import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import logo from '../assets/images/sfc-logo.png';

const ResetContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #000;
  color: #fff;
  border: none;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background-color: #333;  }
`;

const LogoContainer = styled.div`
    text-align: center;
    margin-bottom: 2rem;
`;

const Logo = styled.img`
    height: 60px;
`;

const SuccessMessage = styled.div`
    color: #28a745;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const BackToLogin = styled.div`
    text-align: center;
    margin-top: 1rem;
    
    a {
        color: #000;
        text-decoration: none;
        
        &:hover {
            text-decoration: underline;
        }
    }
`;

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        resetCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isDevelopmentMode, setIsDevelopmentMode] = useState(location.state?.isDevelopmentMode || false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Clear errors when user types
        if (error) setError('');
    };

    // Verify OTP as user types (debounced)
    const verifyOTPCode = async (otp) => {
        if (otp.length === 6 && /^\d{6}$/.test(otp)) {
            setIsVerifying(true);
            try {
                const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                    email: formData.email,
                    otp: otp
                });
                
                if (response.data.success) {
                    setOtpVerified(true);
                    setError('');
                } else {
                    setOtpVerified(false);
                    setError('Invalid verification code');
                }
            } catch (err) {
                setOtpVerified(false);
                setError(err.response?.data?.message || 'Invalid verification code');
            } finally {
                setIsVerifying(false);
            }
        } else {
            setOtpVerified(false);
        }
    };

    const handleOTPChange = (e) => {
        const otp = e.target.value.replace(/\D/g, ''); // Only digits
        if (otp.length <= 6) {
            setFormData({
                ...formData,
                resetCode: otp
            });
            
            // Verify OTP when 6 digits are entered
            if (otp.length === 6) {
                verifyOTPCode(otp);
            } else {
                setOtpVerified(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Check password strength
        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email: formData.email,
                otp: formData.resetCode,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setMessage('Password successfully reset! Redirecting to login...');
                // Navigate to login page after 3 seconds
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            message: 'Password reset successfully. You can now login with your new password.' 
                        } 
                    });
                }, 3000);
            }
        } catch (err) {
            console.error('Reset password error:', err);
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                setError(err.response.data.errors.join(', '));
            } else {
                setError(err.response?.data?.message || 'Error resetting password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP function
    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
                email: formData.email
            });

            if (response.data.success) {
                setMessage('New verification code sent! Check your email or server console.');
                setIsDevelopmentMode(response.data.isDevelopmentMode || false);
                
                // Start cooldown timer
                setResendCooldown(60); // 60 seconds cooldown
                const timer = setInterval(() => {
                    setResendCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Error sending new verification code. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <ResetContainer>
            <LogoContainer>
                <Logo src={logo} alt="Seven Four Clothing" />
            </LogoContainer>
            <Title>Reset Password</Title>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {message && <SuccessMessage>{message}</SuccessMessage>}            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={location.state?.email || isLoading}
                        style={{
                            backgroundColor: location.state?.email ? '#f5f5f5' : 'white'
                        }}
                    />
                </FormGroup>                <FormGroup>
                    <Label htmlFor="resetCode">
                        Verification Code
                        {isVerifying && <span style={{color: '#999', marginLeft: '8px'}}>Verifying...</span>}
                        {otpVerified && <span style={{color: '#28a745', marginLeft: '8px'}}>✓ Verified</span>}
                    </Label>
                    <Input
                        type="text"
                        id="resetCode"
                        name="resetCode"
                        value={formData.resetCode}
                        onChange={handleOTPChange}
                        required
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                        style={{
                            borderColor: otpVerified ? '#28a745' : (formData.resetCode.length === 6 && !otpVerified) ? '#dc3545' : '#ddd',
                            borderWidth: '2px'
                        }}
                        disabled={isLoading}
                    />
                    <div style={{fontSize: '12px', color: '#666', margin: '5px 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>
                            {isDevelopmentMode 
                                ? 'Check the server console for the 6-digit verification code'
                                : 'Check your email for the 6-digit verification code'
                            }
                        </span>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isResending || resendCooldown > 0}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: resendCooldown > 0 ? '#999' : '#007bff',
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                textDecoration: 'underline'
                            }}
                        >
                            {isResending ? 'Sending...' : 
                             resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                             'Resend Code'}
                        </button>
                    </div>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength="8"
                        placeholder="At least 8 characters"
                        disabled={isLoading || !otpVerified}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="8"
                        placeholder="Confirm your new password"
                        disabled={isLoading || !otpVerified}
                    />
                </FormGroup>

                <Button 
                    type="submit" 
                    disabled={isLoading || !otpVerified || !formData.newPassword || !formData.confirmPassword}
                    style={{
                        opacity: (!otpVerified || !formData.newPassword || !formData.confirmPassword) ? 0.5 : 1
                    }}
                >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <Button 
                    type="button" 
                    onClick={handleResendOTP}
                    disabled={isResending || resendCooldown > 0}
                    style={{
                        marginTop: '0.5rem',
                        backgroundColor: resendCooldown > 0 ? '#ccc' : '#007bff',
                        color: resendCooldown > 0 ? '#666' : '#fff',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        opacity: resendCooldown > 0 ? 0.7 : 1
                    }}
                >
                    {isResending ? 'Resending OTP...' : resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                </Button>

                <BackToLogin>
                    <Link to="/login">Back to Login</Link>
                </BackToLogin>
            </Form>
        </ResetContainer>
    );
};

export default ResetPasswordPage;