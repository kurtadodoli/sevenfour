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

// Initialize services
const emailService = require('./services/emailService');
const otpService = require('./services/otpService');

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

// Rate limiting - disabled for development/testing
// const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 1000, // much higher limit for development
//     message: 'Too many requests, please try again later.'
// });

// Apply rate limiting to API routes - DISABLED for testing
// app.use('/api/', apiLimiter);

// Auth-specific rate limiting - DISABLED for testing
// const authLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour window
//     max: 100, // increased for development
//     message: 'Too many login attempts, please try again after an hour'
// });

// Login limiter - DISABLED for testing
// app.use('/api/auth/login', authLimiter);

// Registration limiter - DISABLED for testing
// const registerLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour window
//     max: 50, // much higher limit for registration
//     message: 'Too many registration attempts, please try again after an hour'
// });
// app.use('/api/auth/register', registerLimiter);

// Update CORS to fix preflight and origin issues
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002'
    ];
    
    console.log('🌐 CORS Request from origin:', origin);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin && origin.includes('localhost')) {
        console.log('✅ CORS: Allowing localhost origin');
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS: Origin allowed');
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Handle preflight requests explicitly for all routes
app.options('*', (req, res) => {
  console.log('🔄 CORS Preflight request for:', req.url);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});

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

// Test database connection (optional - don't fail if DB is down)
try {
    testConnection();
} catch (error) {
    console.log('⚠️  Database connection optional for testing');
}

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
const enhancedMaintenanceRoutes = require('./routes/enhanced_maintenance');
const adminRoutes = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');
const customOrdersRoutes = require('./routes/custom-orders');
const customDesignsRoutes = require('./routes/custom-designs');
const searchRoutes = require('./routes/api/search');
const deliveryRoutes = require('./routes/delivery');
const deliveryEnhancedRoutes = require('./routes/deliveryEnhanced');
const courierRoutes = require('./routes/couriers');
const testDeliveryRoutes = require('./routes/testDelivery');

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/db-setup', dbSetupRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/homepage', homepageRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/customizations', customizationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/enhanced-maintenance', enhancedMaintenanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/custom-orders', customOrdersRoutes);
app.use('/api/custom-designs', customDesignsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/delivery-enhanced', deliveryEnhancedRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/test-delivery', testDeliveryRoutes);

// Test delivery routes (temporary for debugging)
app.use('/api/test-delivery', testDeliveryRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Test custom orders endpoint without auth
app.post('/api/custom-orders/test', (req, res) => {
  console.log('Test custom orders endpoint hit');
  res.json({ 
    success: true, 
    message: 'Custom orders endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Test custom designs endpoint without auth
app.get('/api/test-designs', async (req, res) => {
  console.log('🔍 Test designs endpoint hit (public)');
  
  const mysql = require('mysql2/promise');
  const { dbConfig } = require('./config/db');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');    const [designs] = await connection.execute(`
      SELECT cd.*
      FROM custom_designs cd
      WHERE cd.status != 'cancelled'
      ORDER BY cd.created_at DESC
    `);
      // Transform data to match frontend expectations (without images for now)
      const ordersWithImages = designs.map(design => ({
        id: design.id,
        custom_order_id: design.design_id,
        user_id: design.user_id,
        product_type: design.product_type,
        size: design.product_size,
        color: design.product_color,
        quantity: design.quantity,
        urgency: 'standard',
        special_instructions: design.additional_info,
        customer_name: design.customer_name,
        customer_email: design.customer_email,
        customer_phone: design.customer_phone,
        province: 'Metro Manila',
        municipality: design.city,
        street_number: design.street_address,
        house_number: design.house_number,
        barangay: design.barangay,
        postal_code: design.postal_code,
        status: design.status,
        estimated_price: parseFloat(design.estimated_price) || 0, // Convert to number
        final_price: parseFloat(design.final_price) || 0, // Convert to number
        payment_status: 'pending',
        payment_method: 'cash_on_delivery',
        admin_notes: design.admin_notes,
        production_notes: null,
        estimated_delivery_date: null,
        actual_delivery_date: null,
        created_at: design.created_at,
        updated_at: design.updated_at,
        images: [] // Simplified for now
    }));
    
    await connection.end();
    
    console.log(`✅ Retrieved ${ordersWithImages.length} custom designs`);
    
    res.json({
      success: true,
      data: ordersWithImages
    });
    
  } catch (error) {
    console.error('❌ Error fetching custom designs:', error);
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom designs',
      error: error.message
    });
  }
});

// Test cancelled designs endpoint without auth
app.get('/api/test-designs-cancelled', async (req, res) => {
  console.log('🔍 Test cancelled designs endpoint hit (public)');
  
  const mysql = require('mysql2/promise');
  const { dbConfig } = require('./config/db');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    const [designs] = await connection.execute(`
      SELECT cd.*
      FROM custom_designs cd
      WHERE cd.status = 'cancelled'
      ORDER BY cd.updated_at DESC
    `);

    // Transform data to match frontend expectations (without images for now)
    const cancelledOrdersWithImages = designs.map(design => ({
      id: design.id,
      custom_order_id: design.design_id,
      user_id: design.user_id,
      product_type: design.product_type,
      size: design.product_size,
      color: design.product_color,
      quantity: design.quantity,
      urgency: 'standard',
      special_instructions: design.additional_info,
      customer_name: design.customer_name,
      customer_email: design.customer_email,
      customer_phone: design.customer_phone,
      province: 'Metro Manila',
      municipality: design.city,
      street_number: design.street_address,
      house_number: design.house_number,
      barangay: design.barangay,
      postal_code: design.postal_code,
      status: design.status,
      estimated_price: parseFloat(design.estimated_price) || 0, // Convert to number
      final_price: parseFloat(design.final_price) || 0, // Convert to number
      payment_status: 'cancelled',
      payment_method: 'cash_on_delivery',
      admin_notes: design.admin_notes,
      production_notes: null,
      estimated_delivery_date: null,
      actual_delivery_date: null,
      created_at: design.created_at,
      updated_at: design.updated_at,
      images: [] // Simplified for now
    }));
    
    await connection.end();
    
    console.log(`✅ Retrieved ${cancelledOrdersWithImages.length} cancelled custom designs`);
    
    res.json({
      success: true,
      data: cancelledOrdersWithImages
    });
    
  } catch (error) {
    console.error('❌ Error fetching cancelled custom designs:', error);
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cancelled custom designs',
      error: error.message
    });
  }
});

// Update custom design status endpoint (for cancellation) - PUBLIC
app.put('/api/public/custom-orders/:customOrderId/status', async (req, res) => {
  console.log(`🔄 Public cancel request for custom order ${req.params.customOrderId}`);
  
  const mysql = require('mysql2/promise');
  const { dbConfig } = require('./config/db');
  
  let connection;
  try {
    const { customOrderId } = req.params;
    const { status, admin_notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'under_review', 'approved', 'in_production', 'ready_for_pickup', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    // Update the custom design status (using design_id which matches custom_order_id)
    const updateQuery = `
      UPDATE custom_designs 
      SET status = ?, admin_notes = ?, updated_at = NOW()
      WHERE design_id = ?
    `;

    console.log('📝 Executing status update:', { status, designId: customOrderId });
    
    const [result] = await connection.execute(updateQuery, [status, admin_notes || null, customOrderId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Custom design not found'
      });
    }

    console.log(`✅ Successfully updated custom design ${customOrderId} to ${status}`);

    res.json({
      success: true,
      message: `Custom design ${status === 'cancelled' ? 'cancelled' : 'updated'} successfully`
    });
    
  } catch (error) {
    console.error('❌ Error updating custom design status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom design status',
      error: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
});

// User-specific custom designs endpoint (active orders by email)
app.get('/api/user-designs/:email', async (req, res) => {
  console.log(`🔍 User designs endpoint hit for email: ${req.params.email}`);
  
  const mysql = require('mysql2/promise');
  const { dbConfig } = require('./config/db');
  
  let connection;
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');    const [designs] = await connection.execute(`
      SELECT cd.*
      FROM custom_designs cd
      WHERE cd.customer_email = ? AND cd.status != 'cancelled'
      ORDER BY cd.created_at DESC
    `, [email]);

    console.log(`🔍 Raw database results for ${email}:`, designs.length > 0 ? Object.keys(designs[0]) : 'No results');// Transform data to match frontend expectations
    const userOrdersWithImages = designs.map(design => ({
      id: design.id,
      custom_order_id: design.design_id,
      user_id: design.user_id,
      product_type: design.product_type,
      product_name: design.product_name,
      productName: design.product_name, // Add camelCase version too
      size: design.product_size,
      color: design.product_color,
      quantity: design.quantity,
      urgency: 'standard',
      special_instructions: design.additional_info,
      customer_name: `${design.first_name} ${design.last_name}`.trim(),
      first_name: design.first_name,
      firstName: design.first_name, // Add camelCase version
      last_name: design.last_name,
      lastName: design.last_name, // Add camelCase version
      customer_email: design.email,
      email: design.email,
      customer_phone: design.customer_phone,
      province: 'Metro Manila',
      municipality: design.city,
      street_number: design.street_address,
      house_number: design.house_number,
      barangay: design.barangay,
      postal_code: design.postal_code,
      status: design.status,
      estimated_price: parseFloat(design.estimated_price) || 0,
      final_price: parseFloat(design.final_price) || 0,
      payment_status: 'pending',
      payment_method: 'cash_on_delivery',
      admin_notes: design.admin_notes,
      production_notes: null,
      estimated_delivery_date: null,
      actual_delivery_date: null,
      created_at: design.created_at,
      updated_at: design.updated_at,
      images: []
    }));
    
    await connection.end();
    
    console.log(`✅ Retrieved ${userOrdersWithImages.length} custom designs for ${email}`);
    
    res.json({
      success: true,
      data: userOrdersWithImages
    });
    
  } catch (error) {
    console.error('❌ Error fetching user custom designs:', error);
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user custom designs',
      error: error.message
    });
  }
});

// User-specific cancelled custom designs endpoint
app.get('/api/user-designs-cancelled/:email', async (req, res) => {
  console.log(`🔍 User cancelled designs endpoint hit for email: ${req.params.email}`);
  
  const mysql = require('mysql2/promise');
  const { dbConfig } = require('./config/db');
  
  let connection;
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');    const [designs] = await connection.execute(`
      SELECT cd.*
      FROM custom_designs cd
      WHERE cd.email = ? AND cd.status = 'cancelled'
      ORDER BY cd.updated_at DESC
    `, [email]);    // Transform data to match frontend expectations
    const cancelledUserOrdersWithImages = designs.map(design => ({
      id: design.id,
      custom_order_id: design.design_id,
      user_id: design.user_id,
      product_type: design.product_type,
      product_name: design.product_name,
      productName: design.product_name, // Add camelCase version too
      size: design.product_size,
      color: design.product_color,
      quantity: design.quantity,
      urgency: 'standard',
      special_instructions: design.additional_info,
      customer_name: `${design.first_name} ${design.last_name}`.trim(),
      first_name: design.first_name,
      firstName: design.first_name, // Add camelCase version
      last_name: design.last_name,
      lastName: design.last_name, // Add camelCase version
      customer_email: design.email,
      email: design.email,
      customer_phone: design.customer_phone,
      province: 'Metro Manila',
      municipality: design.city,
      street_number: design.street_address,
      house_number: design.house_number,
      barangay: design.barangay,
      postal_code: design.postal_code,
      status: design.status,
      estimated_price: parseFloat(design.estimated_price) || 0,
      final_price: parseFloat(design.final_price) || 0,
      payment_status: 'cancelled',
      payment_method: 'cash_on_delivery',
      admin_notes: design.admin_notes,
      production_notes: null,
      estimated_delivery_date: null,
      actual_delivery_date: null,
      created_at: design.created_at,
      updated_at: design.updated_at,
      images: []
    }));
    
    await connection.end();
    
    console.log(`✅ Retrieved ${cancelledUserOrdersWithImages.length} cancelled custom designs for ${email}`);
    
    res.json({
      success: true,
      data: cancelledUserOrdersWithImages
    });
    
  } catch (error) {
    console.error('❌ Error fetching user cancelled custom designs:', error);
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user cancelled custom designs',
      error: error.message
    });
  }
});

// Add missing API endpoints to prevent 404 errors
app.get('/api/deliveries/schedules', (req, res) => {
  console.log('📦 Delivery schedules endpoint hit');
  res.json({ 
    success: true, 
    data: [],
    message: 'Delivery schedules endpoint working (no data yet)' 
  });
});

app.get('/api/production/status', (req, res) => {
  console.log('🏭 Production status endpoint hit');
  res.json({ 
    success: true, 
    data: {
      active_orders: 0,
      pending_orders: 0,
      completed_today: 0
    },
    message: 'Production status endpoint working (no data yet)' 
  });
});

// Test endpoint to manually confirm an order without authentication
app.post('/api/test-confirm-order/:orderId', async (req, res) => {
  console.log('🧪 TEST CONFIRM ORDER endpoint hit for order:', req.params.orderId);
  
  const mysql = require('mysql2/promise');
  const { dbConfig } = require('./config/db');
  
  let connection;
  try {
    const orderId = req.params.orderId;
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established for test confirm');
    
    await connection.beginTransaction();
    
    // Get order details
    const [orders] = await connection.execute(`
      SELECT id, status, user_id, invoice_id, order_number
      FROM orders 
      WHERE id = ?
    `, [orderId]);
    
    if (orders.length === 0) {
      throw new Error('Order not found');
    }
    
    const order = orders[0];
    console.log('📋 Order found:', order);
    
    if (order.status !== 'pending') {
      throw new Error(`Cannot confirm order with status: ${order.status}`);
    }
    
    // Get order items
    const [orderItems] = await connection.execute(`
      SELECT oi.product_id, oi.quantity, p.productname, p.total_available_stock, p.total_reserved_stock
      FROM order_items oi
      JOIN orders o ON oi.invoice_id = o.invoice_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.id = ?
    `, [orderId]);
    
    console.log(`📦 Found ${orderItems.length} items in order`);
    
    // Check stock availability
    const insufficientStock = [];
    for (const item of orderItems) {
      console.log(`Checking ${item.productname}: need ${item.quantity}, have ${item.total_available_stock}`);
      if (item.total_available_stock < item.quantity) {
        insufficientStock.push({
          product: item.productname,
          requested: item.quantity,
          available: item.total_available_stock
        });
      }
    }
    
    if (insufficientStock.length > 0) {
      throw new Error('Insufficient stock: ' + JSON.stringify(insufficientStock));
    }
    
    // Update inventory
    console.log('🔄 Updating inventory...');
    for (const item of orderItems) {
      const [updateResult] = await connection.execute(`
        UPDATE products 
        SET total_available_stock = total_available_stock - ?,
            total_reserved_stock = COALESCE(total_reserved_stock, 0) + ?,
            last_stock_update = CURRENT_TIMESTAMP,
            stock_status = CASE 
                WHEN (total_available_stock - ?) <= 0 THEN 'out_of_stock'
                WHEN (total_available_stock - ?) <= 5 THEN 'critical_stock'
                WHEN (total_available_stock - ?) <= 15 THEN 'low_stock'
                ELSE 'in_stock'
            END
        WHERE product_id = ?
      `, [item.quantity, item.quantity, item.quantity, item.quantity, item.quantity, item.product_id]);
      
      console.log(`✅ Updated ${item.productname}: -${item.quantity} units (affected rows: ${updateResult.affectedRows})`);
    }
    
    // Update order status
    await connection.execute(`
      UPDATE orders 
      SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [orderId]);
    
    console.log('✅ Order status updated to confirmed');
    
    await connection.commit();
    
    // Get updated inventory to verify
    const [updatedItems] = await connection.execute(`
      SELECT oi.product_id, oi.quantity, p.productname, p.total_available_stock, p.total_reserved_stock
      FROM order_items oi
      JOIN orders o ON oi.invoice_id = o.invoice_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.id = ?
    `, [orderId]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Order confirmed successfully (TEST)',
      order: {
        id: orderId,
        number: order.order_number,
        status: 'confirmed'
      },
      inventoryUpdates: updatedItems.map(item => ({
        product: item.productname,
        quantityOrdered: item.quantity,
        newAvailableStock: item.total_available_stock,
        newReservedStock: item.total_reserved_stock
      }))
    });
    
  } catch (error) {
    console.error('❌ Test confirm order error:', error.message);
    if (connection) {
      await connection.rollback();
      await connection.end();
    }
    res.status(500).json({
      success: false,
      message: 'Test confirm failed: ' + error.message
    });
  }
});

// Test delivery scheduling endpoint (no auth)
app.post('/api/test-schedule', (req, res) => {
  console.log('🧪 TEST SCHEDULE ENDPOINT HIT');
  console.log('Request body:', req.body);
  res.json({
    success: true,
    message: 'Test schedule endpoint working!',
    data: req.body
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Use environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Make sure server starts on port 5000
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Frontend should connect to: http://localhost:${PORT}`);
    
    // Test database connection
    await testDbConnection();
    
    // Initialize services
    console.log('🔧 Initializing services...');
      // Test email service
    try {
        const emailReady = await emailService.testConnection();
        if (emailReady) {
            console.log('📧 Email service is ready');
        } else {
            console.log('📧 Email service in development mode');
        }
    } catch (error) {
        console.log('📧 Email service initialization error:', error.message);
    }
    
    // Clean up expired OTPs on startup
    const cleanedCount = await otpService.cleanupExpiredOTPs();
    console.log(`🧹 Cleaned up ${cleanedCount} expired OTP records`);
    
    // Schedule periodic cleanup every hour
    setInterval(async () => {
        const count = await otpService.cleanupExpiredOTPs();
        if (count > 0) {
            console.log(`🧹 Periodic cleanup: removed ${count} expired OTP records`);
        }
    }, 60 * 60 * 1000); // 1 hour
    
    console.log('✅ Server initialization complete');
});
