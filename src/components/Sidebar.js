import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/sfc-logo-white.png';
import { useAuth } from '../context/AuthContext';

// Styled Components
const SidebarContainer = styled.div`
  width: ${props => props.$minimized ? '80px' : '300px'};
  height: 100vh;
  background: linear-gradient(180deg, #121212 0%, #000000 100%);
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  z-index: 1000;
  box-shadow: ${props => props.$minimized ? 
    '4px 0 20px rgba(0, 0, 0, 0.4)' : 
    '3px 0 20px rgba(0, 0, 0, 0.3)'
  };
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  padding-bottom: 20px;
  
  /* Enhanced glow effect when minimized */
  ${props => props.$minimized && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: -2px;
      width: 2px;
      height: 100%;
      background: linear-gradient(180deg, 
        rgba(58, 123, 213, 0.6) 0%, 
        rgba(0, 210, 255, 0.4) 50%, 
        rgba(58, 123, 213, 0.6) 100%
      );
      filter: blur(1px);
    }
  `}
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
  margin: ${props => props.$minimized ? '12px 16px' : '6px 16px'};
  position: relative;
  width: ${props => props.$minimized ? 'auto' : 'auto'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Enhanced hover effect for minimized mode */
  ${props => props.$minimized && `
    &:hover {
      transform: translateX(4px);
    }
    
    /* Subtle background highlight on hover */
    &::before {
      content: '';
      position: absolute;
      left: -12px;
      right: -12px;
      top: -4px;
      bottom: -4px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: -1;
    }
    
    &:hover::before {
      opacity: 1;
      background: rgba(255, 255, 255, 0.05);
    }
  `}
  
  &:hover {
    transform: ${props => props.$minimized ? 'translateX(4px)' : 'translateX(2px)'};
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.$minimized ? '12px 0' : '14px 20px'};
  color: ${props => props.$active ? '#ffffff' : '#b8b8b8'};
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: ${props => props.$minimized ? '0' : '16px'};
  position: relative;
  overflow: visible;
  background: ${props => {
    if (props.$minimized) return 'transparent';
    return props.$active ? 'rgba(255, 255, 255, 0.12)' : 'transparent';
  }};
  border: ${props => {
    if (props.$minimized) return 'none';
    return props.$active ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent';
  }};
  margin: ${props => props.$minimized ? '8px 0' : '4px 0'};
  width: 100%;
  justify-content: ${props => props.$minimized ? 'center' : 'flex-start'};
  
  span {
    opacity: ${props => props.$minimized ? '0' : '1'};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.3px;
    width: ${props => props.$minimized ? '0' : 'auto'};
    overflow: hidden;
    color: ${props => props.$active ? '#ffffff' : '#cccccc'};
    transform: ${props => props.$minimized ? 'translateX(-20px)' : 'translateX(0)'};
  }

  &:hover {
    color: #ffffff;
    background: ${props => {
      if (props.$minimized) return 'transparent';
      return props.$active ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)';
    }};
    border-color: ${props => {
      if (props.$minimized) return 'transparent';
      return props.$active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)';
    }};
    transform: ${props => props.$minimized ? 'none' : 'translateX(6px)'};
    box-shadow: ${props => props.$minimized ? 'none' : '0 8px 20px rgba(0, 0, 0, 0.3)'};
    
    span {
      transform: ${props => props.$minimized ? 'translateX(-20px)' : 'translateX(4px)'};
      color: #ffffff;
    }
  }

  &:active {
    transform: ${props => props.$minimized ? 'none' : 'scale(0.98) translateX(6px)'};
    transition: all 0.15s ease;
  }
  
  /* Special styling for minimized mode */
  ${props => props.$minimized && `
    &::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 0;
      background: linear-gradient(180deg, #3a7bd5 0%, #00d2ff 100%);
      border-radius: 2px;
      transition: all 0.3s ease;
      opacity: 0;
    }
    
    ${props.$active && `
      &::before {
        height: 32px;
        opacity: 1;
      }
    `}
    
    &:hover::before {
      height: 24px;
      opacity: 0.7;
    }
  `}
`;

const IconWrapper = styled.div`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  position: relative;
  border-radius: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  box-shadow: ${props => props.$minimized ? 
    '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)' : 
    '0 4px 12px rgba(0, 0, 0, 0.25)'
  };
  margin-right: ${props => props.$minimized ? '0' : '16px'};
  
  /* Enhanced positioning and effects when minimized */
  ${props => props.$minimized && `
    width: 52px;
    height: 52px;
    margin: 8px auto;
    transform: translateX(2px);
    border: 2px solid rgba(255, 255, 255, 0.15);
    
    /* Glowing outer ring */
    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.2) 0%, 
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 255, 255, 0.2) 100%
      );
      border-radius: 18px;
      opacity: 0;
      transition: all 0.4s ease;
      z-index: -1;
    }

    /* Pulsing animation */
    animation: iconPulse 3s ease-in-out infinite;
    
    @keyframes iconPulse {
      0%, 100% { transform: translateX(2px) scale(1); }
      50% { transform: translateX(2px) scale(1.02); }
    }

    &:hover {
      transform: translateX(6px) scale(1.08);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      
      &::before {
        opacity: 1;
        transform: scale(1.1);
      }
    }
    
    /* Enhanced tooltip positioning */
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 70px;
      top: 50%;
      transform: translateY(-50%);
      padding: 10px 16px;
      background: linear-gradient(135deg, #333 0%, #111 100%);
      color: white;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      /* Arrow pointing to icon */
      &::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid #333;
      }
    }
    
    &:hover::after {
      opacity: 1;
      transform: translateY(-50%) translateX(8px);
    }
  `}

  svg {
    width: ${props => props.$minimized ? '24px' : '20px'};
    height: ${props => props.$minimized ? '24px' : '20px'};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    color: white;
  }

  &:hover {
    transform: ${props => props.$minimized ? 'translateX(6px) scale(1.08)' : 'translateY(-2px) scale(1.05)'};
    
    svg {
      transform: ${props => props.$minimized ? 'scale(1.15)' : 'scale(1.1)'};
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
    }
  }

  &:active {
    transform: ${props => props.$minimized ? 'translateX(4px) scale(1.02)' : 'translateY(0px) scale(1.02)'};
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
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />    </svg>
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

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>        <path d="M21 21l-4.35-4.35"/>
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

const TransactionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
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

const CustomIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
);

const ToggleButton = styled.button`
    width: 46px;
    height: 46px;
    position: fixed;
    left: ${props => props.$minimized ? '34px' : '254px'};
    top: 60px;
    background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
    border: 3px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(58, 123, 213, 0.3);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1002;
    color: white;
    backdrop-filter: blur(10px);
    
    /* Pulsing animation */
    &::before {
        content: '';
        position: absolute;
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(58, 123, 213, 0.3) 0%, rgba(0, 210, 255, 0.3) 100%);
        animation: pulse 2s ease-in-out infinite;
        z-index: -1;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 0.3; }
    }
    
    &:hover {
        transform: scale(1.15);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 30px rgba(58, 123, 213, 0.5);
        border-color: rgba(255, 255, 255, 0.3);
        
        &::before {
            animation-duration: 1s;
        }
    }
    
    &:active {
        transform: scale(1.05);
        transition: all 0.15s ease;
    }
    
    svg {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    
    &:hover svg {
        transform: scale(1.1);
    }
`;

const Sidebar = () => {
    const [isMinimized, setIsMinimized] = useState(false);
    const location = useLocation();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const toggleSidebar = () => {
        setIsMinimized(!isMinimized);
    };

    return (        <>
            <ToggleButton $minimized={isMinimized} onClick={toggleSidebar} aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}>
                <MenuToggleIcon isOpen={!isMinimized} />
            </ToggleButton>
              <SidebarContainer $minimized={isMinimized}>
                <LogoSection $minimized={isMinimized} onClick={toggleSidebar}>
                    <LogoWrapper>
                        <Logo src={logo} alt="Seven Four Clothing" />
                    </LogoWrapper>
                    {!isMinimized && <CompanyName $minimized={isMinimized}>Seven Four</CompanyName>}
                </LogoSection>                <NavLinks>
                    {/* Main section - visible to all */}
                    {!isMinimized && <SectionTitle $minimized={isMinimized} $color="#3a7bd5">Main</SectionTitle>}
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
                    )}                    {/* Shop section - visible to all */}
                    {!isMinimized && <SectionTitle $minimized={isMinimized} $color="#f953c6">Shop</SectionTitle>}
                    <NavItem $minimized={isMinimized}>                        <StyledLink to="/products" $minimized={isMinimized} $active={location.pathname === '/products'}>
                            <IconWrapper $minimized={isMinimized} $section="shop" data-tooltip="Products">
                                <ProductIcon />
                            </IconWrapper>
                            {!isMinimized && <span>Products</span>}
                        </StyledLink>
                    </NavItem>
                    <NavItem $minimized={isMinimized}>
                        <StyledLink to="/custom" $minimized={isMinimized} $active={location.pathname === '/custom'}>
                            <IconWrapper $minimized={isMinimized} $section="shop" data-tooltip="Custom Design">
                                <CustomIcon />
                            </IconWrapper>
                            {!isMinimized && <span>Custom Design</span>}
                        </StyledLink>
                    </NavItem>{/* Management section - admin only */}
                    {isAdmin && (
                        <>
                            {!isMinimized && <SectionTitle $minimized={isMinimized} $color="#4776E6">Management</SectionTitle>}<NavItem $minimized={isMinimized}>
                                <StyledLink to="/inventory" $minimized={isMinimized} $active={location.pathname === '/inventory'}>
                                    <IconWrapper $minimized={isMinimized} $section="management" data-tooltip="Inventory">
                                        <InventoryIcon />
                                    </IconWrapper>
                                    {!isMinimized && <span>Inventory</span>}
                                </StyledLink>
                            </NavItem>                            <NavItem $minimized={isMinimized}>
                                <StyledLink to="/transactions" $minimized={isMinimized} $active={location.pathname === '/transactions'}>
                                    <IconWrapper $minimized={isMinimized} $section="management" data-tooltip="Transactions">
                                        <TransactionIcon />
                                    </IconWrapper>
                                    {!isMinimized && <span>Transactions</span>}
                                </StyledLink>
                            </NavItem>
                            <NavItem $minimized={isMinimized}>
                                <StyledLink to="/maintenance" $minimized={isMinimized} $active={location.pathname === '/maintenance'}>
                                    <IconWrapper $minimized={isMinimized} $section="management" data-tooltip="Maintenance">
                                        <SettingsIcon />
                                    </IconWrapper>
                                    {!isMinimized && <span>Maintenance</span>}
                                </StyledLink>
                            </NavItem>
                            <NavItem $minimized={isMinimized}>
                                <StyledLink to="/search" $minimized={isMinimized} $active={location.pathname === '/search'}>
                                    <IconWrapper $minimized={isMinimized} $section="management" data-tooltip="Search">
                                        <SearchIcon />
                                    </IconWrapper>
                                    {!isMinimized && <span>Search</span>}
                                </StyledLink>
                            </NavItem>
                            <NavItem $minimized={isMinimized}>
                                <StyledLink to="/delivery" $minimized={isMinimized} $active={location.pathname === '/delivery'}>
                                    <IconWrapper $minimized={isMinimized} $section="management" data-tooltip="Delivery">
                                        <DeliveryIcon />
                                    </IconWrapper>
                                    {!isMinimized && <span>Delivery</span>}
                                </StyledLink>
                            </NavItem>
                        </>
                    )}
                    
                    {/* Support section - visible to all */}
                    {!isMinimized && <SectionTitle $minimized={isMinimized} $color="#11998e">Support</SectionTitle>}
                    <NavItem $minimized={isMinimized}>
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
                        </StyledLink>
                    </NavItem>
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
                    </UserProfileSection>                )}
            </SidebarContainer>
        </>
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