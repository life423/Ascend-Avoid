#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('===================================================');
console.log('  Ascend Avoid - Installation Script         ');
console.log('===================================================');
console.log('');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`✅ Node.js ${nodeVersion} is installed`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js (v12 or higher) and try again.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version').toString().trim();
  console.log(`✅ npm ${npmVersion} is installed`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm and try again.');
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create a readme shortcut if it doesn't exist
const readmeShortcutPath = path.join(__dirname, 'README.md');
if (!fs.existsSync(readmeShortcutPath)) {
  try {
    fs.copyFileSync(path.join(__dirname, 'readme.md'), readmeShortcutPath);
    console.log('✅ Created README.md shortcut');
  } catch (error) {
    console.log('ℹ️ Could not create README.md shortcut:', error.message);
  }
}

console.log('\n🎮 Ascend Avoid is ready to play!');
console.log('\nTo start the game, run one of the following commands:');
console.log('  • npm run dev');
console.log('  • npm start');
console.log('\nThis will open the game in your default web browser.');
console.log('\nEnjoy playing! 🎯');
