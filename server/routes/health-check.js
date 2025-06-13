const express = require('express');
const router = express.Router();

// Health check routes - no authentication required

// @route   GET /api/health-check
// @desc    Basic API health check
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// @route   GET /api/health-check/database
// @desc    Check database connection
router.get('/database', async (req, res) => {
    try {
        // Import database module
        const { query } = require('../config/db');
        
        // Try a simple query
        const result = await query('SELECT 1 as dbCheck');
        
        res.json({
            success: true,
            message: 'Database connection is healthy',
            dbResult: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// @route   GET /api/health-check/cors
// @desc    Test CORS configuration
router.get('/cors', (req, res) => {
    res.json({
        success: true,
        message: 'CORS check successful',
        headers: {
            origin: req.headers.origin || 'No origin header',
            referer: req.headers.referer || 'No referer header',
            host: req.headers.host
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
