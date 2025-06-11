import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

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
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.first_name || !formData.last_name || !formData.email || 
            !formData.password || !formData.confirmPassword || !formData.gender || 
            !formData.birthday) {
            setError('All fields are required');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('/api/auth/register', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                gender: formData.gender,
                birthday: formData.birthday
            });

            if (response.data) {
                navigate('/login', { 
                    state: { message: 'Registration successful! Please login.' }
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(
                error.response?.data?.message ||
                'An error occurred during registration. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RegisterContainer>
            <RegisterBox>
                <Title>Create Account</Title>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>First Name</Label>
                        <Input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your first name"
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label>Last Name</Label>
                        <Input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
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
                            <option value="">Select gender</option>
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
                        />
                    </InputGroup>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </Button>
                </Form>

                <Links>
                    <StyledLink to="/login">
                        Already have an account? Sign in
                    </StyledLink>
                </Links>
            </RegisterBox>
        </RegisterContainer>
    );
};

const RegisterContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f4f4f9;
`;

const RegisterBox = styled.div`
    background: #fff;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 24px;
    font-size: 28px;
    font-weight: 600;
    color: #333;
`;

const ErrorMessage = styled.div`
    background: #ffe5e5;
    color: #dc3545;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
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

const Links = styled.div`
    margin-top: 16px;
    text-align: center;
`;

const StyledLink = styled(Link)`
    color: #1a1a1a;
    text-decoration: none;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const Button = styled.button`
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
