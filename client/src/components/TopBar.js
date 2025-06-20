import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

const TopBarContainer = styled.div`
  height: 60px;
  background: #050505;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 1.25rem;
  position: fixed;
  top: 0;
  right: 0;
  left: 0; /* Full width - sidebar will overlay */
  z-index: 900;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
`;

const AccountSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AccountIcon = styled(FontAwesomeIcon)`
  color: white;
  font-size: 1.2rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const AccountLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  text-decoration: none;
`;

const AccountButton = styled.button`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.8rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  span {
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
`;

const AccountDropdown = styled.div.attrs({ ref: React.forwardRef })`
  position: relative;
  display: inline-block;
`;

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
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  min-width: 220px;
  padding: 0.7rem 0;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: dropdownFade 0.25s cubic-bezier(0.4, 0, 0.2, 1);

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
  padding: 0.8rem 1.2rem;
  border: none;
  background: none;
  color: #e0e0e0;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  svg {
      color: #999;
      transition: all 0.2s ease;
  }

  &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      
      svg {
          color: #ffffff;
          transform: scale(1.1);
      }
  }
  
  &:active {
      background-color: rgba(255, 255, 255, 0.12);
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
  margin: 0.5rem 1rem;
`;

const TopBar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const isAuthenticated = !!currentUser && !loading;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

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
  }, []);  return (
    <TopBarContainer>
      <AccountSection>
        {isAuthenticated ? (
          <AccountDropdown ref={dropdownRef}>
            <AccountButton onClick={() => setShowDropdown(!showDropdown)}>
              <UserAvatar 
                src={currentUser?.profile_picture_url}
                alt={`${currentUser?.first_name || 'User'}'s profile`}
              />
              <span>
                {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name}` : currentUser.email}
              </span>
              <DropdownArrow $isOpen={showDropdown} />
            </AccountButton>
            {showDropdown && (
              <DropdownMenu>
                <DropdownItem onClick={() => {
                  navigate('/profile');
                  setShowDropdown(false);
                }}>
                  <FontAwesomeIcon icon={faUser} style={{ width: 16 }} />
                  <span style={{ marginLeft: '8px' }}>My Profile</span>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} style={{ width: 16 }} />
                  <span style={{ marginLeft: '8px' }}>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            )}
          </AccountDropdown>
        ) : (
          <AccountLink to="/login">
            <AccountIcon icon={faUser} />
          </AccountLink>
        )}
      </AccountSection>
    </TopBarContainer>
  );
};

export default TopBar;