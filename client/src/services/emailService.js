// EmailJS Configuration and Service
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
};

class EmailJSService {
  constructor() {
    // Initialize EmailJS with public key
    if (EMAILJS_CONFIG.PUBLIC_KEY) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log('📧 EmailJS initialized successfully');
      console.log('📧 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
    } else {
      console.log('📧 EmailJS running in development mode - keys not configured');
    }
  }

  // Check if EmailJS is properly configured
  isConfigured() {
    return (
      EMAILJS_CONFIG.SERVICE_ID &&
      EMAILJS_CONFIG.TEMPLATE_ID &&
      EMAILJS_CONFIG.PUBLIC_KEY
    );
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email using EmailJS
  async sendOTPEmail(email, otp, userName = '', purpose = 'password reset') {
    console.log('📧 EmailJS Configuration Check:');
    console.log('📧 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
    console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
    console.log('📧 Public Key:', EMAILJS_CONFIG.PUBLIC_KEY ? `${EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 8)}...` : 'NOT SET');
    console.log('📧 Is Configured:', this.isConfigured());

    // Use development mode if not configured
    if (!this.isConfigured()) {
      console.log('📧 ===========================================');
      console.log('📧 DEVELOPMENT MODE - EMAIL NOT SENT');
      console.log('📧 ===========================================');
      console.log(`📧 To: ${email}`);
      console.log(`📧 Subject: Seven Four Clothing - Your ${purpose} verification code`);
      console.log(`📧 OTP Code: ${otp}`);
      console.log(`📧 This code expires in 10 minutes`);
      console.log('📧 ===========================================');
      console.log('📧 To enable real email sending with EmailJS:');
      console.log('📧 1. Sign up at https://www.emailjs.com');
      console.log('📧 2. Create a service (Gmail, Outlook, etc.)');
      console.log('📧 3. Create an email template');
      console.log('📧 4. Set environment variables in .env:');
      console.log('📧    REACT_APP_EMAILJS_SERVICE_ID=your_service_id');
      console.log('📧    REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id');
      console.log('📧    REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key');
      console.log('📧 5. Restart the React app');
      console.log('📧 ===========================================');
      
      return { 
        success: true, 
        messageId: 'dev-mode-' + Date.now(),
        message: 'OTP logged to console (development mode)',
        isDevelopmentMode: true,
        otp: otp // Include OTP for development testing
      };
    }

    try {
      console.log('📧 Sending email via EmailJS...');
      console.log('📧 To:', email);

      // Template parameters for EmailJS - matching your template variables
      const templateParams = {
        // Your template's exact variables
        passcode: otp,
        time: '10 minutes',
        email: email,
        // Additional useful variables (in case your template uses them)
        to_name: userName || email.split('@')[0],
        purpose: purpose,
        company_name: 'Seven Four Clothing'
      };

      console.log('📧 Template Params:', JSON.stringify(templateParams, null, 2));

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email sent successfully via EmailJS');
      console.log('📧 Response status:', response.status);
      console.log('📧 Response text:', response.text);

      return {
        success: true,
        messageId: response.text,
        message: 'OTP sent successfully',
        isDevelopmentMode: false
      };

    } catch (error) {
      console.error('❌ EmailJS error:', error);
      console.log('📧 Debug info:');
      console.log('📧 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      console.log('📧 Public Key:', EMAILJS_CONFIG.PUBLIC_KEY);
      
      // Return a more user-friendly error message
      let errorMessage = 'Failed to send verification code. ';
      
      if (error.status === 400) {
        errorMessage += 'Invalid email configuration.';
      } else if (error.status === 401) {
        errorMessage += 'Email service authentication failed.';
      } else if (error.status === 402) {
        errorMessage += 'Email service quota exceeded.';
      } else if (error.status === 404) {
        errorMessage += 'Email service not found.';
      } else if (error.status === 422) {
        errorMessage += 'Email template configuration error. Check template variables.';
      } else if (error.status === 429) {
        errorMessage += 'Too many email requests. Please try again later.';
      } else {
        errorMessage += 'Please try again.';
      }

      return {
        success: false,
        error: error,
        message: errorMessage,
        isDevelopmentMode: false
      };
    }
  }

  // Send general email using EmailJS
  async sendEmail(templateParams, templateId = null) {
    if (!this.isConfigured()) {
      console.log('📧 EmailJS not configured, using development mode');
      return {
        success: true,
        message: 'Email logged to console (development mode)',
        isDevelopmentMode: true
      };
    }

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        templateId || EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      return {
        success: true,
        messageId: response.text,
        message: 'Email sent successfully',
        isDevelopmentMode: false
      };

    } catch (error) {
      console.error('❌ EmailJS error:', error);
      return {
        success: false,
        error: error,
        message: 'Failed to send email. Please try again.',
        isDevelopmentMode: false
      };
    }
  }

  // Test function to verify EmailJS configuration
  async testEmailJS(testEmail = 'test@example.com') {
    console.log('🧪 Testing EmailJS configuration...');
    
    const testParams = {
      passcode: '123456',
      time: '10 minutes',
      email: testEmail
    };
    
    console.log('🧪 Test params:', testParams);
    console.log('🧪 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
    console.log('🧪 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
    
    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        testParams
      );
      
      console.log('✅ EmailJS test successful!', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ EmailJS test failed:', error);
      return { success: false, error };
    }
  }
}

// Create singleton instance
const emailJSService = new EmailJSService();

export default emailJSService;
