const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Check if we have valid email credentials
        this.hasValidCredentials = this.validateCredentials();
        
        if (this.hasValidCredentials) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            console.log('📧 Email service running in development mode - credentials not configured');
        }
    }

    // Validate email credentials
    validateCredentials() {
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;
        
        // Check if credentials are set and not placeholder values
        const isValidUser = user && 
                           user !== 'sevenfourclothing@gmail.com' && 
                           user.includes('@') && 
                           !user.includes('your-email');
        
        const isValidPass = pass && 
                           pass !== 'abcd efgh ijkl mnop' && 
                           pass.length > 10 &&
                           !pass.includes('your-app-password');
        
        return isValidUser && isValidPass;
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP email
    async sendOTPEmail(email, otp, purpose = 'password reset') {
        console.log('📧 Email service check:');
        console.log('📧 Has valid credentials:', this.hasValidCredentials);
        console.log('📧 EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
        
        // Use development mode if no valid email credentials
        if (!this.hasValidCredentials) {
            console.log('📧 ===========================================');
            console.log('📧 DEVELOPMENT MODE - EMAIL NOT SENT');
            console.log('📧 ===========================================');
            console.log(`📧 To: ${email}`);
            console.log(`📧 Subject: Seven Four Clothing - Your ${purpose} verification code`);
            console.log(`📧 OTP Code: ${otp}`);
            console.log(`📧 This code expires in 10 minutes`);
            console.log('📧 ===========================================');
            console.log('📧 To enable real email sending:');
            console.log('📧 1. Set EMAIL_USER to your Gmail address');
            console.log('📧 2. Set EMAIL_PASS to your Gmail App Password');
            console.log('📧 3. Restart the server');
            console.log('📧 ===========================================');
            
            return { 
                success: true, 
                messageId: 'dev-mode-' + Date.now(),
                message: 'OTP logged to console (development mode)',
                isDevelopmentMode: true
            };
        }

        // Production email sending code
        const mailOptions = {
            from: `Seven Four Clothing <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Seven Four Clothing - Your ${purpose} verification code`,
            html: this.generateEmailHTML(otp, purpose)
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('📧 OTP email sent successfully to:', email);
            console.log('📧 Message ID:', result.messageId);
            return { 
                success: true, 
                messageId: result.messageId,
                isDevelopmentMode: false
            };
        } catch (error) {
            console.error('📧 Failed to send OTP email:', error.message);
            
            // Fallback to development mode if email fails
            console.log('📧 ===========================================');
            console.log('📧 EMAIL FAILED - FALLBACK TO CONSOLE');
            console.log('📧 ===========================================');
            console.log(`📧 To: ${email}`);
            console.log(`📧 OTP Code: ${otp}`);
            console.log('📧 ===========================================');
            
            return { 
                success: true, 
                messageId: 'fallback-' + Date.now(),
                message: 'Email sending failed, OTP logged to console',
                isDevelopmentMode: true,
                error: error.message
            };
        }
    }

    // Generate email HTML template
    generateEmailHTML(otp, purpose) {
        return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; font-weight: 300; letter-spacing: 2px; margin: 0;">SEVEN FOUR CLOTHING</h1>
        </div>
        
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verification Code</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Hello,</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password. Please use the verification code below to proceed:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
            <div style="background-color: #f8f8f8; border: 2px solid #000; padding: 20px; border-radius: 8px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; font-family: 'Courier New', monospace;">
                    ${otp}
                </span>
            </div>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            This verification code will expire in <strong>10 minutes</strong> for security reasons.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            If you didn't request this password reset, please ignore this email or contact our support team.
        </p>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center;">
            <p style="color: #999; font-size: 14px; margin: 0;">
                Seven Four Clothing<br/>
                This is an automated message, please do not reply.
            </p>
        </div>
    </div>
</div>`;
    }

    // Test email configuration
    async testConnection() {
        if (!this.hasValidCredentials) {
            console.log('📧 Email service in development mode - no credentials to test');
            return false;
        }

        try {
            await this.transporter.verify();
            console.log('📧 Email service is ready to send messages');
            return true;
        } catch (error) {
            console.error('📧 Email service configuration error:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();
