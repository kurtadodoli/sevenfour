// Simple server starter for testing
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting server...');

const serverPath = path.join(__dirname, 'server', 'app.js');
const serverProcess = spawn('node', [serverPath], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

serverProcess.on('exit', (code) => {
  console.log(`🛑 Server process exited with code ${code}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  serverProcess.kill();
  process.exit(0);
});

console.log('✅ Server startup initiated. Check console for server logs.');
