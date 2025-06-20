import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import logo from '../assets/images/sfc-logo-white.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHome, 
  faShoppingBag, 
  faQuestionCircle, 
  faInfoCircle, 
  faSignOutAlt,  faCog,
  faChartLine,
  faClipboardList,
  faTruck,
  faSearch,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';

const TopBarContainer = styled.div`
  height: 60px;
  background: #050505;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 900;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  
  &::after {
    content: '';
    position: absolute;
    left: 65px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 30px;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
    opacity: 0.7;
  }
`;

// Removed unused MenuToggle component

const LogoSection = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  padding: ${props => props.$isMenuToggle ? '0 8px' : '0'};
  border-radius: 8px;
  position: relative;  overflow: visible;
  
  // Remove the before pseudo-element for minimalist design
  ${props => props.$isMenuToggle && `
    &:hover {
      opacity: 0.9;
    }
    
    &:active {
      opacity: 0.8;
    }
  `}
`;

const Logo = styled.img`
  height: 28px;
  width: 28px;
  object-fit: contain;
  margin-left: 5px;
  transition: opacity 0.2s ease;
  position: relative;
  z-index: 1;
  opacity: 0.9;
  
  &:hover {
    opacity: 1;
  }
`;

const NavSection = styled.div`
  position: absolute;
  top: 60px;
  left: ${props => props.$isOpen ? '0' : '-200px'};
  width: 200px;
  background: #0a0a0a;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isOpen ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  z-index: 990;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;  background-color: rgba(0, 0, 0, 0.2);
  z-index: 980;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.25s ease, visibility 0.25s ease;
  // Removed blur effect
  }
`;

const NavSectionTitle = styled.div`
  color: #888888;
  font-size: 9px;
  text-transform: uppercase;
  margin: 14px 16px 4px;
  padding: 0 6px;
  font-weight: 500;
  letter-spacing: 0.8px;
  position: relative;
  opacity: 0.7;
`;

const NavLink = styled(Link)`
  color: #e0e0e0;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.6rem 1.1rem;
  margin: 2px 6px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  border: none;
  opacity: 0.85;.icon-container {
    width: 18px;
    height: 18px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: white;
    opacity: 0.8;
    font-size: 16px;
    background: transparent;
    box-shadow: none;
    border: none;
  }    .nav-text {
    font-weight: 400;
    font-size: 12px;
  }&.active {
    opacity: 1;
    background: rgba(255, 255, 255, 0.06);
    box-shadow: none;
    border-left: 2px solid #ffffff;
    
    .icon-container {
      opacity: 1;
      color: #ffffff;
    }
  }
    &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.03);
    transform: translateX(2px);
    
    .icon-container {
      opacity: 1;
      transform: scale(1.05);
      color: #ffffff;
    }
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
  height: 1px;  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
  margin: 0.5rem 1rem;
`;

const TopBar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentUser, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const logoRef = useRef(null);
  
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
    };  }, []);
  
  // Removed hint functionality
  return (
    <TopBarContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>        <LogoSection 
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label={isNavOpen ? "Close menu" : "Open menu"}
          title={isNavOpen ? "Click to close menu" : "Click to open menu"}
          $isMenuToggle={true}
          $isOpen={isNavOpen}
          ref={logoRef}
        ><Logo 
            src={logo} 
            alt="Seven Four Clothing" 
            $isMenuToggle={true}
          />
        </LogoSection>
      </div>
      {isNavOpen && <Overlay $isOpen={isNavOpen} onClick={() => setIsNavOpen(false)} />}
      <NavSection $isOpen={isNavOpen}>
        <NavSectionTitle>Main</NavSectionTitle>        <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
          <div className="icon-container">
            <FontAwesomeIcon icon={faHome} style={{ color: 'white' }} />
          </div>
          <span className="nav-text">Home</span>
        </NavLink>
        
        {isAuthenticated && currentUser?.role === 'admin' && (
          <NavLink to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>          <div className="icon-container">
            <FontAwesomeIcon icon={faChartLine} style={{ color: 'white' }} />
          </div>
            <span className="nav-text">Dashboard</span>
          </NavLink>
        )}
          <NavSectionTitle>Shop</NavSectionTitle>        <NavLink to="/products" className={location.pathname === '/products' ? 'active' : ''}>
          <div className="icon-container">
            <FontAwesomeIcon icon={faShoppingBag} style={{ color: 'white' }} />
          </div>
          <span className="nav-text">Products</span>
        </NavLink>
        
        {/* Cart and Wishlist removed from sidebar - functionality moved to Orders page */}
        
          {/* Only show Orders & Delivery section for authenticated non-admin users */}
        {isAuthenticated && currentUser?.role !== 'admin' && (          <>
            <NavSectionTitle>Orders & Delivery</NavSectionTitle>
            <NavLink to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>
              <div className="icon-container">
                <FontAwesomeIcon icon={faClipboardList} style={{ color: 'white' }} />
              </div>
              <span className="nav-text">Orders</span>
            </NavLink>
          </>
        )}{isAuthenticated && currentUser?.role === 'admin' && (
          <>
            <NavSectionTitle>Management</NavSectionTitle>
            
            <NavLink to="/inventory" className={location.pathname === '/inventory' ? 'active' : ''}>
              <div className="icon-container">
                <FontAwesomeIcon icon={faClipboardList} style={{ color: 'white' }} />
              </div>
              <span className="nav-text">Inventory</span>            </NavLink>
              <NavLink to="/maintenance" className={location.pathname === '/maintenance' ? 'active' : ''}>
              <div className="icon-container">
                <FontAwesomeIcon icon={faCog} style={{ color: 'white' }} />
              </div>
              <span className="nav-text">Maintenance</span>
            </NavLink>
            
            <NavLink to="/transactions" className={location.pathname === '/transactions' ? 'active' : ''}>
              <div className="icon-container">
                <FontAwesomeIcon icon={faReceipt} style={{ color: 'white' }} />
              </div>
              <span className="nav-text">Transactions</span>
            </NavLink>
              <NavLink to="/search" className={location.pathname === '/search' ? 'active' : ''}>
              <div className="icon-container">
                <FontAwesomeIcon icon={faSearch} style={{ color: 'white' }} />
              </div>
              <span className="nav-text">Search</span>
            </NavLink>
            
            <NavLink to="/delivery" className={location.pathname === '/delivery' ? 'active' : ''}>
              <div className="icon-container">
                <FontAwesomeIcon icon={faTruck} style={{ color: 'white' }} />              </div>
              <span className="nav-text">Delivery</span>
            </NavLink>
          </>
        )}
        
        <NavSectionTitle>Support</NavSectionTitle>
        <NavLink to="/help" className={location.pathname === '/help' ? 'active' : ''}>
          <div className="icon-container">
            <FontAwesomeIcon icon={faQuestionCircle} style={{ color: 'white' }} />
          </div>
          <span className="nav-text">Help</span>
        </NavLink>
        
        <NavLink to="/about" className={location.pathname === '/about' ? 'active' : ''}>
          <div className="icon-container">
            <FontAwesomeIcon icon={faInfoCircle} style={{ color: 'white' }} />
          </div>
          <span className="nav-text">About</span>
        </NavLink>
      </NavSection>

      <AccountSection>        {isAuthenticated ? (
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
              <DropdownMenu>                <DropdownItem onClick={() => {
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