import React from 'react';
import styled from 'styled-components';

const Welcome = ({ user }) => {
    return (
        <WelcomeContainer>
            <WelcomeMessage>
                Welcome back, {user.first_name}!
            </WelcomeMessage>
            <LoginStatus>
                ✅ You are successfully logged in
            </LoginStatus>
            <UserInfo>
                <InfoItem>
                    <Label>Email:</Label>
                    <Value>{user.email}</Value>
                </InfoItem>
                <InfoItem>
                    <Label>Username:</Label>
                    <Value>{user.username}</Value>
                </InfoItem>
            </UserInfo>
        </WelcomeContainer>
    );
};

const WelcomeContainer = styled.div`
    padding: 2rem;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin: 2rem auto;
    max-width: 600px;
`;

const WelcomeMessage = styled.h1`
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1rem;
    text-align: center;
`;

const LoginStatus = styled.div`
    text-align: center;
    color: #27ae60;
    font-weight: 500;
    margin-bottom: 2rem;
`;

const UserInfo = styled.div`
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
`;

const InfoItem = styled.div`
    display: flex;
    margin: 0.5rem 0;
`;

const Label = styled.span`
    font-weight: bold;
    width: 100px;
`;

const Value = styled.span`
    color: #2c3e50;
`;

export default Welcome;