const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify SMTP connection
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        return true;
    } catch (error) {
        console.error('SMTP connection verification failed:', error);
        return false;
    }
};

// Send reset code email
const sendResetCode = async (email, resetCode) => {
    try {
        // Verify connection first
        const isConnected = await verifyConnection();
        if (!isConnected) {
            console.error('Failed to establish SMTP connection');
            return false;
        }

        console.log('Attempting to send reset code to:', email);
        
        const info = await transporter.sendMail({
            from: `"Seven Four Clothing" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code - Seven Four Clothing',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested to reset your password. Here is your verification code:</p>
                <h2 style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px;">${resetCode}</h2>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        console.error('SMTP Settings:', {
            host: transporter.options.host,
            port: transporter.options.port,
            user: process.env.EMAIL_USER
        });
        return false;
    }
};

module.exports = {
    sendResetCode,
    verifyConnection
};
