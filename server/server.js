const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Create database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Seven Four Clothing API' });
});

// Database test route
app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1 + 1 AS result');
    res.json({ 
      status: 'ok',
      message: 'Database connected!',
      result: result[0]
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001; // Changed from 5000 to 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});