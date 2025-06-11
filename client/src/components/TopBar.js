import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import logo from '../assets/images/sfc-logo-white.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const TopBarContainer = styled.div`
  height: 60px;
  background: #1a1a1a;
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
  color: white;
`;

const LogoSection = styled.div`
  height: 60px;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 40px;
  width: 40px;
  object-fit: contain;
`;

const NavSection = styled.div`
  position: absolute;
  top: 60px;
  left: ${props => props.$isOpen ? '0' : '-240px'};
  width: 240px;
  background: #1a1a1a;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  transition: left 0.3s ease;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  padding: 1rem 2rem;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    opacity: 1;
    background: rgba(255, 255, 255, 0.05);
    border-left: 3px solid white;
  }
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

const TopBar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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
  }, []);

  return (
    <TopBarContainer>
      <LogoSection onClick={() => setIsNavOpen(!isNavOpen)}>
        <Logo src={logo} alt="Seven Four Clothing" />
      </LogoSection>

      <NavSection $isOpen={isNavOpen}>
        <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </NavLink>
        <NavLink to="/products" className={location.pathname === '/products' ? 'active' : ''}>
          Shop
        </NavLink>
        <NavLink to="/cart" className={location.pathname === '/cart' ? 'active' : ''}>
          Cart
        </NavLink>
        <NavLink to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>
          Orders
        </NavLink>
        <NavLink to="/help" className={location.pathname === '/help' ? 'active' : ''}>
          Help
        </NavLink>
        <NavLink to="/about" className={location.pathname === '/about' ? 'active' : ''}>
          About
        </NavLink>
      </NavSection>

      <AccountSection>
        {isAuthenticated ? (
          <AccountDropdown ref={dropdownRef}>
            <AccountButton onClick={() => setShowDropdown(!showDropdown)}>
              <UserAvatar 
                src={user?.profile_picture_url}
                alt={`${user?.first_name || 'User'}'s profile`}
              />
              <span>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user.email}
              </span>
              <DropdownArrow $isOpen={showDropdown} />
            </AccountButton>
            {showDropdown && (
              <DropdownMenu>
                <DropdownItem onClick={() => {
                  navigate('/profile');
                  setShowDropdown(false);
                }}>
                  My Profile
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>
                  Logout
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