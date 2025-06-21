#!/usr/bin/env node

/**
 * Cross-platform development script for Ascend Avoid
 * Replaces platform-specific batch files with universal Node.js script
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.cyan) {
  console.log(`${color}[DEV]${colors.reset} ${message}`);
}

function error(message) {
  console.error(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function success(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function checkPrerequisites() {
  log('Checking prerequisites...');
  
  // Check if Node.js version is sufficient
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    error(`Node.js 18+ required. Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  // Check if package.json exists
  if (!existsSync(path.join(__dirname, 'package.json'))) {
    error('package.json not found. Run this script from the project root.');
    process.exit(1);
  }
  
  // Check if server directory exists
  if (!existsSync(path.join(__dirname, 'server'))) {
    error('Server directory not found.');
    process.exit(1);
  }
  
  success('Prerequisites check passed');
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    log('Checking dependencies...');
    
    // Check client dependencies
    if (!existsSync(path.join(__dirname, 'node_modules'))) {
      log('Installing client dependencies...');
      
      const clientInstall = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
      });
      
      clientInstall.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Failed to install client dependencies'));
          return;
        }
        
        // Check server dependencies
        if (!existsSync(path.join(__dirname, 'server', 'node_modules'))) {
          log('Installing server dependencies...');
          
          const serverInstall = spawn('npm', ['install', '--legacy-peer-deps'], {
            stdio: 'inherit',
            shell: true,
            cwd: path.join(__dirname, 'server')
          });
          
          serverInstall.on('close', (serverCode) => {
            if (serverCode !== 0) {
              reject(new Error('Failed to install server dependencies'));
              return;
            }
            
            success('All dependencies installed');
            resolve();
          });
        } else {
          success('Dependencies already installed');
          resolve();
        }
      });
    } else {
      // Client dependencies exist, check server
      if (!existsSync(path.join(__dirname, 'server', 'node_modules'))) {
        log('Installing server dependencies...');
        
        const serverInstall = spawn('npm', ['install', '--legacy-peer-deps'], {
          stdio: 'inherit',
          shell: true,
          cwd: path.join(__dirname, 'server')
        });
        
        serverInstall.on('close', (code) => {
          if (code !== 0) {
            reject(new Error('Failed to install server dependencies'));
            return;
          }
          
          success('Server dependencies installed');
          resolve();
        });
      } else {
        success('Dependencies already installed');
        resolve();
      }
    }
  });
}

function startDevelopment() {
  log('Starting development servers...');
  log(`${colors.yellow}Client:${colors.reset} http://localhost:5173`);
  log(`${colors.yellow}Server:${colors.reset} http://localhost:2567`);
  log(`${colors.magenta}Press Ctrl+C to stop both servers${colors.reset}`);
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('Shutting down development servers...');
    devProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    devProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  devProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      error(`Development servers exited with code ${code}`);
      process.exit(code);
    }
  });
}

async function main() {
  try {
    console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════╗
║          ASCEND AVOID - DEV           ║
║        Development Environment        ║
╚═══════════════════════════════════════╝${colors.reset}
`);
    
    checkPrerequisites();
    await installDependencies();
    startDevelopment();
    
  } catch (err) {
    error(err.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  error(`Unhandled promise rejection: ${reason}`);
  process.exit(1);
});

// Run the script
main();