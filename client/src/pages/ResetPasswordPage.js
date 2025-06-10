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
    background-color: #333;
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 4px;
  text-align: center;
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
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
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        resetCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email: formData.email,
                resetCode: formData.resetCode,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setMessage('Password successfully reset');
                // Navigate to login page after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResetContainer>
            <LogoContainer>
                <Logo src={logo} alt="Seven Four Clothing" />
            </LogoContainer>
            <Title>Reset Password</Title>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {message && <SuccessMessage>{message}</SuccessMessage>}

            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={location.state?.email}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="resetCode">Verification Code</Label>
                    <Input
                        type="text"
                        id="resetCode"
                        name="resetCode"
                        value={formData.resetCode}
                        onChange={handleChange}
                        required
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                    />
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
                        minLength="6"
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
                        minLength="6"
                    />
                </FormGroup>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>

                <BackToLogin>
                    <Link to="/login">Back to Login</Link>
                </BackToLogin>
            </Form>
        </ResetContainer>
    );
};

export default ResetPasswordPage;