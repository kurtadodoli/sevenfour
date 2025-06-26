import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import logo from '../assets/images/sfc-logo.png';

const ForgotContainer = styled.div`
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
  font-size: 1rem;  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background-color: #333;
  }
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

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
                email
            });            if (response.data.success) {
                if (response.data.isDevelopmentMode) {
                    setMessage('Verification code generated! Check the server console for the 6-digit code, then proceed to reset your password.');
                } else {
                    setMessage('Verification code has been sent to your email. Please check your inbox and spam folder.');
                }
                // Navigate to reset password page after 3 seconds
                setTimeout(() => {
                    navigate('/reset-password', { 
                        state: { 
                            email,
                            isDevelopmentMode: response.data.isDevelopmentMode
                        } 
                    });
                }, 3000);
            }} catch (err) {
            console.error('Password reset error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message.includes('Network Error')) {
                setError('Unable to connect to server. Please try again.');
            } else {
                setError('Error requesting password reset. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ForgotContainer>
            <LogoContainer>
                <Logo src={logo} alt="Seven Four Clothing" />
            </LogoContainer>
            <Title>Forgot Password</Title>
            <p>Enter your email address and we'll send you a code to reset your password.</p>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {message && <SuccessMessage>{message}</SuccessMessage>}

            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </FormGroup>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                </Button>

                <BackToLogin>
                    <Link to="/login">Back to Login</Link>
                </BackToLogin>
            </Form>
        </ForgotContainer>
    );
};

export default ForgotPasswordPage;