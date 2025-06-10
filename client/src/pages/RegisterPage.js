import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import logo from '../assets/images/sfc-logo.png';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        birthday: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateForm = () => {
        // Name validation
        if (!formData.firstName.trim()) return 'First name is required';
        if (!formData.lastName.trim()) return 'Last name is required';
        if (formData.firstName.length < 2 || formData.firstName.length > 50) 
            return 'First name must be between 2 and 50 characters';
        if (formData.lastName.length < 2 || formData.lastName.length > 50) 
            return 'Last name must be between 2 and 50 characters';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) return 'Email is required';
        if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';

        // Password validation
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(formData.password)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(formData.password)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(formData.password)) return 'Password must contain at least one number';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';

        // Gender and birthday validation
        if (!formData.gender) return 'Please select your gender';
        if (!formData.birthday) return 'Birthday is required';
        
        // Validate age (must be at least 13 years old)
        const birthDate = new Date(formData.birthday);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 13) return 'You must be at least 13 years old to register';

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate form
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            return;
        }

        try {
            const registerData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                gender: formData.gender,
                birthday: formData.birthday
            };

            console.log('Attempting to register with data:', registerData);
            
            const response = await axios.post(
                'http://localhost:5000/api/auth/register',
                registerData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Registration response:', response.data);

            if (response.data.success) {
                // Store the token if provided
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }

                navigate('/login', { 
                    state: { 
                        message: 'Registration successful! Please log in.',
                        email: formData.email
                    }
                });
            } else {
                setError(response.data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error.response || error);
            setError(
                error.response?.data?.message || 
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <RegisterContainer>
                <Header>
                    <Logo src={logo} alt="Logo" />
                    <Title>CREATE ACCOUNT</Title>
                    <SubTitle>Please fill in the information below:</SubTitle>
                </Header>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>First Name</Label>
                        <Input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your first name"
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label>Last Name</Label>
                        <Input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your last name"
                        />
                    </InputGroup>

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
                            minLength={8}
                            placeholder="Enter your password"
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                            placeholder="Confirm your password"
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label>Gender</Label>
                        <Select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Prefer not to say</option>
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
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </InputGroup>

                    <RegisterButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </RegisterButton>

                    <LoginPrompt>
                        Already have an account?{' '}
                        <LoginLink to="/login">Sign in</LoginLink>
                    </LoginPrompt>
                </Form>
            </RegisterContainer>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    padding: 40px 20px;
    background: #f8f8f8;
`;

const RegisterContainer = styled.div`
    max-width: 480px;
    margin: 0 auto;
    padding: 40px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 30px;
`;

const Logo = styled.img`
    max-width: 100px;
    margin-bottom: 20px;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #1a1a1a;
`;

const SubTitle = styled.p`
    color: #666;
    font-size: 14px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    color: #333;
    font-weight: 500;
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
        outline: none;
        border-color: #1a1a1a;
    }
`;

const Select = styled.select`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
    background-color: white;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #1a1a1a;
    }
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    background: #ffe5e5;
    padding: 12px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 20px;
    text-align: center;
`;

const LoginPrompt = styled.p`
    text-align: center;
    font-size: 14px;
    color: #666;
`;

const LoginLink = styled(Link)`
    color: #1a1a1a;
    text-decoration: none;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const RegisterButton = styled.button`
    background: #1a1a1a;
    color: white;
    padding: 15px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        background: #666;
        cursor: not-allowed;
    }
`;

export default RegisterPage;
