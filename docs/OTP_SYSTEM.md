# OTP Password Reset System

This document explains the implementation of the OTP (One-Time Password) verification system for password resets in the Seven Four Clothing application.

## 🔧 Setup Instructions

### 1. Email Configuration

Add the following environment variables to your `server/.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**For Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password (not your regular password)
3. Use the App Password in the `EMAIL_PASS` field

### 2. Database Setup

The system automatically creates the required tables:
- `password_reset_otps` - Stores OTP codes and their metadata
- Updates `login_attempts` table to track password reset activities

### 3. Server Restart

Restart your server to initialize the email service and OTP cleanup processes.

## 🔄 How It Works

### Password Reset Flow

1. **Request Reset** (`/forgot-password`)
   - User enters email address
   - System checks if email exists (doesn't reveal if not found for security)
   - Generates 6-digit OTP valid for 10 minutes
   - Sends formatted email with OTP
   - Rate limited: 3 requests per hour per email

2. **Verify OTP** (`/verify-otp`)
   - Optional endpoint to verify OTP without marking as used
   - Used for real-time validation in the UI

3. **Reset Password** (`/reset-password`)
   - User enters OTP, new password, and confirmation
   - System verifies OTP and marks it as used
   - Validates password strength
   - Updates user password with bcrypt hashing
   - Logs the password reset activity

### Security Features

- **Rate Limiting**: 3 OTP requests per hour per email
- **OTP Expiration**: Codes expire after 10 minutes
- **One-Time Use**: OTPs are marked as used after successful verification
- **Password Validation**: Enforces strong password requirements
- **Activity Logging**: All attempts are logged for security monitoring
- **Automatic Cleanup**: Expired OTPs are cleaned up hourly

## 📧 Email Template

The system sends professionally formatted emails with:
- Company branding
- Clear verification code display
- Expiration information
- Security warnings
- Responsive HTML design

## 🎨 Frontend Features

### Forgot Password Page
- Clean email input form
- Success/error message display
- Automatic redirect to reset page

### Reset Password Page
- Real-time OTP verification
- Visual feedback for code validation
- Password strength requirements
- Disabled form until OTP is verified
- Progress indicators

### Enhanced UI Elements
- OTP input with proper formatting
- Countdown timer for expiration
- Resend code functionality
- Visual validation states
- Responsive design

## 🔒 Security Considerations

### Rate Limiting
- **Forgot Password**: 3 requests per hour per email
- **General API**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 30 requests per hour per IP

### Data Protection
- OTPs stored with expiration timestamps
- Sensitive data properly hashed
- IP addresses and user agents logged for monitoring
- Automatic cleanup of expired records

### Validation
- Email format validation
- OTP format validation (6 digits only)
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

## 📊 Monitoring & Maintenance

### Automatic Cleanup
- Expired OTPs are removed every hour
- Records older than 24 hours are purged
- Cleanup statistics logged to console

### Statistics
The OTP service provides statistics for monitoring:
```javascript
{
  total_otps: 150,
  used_otps: 120,
  active_otps: 5,
  expired_otps: 25
}
```

### Logging
All activities are logged:
- OTP generation and sending
- Email delivery status
- Verification attempts
- Password reset completion
- Cleanup operations

## 🚀 API Endpoints

### POST `/api/auth/forgot-password`
Request password reset OTP

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email. It will expire in 10 minutes.",
  "expiresAt": "2025-06-17T15:30:00.000Z"
}
```

### POST `/api/auth/verify-otp`
Verify OTP without marking as used

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code is valid",
  "expiresAt": "2025-06-17T15:30:00.000Z"
}
```

### POST `/api/auth/reset-password`
Reset password with OTP verification

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

## 🛠️ Troubleshooting

### Email Not Sending
1. Check email credentials in `.env`
2. Verify Gmail App Password is correct
3. Check server logs for email service errors
4. Ensure 2FA is enabled on Gmail account

### OTP Not Working
1. Check if OTP has expired (10-minute limit)
2. Verify correct email address
3. Check spam/junk folder
4. Try requesting a new OTP

### Rate Limiting Issues
1. Wait for the rate limit window to reset
2. Check if too many requests were made
3. Review rate limiting configuration

## 📱 Mobile Considerations

The system is designed to work seamlessly on mobile devices:
- Responsive email templates
- Mobile-friendly OTP input
- Touch-optimized UI elements
- Proper viewport handling

## 🔮 Future Enhancements

Potential improvements:
- SMS OTP as alternative
- Multiple email providers
- OTP retry mechanisms
- Advanced analytics
- Admin dashboard for monitoring
- Custom email templates per user type

## 📄 Dependencies

### Backend
- `nodemailer` - Email sending
- `bcrypt` - Password hashing
- `express-rate-limit` - Rate limiting
- `mysql2` - Database operations

### Frontend
- `axios` - HTTP requests
- `styled-components` - UI styling
- `react-router-dom` - Navigation

This OTP system provides a secure, user-friendly password reset experience while maintaining high security standards and monitoring capabilities.
