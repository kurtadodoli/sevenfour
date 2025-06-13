const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

console.log('Loading userController...');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.user_id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Validate password strength
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return errors;
};

// Log login attempts
const logLoginAttempt = async (email, ip, userAgent, success) => {
    try {
        await query(
            `INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)`,
            [email, ip || 'unknown', userAgent || 'unknown', success]
        );
    } catch (error) {
        console.error('Error logging login attempt:', error);
    }
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, gender, birthday } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !password || !gender || !birthday) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: first_name, last_name, email, password, gender, birthday'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: passwordErrors
            });
        }

        // Check if user already exists
        const existingUsers = await query(
            'SELECT user_id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await query(
            `INSERT INTO users (first_name, last_name, email, password, gender, birthday, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email.toLowerCase(), hashedPassword, gender, birthday, 'customer']
        );

        // Get the created user
        const newUser = await query(
            'SELECT user_id, first_name, last_name, email, gender, birthday, role, created_at FROM users WHERE user_id = ?',
            [result.insertId]
        );

        // Generate token
        const token = generateToken(newUser[0]);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser[0].user_id,
                    first_name: newUser[0].first_name,
                    last_name: newUser[0].last_name,
                    email: newUser[0].email,
                    gender: newUser[0].gender,
                    birthday: newUser[0].birthday,
                    role: newUser[0].role,
                    created_at: newUser[0].created_at
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        // Validate required fields
        if (!email || !password) {
            await logLoginAttempt(email, ip, userAgent, false);
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const users = await query(
            'SELECT user_id, first_name, last_name, email, password, gender, birthday, role, is_active FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            await logLoginAttempt(email, ip, userAgent, false);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check if user is active
        if (!user.is_active) {
            await logLoginAttempt(email, ip, userAgent, false);
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            await logLoginAttempt(email, ip, userAgent, false);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login timestamp
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
            [user.user_id]
        );

        // Log successful login
        await logLoginAttempt(email, ip, userAgent, true);

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    gender: user.gender,
                    birthday: user.birthday,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await query(
            'SELECT user_id, first_name, last_name, email, gender, birthday, role, created_at, last_login FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        res.json({
            success: true,
            data: {
                user: {
                    id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    gender: user.gender,
                    birthday: user.birthday,
                    role: user.role,
                    created_at: user.created_at,
                    last_login: user.last_login
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error retrieving profile'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, gender, birthday } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !gender || !birthday) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: first_name, last_name, gender, birthday'
            });
        }

        // Update user profile
        await query(
            'UPDATE users SET first_name = ?, last_name = ?, gender = ?, birthday = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [first_name, last_name, gender, birthday, userId]
        );

        // Get updated user data
        const users = await query(
            'SELECT user_id, first_name, last_name, email, gender, birthday, role, updated_at FROM users WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: users[0].user_id,
                    first_name: users[0].first_name,
                    last_name: users[0].last_name,
                    email: users[0].email,
                    gender: users[0].gender,
                    birthday: users[0].birthday,
                    role: users[0].role,
                    updated_at: users[0].updated_at
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error updating profile'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Validate new password
        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'New password validation failed',
                errors: passwordErrors
            });
        }

        // Get current user password
        const users = await query(
            'SELECT password FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await query(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [hashedNewPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error changing password'
        });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await query(
            'SELECT user_id, first_name, last_name, email, gender, birthday, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    gender: user.gender,
                    birthday: user.birthday,
                    role: user.role,
                    is_active: user.is_active,
                    created_at: user.created_at,
                    last_login: user.last_login
                }))
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error retrieving users'
        });
    }
};

// Toggle user active status (admin only)
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_active must be a boolean value'
            });
        }

        // Prevent admin from deactivating themselves
        if (parseInt(userId) === req.user.id && !is_active) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const result = await query(
            'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [is_active, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error updating user status'
        });
    }
};

console.log('UserController loaded with exports:', Object.keys(exports));
