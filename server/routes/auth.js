const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticateUser } = require('../middleware/auth');
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const corsOptions = require('../config/cors');
const { sendResetCode } = require('../utils/email');

// CORS configuration
router.use(cors(corsOptions));
router.options('*', cors(corsOptions));

// Test endpoint
router.get('/status', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, gender, birthday } = req.body;

        if (!firstName || !lastName || !email || !password) {
            const missingFields = [];
            if (!firstName) missingFields.push('firstName');
            if (!lastName) missingFields.push('lastName');
            if (!email) missingFields.push('email');
            if (!password) missingFields.push('password');

            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Registering user:', { firstName, lastName, email, gender, birthday });
        const [result] = await db.execute(
            `INSERT INTO users (first_name, last_name, email, password, gender, birthday)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword, gender || 'other', birthday]
        );

        const token = jwt.sign(
            { id: result.insertId, email, role: 'customer' },
            process.env.JWT_SECRET || '6b3f63997a216cf103f68d4dbbe7e25d98d16b2472ef091b9ef72865156018164331bcd7fd36ff56573641544417f785c7696e53fb96062df99a0f04e3d54ff6',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: result.insertId,
                firstName,
                lastName,
                email,
                role: 'customer'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            details: error.message
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        await db.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, first_name, last_name, email, gender, 
        birthday, role, created_at, last_login 
        FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }


    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile fetch'
    });
  }
});


// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

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

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        await db.execute(
            'UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE email = ?',
            [resetCode, resetCodeExpiry, email]
        );

        const emailSent = await sendResetCode(email, resetCode);

        if (!emailSent) {
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


// Reset Password
router.get('/reset-password', function(req, res) {
    res.send('Reset password GET route placeholder');
});

module.exports = router;
