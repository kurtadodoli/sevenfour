import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo-white.png';
import { useAuth } from '../context/AuthContext';

// Styled Components
const SidebarContainer = styled.div`
  width: 280px;
  height: 100vh;
  background: #0a0a0a;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow-y: auto;
  
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
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
`;

const LogoWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
`;

const Logo = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
`;

const CompanyName = styled.span`
  color: white;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const NavSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  color: #666;
  font-size: 11px;
  text-transform: uppercase;
  margin: 0 0 12px 24px;
  padding: 0;
  font-weight: 600;
  letter-spacing: 1px;
`;

const NavItem = styled.div`
  margin: 2px 16px;
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: ${props => props.$active ? '#ffffff' : '#999'};
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border: ${props => props.$active ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent'};
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  
  svg {
    width: 18px;
    height: 18px;
    color: inherit;
  }
`;

const LinkText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: inherit;
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

const Sidebar = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';
    const isStaff = currentUser?.role === 'staff' || isAdmin;

    return (
        <SidebarContainer>
            <LogoSection>
                <LogoWrapper>
                    <Logo src={logo} alt="Seven Four Clothing" />
                </LogoWrapper>
                <CompanyName>Seven Four</CompanyName>
            </LogoSection>

            {/* Main Section */}
            <NavSection>
                <SectionTitle>MAIN</SectionTitle>
                <NavItem>
                    <StyledLink to="/" $active={location.pathname === '/'}>
                        <IconWrapper>
                            <HomeIcon />
                        </IconWrapper>
                        <LinkText>Home</LinkText>
                    </StyledLink>
                </NavItem>
                {isAdmin && (
                    <NavItem>
                        <StyledLink to="/dashboard" $active={location.pathname === '/dashboard'}>
                            <IconWrapper>
                                <DashboardIcon />
                            </IconWrapper>
                            <LinkText>Dashboard</LinkText>
                        </StyledLink>
                    </NavItem>
                )}
            </NavSection>

            {/* Shop Section */}
            <NavSection>
                <SectionTitle>SHOP</SectionTitle>
                <NavItem>
                    <StyledLink to="/products" $active={location.pathname === '/products'}>
                        <IconWrapper>
                            <ProductIcon />
                        </IconWrapper>
                        <LinkText>Products</LinkText>
                    </StyledLink>
                </NavItem>
                <NavItem>
                    <StyledLink to="/orders" $active={location.pathname === '/orders'}>
                        <IconWrapper>
                            <OrderIcon />
                        </IconWrapper>
                        <LinkText>Orders</LinkText>
                    </StyledLink>
                </NavItem>
            </NavSection>

            {/* Management Section - Admin Only */}
            {isAdmin && (
                <NavSection>
                    <SectionTitle>MANAGEMENT</SectionTitle>
                    <NavItem>
                        <StyledLink to="/inventory" $active={location.pathname === '/inventory'}>
                            <IconWrapper>
                                <InventoryIcon />
                            </IconWrapper>
                            <LinkText>Inventory</LinkText>
                        </StyledLink>
                    </NavItem>
                    <NavItem>
                        <StyledLink to="/transactions" $active={location.pathname === '/transactions'}>
                            <IconWrapper>
                                <TransactionIcon />
                            </IconWrapper>
                            <LinkText>Transactions</LinkText>
                        </StyledLink>
                    </NavItem>
                    <NavItem>
                        <StyledLink to="/maintenance" $active={location.pathname === '/maintenance'}>
                            <IconWrapper>
                                <SettingsIcon />
                            </IconWrapper>
                            <LinkText>Maintenance</LinkText>
                        </StyledLink>
                    </NavItem>
                    <NavItem>
                        <StyledLink to="/search" $active={location.pathname === '/search'}>
                            <IconWrapper>
                                <SearchIcon />
                            </IconWrapper>
                            <LinkText>Search</LinkText>
                        </StyledLink>
                    </NavItem>
                    <NavItem>
                        <StyledLink to="/delivery" $active={location.pathname === '/delivery'}>
                            <IconWrapper>
                                <DeliveryIcon />
                            </IconWrapper>
                            <LinkText>Delivery</LinkText>
                        </StyledLink>
                    </NavItem>
                </NavSection>
            )}

            {/* Support Section */}
            <NavSection>
                <SectionTitle>SUPPORT</SectionTitle>
                <NavItem>
                    <StyledLink to="/help" $active={location.pathname === '/help'}>
                        <IconWrapper>
                            <HelpIcon />
                        </IconWrapper>
                        <LinkText>Help</LinkText>
                    </StyledLink>
                </NavItem>
                <NavItem>
                    <StyledLink to="/about" $active={location.pathname === '/about'}>
                        <IconWrapper>
                            <InfoIcon />
                        </IconWrapper>
                        <LinkText>About</LinkText>
                    </StyledLink>
                </NavItem>
            </NavSection>
        </SidebarContainer>
    );
};

export default Sidebar;
