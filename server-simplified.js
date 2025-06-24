// Ultra-simple server for testing
console.log('🚀 Starting server...');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

console.log('Setting up middleware...');

// Basic CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

console.log('Setting up routes...');

// Test route
app.get('/api/test', (req, res) => {
    console.log('Test route hit');
    res.json({ 
        success: true, 
        message: 'Server is working!', 
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Custom orders route (basic)
app.post('/api/custom-orders', (req, res) => {
    console.log('Custom orders route hit');
    console.log('Body:', req.body);
    
    res.json({
        success: true,
        message: 'Custom order received',
        data: {
            customOrderId: 'TEST-' + Date.now(),
            estimatedPrice: 500,
            customerName: 'Test User',
            customerEmail: 'test@example.com'
        }
    });
});

console.log('Starting server on port', PORT);

app.listen(PORT, (err) => {
    if (err) {
        console.error('❌ Failed to start server:', err);
        return;
    }
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
    console.log(`📝 Custom orders: POST http://localhost:${PORT}/api/custom-orders`);
});

console.log('Server setup complete');
