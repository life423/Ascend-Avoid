// Simple script to run both client and server without requiring concurrently
const { spawn } = require('child_process');
const os = require('os');

console.log('Starting Ascend Avoid game...');
console.log('Running client and server components...');

// Determine command prefix based on OS
const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Start the client (Vite dev server)
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

console.log('Client process started');

// Start the server
const serverProcess = spawn(npmCmd, ['run', 'dev:server'], {
  stdio: 'inherit',
  shell: true
});

console.log('Server process started');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  clientProcess.kill();
  serverProcess.kill();
  process.exit();
});

// Handle child process exit
clientProcess.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
  serverProcess.kill();
  process.exit(code);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  clientProcess.kill();
  process.exit(code);
});