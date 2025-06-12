// server/routes/api/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
const { auth } = require('../../middleware/auth');
const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware    // Get user profile data with all necessary fields
    const [users] = await pool.execute(
      `SELECT id, first_name, last_name, email, gender, street_address, apartment_suite, 
              city, state_province, postal_code, country, profile_picture_url,
              created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }

    // Send the profile data with success flag
    res.json({
      success: true,
      data: users[0],
      message: 'Profile data retrieved successfully'
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile data',
      error: error.message 
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      gender,
      profile_picture_url,
      street_address, 
      apartment_suite, 
      city, 
      state_province, 
      postal_code, 
      country 
    } = req.body;
    const userId = req.user.id; // From auth middleware
    const updateFields = {};

    // Only include fields that are provided in the request
    if (first_name !== undefined) updateFields.first_name = first_name;
    if (last_name !== undefined) updateFields.last_name = last_name;
    if (gender !== undefined) updateFields.gender = gender;
    if (profile_picture_url !== undefined) updateFields.profile_picture_url = profile_picture_url;
    if (street_address !== undefined) updateFields.street_address = street_address;
    if (apartment_suite !== undefined) updateFields.apartment_suite = apartment_suite;
    if (city !== undefined) updateFields.city = city;
    if (state_province !== undefined) updateFields.state_province = state_province;
    if (postal_code !== undefined) updateFields.postal_code = postal_code;
    if (country !== undefined) updateFields.country = country;

    // Update user profile
    const query = `
      UPDATE users
      SET ${Object.keys(updateFields).map(key => `${key} = ?`).join(', ')}
      WHERE id = ?
    `;
    
    const values = [...Object.values(updateFields), userId];
    await pool.execute(query, values);

    // Fetch updated user data
    const [rows] = await pool.execute(
      'SELECT id, email, first_name, last_name, gender, profile_picture_url, street_address, apartment_suite, city, state_province, postal_code, country FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = rows[0];
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;