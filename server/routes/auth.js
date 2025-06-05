// filepath: c:\seven-four-clothing\server\routes\auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            firstName,
            lastName,
            birthday,
            gender,
            province_id,
            city_id,
            newsletter
        } = req.body;

        // Log registration attempt
        console.log('Registration attempt:', {
            email,
            firstName,
            lastName,
            province_id,
            city_id
        });

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName || !birthday || !gender || !province_id || !city_id) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email already exists
        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            console.log('Email already exists:', email);
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await pool.query(`
            INSERT INTO users (
                username,
                email,
                password,
                first_name,
                last_name,
                birthday,
                gender,
                province_id,
                city_id,
                newsletter
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            username,
            email,
            hashedPassword,
            firstName,
            lastName,
            birthday,
            gender,
            province_id,
            city_id,
            newsletter || false
        ]);

        console.log('User registered successfully:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('\n=== Login Attempt ===');
        console.log('Email:', email);
        console.log('Provided password:', password);

        // Find user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];
        console.log('✅ User found:', {
            id: user.id,
            email: user.email,
            storedHash: user.password
        });

        // Debug password check
        try {
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('Password check:', {
                providedPassword: password,
                storedHash: user.password,
                isValid: isValidPassword
            });

            if (!isValidPassword) {
                console.log('❌ Password verification failed');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            console.log('✅ Password verified successfully');

            // Generate token
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username
                }
            });

        } catch (bcryptError) {
            console.error('Password verification error:', bcryptError);
            throw bcryptError;
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed: ' + error.message
        });
    }
});

router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

router.get('/provinces', async (req, res) => {
    try {
        const [provinces] = await pool.query('SELECT * FROM provinces');
        res.json(provinces);
    } catch (error) {
        console.error('Error fetching provinces:', error);
        res.status(500).json({ message: 'Failed to fetch provinces' });
    }
});

router.get('/cities/:provinceId', async (req, res) => {
    try {
        const [cities] = await pool.query(
            'SELECT * FROM cities WHERE province_id = ?',
            [req.params.provinceId]
        );
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Failed to fetch cities' });
    }
});

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching profile for user:', req.user.userId); // Debug log

        const [users] = await pool.query(`
            SELECT 
                u.id,
                u.username,
                u.email,
                u.first_name,
                u.last_name,
                u.birthday,
                u.gender,
                p.province_name,
                c.city_name
            FROM users u
            LEFT JOIN provinces p ON u.province_id = p.id
            LEFT JOIN cities c ON u.city_id = c.id
            WHERE u.id = ?
        `, [req.user.userId]);

        if (users.length === 0) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Profile fetched successfully');
        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

// Update the test user creation route
router.post('/test/create-user', async (req, res) => {
    try {
        // First, delete if exists
        await pool.query("DELETE FROM users WHERE email = 'test@example.com'");

        // Create test user with known password
        const password = 'Test123!@#';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert test user
        const [result] = await pool.query(`
            INSERT INTO users (
                username,
                email,
                password,
                first_name,
                last_name,
                birthday,
                gender,
                province_id,
                city_id,
                newsletter
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'test_user',
            'test@example.com',
            hashedPassword,
            'Test',
            'User',
            '1990-01-01',
            'MALE',
            1,
            1,
            false
        ]);

        console.log('Test user created successfully:', {
            id: result.insertId,
            email: 'test@example.com',
            passwordHash: hashedPassword
        });

        res.json({
            success: true,
            message: 'Test user created successfully',
            userId: result.insertId,
            email: 'test@example.com',
            passwordHash: hashedPassword
        });

    } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test user'
        });
    }
});

module.exports = router;