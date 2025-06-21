// Simple script to serve the test-engine.html file
const { exec } = require('child_process');
const path = require('path');

console.log('Starting test engine...');

// Run vite dev server with test-engine.html as the entry point
const command = 'npx vite --open test-engine.html';

// Execute the command
const child = exec(command);

// Log output
child.stdout.on('data', (data) => {
  console.log(data);
});

child.stderr.on('data', (data) => {
  console.error(data);
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});