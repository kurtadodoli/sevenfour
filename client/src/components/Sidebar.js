import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo-white.png';
import { useAuth } from '../context/AuthContext';

// Styled Components
const SidebarContainer = styled.div`
  width: ${props => props.$minimized ? '80px' : '240px'};
  height: 100vh;
  background: #1a1a1a;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
`;

const LogoSection = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 20px;
`;

const LogoWrapper = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  background: transparent;
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
`;

const NavLinks = styled.div`
  padding: 20px 0;
  overflow-y: auto;
  height: calc(100vh - 80px);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const SectionTitle = styled.h3`
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
  margin: 20px 20px 10px;
  transition: opacity 0.3s ease;
  opacity: ${props => props.$minimized ? '0' : '1'};
  height: ${props => props.$minimized ? '10px' : 'auto'};
`;

const NavItem = styled.div`
  margin: 2px 0;
  padding: 0 10px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 10px;
  color: ${props => props.$active ? '#fff' : '#999'};
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 6px;
  
  span {
    margin-left: 15px;
    opacity: ${props => props.$minimized ? '0' : '1'};
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  
  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }
`;

// White SVG Icons
const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const ProductIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
    </svg>
);

const CartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
    </svg>
);

const OrderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
);

const TruckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M16 16h6V8l-6-6H2v14h14v-6zM16 16l6-6"/>
        <circle cx="7" cy="20" r="2"/>
        <circle cx="17" cy="20" r="2"/>
    </svg>
);

const ShippingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
);

const InventoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M21 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3"/>
        <path d="M3 16v3a2 2 0 002 2h14a2 2 0 002-2v-3"/>
        <path d="M3 8h18v8H3z"/>
    </svg>
);

const HelpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12" y2="17"/>
    </svg>
);

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12" y2="8"/>
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
        <SidebarContainer $minimized={isMinimized}>
            <LogoSection onClick={toggleSidebar}>
                <LogoWrapper>
                    <Logo src={logo} alt="Seven Four Clothing" />
                </LogoWrapper>
            </LogoSection>
            <NavLinks>
                {/* Main section - visible to all */}
                <SectionTitle $minimized={isMinimized}>{!isMinimized && 'Main'}</SectionTitle>
                <NavItem $active={location.pathname === '/'}>
                    <StyledLink to="/" $minimized={isMinimized}>
                        <IconWrapper>
                            <HomeIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Home</span>}
                    </StyledLink>
                </NavItem>

                {/* Dashboard - admin only */}
                {isAdmin && (
                    <NavItem $active={location.pathname === '/dashboard'}>
                        <StyledLink to="/dashboard" $minimized={isMinimized}>
                            <IconWrapper>
                                <DashboardIcon />
                            </IconWrapper>
                            {!isMinimized && <span>Dashboard</span>}
                        </StyledLink>
                    </NavItem>
                )}

                {/* Shop section - visible to all */}
                <SectionTitle $minimized={isMinimized}>{!isMinimized && 'Shop'}</SectionTitle>
                <NavItem $active={location.pathname === '/products'}>
                    <StyledLink to="/products" $minimized={isMinimized}>
                        <IconWrapper>
                            <ProductIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Products</span>}
                    </StyledLink>
                </NavItem>
                <NavItem $active={location.pathname === '/cart'}>
                    <StyledLink to="/cart" $minimized={isMinimized}>
                        <IconWrapper>
                            <CartIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Cart</span>}
                    </StyledLink>
                </NavItem>

                {/* Delivery section - conditional rendering */}
                <SectionTitle>{!isMinimized && 'Delivery'}</SectionTitle>
                <NavItem $active={location.pathname === '/orders'}>
                    <StyledLink to="/orders" $minimized={isMinimized}>
                        <IconWrapper>
                            <OrderIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Orders</span>}
                    </StyledLink>
                </NavItem>
                {isAdmin && (
                    <>
                        <NavItem $active={location.pathname === '/tracking'}>
                            <StyledLink to="/tracking" $minimized={isMinimized}>
                                <IconWrapper>
                                    <TruckIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Tracking</span>}
                            </StyledLink>
                        </NavItem>
                        <NavItem $active={location.pathname === '/shipping'}>
                            <StyledLink to="/shipping" $minimized={isMinimized}>
                                <IconWrapper>
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
                        <SectionTitle>{!isMinimized && 'Management'}</SectionTitle>
                        <NavItem $active={location.pathname === '/maintenance'}>
                            <StyledLink to="/maintenance" $minimized={isMinimized}>
                                <IconWrapper>
                                    <SettingsIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Maintenance</span>}
                            </StyledLink>
                        </NavItem>
                        <NavItem $active={location.pathname === '/inventory'}>
                            <StyledLink to="/inventory" $minimized={isMinimized}>
                                <IconWrapper>
                                    <InventoryIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Inventory</span>}
                            </StyledLink>
                        </NavItem>
                    </>
                )}

                {/* Support section - visible to all */}
                <SectionTitle>{!isMinimized && 'Support'}</SectionTitle>
                <NavItem $active={location.pathname === '/help'}>
                    <StyledLink to="/help" $minimized={isMinimized}>
                        <IconWrapper>
                            <HelpIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Help</span>}
                    </StyledLink>
                </NavItem>
                <NavItem $active={location.pathname === '/about'}>
                    <StyledLink to="/about" $minimized={isMinimized}>
                        <IconWrapper>
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