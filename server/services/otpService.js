const { query } = require('../config/db');

class OTPService {
    constructor() {
        this.initializeTable();
    }

    // Initialize OTP table if it doesn't exist
    async initializeTable() {
        try {
            await query(`
                CREATE TABLE IF NOT EXISTS password_reset_otps (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    otp VARCHAR(6) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    is_used BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    used_at TIMESTAMP NULL,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    INDEX idx_email (email),
                    INDEX idx_otp (otp),
                    INDEX idx_expires (expires_at)
                )
            `);
            console.log('OTP table initialized successfully');
        } catch (error) {
            console.error('Error initializing OTP table:', error);
        }
    }

    // Store OTP in database
    async storeOTP(email, otp, expiryMinutes = 10, ipAddress = null, userAgent = null) {
        try {
            // First, invalidate any existing unused OTPs for this email
            await query(
                'UPDATE password_reset_otps SET is_used = TRUE WHERE email = ? AND is_used = FALSE',
                [email]
            );

            // Calculate expiry time
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

            // Store new OTP
            const result = await query(
                `INSERT INTO password_reset_otps (email, otp, expires_at, ip_address, user_agent) 
                 VALUES (?, ?, ?, ?, ?)`,
                [email, otp, expiresAt, ipAddress, userAgent]
            );

            console.log(`OTP stored for email: ${email}, expires at: ${expiresAt}`);
            return { success: true, id: result.insertId, expiresAt };
        } catch (error) {
            console.error('Error storing OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify OTP
    async verifyOTP(email, otp) {
        try {
            const result = await query(
                `SELECT * FROM password_reset_otps 
                 WHERE email = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW()
                 ORDER BY created_at DESC LIMIT 1`,
                [email, otp]
            );

            if (result.length === 0) {
                return { 
                    success: false, 
                    error: 'Invalid or expired verification code' 
                };
            }

            // Mark OTP as used
            await query(
                'UPDATE password_reset_otps SET is_used = TRUE, used_at = NOW() WHERE id = ?',
                [result[0].id]
            );

            console.log(`OTP verified successfully for email: ${email}`);
            return { success: true, otpData: result[0] };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user has a valid (non-expired) OTP
    async hasValidOTP(email) {
        try {
            const result = await query(
                'SELECT id FROM password_reset_otps WHERE email = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
                [email]
            );
            return result.length > 0;
        } catch (error) {
            console.error('Error checking valid OTP:', error);
            return false;
        }
    }

    // Get OTP attempts count for rate limiting
    async getOTPAttemptsCount(email, timeWindowMinutes = 60) {
        try {
            const cutoffTime = new Date();
            cutoffTime.setMinutes(cutoffTime.getMinutes() - timeWindowMinutes);

            const result = await query(
                `SELECT COUNT(*) as count FROM password_reset_otps 
                 WHERE email = ? AND created_at > ?`,
                [email, cutoffTime]
            );

            return result[0].count;
        } catch (error) {
            console.error('Error getting OTP attempts count:', error);
            return 0;
        }
    }

    // Clean up expired OTPs (run periodically)
    async cleanupExpiredOTPs() {
        try {
            const result = await query(
                'DELETE FROM password_reset_otps WHERE expires_at < NOW() OR created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)'
            );

            console.log(`Cleaned up ${result.affectedRows} expired OTP records`);
            return result.affectedRows;
        } catch (error) {
            console.error('Error cleaning up expired OTPs:', error);
            return 0;
        }
    }

    // Get OTP statistics for monitoring
    async getOTPStats() {
        try {
            const stats = await query(`
                SELECT 
                    COUNT(*) as total_otps,
                    COUNT(CASE WHEN is_used = TRUE THEN 1 END) as used_otps,
                    COUNT(CASE WHEN expires_at > NOW() AND is_used = FALSE THEN 1 END) as active_otps,
                    COUNT(CASE WHEN expires_at < NOW() AND is_used = FALSE THEN 1 END) as expired_otps
                FROM password_reset_otps 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            return stats[0];
        } catch (error) {
            console.error('Error getting OTP stats:', error);
            return null;
        }
    }
}

module.exports = new OTPService();
