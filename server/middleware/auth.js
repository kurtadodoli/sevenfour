const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

const auth = async (req, res, next) => {    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Access token is required' 
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        console.log('=== AUTH MIDDLEWARE DEBUG ===');
        console.log('Decoded token:', decoded);
        console.log('Looking up user with ID:', decoded.id);
          // Check if user still exists and is active
        const users = await query(
            'SELECT user_id, email, first_name, last_name, role, is_active FROM users WHERE user_id = ?',
            [decoded.id]
        );

        console.log('Users found:', users.length);
        console.log('User data:', users[0]);

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const user = users[0];

        // Check if user is still active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive'
            });
        }        
          // Add user info to request
        req.user = {
            id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        };
        
        console.log('req.user set to:', req.user);
        console.log('=== END AUTH MIDDLEWARE DEBUG ===');

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token has expired' 
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Server error during authentication' 
        });
    }
};

// Middleware for admin-only routes
const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Access denied. Admin only.' 
                });
            }
            next();
        });
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(403).json({ 
            success: false,
            message: 'Access denied' 
        });
    }
};

module.exports = { auth, adminAuth };
