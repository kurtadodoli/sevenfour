import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo-white.png';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

// Styled Components
const SidebarContainer = styled.div`
  width: ${props => props.$minimized ? '80px' : '200px'};
  height: 100vh;
  background: #0a0a0a;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow-y: auto;
  transition: width 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

const LogoSection = styled.div`
  padding: ${props => props.$minimized ? '16px 12px' : '20px 16px'};
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
  justify-content: ${props => props.$minimized ? 'center' : 'flex-start'};
  /* No transition - only sidebar width should animate */
`;

const LogoWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
`;

const Logo = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
`;

const NavSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  color: #666;
  font-size: 11px;
  text-transform: uppercase;
  margin: ${props => props.$minimized ? '16px 0 8px' : '0 0 12px 16px'};
  padding: 0;
  font-weight: 600;
  letter-spacing: 1px;
  opacity: ${props => props.$minimized ? '0' : '1'};
  height: ${props => props.$minimized ? '0' : 'auto'};
  overflow: hidden;
  /* No transition - only sidebar width should animate */
`;

const NavItem = styled.div`
  margin: 2px 12px;
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.$minimized ? '12px 0' : '10px 12px'};
  color: ${props => props.$active ? '#ffffff' : '#999'};
  text-decoration: none;
  border-radius: ${props => props.$minimized ? '0' : '8px'};
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease; /* Only transition hover states */
  position: relative;
  background: ${props => {
    if (props.$minimized) return 'transparent';
    return props.$active ? 'rgba(255, 255, 255, 0.08)' : 'transparent';
  }};
  border: ${props => {
    if (props.$minimized) return 'none';
    return props.$active ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent';
  }};
  justify-content: ${props => props.$minimized ? 'center' : 'flex-start'};
  
  &:hover {
    color: white;
    background: ${props => {
      if (props.$minimized) return 'transparent';
      return 'rgba(255, 255, 255, 0.06)';
    }};
    border-color: ${props => {
      if (props.$minimized) return 'transparent';
      return 'rgba(255, 255, 255, 0.08)';
    }};
  }
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.$minimized ? '0' : '10px'};
  position: relative;
  flex-shrink: 0;
  /* No transition - icons should remain static */
  
  svg {
    width: 18px;
    height: 18px;
    color: inherit;
    /* No transition - icons should remain static */
  }

  ${props => props.$minimized && `
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 50px;
      top: 50%;
      transform: translateY(-50%);
      padding: 8px 12px;
      background: #333;
      color: white;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      transition: opacity 0.2s ease, transform 0.2s ease;
      
      &::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-right: 4px solid #333;
      }
    }
    
    &:hover::after {
      opacity: 1;
      transform: translateY(-50%) translateX(8px);
    }
  `}
`;

const LinkText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  opacity: ${props => props.$minimized ? '0' : '1'};
  width: ${props => props.$minimized ? '0' : 'auto'};
  overflow: hidden;
  /* No transition - text should appear/disappear instantly with sidebar */
  white-space: nowrap;
`;

// Icons
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

const OrderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
        <polyline points="9 11 12 14 15 11"/>
        <line x1="12" y1="2" x2="12" y2="14"/>
    </svg>
);

const InventoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z"/>
        <path d="M3.27 6.96 12 12.01l8.73-5.05"/>
        <path d="M12 22.08V12"/>
    </svg>
);

const TransactionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
    </svg>
);

const DeliveryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
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

const CustomIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
);

const RegistrationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="8.5" cy="7" r="4"/>
        <line x1="20" y1="8" x2="20" y2="14"/>
        <line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
);

const Sidebar = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const { isMinimized, toggleSidebar } = useSidebar();
    const isAdmin = currentUser?.role === 'admin';    return (        <SidebarContainer $minimized={isMinimized}>
            <LogoSection $minimized={isMinimized}>
                <LogoWrapper onClick={toggleSidebar}>
                    <Logo src={logo} alt="Seven Four Clothing" />
                </LogoWrapper>
            </LogoSection>{/* Main Section */}
            <NavSection>
                {!isMinimized && <SectionTitle $minimized={isMinimized}>MAIN</SectionTitle>}
                <NavItem>
                    <StyledLink to="/" $active={location.pathname === '/'} $minimized={isMinimized}>
                        <IconWrapper $minimized={isMinimized} data-tooltip="Home">
                            <HomeIcon />
                        </IconWrapper>
                        {!isMinimized && <LinkText $minimized={isMinimized}>Home</LinkText>}
                    </StyledLink>
                </NavItem>
                {isAdmin && (
                    <NavItem>
                        <StyledLink to="/dashboard" $active={location.pathname === '/dashboard'} $minimized={isMinimized}>
                            <IconWrapper $minimized={isMinimized} data-tooltip="Dashboard">
                                <DashboardIcon />
                            </IconWrapper>
                            {!isMinimized && <LinkText $minimized={isMinimized}>Dashboard</LinkText>}
                        </StyledLink>
                    </NavItem>
                )}
            </NavSection>            {/* Shop Section */}
            <NavSection>
                {!isMinimized && <SectionTitle $minimized={isMinimized}>SHOP</SectionTitle>}
                <NavItem>
                    <StyledLink to="/products" $active={location.pathname === '/products'} $minimized={isMinimized}>
                        <IconWrapper $minimized={isMinimized} data-tooltip="Products">
                            <ProductIcon />
                        </IconWrapper>
                        {!isMinimized && <LinkText $minimized={isMinimized}>Products</LinkText>}
                    </StyledLink>
                </NavItem>
                <NavItem>
                    <StyledLink to="/custom" $active={location.pathname === '/custom'} $minimized={isMinimized}>
                        <IconWrapper $minimized={isMinimized} data-tooltip="Custom Design">
                            <CustomIcon />
                        </IconWrapper>
                        {!isMinimized && <LinkText $minimized={isMinimized}>Custom Design</LinkText>}
                    </StyledLink>
                </NavItem>
                <NavItem>
                    <StyledLink to="/orders" $active={location.pathname === '/orders'} $minimized={isMinimized}>
                        <IconWrapper $minimized={isMinimized} data-tooltip="Orders">
                            <OrderIcon />
                        </IconWrapper>
                        {!isMinimized && <LinkText $minimized={isMinimized}>Orders</LinkText>}
                    </StyledLink>
                </NavItem>
            </NavSection>

            {/* Management Section - Admin Only */}
            {isAdmin && (
                <NavSection>
                    {!isMinimized && <SectionTitle $minimized={isMinimized}>MANAGEMENT</SectionTitle>}
                    <NavItem>
                        <StyledLink to="/inventory" $active={location.pathname === '/inventory'} $minimized={isMinimized}>
                            <IconWrapper $minimized={isMinimized} data-tooltip="Inventory">
                                <InventoryIcon />
                            </IconWrapper>
                            {!isMinimized && <LinkText $minimized={isMinimized}>Inventory</LinkText>}
                        </StyledLink>
                    </NavItem>
                    <NavItem>
                        <StyledLink to="/transactions" $active={location.pathname === '/transactions'} $minimized={isMinimized}>
                            <IconWrapper $minimized={isMinimized} data-tooltip="Transactions">
                                <TransactionIcon />
                            </IconWrapper>
                            {!isMinimized && <LinkText $minimized={isMinimized}>Transactions</LinkText>}
                        </StyledLink>
                    </NavItem>                    <NavItem>
                        <StyledLink to="/maintenance" $active={location.pathname === '/maintenance'} $minimized={isMinimized}>
                            <IconWrapper $minimized={isMinimized} data-tooltip="Maintenance">
                                <SettingsIcon />
                            </IconWrapper>
                            {!isMinimized && <LinkText $minimized={isMinimized}>Maintenance</LinkText>}
                        </StyledLink>
                    </NavItem>
                    <NavItem>
                        <StyledLink to="/registration" $active={location.pathname === '/registration'} $minimized={isMinimized}>
                            <IconWrapper $minimized={isMinimized} data-tooltip="Registration">
                                <RegistrationIcon />
                            </IconWrapper>
                            {!isMinimized && <LinkText $minimized={isMinimized}>Registration</LinkText>}
                        </StyledLink>
                    </NavItem>
                    <NavItem>
                        <StyledLink to="/search" $active={location.pathname === '/search'} $minimized={isMinimized}>
                            <IconWrapper $minimized={isMinimized} data-tooltip="Search">
                                <SearchIcon />
                            </IconWrapper>
                            {!isMinimized && <LinkText $minimized={isMinimized}>Search</LinkText>}
                        </StyledLink>
                    </NavItem><NavItem>
                        <StyledLink to="/delivery" $active={location.pathname === '/delivery'} $minimized={isMinimized}>
                            <IconWrapper $minimized={isMinimized} data-tooltip="Delivery">
                                <DeliveryIcon />
                            </IconWrapper>
                            {!isMinimized && <LinkText $minimized={isMinimized}>Delivery</LinkText>}
                        </StyledLink>
                    </NavItem>
                </NavSection>
            )}

            {/* Support Section */}
            <NavSection>
                {!isMinimized && <SectionTitle $minimized={isMinimized}>SUPPORT</SectionTitle>}
                <NavItem>
                    <StyledLink to="/help" $active={location.pathname === '/help'} $minimized={isMinimized}>
                        <IconWrapper $minimized={isMinimized} data-tooltip="Help">
                            <HelpIcon />
                        </IconWrapper>
                        {!isMinimized && <LinkText $minimized={isMinimized}>Help</LinkText>}
                    </StyledLink>
                </NavItem>
                <NavItem>
                    <StyledLink to="/about" $active={location.pathname === '/about'} $minimized={isMinimized}>
                        <IconWrapper $minimized={isMinimized} data-tooltip="About">
                            <InfoIcon />
                        </IconWrapper>
                        {!isMinimized && <LinkText $minimized={isMinimized}>About</LinkText>}
                    </StyledLink>
                </NavItem>
            </NavSection>
        </SidebarContainer>
    );
};

export default Sidebar;
