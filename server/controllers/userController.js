const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');

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
        // Enhanced logging for debugging
        console.log('==== REGISTRATION REQUEST ====');
        console.log('Time:', new Date().toISOString());
        console.log('IP:', req.ip);
        console.log('User-Agent:', req.get('user-agent'));
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Origin:', req.get('origin'));
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        // Add CORS headers directly in the handler for this specific endpoint
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');        const { first_name, last_name, email, password, gender, birthday, role } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !password) {
            console.log('Missing required fields:', { 
                first_name: !!first_name, 
                last_name: !!last_name, 
                email: !!email, 
                password: !!password
            });
            return res.status(400).json({
                success: false,
                message: 'Required fields: first_name, last_name, email, password'
            });
        }        // Set default values for optional fields
        const userGender = gender || 'other'; // Default to 'other' since 'not_specified' is not allowed
        const userBirthday = birthday || '1990-01-01';
        const userRole = role || 'customer';

        // Validate gender if provided
        if (gender && !['male', 'female', 'other'].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: 'Gender must be either "male", "female", or "other"'
            });
        }

        // Validate role if provided
        if (role && !['customer', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be either "customer" or "admin"'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            console.log('Password validation errors:', passwordErrors);
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: passwordErrors
            });
        }        // Check if user already exists
        console.log('Checking if user exists:', email.toLowerCase());
        const existingUsers = await query(
            'SELECT user_id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            console.log('User with this email already exists:', email.toLowerCase());
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // Hash password
        console.log('Hashing password...');
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);        try {            // Insert new user
            console.log('Attempting to insert new user into database...');
            const result = await query(
                `INSERT INTO users (first_name, last_name, email, password, gender, birthday, role) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [first_name, last_name, email.toLowerCase(), hashedPassword, userGender, userBirthday, userRole]
            );
            
            console.log('User inserted successfully, ID:', result.insertId);

            // Get the created user
            const newUser = await query(
                'SELECT user_id, first_name, last_name, email, gender, birthday, role, created_at FROM users WHERE user_id = ?',
                [result.insertId]
            );
            
            if (newUser.length === 0) {
                throw new Error('User was created but could not be retrieved');
            }
            
            console.log('Retrieved new user details:', newUser[0].user_id);

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
            
        } catch (dbError) {
            console.error('Database operation failed:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error during registration',
                error: dbError.message
            });
        }

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
        const userId = req.user.id;        const users = await query(
            'SELECT user_id, first_name, last_name, email, gender, profile_picture_url, birthday, province, city, address, postal_code, phone, role, created_at, last_login FROM users WHERE user_id = ?',
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
                    profile_picture_url: user.profile_picture_url,
                    birthday: user.birthday,
                    province: user.province,
                    city: user.city,
                    address: user.address,
                    postal_code: user.postal_code,
                    phone: user.phone,
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
        const { first_name, last_name, gender, birthday, province, city, address, postal_code, phone } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !gender || !birthday) {
            return res.status(400).json({
                success: false,
                message: 'Basic profile fields are required: first_name, last_name, gender, birthday'
            });
        }

        // Update user profile with address fields
        await query(
            'UPDATE users SET first_name = ?, last_name = ?, gender = ?, birthday = ?, province = ?, city = ?, address = ?, postal_code = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [first_name, last_name, gender, birthday, province, city, address, postal_code, phone, userId]
        );

        // Get updated user data
        const users = await query(
            'SELECT user_id, first_name, last_name, email, gender, birthday, province, city, address, postal_code, phone, role, updated_at FROM users WHERE user_id = ?',
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
                    province: users[0].province,
                    city: users[0].city,
                    address: users[0].address,
                    postal_code: users[0].postal_code,
                    phone: users[0].phone,
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

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        console.log('Forgot password request for:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }        // Check if user exists
        const user = await query('SELECT user_id, email, first_name, last_name FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            // For security, don't reveal if email exists or not
            return res.json({
                success: true,
                message: 'If this email is registered, you will receive a verification code shortly'
            });
        }        // Rate limiting - max 5 OTP requests per hour (increased for testing)
        const recentAttempts = await otpService.getOTPAttemptsCount(email, 60);
        if (recentAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Too many verification code requests. Please try again in an hour.'
            });
        }

        // Generate and store OTP
        const otp = emailService.generateOTP();
        const storeResult = await otpService.storeOTP(email, otp, 10, clientIP, userAgent);

        if (!storeResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Error generating verification code. Please try again.'
            });
        }

        // Send OTP email
        const emailResult = await emailService.sendOTPEmail(email, otp, 'password reset');

        if (!emailResult.success) {
            console.error('Failed to send OTP email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Error sending verification code. Please try again.'
            });
        }

        console.log(`OTP sent successfully to ${email}`);

        res.json({
            success: true,
            message: 'Verification code sent to your email. It will expire in 10 minutes.',
            expiresAt: storeResult.expiresAt
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Reset Password with OTP
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        console.log('Reset password request for:', email);

        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, verification code, and new password are required'
            });
        }

        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code format'
            });
        }

        // Validate password strength
        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                errors: passwordErrors
            });
        }

        // Verify OTP
        const otpResult = await otpService.verifyOTP(email, otp);
        if (!otpResult.success) {
            return res.status(400).json({
                success: false,
                message: otpResult.error
            });
        }

        // Check if user exists
        const user = await query('SELECT user_id, email FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);        // Update password in database
        const updateResult = await query(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
            [hashedPassword, email]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update password. Please try again.'
            });
        }        console.log(`Password reset successfully for user: ${email}`);

        // Log the password reset activity (without activity_type for now)
        await query(
            'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)',
            [email, req.ip || 'unknown', req.get('User-Agent') || 'unknown', true]
        );

        res.json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Verify OTP (for testing or UI validation)
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        // Check if OTP is valid (but don't mark as used)
        const hasValidOTP = await otpService.hasValidOTP(email);
        
        if (!hasValidOTP) {
            return res.status(400).json({
                success: false,
                message: 'No valid verification code found for this email'
            });
        }

        // For this endpoint, we just verify without marking as used
        const result = await query(
            'SELECT * FROM password_reset_otps WHERE email = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );

        if (result.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        res.json({
            success: true,
            message: 'Verification code is valid',
            expiresAt: result[0].expires_at
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Resend OTP for forgot password
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        console.log('Resend OTP request for:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await query('SELECT user_id, email, first_name, last_name FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            // For security, don't reveal if email exists or not
            return res.json({
                success: true,
                message: 'If this email is registered, you will receive a new verification code shortly'
            });
        }

        // Check if there's a valid existing OTP
        const hasValidOTP = await otpService.hasValidOTP(email);
        if (!hasValidOTP) {
            return res.status(400).json({
                success: false,
                message: 'No active verification code found. Please request a new password reset.'
            });
        }

        // Rate limiting for resend - max 2 resends per 10 minutes
        const recentResends = await otpService.getOTPAttemptsCount(email, 10);
        if (recentResends >= 3) { // Total including original + 2 resends
            return res.status(429).json({
                success: false,
                message: 'Too many verification code requests. Please wait 10 minutes before requesting again.'
            });
        }

        // Generate and store new OTP
        const otp = emailService.generateOTP();
        const storeResult = await otpService.storeOTP(email, otp, 10, clientIP, userAgent);

        if (!storeResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Error generating verification code. Please try again.'
            });
        }

        // Send OTP email
        const emailResult = await emailService.sendOTPEmail(email, otp, 'password reset');

        if (!emailResult.success) {
            console.error('Failed to send resend OTP email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Error sending verification code. Please try again.'
            });
        }

        console.log(`Resend OTP sent successfully to ${email}`);

        res.json({
            success: true,
            message: 'New verification code sent to your email. It will expire in 10 minutes.',
            expiresAt: storeResult.expiresAt,
            isDevelopmentMode: emailResult.isDevelopmentMode || false
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Check if user exists (for EmailJS integration)
exports.checkUser = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('Checking user existence for:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await query('SELECT user_id, email, first_name, last_name FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            // For security, don't reveal if email exists or not
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user[0].user_id,
                email: user[0].email,
                first_name: user[0].first_name,
                last_name: user[0].last_name
            },
            message: 'User found'
        });

    } catch (error) {
        console.error('Check user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Store OTP (for EmailJS integration)
exports.storeOTP = async (req, res) => {
    try {
        const { email, otp, purpose = 'password_reset' } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        console.log('Storing OTP for:', email);

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Rate limiting - max 5 OTP requests per hour
        const recentAttempts = await otpService.getOTPAttemptsCount(email, 60);
        if (recentAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Too many verification code requests. Please try again in an hour.'
            });
        }

        // Store OTP
        const storeResult = await otpService.storeOTP(email, otp, 10, clientIP, userAgent);

        if (!storeResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Error storing verification code. Please try again.'
            });
        }

        console.log(`OTP stored successfully for ${email}`);

        res.json({
            success: true,
            message: 'Verification code stored successfully',
            expiresAt: storeResult.expiresAt
        });

    } catch (error) {
        console.error('Store OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

console.log('UserController loaded with exports:', Object.keys(exports));
