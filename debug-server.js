// Debug script to test server startup with error catching
console.log('🔍 Starting server debug...');

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

try {
  console.log('📁 Current directory:', process.cwd());
  console.log('📂 Checking server directory...');
  
  const fs = require('fs');
  const serverPath = './server/server.js';
  
  if (fs.existsSync(serverPath)) {
    console.log('✅ server.js found');
    
    // Try to require and start the server
    console.log('🚀 Starting server...');
    require(serverPath);
    
  } else {
    console.log('❌ server.js not found at', serverPath);
  }
  
} catch (error) {
  console.error('❌ Error starting server:', error);
  console.error('Stack trace:', error.stack);
}
