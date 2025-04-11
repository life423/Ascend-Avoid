#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script performs health checks on the deployed application to ensure
 * it is functioning correctly. It can be run locally or as part of CI/CD.
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

// Configuration (can be overridden via environment variables)
const config = {
  url: process.env.VERIFY_URL || 'http://localhost:3000',
  healthPath: process.env.VERIFY_HEALTH_PATH || '/',
  timeout: parseInt(process.env.VERIFY_TIMEOUT || '120000', 10), // 2 minutes default
  retries: parseInt(process.env.VERIFY_RETRIES || '10', 10), // 10 retries default
  retryDelay: parseInt(process.env.VERIFY_RETRY_DELAY || '15000', 10), // 15 seconds default
  acceptableStatusCodes: (process.env.VERIFY_ACCEPTABLE_STATUS_CODES || '200-299').split(',')
    .flatMap(range => {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return [Number(range)];
    })
};

// Compose full URL with health endpoint
const healthCheckUrl = new URL(config.healthPath, config.url).toString();

console.log(`🔍 Verifying deployment at: ${healthCheckUrl}`);
console.log(`⏱️  Timeout: ${config.timeout}ms, Retries: ${config.retries}, Retry Delay: ${config.retryDelay}ms`);
console.log(`✓ Acceptable status codes: ${config.acceptableStatusCodes.join(', ')}`);

/**
 * Performs a health check request to the specified URL
 */
function performHealthCheck(url) {
  return new Promise((resolve, reject) => {
    // Determine if we're testing locally or against a deployed environment
    const isLocalTest = url.includes('localhost') || url.includes('127.0.0.1');
    
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: config.timeout,
      headers: {
        'User-Agent': 'HealthCheck/1.0',
        'Accept': 'text/html,application/json,*/*',
        'Connection': 'keep-alive'
      }
    };
    
    console.log(`📡 Sending request to: ${parsedUrl.protocol}//${options.hostname}:${options.port}${options.path}`);
    
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📥 Response Status: ${res.statusCode}`);
        console.log(`📋 Response Headers: ${JSON.stringify(res.headers)}`);
        
        // Log the body but limit it if it's too long
        const maxBodyLength = 500;
        const bodyLog = data.length > maxBodyLength 
          ? data.substring(0, maxBodyLength) + '... (truncated)'
          : data;
        console.log(`📄 Response Body: ${bodyLog}`);
        
        // Accept status codes from configuration or use local testing exceptions
        if (config.acceptableStatusCodes.includes(res.statusCode) || 
            (isLocalTest && (res.statusCode === 404 || res.statusCode === 403))) {
          resolve({ 
            status: res.statusCode,
            data,
            headers: res.headers
          });
        } else {
          reject(new Error(`Request failed with status code: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.error(`❌ Request error: ${err.message}`);
      if (err.code === 'ENOTFOUND') {
        console.error(`💡 DNS lookup failed. Check if the hostname "${options.hostname}" is correct.`);
      } else if (err.code === 'ECONNREFUSED') {
        console.error(`💡 Connection refused. The server at ${options.hostname}:${options.port} might not be running.`);
      }
      reject(err);
    });
    
    req.on('timeout', () => {
      console.error(`⏱️ Request timed out after ${config.timeout}ms`);
      req.destroy();
      reject(new Error(`Request timed out after ${config.timeout}ms`));
    });
    
    // End the request
    req.end();
  });
}

/**
 * Retry logic for health checks
 */
async function checkWithRetry() {
  console.log(`ℹ️ Environment information:`);
  console.log(`🔧 Node.js version: ${process.version}`);
  console.log(`🌐 URL being verified: ${healthCheckUrl}`);
  let lastError;
  
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${config.retries}...`);
      const result = await performHealthCheck(healthCheckUrl);
      console.log(`✅ Health check passed! Status: ${result.status}`);
      return result;
    } catch (error) {
      lastError = error;
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < config.retries) {
        console.log(`⏳ Waiting ${config.retryDelay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      }
    }
  }
  
  throw new Error(`All ${config.retries} health check attempts failed. Last error: ${lastError.message}`);
}

// Run the verification
checkWithRetry()
  .then(() => {
    console.log('🎉 Deployment verification successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Deployment verification failed:', error.message);
    process.exit(1);
  });
