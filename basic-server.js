// Very simple server for testing
console.log('Starting basic server...');

const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Server working!', port: PORT });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Test: http://localhost:3002/api/test');
});

console.log('Server script loaded');
