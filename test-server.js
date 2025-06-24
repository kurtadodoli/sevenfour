const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log('🔍 Server is accessible for testing...');
});

// Test timeout
setTimeout(() => {
  console.log('🛑 Test server will stop in 30 seconds...');
}, 30000);
