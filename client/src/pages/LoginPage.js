import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
  background-color: #f7f7f7;
`;

const AuthBox = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
`;

const Title = styled.h1`
  font-size: 28px;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #222222;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  border-color: ${props => props.error ? '#e74c3c' : '#ddd'};

  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
  letter-spacing: 0.5px;
  
  &:hover {
    background-color: #333;
  }

  &:disabled {
    background-color: #999;
    cursor: not-allowed;
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  margin-bottom: 20px;

  a {
    font-size: 12px;
    color: #000;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
`;

const AccountLink = styled(Link)`
  display: inline-block;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 10px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HelpText = styled.p`
  font-size: 13px;
  color: #666;
  margin-top: 20px;
  
  a {
    color: #000;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fff0f0;
  color: #e74c3c;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
`;

const LoginPage = () => {
  const { login, error: contextError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation - fixes the includes error
    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      // Error is handled in the AuthContext
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <AuthBox>
        <Title>SIGN IN</Title>
        
        {(error || contextError) && (
          <ErrorMessage>{error || contextError}</ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              type="text"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="E-mail address"
              error={error.includes('email')}
            />
          </FormGroup>
          
          <FormGroup>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Password"
              error={error.includes('password')}
            />
          </FormGroup>
          
          <ForgotPassword>
            <Link to="/forgot-password">FORGOT YOUR PASSWORD?</Link>
          </ForgotPassword>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
        
        <Footer>
          <AccountLink to="/register">
            I DON'T HAVE AN ACCOUNT YET
          </AccountLink>
          
          <HelpText>
            Still having trouble? <a href="/activate">Activate your account here.</a>
          </HelpText>
        </Footer>
      </AuthBox>
    </Container>
  );
};

export default LoginPage;