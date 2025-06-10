// server/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const security = require('./middleware/security');
const corsOptions = require('./config/cors');
const { testConnection } = require('./config/db');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(security);

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Auth-specific rate limiting
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // start blocking after 5 requests
    message: 'Too many login attempts, please try again after an hour'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS configuration
app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: process.env.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: false, limit: process.env.MAX_FILE_SIZE }));

// Secure static file serving
app.use('/uploads', (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
}, express.static(path.join(__dirname, 'public/uploads')));

// Test database connection
testConnection();

// API routes
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/api/cart');
const productsRoutes = require('./routes/api/products');
const ordersRoutes = require('./routes/api/orders');
const profileRoutes = require('./routes/api/profile');
const usersRoutes = require('./routes/api/users');

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        PORT: process.env.PORT
    });
});

module.exports = app;