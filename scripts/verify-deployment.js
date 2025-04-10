#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script performs health checks on the deployed application to ensure
 * it is functioning correctly. It can be run locally or as part of CI/CD.
 */

const https = require('https');
const http = require('http');

// Configuration (can be overridden via environment variables)
const config = {
  url: process.env.VERIFY_URL || 'http://localhost:3000',
  timeout: process.env.VERIFY_TIMEOUT || 30000, // 30 seconds
  retries: process.env.VERIFY_RETRIES || 5,
  retryDelay: process.env.VERIFY_RETRY_DELAY || 5000, // 5 seconds
};

console.log(`🔍 Verifying deployment at: ${config.url}`);
console.log(`⏱️  Timeout: ${config.timeout}ms, Retries: ${config.retries}, Retry Delay: ${config.retryDelay}ms`);

/**
 * Performs a health check request to the specified URL
 */
function performHealthCheck(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: config.timeout }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ 
            status: res.statusCode,
            data
          });
        } else {
          reject(new Error(`Request failed with status code: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${config.timeout}ms`));
    });
  });
}

/**
 * Retry logic for health checks
 */
async function checkWithRetry() {
  let lastError;
  
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${config.retries}...`);
      const result = await performHealthCheck(config.url);
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
