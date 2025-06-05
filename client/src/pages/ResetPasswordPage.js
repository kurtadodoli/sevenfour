import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext'; // Update this line

const ResetContainer = styled.div`
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

const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth(); // Use the hook instead of useContext
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const { password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await resetPassword(resetToken, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setSuccess(false);
      // Error is already handled in the AuthContext
    }
  };

  return (
    <ResetContainer>
      <Title>Reset Password</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="password">New Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </FormGroup>
        
        {formError && <Message type="error">{formError}</Message>}
        {success && (
          <Message type="success">
            Password has been reset successfully! Redirecting to login page...
          </Message>
        )}
        
        <Button type="submit">Reset Password</Button>
      </Form>
      
      <LoginLink>
        Remember your password? <Link to="/login">Sign in</Link>
      </LoginLink>
    </ResetContainer>
  );
};

export default ResetPasswordPage;