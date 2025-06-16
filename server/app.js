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
const mysql = require('mysql2/promise');

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

// Update CORS to match your client port (3002)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

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
}, express.static(path.join(__dirname, '../uploads')));

// Database configuration - ensure this matches your setup
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

// Test database connection and show table info
async function testDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Test if products table exists and show structure
    const [tables] = await connection.execute("SHOW TABLES LIKE 'products'");
    if (tables.length > 0) {
      console.log('✅ Products table exists');
      
      // Show table structure
      const [columns] = await connection.execute("DESCRIBE products");
      console.log('📋 Products table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
      
      // Show current product count
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM products');
      console.log(`📊 Current products in database: ${count[0].total}`);
    } else {
      console.log('❌ Products table not found');
    }
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

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
const maintenanceRoutes = require('./routes/maintenance');

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
app.use('/api/maintenance', maintenanceRoutes);
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

// Use environment variable or default to 3001
const PORT = process.env.PORT || 3001;

// Make sure server starts on port 3001
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Frontend should connect to: http://localhost:${PORT}`);
    
    // Test database connection
    await testDbConnection();
});
