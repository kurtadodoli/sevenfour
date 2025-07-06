// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const maintenanceRoutes = require('./routes/maintenance');
const enhancedMaintenanceRoutes = require('./routes/enhanced_maintenance');
const cartRoutes = require('./routes/api/cart');
const orderRoutes = require('./routes/api/orders');
const deliveryRoutes = require('./routes/api/delivery');
const deliveryEnhancedRoutes = require('./routes/deliveryEnhanced');
const deliveryStatusRoutes = require('./routes/delivery-status-fixed');
const courierRoutes = require('./routes/api/couriers');
const customOrderRoutes = require('./routes/custom-orders');
const customDesignRoutes = require('./routes/custom-designs');
const searchRoutes = require('./routes/api/search');
const salesReportRoutes = require('./routes/api/salesReport');
const adminRoutes = require('./routes/admin');

const app = express();

// Configure server to handle larger requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enhanced error logging
const logError = (err) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code
    });
};

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
        origin: req.get('Origin')
    });
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/enhanced-maintenance', enhancedMaintenanceRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/delivery-enhanced', deliveryEnhancedRoutes);
app.use('/api/delivery-status', deliveryStatusRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/custom-designs', customDesignRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sales-report', salesReportRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static('../uploads'));

// Add a catch-all route for debugging
app.use('/api/*', (req, res) => {
    console.log('❌ Unmatched API route:', req.method, req.originalUrl);
    res.status(404).json({ 
        error: 'API route not found', 
        method: req.method, 
        path: req.originalUrl,
        availableRoutes: ['/api/auth/*', '/api/maintenance/*']
    });
});

// Test database connection
app.get('/health', async (req, res) => {
    const isConnected = await testConnection();
    res.json({ 
        status: isConnected ? 'healthy' : 'unhealthy',
        database: isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logError(err);
    res.status(500).json({ 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection before starting server
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Failed to connect to database. Server will not start.');
            process.exit(1);
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🔗 http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();