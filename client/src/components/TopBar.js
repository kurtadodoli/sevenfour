import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <TopBarContainer>
            <div></div>
            <AccountSection>
                {currentUser ? (
                    <>
                        <UserInfo>Welcome, {currentUser.email}</UserInfo>
                        <AccountButton onClick={handleLogout}>Logout</AccountButton>
                    </>
                ) : (
                    <AccountLink to="/login">
                        <AccountIcon>👤</AccountIcon>
                        <span>Account</span>
                    </AccountLink>
                )}
            </AccountSection>
        </TopBarContainer>
    );
};

const TopBarContainer = styled.div`
    height: 60px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 900;
`;

const AccountSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const AccountLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #333;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
        background: #f5f5f5;
    }
`;

const AccountIcon = styled.span`
    font-size: 1.2rem;
`;

const UserInfo = styled.span`
    color: #666;
    font-size: 0.9rem;
`;

const AccountButton = styled.button`
    background: #1a1a1a;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
        opacity: 0.9;
    }
`;

export default TopBar;