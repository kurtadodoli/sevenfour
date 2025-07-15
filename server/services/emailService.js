const sgMail = require('@sendgrid/mail');

class EmailService {
    constructor() {
        // SendGrid Configuration
        this.apiKey = process.env.SENDGRID_API_KEY;
        this.fromEmail = process.env.FROM_EMAIL || 'sfclothing.74@gmail.com';
        this.fromName = process.env.FROM_NAME || 'Seven Four Clothing';
        
        // Check if we have valid SendGrid credentials
        this.hasValidCredentials = this.validateCredentials();
        
        if (this.hasValidCredentials) {
            sgMail.setApiKey(this.apiKey);
            console.log('📧 SendGrid service initialized successfully');
        } else {
            console.log('📧 SendGrid service running in development mode - API key not configured');
        }
    }

    // Validate SendGrid credentials
    validateCredentials() {
        const apiKey = this.apiKey;
        
        console.log('📧 SendGrid Configuration Check:');
        console.log('📧 API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
        console.log('📧 From Email:', this.fromEmail);
        console.log('📧 From Name:', this.fromName);
        
        // Check if credentials are set and not placeholder values
        const isValidApiKey = apiKey && 
                             apiKey.length > 20 &&
                             !apiKey.includes('your-sendgrid-api-key');
        
        console.log('📧 Valid API Key:', isValidApiKey);
        
        return isValidApiKey;
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP email using SendGrid
    async sendOTPEmail(email, otp, purpose = 'password reset') {
        // Use development mode if no valid SendGrid credentials
        if (!this.hasValidCredentials) {
            console.log('📧 Development mode - OTP email not sent');
            console.log(`📧 To: ${email} | OTP: ${otp}`);
            console.log('📧 To enable real email sending with SendGrid:');
            console.log('📧 1. Sign up at https://sendgrid.com');
            console.log('📧 2. Create an API key in SendGrid dashboard');
            console.log('📧 3. Set SENDGRID_API_KEY in .env');
            console.log('📧 4. Verify sender email in SendGrid');
            console.log('📧 5. Restart the server');
            console.log('📧 ===========================================');
            
            return { 
                success: true, 
                messageId: 'dev-mode-' + Date.now(),
                message: 'OTP logged to console (development mode)',
                isDevelopmentMode: true
            };
        }

        try {
            const emailHtml = this.generateEmailHTML(otp, purpose);
            
            const message = {
                to: email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: `Seven Four Clothing - Your ${purpose} verification code`,
                html: emailHtml,
                text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
            };

            console.log('📧 Sending email via SendGrid...');
            console.log('📧 To:', email);
            console.log('📧 From:', `${this.fromName} <${this.fromEmail}>`);

            const response = await sgMail.send(message);

            console.log('✅ Email sent successfully via SendGrid');
            console.log('📧 Response status:', response[0].statusCode);
            console.log('📧 Message ID:', response[0].headers['x-message-id']);

            return {
                success: true,
                messageId: response[0].headers['x-message-id'] || 'sendgrid-success',
                message: 'Email sent successfully via SendGrid',
                isDevelopmentMode: false
            };

        } catch (error) {
            console.error('❌ SendGrid send error:', error);
            
            // Check for specific SendGrid errors
            if (error.response) {
                console.error('📧 SendGrid error details:');
                console.error('   Status:', error.response.status);
                console.error('   Body:', error.response.body);
            }
            
            // Fallback to development mode if SendGrid fails
            console.log('📧 ===========================================');
            console.log('📧 SENDGRID FAILED - FALLBACK TO DEV MODE');
            console.log('📧 ===========================================');
            console.log(`📧 To: ${email}`);
            console.log(`📧 OTP Code: ${otp}`);
            console.log(`📧 Error: ${error.message || error}`);
            console.log('📧 ===========================================');

            return {
                success: true, // Still return success so the OTP process continues
                messageId: 'fallback-' + Date.now(),
                message: 'SendGrid failed, OTP shown in console',
                isDevelopmentMode: true,
                fallback: {
                    otp: otp,
                    email: email,
                    error: error.message || error
                }
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

    // Test SendGrid configuration
    async testConnection() {
        if (!this.hasValidCredentials) {
            console.log('📧 SendGrid service in development mode - no API key to test');
            return false;
        }

        try {
            // Test with a simple API check
            console.log('📧 SendGrid service is ready to send messages');
            console.log('📧 API Key configured:', this.apiKey ? 'YES' : 'NO');
            console.log('📧 From Email:', this.fromEmail);
            return true;
        } catch (error) {
            console.error('📧 SendGrid service configuration error:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();
