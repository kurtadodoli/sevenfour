import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import axios from 'axios';
import logo from '../assets/images/sfc-logo.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const returnUrl = location.state?.returnUrl || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {            const response = await axios.post('/api/auth/login', formData);
            
            if (response.data.token) {
                // Store the token
                localStorage.setItem('token', response.data.token);
                
                // Update auth context
                await login(response.data.token);
                
                setMessage('Login successful!');
                
                // Navigate based on role and return URL
                const redirectPath = response.data.user.role === 'admin' ? '/dashboard' : returnUrl;
                setTimeout(() => {
                    navigate(redirectPath);
                }, 500);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(
                error.response?.data?.message ||
                'Invalid email or password. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <LoginContainer>
                <LogoContainer>
                    <Logo src={logo} alt="Seven Four Clothing" />
                </LogoContainer>
                <FormSection>
                    <Title>Welcome Back</Title>
                    <SubTitle>Please sign in to your account</SubTitle>

                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                            />
                        </InputGroup>

                        <LoginButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </LoginButton>

                        <Links>
                            <StyledLink to="/forgot-password">
                                Forgot Password?
                            </StyledLink>
                            <StyledLink to="/register">
                                Don't have an account? Sign up
                            </StyledLink>
                        </Links>
                    </Form>
                </FormSection>
            </LoginContainer>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #f8f9fa;
`;

const LoginContainer = styled.div`
    width: 100%;
    max-width: 550px; // Increased from 450px
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-top: -60px;
`;

const LogoContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px 0 20px;
`;

const Logo = styled.img`
    height: 80px; // Increased from 60px
    width: auto;
    object-fit: contain;
`;

const FormSection = styled.div`
    padding: 50px; // Increased from 40px
`;

const Title = styled.h1`
    font-size: 32px; // Increased from 28px
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px; // Increased from 8px
    text-align: center;
`;

const SubTitle = styled.p`
    font-size: 18px; // Increased from 16px
    color: #666;
    margin-bottom: 40px; // Increased from 32px
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #333;
`;

const Input = styled.input`
    padding: 14px 18px; // Increased from 12px 16px
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px; // Increased from 15px
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #1a1a1a;
        box-shadow: 0 0 0 2px rgba(26, 26, 26, 0.1);
    }
`;

const LoginButton = styled.button`
    background: #1a1a1a;
    color: white;
    padding: 16px; // Increased from 14px
    border: none;
    border-radius: 8px;
    font-size: 18px; // Increased from 16px
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        background: #666;
        cursor: not-allowed;
    }
`;

const Links = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
    text-align: center;
`;

const StyledLink = styled(Link)`
    color: #1a1a1a;
    font-weight: 600;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const ErrorMessage = styled.div`
    background: #ffe5e5;
    color: #dc3545;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
    text-align: center;
`;

const SuccessMessage = styled.div`
    background: #d1e7dd;
    color: #0f5132;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
    text-align: center;
`;

export default LoginPage;