import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/sfc-logo-white.png';

const Sidebar = () => {
    const location = useLocation();
    const [isMinimized, setIsMinimized] = useState(false);

    const toggleSidebar = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <SidebarContainer minimized={isMinimized}>
            <LogoSection onClick={toggleSidebar}>
                <Logo src={logo} alt="Seven Four Clothing" minimized={isMinimized} />
            </LogoSection>
            <NavLinks>
                <SectionTitle>{!isMinimized && 'Main'}</SectionTitle>
                <NavItem active={location.pathname === '/'}>
                    <StyledLink to="/" minimized={isMinimized}>
                        <IconWrapper>🏠</IconWrapper>
                        {!isMinimized && <span>Home</span>}
                    </StyledLink>
                </NavItem>
                <NavItem active={location.pathname === '/dashboard'}>
                    <StyledLink to="/dashboard" minimized={isMinimized}>
                        <IconWrapper>📊</IconWrapper>
                        {!isMinimized && <span>Dashboard</span>}
                    </StyledLink>
                </NavItem>

                <SectionTitle>{!isMinimized && 'Shop'}</SectionTitle>
                <NavItem active={location.pathname === '/products'}>
                    <StyledLink to="/products" minimized={isMinimized}>
                        <IconWrapper>👕</IconWrapper>
                        {!isMinimized && <span>Products</span>}
                    </StyledLink>
                </NavItem>
                <NavItem active={location.pathname === '/cart'}>
                    <StyledLink to="/cart" minimized={isMinimized}>
                        <IconWrapper>🛒</IconWrapper>
                        {!isMinimized && <span>Cart</span>}
                    </StyledLink>
                </NavItem>

                <SectionTitle>{!isMinimized && 'Delivery'}</SectionTitle>
                <NavItem active={location.pathname === '/orders'}>
                    <StyledLink to="/orders" minimized={isMinimized}>
                        <IconWrapper>📦</IconWrapper>
                        {!isMinimized && <span>Orders</span>}
                    </StyledLink>
                </NavItem>
                <NavItem active={location.pathname === '/tracking'}>
                    <StyledLink to="/tracking" minimized={isMinimized}>
                        <IconWrapper>🚚</IconWrapper>
                        {!isMinimized && <span>Tracking</span>}
                    </StyledLink>
                </NavItem>
                <NavItem active={location.pathname === '/shipping'}>
                    <StyledLink to="/shipping" minimized={isMinimized}>
                        <IconWrapper>📍</IconWrapper>
                        {!isMinimized && <span>Shipping</span>}
                    </StyledLink>
                </NavItem>

                <SectionTitle>{!isMinimized && 'Management'}</SectionTitle>
                <NavItem active={location.pathname === '/maintenance'}>
                    <StyledLink to="/maintenance" minimized={isMinimized}>
                        <IconWrapper>⚙️</IconWrapper>
                        {!isMinimized && <span>Maintenance</span>}
                    </StyledLink>
                </NavItem>
                <NavItem active={location.pathname === '/inventory'}>
                    <StyledLink to="/inventory" minimized={isMinimized}>
                        <IconWrapper>📦</IconWrapper>
                        {!isMinimized && <span>Inventory</span>}
                    </StyledLink>
                </NavItem>

                <SectionTitle>{!isMinimized && 'Support'}</SectionTitle>
                <NavItem active={location.pathname === '/help'}>
                    <StyledLink to="/help" minimized={isMinimized}>
                        <IconWrapper>❓</IconWrapper>
                        {!isMinimized && <span>Help</span>}
                    </StyledLink>
                </NavItem>
                <NavItem active={location.pathname === '/about'}>
                    <StyledLink to="/about" minimized={isMinimized}>
                        <IconWrapper>ℹ️</IconWrapper>
                        {!isMinimized && <span>About</span>}
                    </StyledLink>
                </NavItem>
            </NavLinks>
        </SidebarContainer>
    );
};

const SidebarContainer = styled.div`
    width: ${props => props.minimized ? '80px' : '250px'};
    height: 100vh;
    background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
`;

const LogoSection = styled.div`
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
`;

const Logo = styled.img`
    height: 50px;
    width: ${props => props.minimized ? '40px' : 'auto'};
    transition: all 0.3s ease;
`;

const NavLinks = styled.ul`
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    overflow-y: auto;
    height: calc(100vh - 100px);

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }
`;

const NavItem = styled.li`
    margin: 0.25rem 0.75rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(5px);
    }
`;

const StyledLink = styled(Link)`
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: ${props => props.active ? '#ffffff' : '#b3b3b3'};
    text-decoration: none;
    transition: all 0.3s ease;
    gap: 1rem;

    &:hover {
        color: white;
    }
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    font-size: 1.2rem;
`;

const SectionTitle = styled.div`
    color: #666;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 1.5rem 1.5rem 0.5rem;
    font-weight: 600;
`;

export default Sidebar;