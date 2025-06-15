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

// Load environment variables - handle both direct server run and root run
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug environment variables
console.log('DB_PASSWORD loaded:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('DB_USER loaded:', process.env.DB_USER);

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
    max: 30, // increased from 5 to 30 for development
    message: 'Too many login attempts, please try again after an hour'
});

// Login limiter (keep stricter)
app.use('/api/auth/login', authLimiter);

// Registration limiter (more generous for development)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 50, // much higher limit for registration
    message: 'Too many registration attempts, please try again after an hour'
});
app.use('/api/auth/register', registerLimiter);

// Apply most permissive CORS settings for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// CORS configuration with our options as backup
app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: process.env.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: false, limit: process.env.MAX_FILE_SIZE }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Secure uploads serving
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
const dbSetupRoutes = require('./routes/api/db-setup');
const dashboardRoutes = require('./routes/api/dashboard');
const healthCheckRoutes = require('./routes/health-check');
const homepageRoutes = require('./routes/api/homepage');
const customizationRoutes = require('./routes/api/customizations');

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/db-setup', dbSetupRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/homepage', homepageRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/customizations', customizationRoutes);
app.use('/health', healthCheckRoutes);

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
