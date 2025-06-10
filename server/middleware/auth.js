// middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db.js');


const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // include user's info (like id) from token
    next();
  } catch (err) {
    console.error('JWT error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeStaff = (req, res, next) => {
  // Placeholder: allow all for now
  next();
};

module.exports = {
  authenticateUser,
  authorizeStaff
};

