import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo-white.png';
import { useAuth } from '../context/AuthContext';

// Styled Components
const SidebarContainer = styled.div`
  width: ${props => props.$minimized ? '90px' : '300px'};
  height: 100vh;
  background: linear-gradient(180deg, #121212 0%, #000000 100%);
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  z-index: 1000;
  box-shadow: ${props => props.$minimized ? '6px 0 30px rgba(0, 0, 0, 0.5)' : '3px 0 20px rgba(0, 0, 0, 0.3)'};
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  padding-bottom: 20px;
`;

const LogoSection = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$minimized ? 'center' : 'flex-start'};
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 ${props => props.$minimized ? '0' : '28px'};
  position: relative;
  background: linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: ${props => props.$minimized ? '20%' : '5%'};
    width: ${props => props.$minimized ? '60%' : '90%'};
    height: 1px;
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  }
  
  &:hover {
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const LogoWrapper = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 15px;
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
  
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

const Logo = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  
  &:hover {
    transform: scale(1.1);
  }
`;

const CompanyName = styled.span`
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  margin-left: 20px;
  opacity: ${props => props.$minimized ? '0' : '1'};
  width: ${props => props.$minimized ? '0' : 'auto'};
  overflow: hidden;
  transition: all 0.4s ease;
  white-space: nowrap;
  letter-spacing: 0.8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  /* Animated gradient text when hovered */
  background-size: 200% auto;
  background-image: linear-gradient(90deg, #ffffff 0%, #3a7bd5 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  font-family: 'Arial', sans-serif;
`;

const NavLinks = styled.div`
  padding: 20px 0;
  overflow-y: auto;
  overflow-x: visible;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  
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
  color: #a0a0a0;
  font-size: 11px;
  text-transform: uppercase;
  margin: ${props => props.$minimized ? '24px auto 8px' : '30px 24px 16px'};
  padding: ${props => props.$minimized ? '0' : '0 8px'};
  transition: all 0.3s ease;
  opacity: ${props => props.$minimized ? '0' : '1'};
  height: ${props => props.$minimized ? '3px' : 'auto'};
  overflow: hidden;
  font-weight: 800;
  letter-spacing: 1.5px;
  position: relative;
  width: ${props => props.$minimized ? '30px' : 'auto'};
  text-align: ${props => props.$minimized ? 'center' : 'left'};
  
  ${props => props.$minimized && `
    &::after {
      content: '';
      position: absolute;
      width: 30px;
      height: 3px;
      background: ${props.$color || '#888'};
      border-radius: 3px;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  `}
`;

const NavItem = styled.div`
  margin: ${props => props.$minimized ? '16px auto' : '8px 16px'};
  position: relative;
  width: ${props => props.$minimized ? '60px' : 'auto'};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateX(${props => props.$minimized ? '0' : '3px'});
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.$minimized ? '8px 0' : '12px 16px'};
  color: ${props => props.$active ? '#ffffff' : '#b8b8b8'};
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  position: relative;
  overflow: visible;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  margin: ${props => props.$minimized ? '16px auto' : '0'};
  width: ${props => props.$minimized ? '80%' : '100%'};
  justify-content: ${props => props.$minimized ? 'center' : 'flex-start'};
  
  span {
    opacity: ${props => props.$minimized ? '0' : '1'};
    transition: opacity 0.3s ease, transform 0.3s ease;
    white-space: nowrap;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.3px;
    width: ${props => props.$minimized ? '0' : 'auto'};
    overflow: hidden;
    color: ${props => props.$active ? '#ffffff' : '#cccccc'};
  }

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, ${props => props.$active ? '0.15' : '0.08'});
    border-color: rgba(255, 255, 255, ${props => props.$active ? '0.25' : '0.12'});
    transform: ${props => props.$minimized ? 'scale(1.08)' : 'translateX(5px)'};
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    
    span {
      transform: translateX(3px);
    }
  }

  &:active {
    transform: ${props => props.$minimized ? 'scale(0.95)' : 'scale(0.98) translateX(5px)'};
    transition: all 0.1s ease;
  }
`;

const IconWrapper = styled.div`
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  position: relative;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => {
    switch (props.$section) {
      case 'main': return 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)';
      case 'shop': return 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)';
      case 'delivery': return 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)';
      case 'management': return 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)';
      case 'support': return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      default: return 'rgba(255, 255, 255, 0.15)';
    }
  }};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  margin-right: ${props => props.$minimized ? '0' : '16px'};

  svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
    color: white;
  }

  /* Enhanced effect when sidebar is minimized */
  ${props => props.$minimized && `
    width: 48px;
    height: 48px;
    margin: 0 auto;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
    
    &::before {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
      border-radius: 16px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    &:hover::before {
      opacity: 1;
    }

    &:hover svg {
      transform: scale(1.2);
    }
    
    /* Tooltip for minimized mode */
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 60px;
      padding: 8px 12px;
      background: #333;
      color: white;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.3s ease;
      pointer-events: none;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }
    
    &:hover::after {
      opacity: 1;
      transform: translateX(0);
    }
  `}

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0px);
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

const ProfileIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const MenuToggleIcon = ({isOpen}) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {isOpen ? (
            // Chevron left icon when open
            <>
                <polyline points="15 18 9 12 15 6"></polyline>
            </>
        ) : (
            // Chevron right icon when closed
            <>
                <polyline points="9 18 15 12 9 6"></polyline>
            </>
        )}
    </svg>
);

const ToggleButton = styled.button`
    width: 42px;
    height: 42px;
    position: absolute;
    right: -21px;
    top: 120px;
    background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    z-index: 10;
    color: white;
    
    &:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    
    &:active {
        transform: scale(0.95);
    }
    
    svg {
        transition: transform 0.3s ease;
    }
`;

const Sidebar = () => {
    const [isMinimized, setIsMinimized] = useState(false);
    const location = useLocation();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const toggleSidebar = () => {
        setIsMinimized(!isMinimized);
    };    return (
        <SidebarContainer $minimized={isMinimized}>
            <ToggleButton onClick={toggleSidebar} aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}>
                <MenuToggleIcon isOpen={!isMinimized} />
            </ToggleButton>
            
            <LogoSection $minimized={isMinimized} onClick={toggleSidebar}>
                <LogoWrapper>
                    <Logo src={logo} alt="Seven Four Clothing" />
                </LogoWrapper>
                <CompanyName $minimized={isMinimized}>Seven Four</CompanyName>
            </LogoSection><NavLinks>
                {/* Main section - visible to all */}
                <SectionTitle $minimized={isMinimized} $color="#3a7bd5">{!isMinimized && 'Main'}</SectionTitle>
                <NavItem $minimized={isMinimized}>
                    <StyledLink to="/" $minimized={isMinimized} $active={location.pathname === '/'}>
                        <IconWrapper $minimized={isMinimized} $section="main" data-tooltip="Home">
                            <HomeIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Home</span>}
                    </StyledLink>
                </NavItem>

                {/* Dashboard - admin only */}
                {isAdmin && (
                    <NavItem $minimized={isMinimized}>
                        <StyledLink to="/dashboard" $minimized={isMinimized} $active={location.pathname === '/dashboard'}>
                            <IconWrapper $minimized={isMinimized} $section="main" data-tooltip="Dashboard">
                                <DashboardIcon />
                            </IconWrapper>
                            {!isMinimized && <span>Dashboard</span>}
                        </StyledLink>
                    </NavItem>
                )}

                {/* Shop section - visible to all */}
                <SectionTitle $minimized={isMinimized} $color="#f953c6">{!isMinimized && 'Shop'}</SectionTitle>
                <NavItem $minimized={isMinimized}>
                    <StyledLink to="/products" $minimized={isMinimized} $active={location.pathname === '/products'}>
                        <IconWrapper $minimized={isMinimized} $section="shop" data-tooltip="Products">
                            <ProductIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Products</span>}
                    </StyledLink>
                </NavItem>
                <NavItem $minimized={isMinimized}>
                    <StyledLink to="/cart" $minimized={isMinimized} $active={location.pathname === '/cart'}>
                        <IconWrapper $minimized={isMinimized} $section="shop" data-tooltip="Cart">
                            <CartIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Cart</span>}
                    </StyledLink>
                </NavItem>
                
                {/* Delivery section - conditional rendering */}
                <SectionTitle $minimized={isMinimized} $color="#f2994a">{!isMinimized && 'Delivery'}</SectionTitle>                <NavItem $minimized={isMinimized}>
                    <StyledLink to="/orders" $minimized={isMinimized} $active={location.pathname === '/orders'}>
                        <IconWrapper $minimized={isMinimized} $section="delivery" data-tooltip="Orders">
                            <OrderIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Orders</span>}
                    </StyledLink>
                </NavItem>
                {isAdmin && (
                    <>
                        <NavItem $minimized={isMinimized}>
                            <StyledLink to="/tracking" $minimized={isMinimized} $active={location.pathname === '/tracking'}>
                                <IconWrapper $minimized={isMinimized} $section="delivery" data-tooltip="Tracking">
                                    <TruckIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Tracking</span>}
                            </StyledLink>
                        </NavItem>                        <NavItem $minimized={isMinimized}>
                            <StyledLink to="/shipping" $minimized={isMinimized} $active={location.pathname === '/shipping'}>
                                <IconWrapper $minimized={isMinimized} $section="delivery" data-tooltip="Shipping">
                                    <ShippingIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Shipping</span>}
                            </StyledLink>
                        </NavItem>
                    </>
                )}                {/* Management section - admin only */}
                {isAdmin && (
                    <>
                        <SectionTitle $minimized={isMinimized} $color="#4776E6">{!isMinimized && 'Management'}</SectionTitle>
                        <NavItem $minimized={isMinimized}>
                            <StyledLink to="/maintenance" $minimized={isMinimized} $active={location.pathname === '/maintenance'}>
                                <IconWrapper $minimized={isMinimized} $section="management" data-tooltip="Maintenance">
                                    <SettingsIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Maintenance</span>}
                            </StyledLink>
                        </NavItem>
                        <NavItem $minimized={isMinimized}>
                            <StyledLink to="/inventory" $minimized={isMinimized} $active={location.pathname === '/inventory'}>
                                <IconWrapper $minimized={isMinimized} $section="management" data-tooltip="Inventory">
                                    <InventoryIcon />
                                </IconWrapper>
                                {!isMinimized && <span>Inventory</span>}
                            </StyledLink>
                        </NavItem>
                    </>
                )}
                
                {/* Support section - visible to all */}
                <SectionTitle $minimized={isMinimized} $color="#11998e">{!isMinimized && 'Support'}</SectionTitle>                <NavItem $minimized={isMinimized}>
                    <StyledLink to="/help" $minimized={isMinimized} $active={location.pathname === '/help'}>
                        <IconWrapper $minimized={isMinimized} $section="support" data-tooltip="Help">
                            <HelpIcon />
                        </IconWrapper>
                        {!isMinimized && <span>Help</span>}
                    </StyledLink>
                </NavItem>
                <NavItem $minimized={isMinimized}>
                    <StyledLink to="/about" $minimized={isMinimized} $active={location.pathname === '/about'}>
                        <IconWrapper $minimized={isMinimized} $section="support" data-tooltip="About">
                            <InfoIcon />
                        </IconWrapper>
                        {!isMinimized && <span>About</span>}
                    </StyledLink>                </NavItem>
            </NavLinks>
            
            {/* User profile section */}
            {currentUser && (
                <UserProfileSection $minimized={isMinimized}>
                    <UserAvatar $minimized={isMinimized}>
                        {currentUser.profile_picture_url ? (
                            <img 
                                src={`http://localhost:5000${currentUser.profile_picture_url}`} 
                                alt="Profile" 
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23555"/><text x="50%" y="50%" font-size="24" text-anchor="middle" dy=".3em" fill="%23fff">' + (currentUser?.first_name?.charAt(0) || '') + (currentUser?.last_name?.charAt(0) || '') + '</text></svg>';
                                }}
                            />
                        ) : (
                            <span>{currentUser?.first_name?.charAt(0) || ''}{currentUser?.last_name?.charAt(0) || ''}</span>
                        )}
                    </UserAvatar>
                    {!isMinimized && (
                        <UserInfo>
                            <UserName>{currentUser.first_name} {currentUser.last_name}</UserName>
                            <UserRole>{currentUser.role}</UserRole>
                        </UserInfo>
                    )}
                    <StyledLink to="/profile" $minimized={isMinimized} title="View Profile">
                        <ProfileIcon />
                    </StyledLink>
                </UserProfileSection>
            )}
        </SidebarContainer>
    );
};

// User Profile Section Styles
const UserProfileSection = styled.div`
    display: flex;
    align-items: center;
    padding: ${props => props.$minimized ? '12px 8px' : '16px 24px'};
    margin-top: auto;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: ${props => props.$minimized ? '20%' : '5%'};
        width: ${props => props.$minimized ? '60%' : '90%'};
        height: 1px;
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
    }
`;

const UserAvatar = styled.div`
    width: ${props => props.$minimized ? '40px' : '48px'};
    height: ${props => props.$minimized ? '40px' : '48px'};
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.05);
        border-color: rgba(255, 255, 255, 0.4);
    }
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    span {
        color: white;
        font-weight: bold;
        font-size: ${props => props.$minimized ? '14px' : '16px'};
    }
`;

const UserInfo = styled.div`
    margin-left: 12px;
    flex-grow: 1;
    overflow: hidden;
`;

const UserName = styled.div`
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserRole = styled.div`
    color: #b0b0b0;
    font-size: 12px;
    text-transform: capitalize;
`;

export default Sidebar;

// Revert to the original sidebar design with proper styling
const styles = {
    sidebar: {
        width: '250px',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        position: 'fixed',
        left: 0,
        top: 0,
        paddingTop: '60px',
        zIndex: 1000,
        overflowY: 'auto'
    },
    nav: {
        padding: '0'
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px 20px',
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
        borderBottom: 'none'
    },
    navItemHover: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    navIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '15px',
        fontSize: '18px'
    },
    homeIcon: {
        backgroundColor: '#3b82f6'
    },
    dashboardIcon: {
        backgroundColor: '#3b82f6'
    },
    productsIcon: {
        backgroundColor: '#ec4899'
    },
    cartIcon: {
        backgroundColor: '#ec4899'
    },
    ordersIcon: {
        backgroundColor: '#f59e0b'
    },
    trackingIcon: {
        backgroundColor: '#f59e0b'
    },
    shippingIcon: {
        backgroundColor: '#f59e0b'
    },
    maintenanceIcon: {
        backgroundColor: '#6366f1'
    }
};