import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo.png';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        birthday: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, currentUser, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            navigate('/', { replace: true });
        }
    }, [currentUser, navigate]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleChange = (e) => {
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

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            return 'First name is required';
        }
        if (!formData.last_name.trim()) {
            return 'Last name is required';
        }
        if (!formData.email.trim()) {
            return 'Email is required';
        }
        if (!formData.password) {
            return 'Password is required';
        }
        if (!formData.confirmPassword) {
            return 'Please confirm your password';
        }
        if (!formData.gender) {
            return 'Please select your gender';
        }
        if (!formData.birthday) {
            return 'Birthday is required';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return 'Please enter a valid email address';
        }

        // Password match validation
        if (formData.password !== formData.confirmPassword) {
            return 'Passwords do not match';
        }

        // Age validation (must be at least 13 years old)
        const today = new Date();
        const birthDate = new Date(formData.birthday);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) {
            return 'You must be at least 13 years old to register';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            // We can't use setError directly since error comes from AuthContext
            // Instead, let the validation show in the UI or use a local error state
            return;
        }

        setIsLoading(true);
        
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registerData } = formData;
            
            await register(registerData);
            // Navigation will happen automatically via useEffect when currentUser changes
        } catch (error) {
            console.error('Registration error:', error);
            // Error is already handled by auth context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <RegisterCard>
                <LogoContainer>
                    <Logo src={logo} alt="Seven Four Clothing" />
                    <CompanyName>Seven Four Clothing</CompanyName>
                </LogoContainer>

                <Title>Create Account</Title>
                <Subtitle>Join our community today</Subtitle>

                {error && (
                    <ErrorMessage>
                        {error}
                    </ErrorMessage>
                )}

                <Form onSubmit={handleSubmit}>
                    <InputRow>
                        <InputGroup>
                            <Label>First Name</Label>
                            <Input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                                required
                                disabled={isLoading}
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label>Last Name</Label>
                            <Input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                                required
                                disabled={isLoading}
                            />
                        </InputGroup>
                    </InputRow>

                    <InputGroup>
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                        />
                    </InputGroup>

                    <InputRow>
                        <InputGroup>
                            <Label>Gender</Label>
                            <Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </Select>
                        </InputGroup>

                        <InputGroup>
                            <Label>Birthday</Label>
                            <Input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            />
                        </InputGroup>
                    </InputRow>

                    <InputGroup>
                        <Label>Password</Label>
                        <PasswordContainer>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
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
                        <PasswordRequirements>
                            Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
                        </PasswordRequirements>
                    </InputGroup>

                    <InputGroup>
                        <Label>Confirm Password</Label>
                        <PasswordContainer>
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                disabled={isLoading}
                            />
                            <PasswordToggle
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? '👁️' : '🙈'}
                            </PasswordToggle>
                        </PasswordContainer>
                    </InputGroup>

                    <RegisterButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </RegisterButton>
                </Form>

                <LoginPrompt>
                    Already have an account?{' '}
                    <StyledLink to="/login">Sign in here</StyledLink>
                </LoginPrompt>
            </RegisterCard>
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

const RegisterCard = styled.div`
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
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

const InputRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
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

const Select = styled.select`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background-color: white;

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

const PasswordRequirements = styled.div`
    font-size: 12px;
    color: #666;
    margin-top: 5px;
    text-align: left;
`;

const RegisterButton = styled.button`
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

const LoginPrompt = styled.p`
    margin-top: 20px;
    color: #666;
    font-size: 14px;
`;

const StyledLink = styled(Link)`
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
`;

export default RegisterPage;
