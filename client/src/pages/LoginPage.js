import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo.png';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const { login, currentUser, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/';    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            console.log('User detected in context, preparing to redirect to:', from);
            
            // Give the token storage a moment to sync
            const redirectTimer = setTimeout(() => {
                console.log('Redirecting to:', from);
                navigate(from, { replace: true });
            }, 300); // A bit longer delay to ensure everything is ready
            
            return () => clearTimeout(redirectTimer);
        }
    }, [currentUser, navigate, from]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value.trim() // Trim whitespace to prevent common login issues
        }));
        // Clear error when user starts typing
        if (error) {
            clearError();
        }
    };const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            return;
        }

        setIsLoading(true);
        console.log('Submitting login form...');
        
        try {
            // Clean up inputs
            const loginData = {
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            };
            
            const loginResult = await login(loginData);
            console.log('Login API call successful');
            
            // If login is successful but navigation doesn't happen automatically
            if (loginResult?.success && loginResult?.user) {
                console.log('Login successful, token received');
                
                // Try forcing the user into context
                if (!currentUser) {
                    console.log('Setting current user explicitly');
                    // This is handled by the login function now, but just in case
                }
                
                // Make sure to navigate even if the context update doesn't trigger useEffect
                setTimeout(() => {
                    console.log('Checking if redirect happened automatically...');
                    // Get the current location and see if we're still on the login page
                    if (window.location.pathname.includes('/login')) {
                        console.log('Manual redirect to:', from);
                        navigate(from, { replace: true });
                    }
                }, 800);
            }
        } catch (error) {
            console.error('Login error:', error);
            // Error is already handled by auth context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <LoginCard>
                <LogoContainer>
                    <Logo src={logo} alt="Seven Four Clothing" />
                    <CompanyName>Seven Four Clothing</CompanyName>
                </LogoContainer>

                <Title>Welcome Back</Title>
                <Subtitle>Sign in to your account</Subtitle>

                {error && (
                    <ErrorMessage>
                        {error}
                    </ErrorMessage>
                )}

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label>Password</Label>
                        <PasswordContainer>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                required
                                disabled={isLoading}
                            />                            <PasswordToggle
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </PasswordToggle>
                        </PasswordContainer>
                    </InputGroup>                    <LoginButton type="submit" disabled={isLoading}>
                        <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                    </LoginButton>
                </Form>

                <LinksContainer>
                    <StyledLink to="/forgot-password">Forgot Password?</StyledLink>
                </LinksContainer>

                <RegisterPrompt>
                    Don't have an account?{' '}
                    <StyledLink to="/register">Sign up here</StyledLink>
                </RegisterPrompt>

                <TestAccountInfo>
                    <h4>Test Admin Account:</h4>
                    <p>Email: kurtadodoli@gmail.com</p>
                    <p>Password: Admin123!@#</p>
                </TestAccountInfo>
            </LoginCard>
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    padding: 20px;
`;

const LoginCard = styled.div`
    background: #ffffff;
    padding: 60px 40px;
    width: 100%;
    max-width: 420px;
    text-align: center;
`;

const LogoContainer = styled.div`
    margin-bottom: 50px;
`;

const Logo = styled.img`
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
    object-fit: contain;
`;

const CompanyName = styled.h1`
    color: #000000;
    font-size: 32px;
    font-weight: 300;
    margin: 0;
    letter-spacing: 3px;
    text-transform: uppercase;
`;

const Title = styled.h2`
    color: #000000;
    font-size: 24px;
    font-weight: 400;
    margin-bottom: 8px;
    letter-spacing: 1px;
`;

const Subtitle = styled.p`
    color: #666666;
    font-size: 14px;
    margin-bottom: 40px;
    font-weight: 300;
    letter-spacing: 0.5px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const InputGroup = styled.div`
    text-align: left;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: #000000;
    font-weight: 400;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const Input = styled.input`
    width: 100%;
    padding: 16px 0;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background-color: transparent;
    font-weight: 300;

    &:focus {
        outline: none;
        border-bottom: 1px solid #000000;
    }

    &:disabled {
        background-color: transparent;
        cursor: not-allowed;
        opacity: 0.6;
    }

    &::placeholder {
        color: #999999;
        font-weight: 300;
    }
`;

const PasswordContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const PasswordToggle = styled.button`
    position: absolute;
    right: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: #999999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    
    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    &:hover:not(:disabled) {
        color: #000000;
    }

    svg {
        transition: color 0.3s ease;
    }
`;

const LoginButton = styled.button`
    background: #000000;
    color: #ffffff;
    border: none;
    padding: 18px 32px;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.4s ease;
    margin-top: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    overflow: hidden;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: #ffffff;
        transition: left 0.4s ease;
        z-index: 0;
    }

    &:hover:not(:disabled):before {
        left: 0;
    }

    &:hover:not(:disabled) {
        color: #000000;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    span {
        position: relative;
        z-index: 1;
    }
`;

const ErrorMessage = styled.div`
    background: #f8f8f8;
    color: #000000;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 14px;
    font-weight: 300;
    border-left: 3px solid #000000;
`;

const LinksContainer = styled.div`
    margin: 30px 0 20px 0;
`;

const StyledLink = styled(Link)`
    color: #666666;
    text-decoration: none;
    font-weight: 300;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: color 0.3s ease;

    &:hover {
        color: #000000;
    }
`;

const RegisterPrompt = styled.p`
    margin-top: 40px;
    color: #666666;
    font-size: 14px;
    font-weight: 300;
`;

const TestAccountInfo = styled.div`
    margin-top: 40px;
    padding: 24px;
    background: #f8f8f8;
    text-align: left;
    
    h4 {
        margin: 0 0 16px 0;
        color: #000000;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 400;
    }
    
    p {
        margin: 8px 0;
        font-size: 12px;
        color: #666666;
        font-family: 'Courier New', monospace;
        font-weight: 300;
    }
`;

export default LoginPage;
