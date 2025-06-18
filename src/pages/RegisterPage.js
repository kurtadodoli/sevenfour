import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo.png';

const RegisterPage = () => {    const [formData, setFormData] = useState({
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
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);    const [validationError, setValidationError] = useState('');

    const { currentUser, error, clearError, register } = useAuth();
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
    }, [clearError]);    const handleChange = (e) => {
        const { name, value } = e.target;
        // Trim whitespace for email and names, leave as-is for password fields
        const trimmedValue = (name === 'password' || name === 'confirmPassword') 
            ? value 
            : value.trim();
            
        setFormData(prev => ({
            ...prev,
            [name]: trimmedValue
        }));
        
        // Clear errors when user starts typing
        if (error) {
            clearError();
        }
        if (validationError) {
            setValidationError('');
        }
    };

    // Password strength validation
    const validatePasswordStrength = (password) => {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return errors;
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
        
        // Password strength validation
        const passwordErrors = validatePasswordStrength(formData.password);
        if (passwordErrors.length > 0) {
            return passwordErrors[0]; // Return the first error
        }

        // Password match validation
        if (formData.password !== formData.confirmPassword) {
            return 'Passwords do not match';
        }// Age validation (must be at least 13 years old)
        const today = new Date();
        const birthDate = new Date(formData.birthday);
        let ageValue = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            ageValue--;
        }

        if (ageValue < 13) {
            return 'You must be at least 13 years old to register';
        }

        // Password validation
        if (formData.password) {
            const passwordErrors = validatePasswordStrength(formData.password);
            if (passwordErrors.length > 0) {
                return passwordErrors[0]; // Return the first error
            }
        }

        return null;
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setValidationError('');
        clearError();
        
        const validateResult = validateForm();
        if (validateResult) {
            setValidationError(validateResult);
            return;
        }

        setIsLoading(true);        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registerData } = formData;
            
            console.log('Submitting registration form with data:', registerData);
            
            // Use the register method from AuthContext
            const result = await register(registerData);
            
            console.log('Registration result:', result);
            
            // Success is handled by the AuthContext:
            // - It sets the token in localStorage
            // - It sets the currentUser state
            // - The useEffect above will detect the currentUser and navigate automatically
            
            // Clear form after successful registration
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                confirmPassword: '',
                gender: '',
                birthday: ''
            });
        } catch (error) {
            console.error('Registration error:', error);
            
            // Use both the error from context and our local validation error
            const errorMessage = error.message || 'Registration failed. Please try again.';
            setValidationError(errorMessage);
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
                <Subtitle>Join our community today</Subtitle>                {(error || validationError) && (
                    <ErrorMessage>
                        {validationError || error}
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
                            />                            <PasswordToggle
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
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
                    </InputGroup>                    <RegisterButton type="submit" disabled={isLoading}>
                        <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
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
    background: #ffffff;
    padding: 20px;
`;

const RegisterCard = styled.div`
    background: #ffffff;
    padding: 60px 40px;
    width: 100%;
    max-width: 520px;
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

const InputRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

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

const Select = styled.select`
    width: 100%;
    padding: 16px 0;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background-color: transparent;
    font-weight: 300;
    cursor: pointer;

    &:focus {
        outline: none;
        border-bottom: 1px solid #000000;
    }

    &:disabled {
        background-color: transparent;
        cursor: not-allowed;
        opacity: 0.6;
    }

    option {
        background-color: #ffffff;
        color: #000000;
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

const PasswordRequirements = styled.div`
    font-size: 11px;
    color: #999999;
    margin-top: 8px;
    text-align: left;
    font-weight: 300;
    letter-spacing: 0.3px;
`;

const RegisterButton = styled.button`
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

const LoginPrompt = styled.p`
    margin-top: 40px;
    color: #666666;
    font-size: 14px;
    font-weight: 300;
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

export default RegisterPage;
