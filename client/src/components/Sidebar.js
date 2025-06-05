import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo-white.png';

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background-color: #1a1a1a;
  position: fixed;
  left: 0;
  top: 0;
  padding: 2rem 0;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Logo = styled.img`
  height: 50px;
  width: auto;
`;

const NavMenu = styled.nav`
  padding: 0 1rem;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: #fff;
  text-decoration: none;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #333;
  }
  
  ${props => props.active && `
    background-color: #333;
  `}

  i {
    font-size: 1.2rem;
    min-width: 25px;
    text-align: center;
  }
`;

const NavText = styled.span`
  margin-left: 1rem;
`;

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo src={logo} alt="Seven Four Logo" />
      </LogoContainer>
      <NavMenu>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'active-link' : ''}
        >
          <i className="fas fa-home"></i>
          <NavText>Home</NavText>
        </NavLink>
        <NavLink 
          to="/products" 
          className={({ isActive }) => isActive ? 'active-link' : ''}
        >
          <i className="fas fa-tshirt"></i>
          <NavText>Products</NavText>
        </NavLink>
        <NavLink 
          to="/cart" 
          className={({ isActive }) => isActive ? 'active-link' : ''}
        >
          <i className="fas fa-shopping-cart"></i>
          <NavText>Cart</NavText>
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => isActive ? 'active-link' : ''}
        >
          <i className="fas fa-box"></i>
          <NavText>Orders</NavText>
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? 'active-link' : ''}
        >
          <i className="fas fa-user"></i>
          <NavText>Profile</NavText>
        </NavLink>
      </NavMenu>
    </SidebarContainer>
  );
};

export default Sidebar;