const express = require('express');
const router = express.Router();

// Simple test routes without auth or database dependencies
router.get('/custom-orders/test', (req, res) => {
    res.json({ 
        message: 'Custom orders route is working!',
        timestamp: new Date().toISOString()
    });
});

router.get('/custom-orders/me', (req, res) => {
    res.status(401).json({ 
        message: 'Authentication required',
        endpoint: '/api/custom-orders/me'
    });
});

router.get('/custom-orders', (req, res) => {
    res.status(401).json({ 
        message: 'Authentication required',
        endpoint: '/api/custom-orders'
    });
});

router.post('/custom-orders', (req, res) => {
    res.status(401).json({ 
        message: 'Authentication required',
        endpoint: 'POST /api/custom-orders'
    });
});

module.exports = router;
