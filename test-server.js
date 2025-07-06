const express = require('express');
const path = require('path');

// Test basic server startup
console.log('🚀 Testing basic server startup...');

try {
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
  });
  
  const PORT = 5000;
  
  app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
    console.log(`🌐 Test URL: http://localhost:${PORT}/test`);
  });
  
} catch (error) {
  console.error('❌ Error starting test server:', error);
}
