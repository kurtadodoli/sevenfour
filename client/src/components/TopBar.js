import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import UserAvatar from './UserAvatar';

const AccountIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const TopBar = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Handle click outside of dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                {auth.isAuthenticated ? (
                    <AccountDropdown ref={dropdownRef}>
                        <AccountButton onClick={() => setShowDropdown(!showDropdown)}>
                            <UserAvatar 
                                src={auth.user?.profile_picture_url}
                                alt={`${auth.user?.first_name || 'User'}'s profile`}
                            />
                            <span>
                                {auth.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name}` : auth.user.email}
                            </span>
                            <DropdownArrow $isOpen={showDropdown} />
                        </AccountButton>
                        {showDropdown && (
                            <DropdownMenu>
                                <DropdownItem onClick={() => {
                                    navigate('/profile');
                                    setShowDropdown(false);
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    My Profile
                                </DropdownItem>
                                <DropdownItem onClick={() => {
                                    navigate('/orders');
                                    setShowDropdown(false);
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 17h6M9 13h6M9 9h6M3 21h18V3H3z" />
                                    </svg>
                                    My Orders
                                </DropdownItem>
                                <DropdownDivider />
                                <DropdownItem onClick={handleLogout}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                                    </svg>
                                    Logout
                                </DropdownItem>
                            </DropdownMenu>
                        )}
                    </AccountDropdown>
                ) : (
                    <AccountLink to="/login">
                        <IconWrapper>
                            <AccountIcon />
                        </IconWrapper>
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

const IconWrapper = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const AccountButton = styled.button`
    display: flex;
    align-items: center;
    background: #1a1a1a;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    gap: 0.5rem;
    
    span {
        font-size: 0.9rem;
        white-space: nowrap;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &:hover {
        background: #333;
    }
`;

const AccountDropdown = styled.div.attrs({ ref: React.forwardRef })`
    position: relative;
    display: inline-block;
`;

// Using UserAvatar component instead of custom styled components

const DropdownArrow = styled.span`
    margin-left: 0.5rem;
    display: inline-block;
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    
    &::after {
        content: '▼';
        font-size: 0.8rem;
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    padding: 0.5rem 0;
    z-index: 1000;
    animation: dropdownFade 0.2s ease;

    @keyframes dropdownFade {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const DropdownItem = styled.button`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    color: #333;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s;

    svg {
        color: #666;
    }

    &:hover {
        background-color: #f5f5f5;
    }
`;

const DropdownDivider = styled.div`
    height: 1px;
    background-color: #eee;
    margin: 0.5rem 0;
`;

export default TopBar;