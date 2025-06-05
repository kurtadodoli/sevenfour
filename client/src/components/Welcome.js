import React from 'react';
import styled from 'styled-components';

const Welcome = ({ user }) => {
    return (
        <WelcomeContainer>
            <WelcomeMessage>Welcome back, {user.first_name}!</WelcomeMessage>
            <LoginStatus>✅ You are successfully logged in</LoginStatus>
        </WelcomeContainer>
    );
};

const WelcomeContainer = styled.div`
    text-align: center;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 2rem;
`;

const WelcomeMessage = styled.h1`
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1rem;
`;

const LoginStatus = styled.div`
    color: #28a745;
    font-size: 1.1rem;
    font-weight: 500;
`;

export default Welcome;