import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const ForgotContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #000;
  color: #fff;
  border: none;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background-color: #333;
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 4px;
  text-align: center;
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
`;

const ForgotPasswordPage = () => {
  const { forgotPassword, error, setError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      await forgotPassword(email);
      setSuccess(true);
      setMessage('Password reset email sent! Please check your inbox');
    } catch (err) {
      setSuccess(false);
      // Error is already handled in the AuthContext
    }
  };

  return (
    <ForgotContainer>
      <Title>Forgot Password</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        
        {message && <Message type={success ? 'success' : 'error'}>{message}</Message>}
        {error && <Message type="error">{error}</Message>}
        
        <Button type="submit">Send Reset Email</Button>
      </Form>
      
      <LoginLink>
        Remember your password? <Link to="/login">Sign in</Link>
      </LoginLink>
    </ForgotContainer>
  );
};

export default ForgotPasswordPage;