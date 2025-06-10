const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const verifyToken = require('../middleware/auth');
const { sendResetCode } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, gender, birthday } = req.body;
        
        // Check for existing user
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await db.execute(
            `INSERT INTO users (first_name, last_name, email, password, gender, birthday, role) 
             VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
            [firstName, lastName, email, hashedPassword, gender, birthday]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        // Find user by email with all necessary fields
        const [users] = await db.execute(
            `SELECT id, email, password, first_name, last_name, gender, 
             profile_picture_url, role, street_address, apartment_suite,
             city, state_province, postal_code, country
             FROM users WHERE email = ?`,
            [email]
        );
        console.log('Login attempt for email:', email);

        if (users.length === 0) {
            console.log('No user found with email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];
          // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('Password verification failed for user:', email);
            // Log failed login attempt
            await db.execute(
                'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)',
                [email, req.ip, req.headers['user-agent'], 0]
            );
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await db.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );        // Create token with user role and ID
        const token = jwt.sign({ 
            id: user.id,
            role: user.role,
            email: user.email
        }, process.env.JWT_SECRET, { 
            expiresIn: '24h'
        });
        
        // Get complete user profile data
        const userData = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            gender: user.gender,
            profile_picture_url: user.profile_picture_url,
            street_address: user.street_address,
            apartment_suite: user.apartment_suite,
            city: user.city,
            state_province: user.state_province,
            postal_code: user.postal_code,
            country: user.country
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, first_name, last_name, email, gender, 
             birthday, role, created_at, last_login 
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received forgot password request for:', email);

        // Check if user exists
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes from now

        // Save reset code in database
        await db.execute(
            'UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE email = ?',
            [resetCode, resetCodeExpiry, email]
        );        // Send email with reset code
        try {
            console.log('Attempting to send reset code...');
            const emailSent = await sendResetCode(email, resetCode);

            if (!emailSent) {
                console.error('Failed to send reset code email');
                return res.status(500).json({
                    success: false,
                    message: 'Error sending reset code email. Please try again later.'
                });
            }

            console.log('Reset code email sent successfully');
        } catch (emailError) {
            console.error('Email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Error sending reset code email. Please try again later.'
            });
        }

        res.json({
            success: true,
            message: 'Reset code sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request'
        });
    }
});

// Verify reset code and update password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        // Find user and verify reset code
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_code_expiry > NOW()',
            [email, resetCode]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset code
        await db.execute(
            'UPDATE users SET password = ?, reset_code = NULL, reset_code_expiry = NULL WHERE email = ?',
            [hashedPassword, email]
        );

        res.json({
            success: true,
            message: 'Password successfully reset'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
});

module.exports = router;