// server/controllers/userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');
require('dotenv').config();

// Register a new user
exports.register = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      birthday, 
      gender, 
      province, 
      city, 
      newsletter 
    } = req.body;

    // Check if user with same email exists
    const existingUserByEmail = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUserByEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if user with same username exists
    const existingUserByUsername = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUserByUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const result = await query(
      `INSERT INTO users (username, email, password, role, first_name, last_name, birthday, gender, province, city, newsletter) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, 'customer', firstName, lastName, birthday, gender, province, city, newsletter ? 1 : 0]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get the newly created user
    const newUser = await query('SELECT user_id, username, email, role FROM users WHERE user_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      token,
      user: newUser[0]
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      await query(
        'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)',
        [email, req.ip, req.headers['user-agent'], 0]
      );
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Log successful login attempt
    await query(
      'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)',
      [email, req.ip, req.headers['user-agent'], 1]
    );
    
    // Update last login timestamp
    await query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await query('SELECT user_id, username, email, role, first_name, last_name FROM users WHERE user_id = ?', [req.user.id]);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user[0]
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await query('SELECT user_id, username, email, role, first_name, last_name, created_at FROM users');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    // Validate role
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const result = await query('UPDATE users SET role = ? WHERE user_id = ?', [role, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User with that email does not exist'
      });
    }
    
    const user = users[0];
    
    // Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Save token to database
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.user_id, resetToken, resetTokenExpiry]
    );
    
    // In a real app, you would send an email with the reset link
    // For development, just return the token
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      developmentToken: resetToken // Remove this in production
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;
    
    // Find valid token
    const tokens = await query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND is_used = 0 AND expires_at > NOW()',
      [resetToken]
    );
    
    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }
    
    const token = tokens[0];
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password
    await query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, token.user_id]);
    
    // Mark token as used
    await query('UPDATE password_reset_tokens SET is_used = 1 WHERE token_id = ?', [token.token_id]);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Logout
exports.logout = (req, res) => {
  // In JWT authentication, logout is typically handled client-side by deleting the token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};