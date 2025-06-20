// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const FooterContainer = styled.footer`
  background-color: #1a1a1a;
  color: white;
  padding: 3rem 2rem 1rem;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FooterNav = styled.nav`
  margin-bottom: 2rem;
`;

const FooterNavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const FooterNavItem = styled.li`
  margin: 0;
`;

const FooterNavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ccc;
  }

  &:visited {
    color: white;
  }
`;

const FooterDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #333;
  margin: 1.5rem 0;
`;

const Copyright = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #888;
`;

const Footer = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  return (    <FooterContainer>
      <FooterContent>        
        <FooterNav>
          <FooterNavList>
            <FooterNavItem>
              <FooterNavLink to="/">Home</FooterNavLink>
            </FooterNavItem>
            {!isAdmin && (
              <>
                <FooterNavItem>
                  <FooterNavLink to="/products">Shop</FooterNavLink>
                </FooterNavItem>
                <FooterNavItem>
                  <FooterNavLink to="/help">Help</FooterNavLink>
                </FooterNavItem>
                <FooterNavItem>
                  <FooterNavLink to="/about">About</FooterNavLink>
                </FooterNavItem>
              </>
            )}
            {isAdmin && (
              <>
                <FooterNavItem>
                  <FooterNavLink to="/dashboard">Dashboard</FooterNavLink>
                </FooterNavItem>
                <FooterNavItem>
                  <FooterNavLink to="/admin/pages">Page Manager</FooterNavLink>
                </FooterNavItem>
                <FooterNavItem>
                  <FooterNavLink to="/maintenance">Maintenance</FooterNavLink>
                </FooterNavItem>
              </>
            )}
          </FooterNavList>
        </FooterNav>
        
        <FooterDivider />
        
        <Copyright>
          © 2025 SevenFour Clothing. All Rights Reserved.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;