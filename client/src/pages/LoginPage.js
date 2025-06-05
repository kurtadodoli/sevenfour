import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        try {
            const response = await axios.post(
                'http://localhost:5001/api/auth/login',
                formData
            );

            if (response.data.success) {
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Update auth context
                setAuth({
                    isAuthenticated: true,
                    user: response.data.user,
                    token: response.data.token
                });

                // Redirect to profile page
                navigate('/profile');
            }
        } catch (error) {
            setError(
                error.response?.data?.message || 
                'Login failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <LoginForm onSubmit={handleSubmit}>
                <Title>Login</Title>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                
                <FormGroup>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Password</Label>
                    <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                <Links>
                    <Link onClick={() => navigate('/register')}>
                        Don't have an account? Register
                    </Link>
                    <Link onClick={() => navigate('/forgot-password')}>
                        Forgot Password?
                    </Link>
                </Links>
            </LoginForm>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding: 2rem;
    background-color: #f5f5f5;
`;

const LoginForm = styled.form`
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
`;

const FormGroup = styled.div`
    margin-bottom: 1rem;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 0.75rem;
    background-color: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;

    &:hover {
        background-color: #333;
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    text-align: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
`;

const Links = styled.div`
    margin-top: 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Link = styled.span`
    color: #007bff;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

export default LoginPage;