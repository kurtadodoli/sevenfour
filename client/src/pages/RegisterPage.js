import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/sfc-logo.png';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        try {
            const registerData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                gender: formData.gender || 'other',
                birthday: formData.birthday || '1990-01-01'
            };

            const response = await register(registerData);
            
            if (response.success) {
                navigate('/login');
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
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

                    <InputGroup>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="8"
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
                            minLength="6"
                        />
                    </InputGroup>

                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'CREATE MY ACCOUNT'}
                    </SubmitButton>

                    <LoginLink>
                        Already have an account? <StyledLink to="/login">Login here</StyledLink>
                    </LoginLink>
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

const LoginLink = styled.p`
    text-align: center;
    font-size: 14px;
    color: #666;
`;

const StyledLink = styled(Link)`
    color: #1a1a1a;
    text-decoration: none;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const SubmitButton = styled.button`
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
