const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Seven Four Clothing Server...\n');

// Kill any existing Node processes first
console.log('Stopping any existing servers...');
if (process.platform === 'win32') {
  const { exec } = require('child_process');
  exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
    if (error && !error.message.includes('not found')) {
      console.log('No existing Node processes to kill');
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log('Starting server...\n');
  
  const serverPath = path.join(__dirname, 'server', 'server.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'server')
  });
  
  serverProcess.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
  });
  
  serverProcess.on('exit', (code) => {
    console.log(`\n📊 Server process exited with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill();
    process.exit();
  });
}
