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
    
    const from = location.state?.from?.pathname || '/';

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            navigate(from, { replace: true });
        }
    }, [currentUser, navigate, from]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) {
            clearError();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            return;
        }

        setIsLoading(true);
        
        try {
            await login(formData);
            // Navigation will happen automatically via useEffect when currentUser changes
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
                            />
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </PasswordToggle>
                        </PasswordContainer>
                    </InputGroup>

                    <LoginButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
`;

const LoginCard = styled.div`
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
`;

const LogoContainer = styled.div`
    margin-bottom: 30px;
`;

const Logo = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 10px;
    object-fit: cover;
`;

const CompanyName = styled.h1`
    color: #333;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
`;

const Title = styled.h2`
    color: #333;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
`;

const Subtitle = styled.p`
    color: #666;
    font-size: 16px;
    margin-bottom: 30px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InputGroup = styled.div`
    text-align: left;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
    font-size: 14px;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
`;

const PasswordContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const PasswordToggle = styled.button`
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    
    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const LoginButton = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
`;

const ErrorMessage = styled.div`
    background: #fee;
    color: #c33;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #fcc;
    font-size: 14px;
`;

const LinksContainer = styled.div`
    margin: 20px 0;
`;

const StyledLink = styled(Link)`
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;

    &:hover {
        text-decoration: underline;
    }
`;

const RegisterPrompt = styled.p`
    margin-top: 20px;
    color: #666;
    font-size: 14px;
`;

const TestAccountInfo = styled.div`
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    text-align: left;
    
    h4 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 14px;
    }
    
    p {
        margin: 5px 0;
        font-size: 12px;
        color: #666;
        font-family: monospace;
    }
`;

export default LoginPage;
