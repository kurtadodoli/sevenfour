import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo-white.png';
import { useAuth } from '../context/AuthContext';

// Styled Components
const SidebarContainer = styled.div`
  width: ${props => props.$minimized ? '80px' : '280px'};
  height: 100vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  z-index: 1000;
  box-shadow: ${props => props.$minimized ? '6px 0 25px rgba(0, 0, 0, 0.4)' : '3px 0 15px rgba(0, 0, 0, 0.2)'};
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
`;

const LogoSection = styled.div`
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$minimized ? 'center' : 'flex-start'};
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 ${props => props.$minimized ? '0' : '28px'};
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const LogoWrapper = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const Logo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  transition: transform 0.3s ease;
`;

const CompanyName = styled.span`
  color: #ffffff;
  font-size: 19px;
  font-weight: 700;
  margin-left: 18px;
  opacity: ${props => props.$minimized ? '0' : '1'};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  font-family: 'Arial', sans-serif;
`;

const NavLinks = styled.div`
  padding: 20px 0;
  overflow-y: auto;
  overflow-x: visible;
  height: calc(100vh - 90px);
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const SectionTitle = styled.h3`
  color: #888;
  font-size: 10px;
  text-transform: uppercase;
  margin: 28px 28px 16px;
  transition: all 0.3s ease;
  opacity: ${props => props.$minimized ? '0' : '1'};
  height: ${props => props.$minimized ? '0px' : 'auto'};
  overflow: hidden;
  font-weight: 700;
  letter-spacing: 1.2px;
`;

const NavItem = styled.div`
  margin: 6px 16px;
  position: relative;
  
  &:hover {
    transform: translateX(3px);
  }
  
  transition: transform 0.2s ease;
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: ${props => props.$active ? '#ffffff' : '#b8b8b8'};
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 14px;
  position: relative;
  overflow: visible;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  
  span {
    margin-left: 18px;
    opacity: ${props => props.$minimized ? '0' : '1'};
    transition: opacity 0.3s ease;
    white-space: nowrap;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.3px;
  }

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateX(6px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.98) translateX(6px);
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.2));
  }

  /* Enhanced glow effect when sidebar is minimized */
  ${props => props.$minimized && `
    &::before {
      content: '';
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    &:hover::before {
      opacity: 1;
    }

    &:hover svg {
      transform: scale(1.2);
      filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.6));
    }
  `}

  &:hover svg {
    transform: scale(1.1);
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
`;

// Enhanced modern white SVG icons with better stroke weight
const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

const ProductIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);

const CartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1"/>
        <circle cx="19" cy="21" r="1"/>
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
);

const OrderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
);

const TruckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
);

const ShippingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);

const InventoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z"/>
        <path d="M3.27 6.96 12 12.01l8.73-5.05"/>
        <path d="M12 22.08V12"/>
    </svg>
);

const HelpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <point x="12" y="17"/>
    </svg>
);

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
    </svg>
);

const Sidebar = () => {
    const [isMinimized, setIsMinimized] = useState(false);
    const location = useLocation();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const toggleSidebar = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <SidebarContainer $minimized={isMinimized}>            <LogoSection $minimized={isMinimized} onClick={toggleSidebar}>
                <LogoWrapper>
                    <Logo src={logo} alt="Seven Four Clothing" />
                </LogoWrapper>
                <CompanyName $minimized={isMinimized}>Seven Four</CompanyName>
            </LogoSection>
            <NavLinks>
                {/* Main section - visible to all */}
                <SectionTitle $minimized={isMinimized}>{!isMinimized && 'Main'}</SectionTitle>                <NavItem>
                    <StyledLink to="/" $minimized={isMinimized} $active={location.pathname === '/'}>
                        <IconWrapper $minimized={isMinimized}>
                            <HomeIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Home</span>}
                    </StyledLink>
                </NavItem>

                {/* Dashboard - admin only */}                {isAdmin && (
                    <NavItem>
                        <StyledLink to="/dashboard" $minimized={isMinimized} $active={location.pathname === '/dashboard'}>
                            <IconWrapper $minimized={isMinimized}>
                                <DashboardIcon />
                            </IconWrapper>
                            {!isMinimized && <span>Dashboard</span>}
                        </StyledLink>
                    </NavItem>
                )}

                {/* Shop section - visible to all */}
                <SectionTitle $minimized={isMinimized}>{!isMinimized && 'Shop'}</SectionTitle>                <NavItem>
                    <StyledLink to="/products" $minimized={isMinimized} $active={location.pathname === '/products'}>
                        <IconWrapper $minimized={isMinimized}>
                            <ProductIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Products</span>}
                    </StyledLink>
                </NavItem>
                <NavItem>
                    <StyledLink to="/cart" $minimized={isMinimized} $active={location.pathname === '/cart'}>
                        <IconWrapper $minimized={isMinimized}>
                            <CartIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Cart</span>}
                    </StyledLink>
                </NavItem>{/* Delivery section - conditional rendering */}
                <SectionTitle $minimized={isMinimized}>{!isMinimized && 'Delivery'}</SectionTitle>                <NavItem>
                    <StyledLink to="/orders" $minimized={isMinimized} $active={location.pathname === '/orders'}>
                        <IconWrapper $minimized={isMinimized}>
                            <OrderIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Orders</span>}
                    </StyledLink>
                </NavItem>
                {isAdmin && (
                    <>                        <NavItem>
                            <StyledLink to="/tracking" $minimized={isMinimized} $active={location.pathname === '/tracking'}>
                                <IconWrapper $minimized={isMinimized}>
                                    <TruckIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Tracking</span>}
                            </StyledLink>
                        </NavItem>
                        <NavItem>
                            <StyledLink to="/shipping" $minimized={isMinimized} $active={location.pathname === '/shipping'}>
                                <IconWrapper $minimized={isMinimized}>
                                    <ShippingIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Shipping</span>}
                            </StyledLink>
                        </NavItem>
                    </>
                )}

                {/* Management section - admin only */}
                {isAdmin && (
                    <>
                        <SectionTitle $minimized={isMinimized}>{!isMinimized && 'Management'}</SectionTitle>                        <NavItem>
                            <StyledLink to="/maintenance" $minimized={isMinimized} $active={location.pathname === '/maintenance'}>
                                <IconWrapper $minimized={isMinimized}>
                                    <SettingsIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Maintenance</span>}
                            </StyledLink>
                        </NavItem>
                        <NavItem>
                            <StyledLink to="/inventory" $minimized={isMinimized} $active={location.pathname === '/inventory'}>
                                <IconWrapper $minimized={isMinimized}>
                                    <InventoryIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Inventory</span>}
                            </StyledLink>
                        </NavItem>
                    </>
                )}                {/* Support section - visible to all */}
                <SectionTitle $minimized={isMinimized}>{!isMinimized && 'Support'}</SectionTitle>                <NavItem>
                    <StyledLink to="/help" $minimized={isMinimized} $active={location.pathname === '/help'}>
                        <IconWrapper $minimized={isMinimized}>
                            <HelpIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Help</span>}
                    </StyledLink>
                </NavItem>
                <NavItem>
                    <StyledLink to="/about" $minimized={isMinimized} $active={location.pathname === '/about'}>
                        <IconWrapper $minimized={isMinimized}>
                            <InfoIcon />
                        </IconWrapper>
                        {!isMinimized && <span>About</span>}
                    </StyledLink>
                </NavItem>
            </NavLinks>
        </SidebarContainer>
    );
};

export default Sidebar;