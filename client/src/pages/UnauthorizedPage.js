import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const UnauthorizedContainer = styled.div`
  max-width: 600px;
  margin: 5rem auto;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #f44336;
`;

const Message = styled.p`
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background-color: #000;
  color: #fff;
  padding: 0.8rem 2rem;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #333;
  }
`;

const UnauthorizedPage = () => {
  return (
    <UnauthorizedContainer>
      <Title>Access Denied</Title>
      <Message>
        You do not have permission to access this page. 
        Please contact an administrator if you believe this is an error.
      </Message>
      <HomeButton to="/">Go to Homepage</HomeButton>
    </UnauthorizedContainer>
  );
};

export default UnauthorizedPage;