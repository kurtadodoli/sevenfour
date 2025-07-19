import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/api';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faExpand,
  faTimes,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import CourierManagement from '../components/CourierManagement';

// Styled Components - Modern Minimalist Black & White Design
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #000000;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 300;
`;

const Header = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: #ffffff;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 200;
  margin: 0 0 0.5rem 0;
  color: #000000;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666666;
  margin: 0;
  font-weight: 300;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin: 2rem auto;
  padding: 0 2rem;
  max-width: 1200px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #000000;
    transform: translateY(-1px);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666666;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CalendarContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  height: fit-content;
`;

const CalendarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CalendarNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-right: 1rem;
`;

const CalendarButton = styled.button.attrs({ type: 'button' })`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem;
  cursor: pointer;
  color: #000000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    border-color: #000000;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
    transition: all 0.1s ease;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.15);
  }
`;

const MonthYear = styled.h3`
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0;
  color: #000000;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
`;

const CalendarDay = styled.div.withConfig({
  shouldForwardProp: (prop) => !['availabilityStatus', 'clickable', 'isToday', 'isCurrentMonth'].includes(prop),
})`
  background: ${props => {
    if (props.availabilityStatus === 'available') return 'linear-gradient(135deg, #f8fff9, #ffffff)';
    if (props.availabilityStatus === 'partial') return 'linear-gradient(135deg, #fffdf5, #ffffff)';
    if (props.availabilityStatus === 'busy') return 'linear-gradient(135deg, #fff5f5, #ffffff)';
    if (props.availabilityStatus === 'unavailable') return 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
    return '#ffffff';
  }};
  min-height: 80px;
  padding: 0.5rem;
  border: none;
  position: relative;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  
  &:hover {
    background: ${props => {
      if (!props.clickable) {
        if (props.availabilityStatus === 'available') return 'linear-gradient(135deg, #f8fff9, #ffffff)';
        if (props.availabilityStatus === 'partial') return 'linear-gradient(135deg, #fffdf5, #ffffff)';
        if (props.availabilityStatus === 'busy') return 'linear-gradient(135deg, #fff5f5, #ffffff)';
        if (props.availabilityStatus === 'unavailable') return 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
        return '#ffffff';
      }
      if (props.availabilityStatus === 'available') return 'linear-gradient(135deg, #e8f5e8, #f0f8f0)';
      if (props.availabilityStatus === 'partial') return 'linear-gradient(135deg, #fff8e6, #fffbf0)';
      if (props.availabilityStatus === 'busy') return 'linear-gradient(135deg, #ffe6e6, #fff0f0)';
      if (props.availabilityStatus === 'unavailable') return 'linear-gradient(135deg, #e9ecef, #dee2e6)';
      return '#f8f8f8';
    }};
    transform: ${props => props.clickable ? 'scale(1.02)' : 'none'};
  }
  
  ${props => props.isToday && `
    background: ${
      props.availabilityStatus === 'available' ? 'linear-gradient(135deg, #e8f5e8, #f0f8f0)' :
      props.availabilityStatus === 'partial' ? 'linear-gradient(135deg, #fff8e6, #fffbf0)' :
      props.availabilityStatus === 'busy' ? 'linear-gradient(135deg, #ffe6e6, #fff0f0)' :
      props.availabilityStatus === 'unavailable' ? 'linear-gradient(135deg, #e9ecef, #dee2e6)' :
      '#f0f0f0'
    };
    border: 2px solid #000000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `}
  
  ${props => props.availabilityStatus === 'available' && `
    border-left: 4px solid #28a745;
    box-shadow: inset 0 0 0 1px rgba(40, 167, 69, 0.1);
  `}
  
  ${props => props.availabilityStatus === 'partial' && `
    border-left: 4px solid #ffc107;
    box-shadow: inset 0 0 0 1px rgba(255, 193, 7, 0.1);
  `}
  
  ${props => props.availabilityStatus === 'busy' && `
    border-left: 4px solid #dc3545;
    box-shadow: inset 0 0 0 1px rgba(220, 53, 69, 0.1);
  `}
    ${props => props.availabilityStatus === 'unavailable' && `
    border-left: 4px solid #6c757d;
    box-shadow: inset 0 0 0 1px rgba(108, 117, 125, 0.1);
  `}
`;

const DayNumber = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isToday', 'isCurrentMonth'].includes(prop),
})`
  font-size: 0.9rem;
  font-weight: ${props => props.isToday ? '600' : '400'};
  color: ${props => props.isCurrentMonth ? '#000000' : '#cccccc'};
  margin-bottom: 0.5rem;
  text-align: center;
`;

const DeliveryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => {
    // Map all backend statuses to the three allowed display statuses for styling
    const displayStatus = (() => {
      const status = props.status;
      if (status === 'delivered') return 'delivered';
      if (status === 'shipped' || status === 'in_transit') return 'in_transit';
      // All other statuses map to confirmed
      return 'confirmed';
    })();
    
    switch (displayStatus) {
      case 'confirmed':
        return 'linear-gradient(135deg, #007bff, #0056b3)';
      case 'in_transit':
        return 'linear-gradient(135deg, #17a2b8, #138496)';
      case 'delivered':
        return 'linear-gradient(135deg, #28a745, #20c997)';
      default:
        return 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
    }
  }};
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  margin-top: auto;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  /* Status-specific icons based on simplified mapping */
  ${props => {
    const status = props.status;
    const displayStatus = (() => {
      if (status === 'delivered') return 'delivered';
      if (status === 'shipped' || status === 'in_transit') return 'in_transit';
      return 'confirmed';
    })();
    
    if (displayStatus === 'delivered') {
      return `&::before { content: '✅'; font-size: 16px; }`;
    } else if (displayStatus === 'in_transit') {
      return `&::before { content: '🚚'; font-size: 14px; }`;
    } else {
      return `&::before { content: '📦'; font-size: 14px; }`;
    }
  }}
`;

const AvailabilityIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'availability',
})`
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  min-width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => {
    switch (props.availability) {
      case 'available': return 'linear-gradient(135deg, #28a745, #20c997)';
      case 'partial': return 'linear-gradient(135deg, #ffc107, #fd7e14)';
      case 'busy': return 'linear-gradient(135deg, #dc3545, #e74c3c)';
      case 'unavailable': return 'linear-gradient(135deg, #6c757d, #495057)';
      default: return 'linear-gradient(135deg, #6c757d, #495057)';
    }
  }};
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: white;
  font-weight: bold;
  padding: 0 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }
`;


const FullCalendarModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 2rem;
`;

const FullCalendarContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 95vw;
  max-height: 95vh;
  width: 1200px;
  overflow-y: auto;
  position: relative;
`;











const OrdersList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const OrderItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'orderType',
})`
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  
  &:hover {
    border-color: #000000;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${props => props.isSelected && `
    border-color: #007bff;
    background: linear-gradient(135deg, #f8fbff, #ffffff);
    box-shadow: 0 8px 24px rgba(0, 123, 255, 0.15);
  `}
  
  ${props => props.orderType === 'custom_order' && `
    border-left: 6px solid #e91e63;
    &:hover {
      border-left-color: #e91e63;
    }
  `}
  
  ${props => props.orderType === 'custom_design' && `
    border-left: 6px solid #9c27b0;
    &:hover {
      border-left-color: #9c27b0;
    }
  `}
  
  ${props => props.orderType === 'regular' && `
    border-left: 6px solid #4caf50;
    &:hover {
      border-left-color: #4caf50;
    }
  `}
`;

const OrderInfo = styled.div`
  flex: 1;
  padding: 1.5rem;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
`;

const OrderTypeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => {
    if (props.className === 'custom_order') return 'linear-gradient(135deg, #e91e63, #f06292)';
    if (props.className === 'custom_design') return 'linear-gradient(135deg, #9c27b0, #ba68c8)';
    return 'linear-gradient(135deg, #4caf50, #81c784)';
  }};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;





// Filter & Search UI Components
const FilterControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 400px;
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #aaaaaa;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: #888;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: #f0f0f0;
    color: #000;
  }
`;

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #888;
  font-size: 1rem;
  
  span[role="img"] {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  strong {
    font-weight: 600;
  }
`;

const OrderActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;





const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', '$primary'].includes(prop),
})`
  background: ${props => {
    if (props.variant === 'success') return 'linear-gradient(135deg, #28a745, #20c997)';
    if (props.variant === 'danger') return 'linear-gradient(135deg, #dc3545, #e74c3c)';
    if (props.variant === 'info') return 'linear-gradient(135deg, #17a2b8, #3498db)';
    if (props.variant === 'warning') return 'linear-gradient(135deg, #ffc107, #f39c12)';
    if (props.$primary) return 'linear-gradient(135deg, #000000, #2c3e50)';
    return 'linear-gradient(135deg, #ffffff, #f8f9fa)';
  }};
  color: ${props => {
    if (props.variant || props.$primary) return '#ffffff';
    if (props.variant === 'warning') return '#212529';
    return '#000000';
  }};
  border: 2px solid ${props => {
    if (props.variant === 'success') return '#28a745';
    if (props.variant === 'danger') return '#dc3545';
    if (props.variant === 'info') return '#17a2b8';
    if (props.variant === 'warning') return '#ffc107';
    if (props.$primary) return '#000000';
    return '#e0e0e0';
  }};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-width: fit-content;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  ${props => props.processing && `
    animation: pulse 1.5s ease-in-out infinite;
    
    @keyframes pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      50% {
        transform: scale(1.02);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  `}
  
  &:hover {
    background: ${props => {
      if (props.variant === 'success') return 'linear-gradient(135deg, #218838, #1abc9c)';
      if (props.variant === 'danger') return 'linear-gradient(135deg, #c82333, #c0392b)';
      if (props.variant === 'info') return 'linear-gradient(135deg, #138496, #2980b9)';
      if (props.variant === 'warning') return 'linear-gradient(135deg, #e0a800, #d68910)';
      if (props.$primary) return 'linear-gradient(135deg, #333333, #34495e)';
      return 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
    }};
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-color: ${props => {
      if (props.variant === 'success') return '#20c997';
      if (props.variant === 'danger') return '#e74c3c';
      if (props.variant === 'info') return '#3498db';
      if (props.variant === 'warning') return '#f39c12';
      if (props.$primary) return '#2c3e50';
      return '#ced4da';
    }};
    
    &::before {
      left: 100%;
    }
  }
    &:active {
    transform: translateY(-1px) scale(0.98);
    transition: all 0.1s ease;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => {
      if (props.variant === 'success') return 'rgba(40, 167, 69, 0.25)';
      if (props.variant === 'danger') return 'rgba(220, 53, 69, 0.25)';
      if (props.variant === 'info') return 'rgba(23, 162, 184, 0.25)';
      if (props.variant === 'warning') return 'rgba(255, 193, 7, 0.25)';
      if (props.$primary) return 'rgba(0, 0, 0, 0.25)';
      return 'rgba(0, 123, 255, 0.25)';
    }};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    filter: grayscale(0.3);
    
    &:hover {
      transform: none;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      filter: grayscale(0.3);
      
      &::before {
        left: -100%;
      }
    }
    
    &::before {
      display: none;
    }
  }
  
  ${props => props.variant === 'success' && `
    &:hover {
      color: #ffffff;
    }
  `}
  
  ${props => props.variant === 'danger' && `
    &:hover {
      color: #ffffff;
    }
  `}
  
  ${props => props.variant === 'info' && `
    &:hover {
      color: #ffffff;
    }
  `}
  
  ${props => props.variant === 'warning' && `
    color: #212529;
    &:hover {
      color: #212529;
    }
  `}
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 0.375rem 0.875rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: default;
  user-select: none;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  
  ${props => {
    // Map all backend statuses to the three allowed display statuses
    const displayStatus = (() => {
      const status = props.status;
      if (status === 'delivered') return 'delivered';
      if (status === 'shipped' || status === 'in_transit') return 'in_transit';
      // All other statuses (pending, scheduled, confirmed, processing, etc.) map to confirmed
      return 'confirmed';
    })();
    
    switch (displayStatus) {
      case 'confirmed':
        return `
          background: linear-gradient(135deg, #d1ecf1, #bee5eb);
          color: #0c5460;
          border: 1px solid #bee5eb;
          &:hover {
            background: linear-gradient(135deg, #bee5eb, #74b9ff);
            color: #ffffff;
          }
        `;
      case 'in_transit':
        return `
          background: linear-gradient(135deg, #000000, #2d3436);
          color: #ffffff;
          border: 1px solid #2d3436;
          &:hover {
            background: linear-gradient(135deg, #2d3436, #636e72);
          }
        `;
      case 'delivered':
        return `
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          color: #155724;
          border: 1px solid #c3e6cb;
          &:hover {
            background: linear-gradient(135deg, #c3e6cb, #00b894);
            color: #ffffff;
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #f8f9fa, #dee2e6);
          color: #6c757d;
          border: 1px solid #dee2e6;
          &:hover {
            background: linear-gradient(135deg, #dee2e6, #95a5a6);
            color: #ffffff;
          }
        `;
    }
  }}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 400;  margin: 0;
  color: #000000;
`;

// Missing Styled Components
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666666;
`;



const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;
  padding: 0;
  
  &:hover {
    color: #000000;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

// Custom Popup Modal Styled Components
const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const PopupModal = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid #e0e0e0;
  position: relative;
  animation: popupSlideIn 0.3s ease-out;

  @keyframes popupSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const PopupTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: ${props => 
    props.type === 'error' ? '#dc3545' :
    props.type === 'warning' ? '#ffc107' :
    props.type === 'success' ? '#28a745' :
    '#000000'
  };
`;

const PopupClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #000000;
  }
`;

const PopupContent = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  color: #333333;
  white-space: pre-line;
  margin-bottom: 1.5rem;
`;

const PopupActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const PopupButton = styled.button`
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #333333;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DeliveryPage = () => {
  // Helper function to determine dominant order status for a day
  // Initialize all state variables with proper defaults to prevent runtime errors
  const [orders, setOrders] = useState([]);
  const [deliverySchedules, setDeliverySchedules] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [showCourierManagement, setShowCourierManagement] = useState(false);
  
  // Function to fetch couriers
  const fetchCouriers = useCallback(async () => {
    try {
      const response = await api.get('/couriers');
      if (response.data && Array.isArray(response.data)) {
        setCouriers(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.couriers)) {
        setCouriers(response.data.couriers);
      } else {
        setCouriers([]);
      }
    } catch (error) {
      console.error('Error fetching couriers:', error);
      setCouriers([]);
    }
  }, []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, title: '', message: '', type: 'info' });
  
  // Added state for filtering and searching orders

  const [searchQuery, setSearchQuery] = useState('');
  const [unavailableDates, setUnavailableDates] = useState(new Set()); // User-controlled unavailable dates
  // Laxity Least First (LLF) Algorithm Implementation
  const calculateLaxity = useCallback((order) => {
    const now = new Date();
    const orderDate = new Date(order.created_at);
    const daysSinceOrder = Math.floor((now - orderDate) / (24 * 60 * 60 * 1000));
    
    // Calculate deadline pressure (lower is more urgent)
    const maxDaysForDelivery = 7; // Standard delivery window
    const remainingDays = Math.max(0, maxDaysForDelivery - daysSinceOrder);
    
    // Calculate complexity factors
    const amountComplexity = Math.min(order.total_amount / 1000, 10); // Normalize to 0-10 scale
    const typeComplexity = order.order_type === 'custom_design' ? 3 : 
                          order.order_type === 'custom_order' ? 2 : 1;
    
    // Calculate distance complexity (Metro Manila areas)
    const addressComplexity = (() => {
      const address = (order.shipping_address || '').toLowerCase();
      if (address.includes('makati') || address.includes('bgc') || address.includes('manila')) return 1;
      if (address.includes('quezon') || address.includes('pasig') || address.includes('mandaluyong')) return 2;
      return 3; // Outer Metro Manila areas
    })();
    
    // Laxity = Available Time - Required Processing Time
    // Lower laxity = higher priority (more urgent)
    const processingTime = typeComplexity + addressComplexity + (amountComplexity * 0.5);
    const laxity = remainingDays - processingTime;
    
    return {
      laxity: laxity,
      urgencyScore: -laxity, // Negative laxity for sorting (lower laxity = higher urgency)
      remainingDays: remainingDays,
      processingTime: processingTime,
      amountComplexity: amountComplexity,
      typeComplexity: typeComplexity,
      addressComplexity: addressComplexity,
      daysSinceOrder: daysSinceOrder
    };
  }, []);

  // Memoize filtered and sorted orders using LLF algorithm
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Show all order types (regular, custom_order, custom_design)
        return ['regular', 'custom_order', 'custom_design'].includes(order.order_type);
      })
      .filter(order => {
        // Filter by search query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        
        // Search in multiple fields
        return (
          (order.order_number && order.order_number.toString().toLowerCase().includes(query)) ||
          (order.id && order.id.toString().includes(query)) ||
          (order.customerName && order.customerName.toLowerCase().includes(query)) ||
          (order.shipping_address && order.shipping_address.toLowerCase().includes(query)) ||
          (order.delivery_status && order.delivery_status.toLowerCase().includes(query)) ||
          (order.order_type && order.order_type.toLowerCase().includes(query))
        );
      })
      .map(order => ({
        ...order,
        laxityData: calculateLaxity(order)
      }))
      .sort((a, b) => {
        // Primary sort: Laxity Least First (most urgent first)
        if (a.laxityData.laxity !== b.laxityData.laxity) {
          return a.laxityData.laxity - b.laxityData.laxity;
        }
        
        // Secondary sort: Higher amount first (if same laxity)
        if (a.total_amount !== b.total_amount) {
          return b.total_amount - a.total_amount;
        }
        
        // Tertiary sort: Older orders first
        return new Date(a.created_at) - new Date(b.created_at);
      });
  }, [orders, searchQuery, calculateLaxity]);


  // Function to fetch all orders and delivery data using enhanced API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersResponse = await api.get('/delivery-enhanced/orders');
      if (ordersResponse.data.success) {
        const ordersData = ordersResponse.data.data;
        
        // ========================================
        // DEDUPLICATION LOGIC (Fix for duplicate custom orders)
        // ========================================
        console.log(`📦 Received ${ordersData.length} orders from API`);
        
        // Group orders by order_number and order_type to identify duplicates
        const orderMap = new Map();
        const duplicates = [];
        
        ordersData.forEach((order, index) => {
          const key = `${order.order_number}_${order.order_type}`;
          if (orderMap.has(key)) {
            duplicates.push({
              key,
              first: orderMap.get(key),
              duplicate: { ...order, originalIndex: index }
            });
            console.log(`🔄 Duplicate detected: ${order.order_number} (${order.order_type})`);
          } else {
            orderMap.set(key, { ...order, originalIndex: index });
          }
        });
        
        // Remove duplicates - keep the first occurrence of each order
        const deduplicatedOrders = Array.from(orderMap.values());
        
        if (duplicates.length > 0) {
          console.log(`⚠️ Removed ${duplicates.length} duplicate order(s) from DeliveryPage.js`);
          duplicates.forEach(dup => {
            console.log(`   - ${dup.key} (kept first occurrence)`);
          });
        }
        
        console.log(`✅ Final deduplicated count: ${deduplicatedOrders.length} orders`);
        // ========================================
        
        // Enhanced order processing for all order types
        const processedOrders = deduplicatedOrders.map(order => {
          const laxityData = calculateLaxity(order);
          
          // Process regular orders
          if (order.order_type === 'regular') {
            return {
              ...order,
              order_type: 'regular',
              laxityData: laxityData,
              customerName: order.customer_name || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer'
            };
          }
          
          // Process custom orders (verified custom orders ready for delivery)
          if (order.order_type === 'custom_order') {
            return {
              ...order,
              order_type: 'custom_order',
              laxityData: laxityData,
              customerName: order.customer_name || 'Unknown Customer'
            };
          }
          
          // Process custom designs
          if (order.order_type === 'custom_design') {
            return {
              ...order,
              order_type: 'custom_design',
              laxityData: laxityData,
              customerName: order.customer_name || 'Unknown Customer'
            };
          }
          
          // Default fallback for unknown order types
          return {
            ...order,
            order_type: order.order_type || 'regular',
            laxityData: laxityData,
            customerName: order.customer_name || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer'
          };
        });
        
        setOrders(processedOrders);
      }
      // Fetch calendar for current month (use current date at time of mount)
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const calendarResponse = await api.get('/delivery-enhanced/calendar', {
        params: { year: currentYear, month: currentMonth }
      });
      if (calendarResponse.data.success) {
        const calendarData = calendarResponse.data.data;
        
        // Flatten the calendar structure: extract all deliveries from all calendar entries
        const allDeliveries = [];
        if (calendarData.calendar && Array.isArray(calendarData.calendar)) {
          calendarData.calendar.forEach(calendarEntry => {
            if (calendarEntry.deliveries && Array.isArray(calendarEntry.deliveries)) {
              allDeliveries.push(...calendarEntry.deliveries);
            }
          });
        }
        
        console.log(`📅 Calendar API returned ${calendarData.calendar?.length || 0} calendar entries`);
        console.log(`📅 Total deliveries extracted: ${allDeliveries.length}`);
        allDeliveries.forEach(delivery => {
          console.log(`  • ${delivery.delivery_date}: Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
        });
        
        // Debug: Log the flattened deliveries with more detail
        console.log('📅 Detailed delivery data:', allDeliveries);
        
        setDeliverySchedules(allDeliveries);
      }
      // Fetch couriers
      await fetchCouriers();
    } catch (error) {
      setPopup({
        show: true,
        title: 'Error',
        message: 'Failed to load delivery data. Please refresh the page.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [fetchCouriers, calculateLaxity]);
  
  // Fetch all orders and delivery data using enhanced API
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run when fetchData changes
  
  // Function to schedule delivery for an order
  const handleScheduleDelivery = async (order, scheduleData) => {
    try {
      console.log('📅 Scheduling delivery for order:', order.order_number, 'on date:', scheduleData.date);
      console.log('📅 Order data:', order);
      console.log('📅 Schedule data:', scheduleData);
      
      // Check delivery limit before scheduling
      const selectedDate = new Date(scheduleData.date);
      const maxDeliveriesPerDay = 3;
      
      // Count existing deliveries for the selected date
      const dayOrders = orders.filter(o => {
        if (!o.scheduled_delivery_date) return false;
        const orderDate = new Date(o.scheduled_delivery_date);
        return orderDate.toDateString() === selectedDate.toDateString();
      });
      
      const currentBookings = dayOrders.length;
      
      if (currentBookings >= maxDeliveriesPerDay) {
        showPopup(
          'Delivery Limit Exceeded',
          `Cannot schedule delivery for ${selectedDate.toLocaleDateString()}. Maximum of ${maxDeliveriesPerDay} deliveries per day already reached (${currentBookings} deliveries scheduled).`,
          'error'
        );
        return;
      }
      
      // Regular order scheduling logic
      const response = await api.post('/delivery-enhanced/schedule', {
        order_id: order.id,
        order_number: order.order_number,
        order_type: order.order_type || 'regular',
        customer_name: order.customer_name || order.customerName,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        delivery_date: scheduleData.date,
        delivery_time_slot: scheduleData.timeSlot || null,
        delivery_address: order.shipping_address,
        delivery_city: order.shipping_city,
        delivery_province: order.shipping_province,
        delivery_postal_code: order.shipping_postal_code,
        delivery_contact_phone: order.shipping_phone,
        delivery_notes: scheduleData.notes || `Scheduled delivery for order ${order.order_number}`,
        priority_level: scheduleData.priority || 'normal'
      });
      
      if (response.data.success) {
        console.log('✅ Regular order scheduled successfully');
        
        // Update the order status in local state immediately
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === order.id 
              ? { 
                  ...o, 
                  delivery_status: 'scheduled',
                  scheduled_delivery_date: scheduleData.date,
                  delivery_schedule_id: response.data.data.delivery_schedule_id
                }
              : o
          )
        );
        
        // Show success message
        showPopup(
          'Order Scheduled Successfully',
          `Order ${order.order_number} has been scheduled for delivery on ${new Date(scheduleData.date).toLocaleDateString()}. Status updated to "SCHEDULED" and action buttons are now available.`,
          'success'
        );
        
        // Force refresh all data to ensure UI is in sync
        fetchData();
      }
      
      // Refresh calendar data to show new schedule icon
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const calendarResponse = await api.get('/delivery-enhanced/calendar', {
        params: { year: currentYear, month: currentMonth }
      });
      if (calendarResponse.data.success) {
        const calendarData = calendarResponse.data.data;
        setDeliverySchedules(calendarData.calendar || []);
      }
      
      // Close modal and clear state
      setSelectedOrder(null);
      setShowScheduleModal(false);
      
    } catch (error) {
      console.error('❌ Error scheduling delivery:', error);
      showPopup('Error', 'Error scheduling delivery. Please try again.', 'error');
    }
  };



  // Function to handle delivery status updates

  const handleUpdateDeliveryStatus = async (order, newStatus, event = null) => {
    // Prevent any form submission or page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      console.log(`📦 Updating delivery status for order ${order.order_number} to ${newStatus}`);
      console.log(`🔍 Order details:`, {
        id: order.id,
        order_number: order.order_number,
        order_type: order.order_type,
        current_status: order.delivery_status
      });
      
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup(
          'Authentication Required',
          'You need to log in to update delivery status. Please log in and try again.',
          'warning'
        );
        return;
      }

      // Show confirmation for critical status changes
      if (newStatus === 'delivered') {
        const confirmed = window.confirm(
          `Mark order ${order.order_number} as DELIVERED?\n\n` +
          `This will:\n` +
          `✅ Complete the delivery process\n` +
          `💰 Mark payment as received (GCash)\n` +
          `📅 Set delivery date to today\n` +
          `📧 Notify customer of completion\n\n` +
          `This action will be logged for audit purposes.`
        );
        if (!confirmed) return;
      } else if (newStatus === 'delayed') {
        const confirmed = window.confirm(
          `Mark order ${order.order_number} as DELAYED?\n\n` +
          `This will:\n` +
          `⚠️ Clear current delivery schedule\n` +
          `📅 Require rescheduling\n` +
          `📧 Notify customer of delay\n\n` +
          `You will need to reschedule this order after marking it as delayed.`
        );
        if (!confirmed) return;
      } else if (newStatus === 'cancelled') {
        const confirmed = window.confirm(
          `CANCEL delivery for order ${order.order_number}?\n\n` +
          `This will:\n` +
          `❌ Permanently cancel the delivery\n` +
          `🔄 Update order status to cancelled\n` +
          `💸 Cancel payment transactions\n` +
          `📧 Notify customer of cancellation\n\n` +
          `⚠️ THIS ACTION CANNOT BE UNDONE!`
        );
        if (!confirmed) return;
      }

      try {
        console.log(`📡 Calling delivery status API for regular order...`);
        
        // Use the specific delivery status endpoint
        const response = await api.put(`/delivery-status/orders/${order.id}/status`, {
          delivery_status: newStatus,
          order_type: order.order_type || 'regular',
          delivery_notes: `Status updated to ${newStatus} via DeliveryPage on ${new Date().toLocaleString()}`
        });

        const responseData = response.data;
        console.log(`📥 API Response:`, responseData);

        if (!responseData.success) {
          throw new Error(responseData.message || 'API returned failure status');
        }

        console.log(`✅ Successfully updated order ${order.order_number} to ${newStatus}`);

        // Update local state immediately
        const updatedOrder = {
          ...order,
          delivery_status: newStatus,
          updated_at: responseData.data?.updated_at || new Date().toISOString()
        };

        // Update orders state
        setOrders(prevOrders => {
          const safePrevOrders = Array.isArray(prevOrders) ? prevOrders : [];
          const updatedOrders = safePrevOrders.map(o => {
            if (o.id === order.id || o.order_number === order.order_number) {
              console.log(`🔄 Updated order ${o.order_number} in local state`);
              return updatedOrder;
            }
            return o;
          });
          return updatedOrders;
        });

        // Update delivery schedules state
        setDeliverySchedules(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          return safePrev.map(schedule => {
            if (schedule.order_id === order.id || schedule.order_number === order.order_number) {
              console.log(`📅 Updated delivery schedule for order ${order.order_number}`);
              return { 
                ...schedule, 
                delivery_status: newStatus,
                status: newStatus,
                updated_at: responseData.data?.updated_at || new Date().toISOString()
              };
            }
            return schedule;
          });
        });

        // Show success message
        let successMessage = '';
        if (newStatus === 'delivered') {
          successMessage = `Order ${order.order_number} marked as DELIVERED! ✅\nPayment recorded and customer notified.`;
        } else if (newStatus === 'in_transit') {
          successMessage = `Order ${order.order_number} is now IN TRANSIT! 🚚\nCustomer notified with tracking info.`;
        } else if (newStatus === 'delayed') {
          successMessage = `Order ${order.order_number} marked as DELAYED! ⚠️\nPlease reschedule delivery using the calendar.`;
        } else if (newStatus === 'cancelled') {
          successMessage = `Order ${order.order_number} delivery CANCELLED! ❌\nOrder removed from delivery schedule.`;
        } else {
          successMessage = `Order ${order.order_number} status updated to ${newStatus.toUpperCase()}!`;
        }

        showPopup('Status Updated Successfully', successMessage, 'success');

        // Force a data refresh after a short delay to ensure backend consistency
        setTimeout(() => {
          console.log(`🔄 Forcing data refresh to ensure consistency for ${order.order_number}`);
          fetchData();
        }, 1000);

      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        
        let errorMessage = 'Failed to update delivery status. ';
        
        // Handle axios errors specifically
        if (apiError.response) {
          // Server responded with error status
          const status = apiError.response.status;
          const data = apiError.response.data;
          
          if (status === 401) {
            errorMessage += 'Your session has expired. Please log in again.';
            localStorage.removeItem('token');
            window.location.reload();
          } else if (status === 403) {
            errorMessage += 'You do not have permission to perform this action.';
          } else if (status === 404) {
            errorMessage += 'Order not found in the system.';
          } else if (status === 400) {
            errorMessage += data?.message || 'Invalid request. Please check the order details and try again.';
          } else {
            errorMessage += data?.message || `Server error (${status}). Please try again.`;
          }
        } else if (apiError.request) {
          errorMessage += 'Network error. Please check your connection and try again.';
        } else {
          errorMessage += apiError.message || 'Please try again or contact support if the problem persists.';
        }
        
        showPopup('Update Failed', errorMessage, 'error');
        
        // Attempt to refresh data on error to get current state
        console.log('🔄 Refreshing data due to update error...');
        try {
          await fetchData();
        } catch (refreshError) {
          console.error('❌ Failed to refresh data after error:', refreshError);
        }
      }

    } catch (error) {
      console.error('❌ Critical error in handleUpdateDeliveryStatus:', error);
      showPopup(
        'Critical Error', 
        'A critical error occurred while updating the delivery status. Please refresh the page and try again.', 
        'error'
      );
    }
  };
  // Helper function to toggle date availability
  const toggleDateAvailability = (date) => {
    const dateString = date.toDateString();
    setUnavailableDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) {
        newSet.delete(dateString);
        showPopup('Date Available', `${date.toLocaleDateString()} is now available for delivery.`, 'success');
      } else {
        newSet.add(dateString);
        showPopup('Date Unavailable', `${date.toLocaleDateString()} is now unavailable for delivery.`, 'warning');
      }
      return newSet;
    });
  };
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Find scheduled deliveries for this date
      // Ensure deliverySchedules is an array to prevent filter errors
      const safeDeliverySchedules = Array.isArray(deliverySchedules) ? deliverySchedules : [];
      
      // Debug: Log delivery schedules for today's date
      if (date.toDateString() === new Date().toDateString()) {
        console.log(`📅 Debug for ${date.toDateString()}:`);
        console.log(`  • Total deliverySchedules: ${safeDeliverySchedules.length}`);
        console.log(`  • Delivery schedules:`, safeDeliverySchedules);
        
        // Debug each schedule individually
        safeDeliverySchedules.forEach((schedule, idx) => {
          console.log(`  • Schedule ${idx}:`, {
            id: schedule.id,
            order_id: schedule.order_id,
            order_number: schedule.order_number,
            delivery_date: schedule.delivery_date,
            delivery_status: schedule.delivery_status
          });
        });
      }
      
      const dayDeliveries = safeDeliverySchedules.filter(schedule => {
        // Filter out ALL sample deliveries - comprehensive list
        const sampleOrderIds = [
          1001, 1002, 1005, 9999, 123, 1006, 999999, 5615, 5515, 3,
          // Additional sample IDs to ensure complete filtering (excluding real order IDs 1, 2, 4, 5, 10, 12)
          100, 101, 102, 200, 300, 400, 500,
          1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
          99999, 88888, 77777, 66666, 55555, 44444, 33333, 22222, 11111,
          // Remove orders 26-30 from calendar
          26, 27, 28, 29, 30
        ];
        if (sampleOrderIds.includes(parseInt(schedule.order_id))) {
          return false; // Filter out sample deliveries
        }
        
        const scheduleDate = new Date(schedule.delivery_date);
        const calendarDate = new Date(date);
        
        // Compare just the date parts (ignore time)
        const matches = scheduleDate.getFullYear() === calendarDate.getFullYear() &&
               scheduleDate.getMonth() === calendarDate.getMonth() &&
               scheduleDate.getDate() === calendarDate.getDate();
               
        // Debug logging for today's date (only for real orders)
        if (calendarDate.toDateString() === new Date().toDateString() && matches) {
          console.log(`📅 Calendar Debug for ${calendarDate.toDateString()}:`, {
            schedule: schedule.id,
            order_id: schedule.order_id,
            delivery_date: schedule.delivery_date,
            scheduleDate: scheduleDate.toDateString(),
            calendarDate: calendarDate.toDateString(),
            matches
          });
        }
        
        return matches;
      });

      // Find orders scheduled for this date - for counting and delivery icons only
      // Ensure orders is an array to prevent filter errors
      const safeOrders = Array.isArray(orders) ? orders : [];
      const dayScheduledOrders = safeOrders.filter(order => {
        if (!order.scheduled_delivery_date) return false;
        
        // Filter out ALL sample orders - comprehensive list
        const sampleOrderIds = [
          1001, 1002, 1005, 9999, 123, 1006, 999999, 5615, 5515, 3,
          // Additional sample IDs to ensure complete filtering (excluding real order IDs 1, 2, 4, 5, 10, 12)
          100, 101, 102, 200, 300, 400, 500,
          1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
          99999, 88888, 77777, 66666, 55555, 44444, 33333, 22222, 11111,
          // Remove orders 26-30 from calendar
          26, 27, 28, 29, 30
        ];
        const numericId = typeof order.id === 'string' && order.id.includes('-') 
          ? parseInt(order.id.split('-').pop()) 
          : parseInt(order.id);
        const orderNumberId = order.order_number && !isNaN(order.order_number) 
          ? parseInt(order.order_number) 
          : null;
          
        // Additional filtering for obvious sample/test patterns
        const hasTestPattern = order.customerName && (
          order.customerName.toLowerCase().includes('test') ||
          order.customerName.toLowerCase().includes('sample') ||
          order.customerName.toLowerCase().includes('demo') ||
          order.customerName.toLowerCase().includes('mock')
        );
          
        if ((numericId && sampleOrderIds.includes(numericId)) || 
            (orderNumberId && sampleOrderIds.includes(orderNumberId)) ||
            hasTestPattern) {
          return false; // Filter out sample orders
        }
        
        const orderDate = new Date(order.scheduled_delivery_date);
        const calendarDate = new Date(date);
        
        // Compare just the date parts (ignore time)
        return orderDate.getFullYear() === calendarDate.getFullYear() &&
               orderDate.getMonth() === calendarDate.getMonth() &&
               orderDate.getDate() === calendarDate.getDate();
      });
      
      // Show scheduled orders as delivery blocks on calendar
      const dayOrders = dayScheduledOrders.filter(order => 
        order.delivery_status === 'scheduled' || 
        order.delivery_status === 'in_transit' || 
        order.delivery_status === 'delivered'
      );
      

      
      // Filter out deliveries that correspond to orders to avoid double counting
      const standaloneDeliveries = dayDeliveries.filter(delivery => {
        return !dayOrders.some(order => order.id === delivery.order_id);
      });
      
      // Determine availability status
      const maxDeliveriesPerDay = 3; // Updated maximum capacity
      // Include scheduled orders in booking count (dayScheduledOrders already includes all orders for this date)
      const currentBookings = dayScheduledOrders.length + standaloneDeliveries.length;
      let availabilityStatus = 'available';
      
      // Check if date is user-marked as unavailable
      const dateString = date.toDateString();
      if (unavailableDates.has(dateString)) {
        availabilityStatus = 'unavailable';
      } else {
        // Check capacity for available dates
        if (currentBookings >= maxDeliveriesPerDay) {
          availabilityStatus = 'busy'; // 3+ deliveries = fully booked
        } else if (currentBookings >= 2) {
          availabilityStatus = 'partial'; // 2 deliveries = partially booked
        }
        // 0-1 deliveries = available (default)
      }      days.push({
        date: date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        deliveries: standaloneDeliveries,
        orders: dayOrders,
        scheduledOrders: dayScheduledOrders, // Add scheduled orders to day data
        availabilityStatus: availabilityStatus,
        bookingCount: Math.min(currentBookings, 3) // Cap display at 3 deliveries max
      });
      
      // Debug: Log final day data for today
      if (date.toDateString() === new Date().toDateString()) {
        console.log(`📅 Final day data for ${date.toDateString()}:`, {
          deliveries: standaloneDeliveries.length,
          orders: dayOrders.length,
          scheduledOrders: dayScheduledOrders.length,
          shouldShowIcon: (standaloneDeliveries.length > 0 || dayScheduledOrders.length > 0)
        });
      }
    }
    
    return days;
  };  const handleCalendarDayClick = (day) => {
    // Allow clicking on current month days that aren't marked as unavailable
    // Note: Allow clicking on 'busy' days for scheduling existing orders
    if (!day.isCurrentMonth || day.availabilityStatus === 'unavailable') return;
    
    console.log('📅 Calendar day clicked:', day.date);
    console.log('📅 Day object:', day);
    
    setSelectedDate(day.date);
    

    
    // Find orders that need scheduling (including those that can be rescheduled)
    const safeOrders = Array.isArray(orders) ? orders : [];
    const pendingOrders = safeOrders.filter(order => 
      !order.delivery_status || 
      order.delivery_status === 'pending' || 
      order.delivery_status === 'delayed'
    );
    
    if (pendingOrders.length === 0) {
      showPopup('No Orders Available', 'No orders available for scheduling. All orders may already be scheduled or delivered.', 'warning');
      return;
    }
    
    // If only one pending order, select it automatically
    if (pendingOrders.length === 1) {
      showPopup(
        'Auto-selecting Order',
        `Only one pending order found. Auto-selecting order ${pendingOrders[0].order_number} for scheduling.`,
        'info'
      );
      setSelectedOrder(pendingOrders[0]);
      setShowScheduleModal(true);
    } else {
      // Show message to select an order first with more helpful guidance
      showPopup(
        'Select an Order First', 
        `You have ${pendingOrders.length} orders available for scheduling.\n\nPlease:\n1. Select an order from the Orders list below\n2. Then click on this date (${day.date.toLocaleDateString()}) to schedule delivery\n\nAvailable orders: ${pendingOrders.map(o => o.order_number).join(', ')}`,
        'info'
      );
    }
  };

  const navigateMonth = useCallback(async (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    
    // Fetch calendar data for the new month without showing loading state
    try {
      const currentYear = newDate.getFullYear();
      const currentMonth = newDate.getMonth() + 1;
      const calendarResponse = await api.get('/delivery-enhanced/calendar', {
        params: { year: currentYear, month: currentMonth }
      });
      if (calendarResponse.data.success) {
        const calendarData = calendarResponse.data.data;
        setDeliverySchedules(calendarData.calendar || []);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  }, [currentDate]);

  // Helper function to show custom popups instead of alerts
  const showPopup = (title, message, type = 'info') => {
    setPopup({ show: true, title, message, type });
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <Title>Delivery Management</Title>
          <Subtitle>Loading delivery data...</Subtitle>
        </Header>
        <LoadingSpinner>Loading confirmed orders and delivery schedules...</LoadingSpinner>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Delivery Management</Title>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{Array.isArray(orders) ? orders.length : 0}</StatNumber>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{Array.isArray(orders) ? orders.filter(o => {
            const status = o.delivery_status;
            // Count all non-delivered, non-in-transit orders as confirmed
            return !status || (status !== 'delivered' && status !== 'shipped' && status !== 'in_transit');
          }).length : 0}</StatNumber>
          <StatLabel>Confirmed</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{Array.isArray(orders) ? orders.filter(o => o.delivery_status === 'shipped' || o.delivery_status === 'in_transit').length : 0}</StatNumber>
          <StatLabel>In Transit</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{Array.isArray(orders) ? orders.filter(o => o.delivery_status === 'delivered').length : 0}</StatNumber>
          <StatLabel>Delivered</StatLabel>
        </StatCard>
      </StatsGrid>      <MainContent>
        <ContentSection>
          <LeftSection>            <CalendarContainer>            <CalendarHeader>
              <CalendarNav>
                <CalendarButton 
                  onClick={() => setShowCourierManagement(true)}
                  title="Manage Couriers"
                  style={{ 
                    fontSize: '1rem',
                    padding: '0.8rem',
                    width: '44px',
                    height: '44px',
                    marginRight: '0.5rem'
                  }}
                >
                  <FontAwesomeIcon icon={faUsers} style={{ color: '#000000' }} />
                </CalendarButton>
                <CalendarButton 
                  onClick={() => setShowFullCalendar(true)}
                  title="View Full Calendar"
                  style={{ 
                    fontSize: '1rem',
                    padding: '0.8rem',
                    width: '44px',
                    height: '44px'
                  }}
                >
                  <FontAwesomeIcon icon={faExpand} style={{ color: '#000000' }} />
                </CalendarButton>
              </CalendarNav>              <MonthYear>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

              </MonthYear><CalendarNav>
                <CalendarButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateMonth(-1); }}>
                  <FontAwesomeIcon icon={faChevronLeft} style={{ color: '#000000' }} />
                </CalendarButton>
                <CalendarButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateMonth(1); }}>
                  <FontAwesomeIcon icon={faChevronRight} style={{ color: '#000000' }} />
                </CalendarButton>
              </CalendarNav>
            </CalendarHeader>
            <CalendarGrid>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <CalendarDay key={`mini-header-${day}-${index}`} style={{ minHeight: '40px', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', background: '#f8f8f8' }}>
                  {day}
                </CalendarDay>  
              ))}
              {generateCalendarDays().map((day, index) => (
                <CalendarDay 
                    key={`mini-calendar-day-${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`} 
                    clickable={day.isCurrentMonth && day.availabilityStatus !== 'unavailable'}
                    onClick={() => handleCalendarDayClick(day)}
                    isToday={day.isToday}
                    availabilityStatus={day.availabilityStatus}
                    style={{

                    }}
                  >
                    <DayNumber isToday={day.isToday} isCurrentMonth={day.isCurrentMonth}>
                      {day.dayNumber}
                    </DayNumber>
                    
                    {/* Delivery Status Icon - Only show when there are deliveries */}
                    {(() => {
                      const totalDeliveries = day.deliveries.length + (day.scheduledOrders ? day.scheduledOrders.length : 0);
                      return totalDeliveries > 0;
                    })() && (
                      <DeliveryIcon 
                        status={(() => {
                          // Determine the overall status for this day
                          const allOrders = [...(day.scheduledOrders || []), ...day.deliveries];
                          
                          // Priority: delivered > in_transit > delayed > cancelled > scheduled > pending
                          if (allOrders.some(order => order.delivery_status === 'delivered')) return 'delivered';
                          if (allOrders.some(order => order.delivery_status === 'in_transit')) return 'in_transit';
                          if (allOrders.some(order => order.delivery_status === 'delayed')) return 'delayed';
                          if (allOrders.some(order => order.delivery_status === 'cancelled')) return 'cancelled';
                          if (allOrders.some(order => order.delivery_status === 'scheduled')) return 'scheduled';
                          return 'pending';
                        })()}
                        availability={day.availabilityStatus}
                        title={(() => {
                          const allOrders = [...(day.scheduledOrders || []), ...day.deliveries];
                          const count = allOrders.length;
                          const deliveryInfo = allOrders.length > 0 ? 
                            (allOrders.some(order => order.delivery_status === 'delivered') ? 'DELIVERED' :
                             allOrders.some(order => order.delivery_status === 'in_transit') ? 'IN TRANSIT' :
                             allOrders.some(order => order.delivery_status === 'delayed') ? 'DELAYED' :
                             allOrders.some(order => order.delivery_status === 'cancelled') ? 'CANCELLED' :
                             allOrders.some(order => order.delivery_status === 'scheduled') ? 'SCHEDULED' : 'PENDING') : '';
                          
                          return `${count} delivery(ies) - Status: ${deliveryInfo}\nClick to view order details`;
                        })()}
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          // Handle left-click for delivery info
                          const allScheduledOrders = [...(day.scheduledOrders || [])];
                          if (allScheduledOrders.length > 0) {
                            const orderDetails = allScheduledOrders.map(order => {
                              const status = order.delivery_status || 'pending';
                              const statusIcon = {
                                'pending': '⏳ PENDING',
                                'scheduled': '📅 SCHEDULED',
                                'in_transit': '🚚 IN TRANSIT',
                                'delivered': '✅ DELIVERED',
                                'delayed': '⚠️ DELAYED',
                                'cancelled': '❌ CANCELLED'
                              }[status] || '📦 UNKNOWN';
                              
                              const orderType = '🛍️ Regular';
                              
                              return `${statusIcon}\n${orderType} Order: ${order.order_number}\nCustomer: ${order.customerName}\nAmount: ₱${parseFloat(order.total_amount || 0).toFixed(2)}`;
                            }).join('\n\n');
                            
                            showPopup(
                              `📦 Delivery Schedule - ${day.date.toLocaleDateString()}`,
                              `${allScheduledOrders.length} order${allScheduledOrders.length > 1 ? 's' : ''} scheduled for delivery:\n\n${orderDetails}\n\n💡 Use the action buttons in the Orders list to update delivery status.`,
                              'info'
                            );
                          }
                        }}
                      >
                        {/* Remove delivery count numbers - show only status icons */}
                      </DeliveryIcon>
                    )}
                    
                    {/* Availability Indicator - Circle overlay */}
                    <AvailabilityIndicator
                      availability={day.availabilityStatus}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (day.isCurrentMonth) {
                          toggleDateAvailability(day.date);
                        }
                      }}
                      title={`Availability: ${day.availabilityStatus} (${Math.min(day.bookingCount, 3)}${day.bookingCount > 3 ? '+' : ''}/3 deliveries) - Click to toggle`}
                    >
                      {day.bookingCount > 0 ? (day.bookingCount > 3 ? '3+' : day.bookingCount) : ''}
                    </AvailabilityIndicator>
                    

                </CalendarDay>
              ))}
            </CalendarGrid>
            
            {/* Enhanced Calendar Legend - Minimalist Design */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: '#f8f8f8',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: '#000000',
                fontSize: '1.1rem',
                fontWeight: '400'
              }}>
                Calendar Legend
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {/* Order Status */}
                <div>
                  <h5 style={{ margin: '0 0 0.75rem 0', color: '#333333', fontSize: '0.9rem', fontWeight: '500' }}>Order Status</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#007bff', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>
                        📦
                      </div>
                      <span>Scheduled Orders</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#28a745', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>
                        ✅
                      </div>
                      <span>Delivered Orders</span>
                    </div>
                  </div>
                </div>

                {/* Day Availability */}
                <div>
                  <h5 style={{ margin: '0 0 0.75rem 0', color: '#333333', fontSize: '0.9rem', fontWeight: '500' }}>Day Availability</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#28a745' }} />
                      <span>Available (0-1 deliveries)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ffc107' }} />
                      <span>Partial (2 deliveries)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#dc3545' }} />
                      <span>Full (3 deliveries)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Calendar Legend - Minimalist Design */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: '#f8f8f8',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: '#000000',
                fontSize: '1.1rem',
                fontWeight: '400'
              }}>
                Calendar Legend
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {/* Order Status */}
                <div>
                  <h5 style={{ margin: '0 0 0.75rem 0', color: '#333333', fontSize: '0.9rem', fontWeight: '500' }}>Order Status</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#007bff', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>
                        📦
                      </div>
                      <span>Scheduled Orders</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#28a745', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>
                        ✅
                      </div>
                      <span>Delivered Orders</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CalendarContainer>
        </LeftSection>

        {/* Right Section - Order Management */}
        <RightSection>
          <Card>
            <CardHeader>
              <CardTitle>📋 Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}              <FilterControlsContainer>
                <SearchContainer>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <SearchInput
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <ClearButton
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        ✕
                      </ClearButton>
                    )}
                  </div>
                </SearchContainer>
              </FilterControlsContainer>
              
              <OrdersList>
                {/* Use memoized filtered orders */}
                {filteredOrders.length === 0 ? (
                  <EmptyMessage>
                    <span role="img" aria-label="Search">🔍</span>
                    {searchQuery ? (
                      <>No orders found</>
                    ) : (
                      <>No orders found</>
                    )}
                  </EmptyMessage>
                ) : (
                  filteredOrders.map((order, orderIndex) => {
                    // Simplified scheduling state determination - Custom orders now follow regular order workflow
                    
                    // Check if order has any delivery status beyond 'pending'
                    const hasDeliveryStatus = order.delivery_status && 
                                            order.delivery_status !== 'pending' && 
                                            order.delivery_status !== null;
                    
                    // An order is considered "scheduled" if it has a delivery status (same for both regular and custom orders)
                    const isScheduled = hasDeliveryStatus;
                    

                  
                    return (
                    <OrderItem key={`delivery-page-order-${order.id}-idx-${orderIndex}`} orderType={order.order_type} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#ffffff',
                      border: `1px solid ${
                        order.delivery_status === 'delivered' ? '#d4edda' :
                        order.delivery_status === 'in_transit' ? '#bee5eb' :
                        order.delivery_status === 'scheduled' ? '#e3f2fd' :
                        order.delivery_status === 'delayed' ? '#fff3cd' :
                        order.delivery_status === 'cancelled' ? '#f5c6cb' :
                        '#f0f0f0'
                      }`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.2s ease',
                      marginBottom: '1.5rem'
                    }}>
                      {/* Clean Order Header */}
                      <div style={{
                        background: '#fafafa',
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <OrderTypeIcon className={order.order_type} style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            {order.order_type === 'custom_order' ? '🎨' : 
                             order.order_type === 'custom_design' ? '✏️' : '🛍️'}
                          </OrderTypeIcon>
                          <div>
                            <div style={{ 
                              fontSize: '1.2rem', 
                              fontWeight: '700',
                              color: '#000000',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              Order #{order.order_number || order.id}
                              {/* LLF Priority Indicator */}
                              {order.laxityData && (
                                <span style={{
                                  background: order.laxityData.laxity <= 0 ? '#dc3545' : 
                                            order.laxityData.laxity <= 2 ? '#ffc107' : '#28a745',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '12px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  {order.laxityData.laxity <= 0 ? '🔥 URGENT' : 
                                   order.laxityData.laxity <= 2 ? '⚡ HIGH' : '📅 NORMAL'}
                                </span>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '0.9rem', 
                              color: '#666666',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              flexWrap: 'wrap'
                            }}>
                              <span>👤 {order.customerName}</span>
                              <span style={{ color: '#dee2e6' }}>•</span>
                              <span style={{ color: '#28a745', fontWeight: '600' }}>₱{parseFloat(order.total_amount).toFixed(2)}</span>
                              {/* LLF Details */}
                              {order.laxityData && (
                                <>
                                  <span style={{ color: '#dee2e6' }}>•</span>
                                  <span style={{ 
                                    color: order.laxityData.laxity <= 0 ? '#dc3545' : '#6c757d',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                  }}>
                                    Laxity: {order.laxityData.laxity.toFixed(1)}d
                                  </span>
                                  <span style={{ color: '#dee2e6' }}>•</span>
                                  <span style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                                    Age: {order.laxityData.daysSinceOrder}d
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={order.delivery_status || 'pending'} style={{
                          fontSize: '0.8rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontWeight: '600',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                          {(() => {
                            const status = order.delivery_status || 'pending';
                            if (status === 'delivered') return '✅ DELIVERED';
                            if (status === 'shipped' || status === 'in_transit') return '🚚 IN TRANSIT';
                            if (status === 'scheduled') return '📅 SCHEDULED';
                            if (status === 'delayed') return '⚠️ DELAYED';
                            if (status === 'cancelled') return '❌ CANCELLED';
                            return '📋 CONFIRMED';
                          })()}
                        </StatusBadge>
                      </div>

                      {/* Clean Content Area */}
                      <div style={{ display: 'flex', minHeight: '400px' }}>
                        {/* Left Column - Order Information */}
                        <div style={{ 
                          flex: '1', 
                          padding: '2rem'
                        }}>
                          {/* Date Information Cards */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: order.scheduled_delivery_date ? '1fr 1fr' : '1fr',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                          }}>

                            
                            {/* Scheduled Delivery Card */}
                            {order.scheduled_delivery_date && (
                              <div style={{
                                background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                                border: '1px solid #81c784',
                                borderRadius: '8px',
                                padding: '0.75rem'
                              }}>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: '600', 
                                  color: '#2e7d32', 
                                  marginBottom: '0.25rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  🚚 Scheduled Delivery
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1b5e20' }}>
                                  {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                                  {order.delivery_time_slot && (
                                    <div style={{ fontSize: '0.8rem', fontWeight: '400', marginTop: '0.125rem' }}>
                                      at {order.delivery_time_slot}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Delivery Address Card */}
                          <div style={{
                            background: 'linear-gradient(135deg, #fff8e1, #fff3c4)',
                            border: '1px solid #ffcc02',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            marginBottom: '1.5rem'
                          }}>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: '600', 
                              color: '#e65100', 
                              marginBottom: '0.25rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              📍 Delivery Address
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '400', color: '#e65100', lineHeight: '1.4' }}>
                              {order.shipping_address}
                            </div>
                          </div>

                          {/* ENHANCED COURIER INFORMATION - ALWAYS VISIBLE FOR SCHEDULED ORDERS */}
                          {(order.delivery_status === 'scheduled' || order.delivery_status === 'in_transit' || order.delivery_status === 'delivered') && (
                            <div style={{ 
                              background: order.courier_name ? 
                                'linear-gradient(135deg, #e3f2fd, #bbdefb)' : 
                                'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                              border: `2px solid ${order.courier_name ? '#2196f3' : '#ff9800'}`,
                              borderRadius: '12px',
                              padding: '1rem',
                              marginBottom: '1.5rem',
                              position: 'relative',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                              {/* Courier Header */}
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem',
                                marginBottom: '0.75rem'
                              }}>
                                <div style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '50%',
                                  background: order.courier_name ? 
                                    'linear-gradient(135deg, #2196f3, #1976d2)' : 
                                    'linear-gradient(135deg, #ff9800, #f57c00)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.2rem',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                }}>
                                  🚚
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '700',
                                    color: order.courier_name ? '#1565c0' : '#e65100',
                                    marginBottom: '0.125rem'
                                  }}>
                                    {order.courier_name ? '✅ Courier Assigned' : '⚠️ No Courier Assigned'}
                                  </div>
                                  <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: order.courier_name ? '#1976d2' : '#f57c00',
                                    fontWeight: '500'
                                  }}>
                                    {order.courier_name ? 'Ready for delivery' : 'Awaiting courier assignment'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Courier Details */}
                              {order.courier_name ? (
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '0.75rem',
                                  background: 'rgba(255, 255, 255, 0.7)',
                                  padding: '0.75rem',
                                  borderRadius: '8px'
                                }}>
                                  <div>
                                    <div style={{ 
                                      fontSize: '0.7rem', 
                                      color: '#1565c0', 
                                      marginBottom: '0.25rem',
                                      fontWeight: '600',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}>
                                      👤 Courier Name
                                    </div>
                                    <div style={{ 
                                      fontSize: '0.9rem', 
                                      fontWeight: '600', 
                                      color: '#0d47a1' 
                                    }}>
                                      {order.courier_name}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ 
                                      fontSize: '0.7rem', 
                                      color: '#1565c0', 
                                      marginBottom: '0.25rem',
                                      fontWeight: '600',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}>
                                      📱 Phone Number
                                    </div>
                                    <div style={{ 
                                      fontSize: '0.9rem', 
                                      fontWeight: '600', 
                                      color: '#0d47a1' 
                                    }}>
                                      {order.courier_phone || 'Not provided'}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  background: 'rgba(255, 152, 0, 0.15)',
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  border: '1px dashed #ff9800',
                                  textAlign: 'center'
                                }}>
                                  <div style={{ 
                                    fontSize: '0.85rem', 
                                    color: '#e65100', 
                                    fontWeight: '600',
                                    marginBottom: '0.25rem'
                                  }}>
                                    ⚠️ Action Required
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#ef6c00' }}>
                                    Use the scheduling modal to assign a courier for this delivery
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Enhanced Products Section */}

                        {/* Clean Date Information Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: order.scheduled_delivery_date ? '1fr 1fr' : '1fr',
                          gap: '1.5rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{
                            padding: '1rem',
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Date</div>
                            <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>{(() => {
                              const orderDate = order.created_at || order.order_date || order.timestamp;
                              if (!orderDate) return 'Date not available';
                              try {
                                const date = new Date(orderDate);
                                return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
                              } catch (e) {
                                return 'Invalid date';
                              }
                            })()}</div>
                          </div>
                          
                          {order.scheduled_delivery_date && (
                            <div style={{
                              padding: '1rem',
                              background: '#f8fafe',
                              borderRadius: '8px',
                              border: '1px solid #e8f2ff'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#1976d2', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Scheduled Delivery</div>
                              <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1976d2' }}>
                                {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                                {order.delivery_time_slot && (
                                  <div style={{ fontSize: '0.875rem', fontWeight: '400', marginTop: '0.25rem' }}>
                                    at {order.delivery_time_slot}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Clean Address Section */}
                        <div style={{ 
                          marginBottom: '1.5rem',
                          padding: '1rem',
                          background: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #f0f0f0'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Address</div>
                          <div style={{ fontSize: '1rem', fontWeight: '400', color: '#333', lineHeight: '1.5' }}>{order.shipping_address}</div>
                        </div>                          {/* Clean Courier Information Section */}
                          {(order.delivery_status === 'scheduled' || order.delivery_status === 'in_transit' || order.delivery_status === 'delivered') && (
                            <div style={{ 
                              background: '#ffffff',
                              padding: '1.5rem', 
                              borderRadius: '12px', 
                              border: order.courier_name ? '1px solid #e3f2fd' : '1px solid #fff3e0',
                              marginBottom: '1.5rem',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                marginBottom: order.courier_name ? '1.25rem' : '0'
                              }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '12px',
                                  background: order.courier_name ? '#f0f7ff' : '#fff8e1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.5rem',
                                  border: `2px solid ${order.courier_name ? '#e3f2fd' : '#fff3e0'}`
                                }}>
                                  🚚
                                </div>
                                <div>
                                  <div style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '600',
                                    color: order.courier_name ? '#1976d2' : '#f57c00',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {order.courier_name ? 'Courier Assigned' : 'Awaiting Assignment'}
                                  </div>
                                  {!order.courier_name && (
                                    <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.4' }}>
                                      Use the scheduling button to assign a courier
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {order.courier_name && (
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '1rem',
                                  padding: '1rem',
                                  background: '#f8fafe',
                                  borderRadius: '8px',
                                  border: '1px solid #e8f2ff'
                                }}>
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>
                                      {order.courier_name}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>
                                      {order.courier_phone || 'Not provided'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Clean Products Section */}
                          {order.items && order.items.length > 0 && (
                            <div style={{
                              background: '#ffffff',
                              border: '1px solid #f0f0f0',
                              borderRadius: '12px',
                              padding: '1.5rem'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem',
                                marginBottom: '1.25rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid #f0f0f0'
                              }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: '#f8fafe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1rem'
                                }}>
                                  📦
                                </div>
                                <div style={{ 
                                  fontSize: '1rem', 
                                  fontWeight: '600', 
                                  color: '#333'
                                }}>
                                  Products ({order.items.length})
                                </div>
                              </div>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                              }}>
                                {order.items.slice(0, 4).map((item, index) => (
                                  <div 
                                    key={`product-${order.id}-${item.product_id || item.id}-${index}`}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.75rem',
                                      padding: '1rem',
                                      background: '#fafafa',
                                      border: '1px solid #f0f0f0',
                                      borderRadius: '8px',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    {item.productimage ? (
                                      <img
                                        src={`http://localhost:5000/uploads/${item.productimage}`}
                                        alt={item.productname || item.product_name || 'Product'}
                                        style={{
                                          width: '48px',
                                          height: '48px',
                                          objectFit: 'cover',
                                          borderRadius: '6px',
                                          border: '1px solid #e0e0e0',
                                          background: '#ffffff',
                                          flexShrink: '0'
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      style={{
                                        width: '48px',
                                        height: '48px',
                                        background: '#ffffff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        display: item.productimage ? 'none' : 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        color: '#999',
                                        flexShrink: '0'
                                      }}
                                    >
                                      📦
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.25rem',
                                      minWidth: '0',
                                      flex: '1'
                                    }}>
                                      <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#333',
                                        lineHeight: '1.3',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                      }}>
                                        {item.productname || item.product_name || 'Unknown Product'}
                                      </div>
                                      <div style={{
                                        fontSize: '0.75rem',
                                        color: '#666',
                                        lineHeight: '1.3'
                                      }}>
                                        {item.productcolor && `${item.productcolor} • `}
                                        Qty: {item.quantity || 1}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {order.items.length > 4 && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '1rem',
                                    background: '#fafafa',
                                    border: '1px dashed #d0d0d0',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    color: '#666',
                                    fontWeight: '500',
                                    minHeight: '80px'
                                  }}>
                                    +{order.items.length - 4} more items
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Clean Action Panel */}
                        <div style={{ 
                          width: '280px',
                          background: '#ffffff',
                          borderLeft: '1px solid #f0f0f0',
                          padding: '2rem',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {!isScheduled ? (
                            /* Unscheduled Order Actions */
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '1.5rem',
                              height: '100%'
                            }}>
                              {/* Status Indicator */}
                              <div style={{
                                textAlign: 'center',
                                padding: '1.5rem',
                                background: '#fffbf0',
                                borderRadius: '12px',
                                border: '1px solid #ffeaa7'
                              }}>
                                <div style={{
                                  fontSize: '2rem',
                                  marginBottom: '0.75rem'
                                }}>
                                  📋
                                </div>
                                <div style={{
                                  fontSize: '1.1rem',
                                  fontWeight: '600',
                                  color: '#856404',
                                  marginBottom: '0.5rem'
                                }}>
                                  Ready for Scheduling
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#856404', lineHeight: '1.4' }}>
                                  Set delivery date and assign courier
                                </div>
                              </div>
                              
                              {/* Schedule Button */}
                              <ActionButton 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowScheduleModal(true);
                                  showPopup(
                                    'Schedule Delivery',
                                    `Opening schedule modal for order ${order.order_number}. Set delivery date and assign courier.`,
                                    'info'
                                  );
                                }}
                                style={{ 
                                  background: '#28a745',
                                  color: 'white', 
                                  fontSize: '1rem', 
                                  padding: '1.25rem',
                                  fontWeight: '600',
                                  borderRadius: '12px',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.75rem',
                                  minHeight: '56px',
                                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.25)',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                📅 Schedule Delivery
                              </ActionButton>
                            </div>
                          ) : (
                            /* Scheduled Order Actions */
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '1.5rem',
                              height: '100%'
                            }}>
                              {/* Status Indicator */}
                              <div style={{
                                textAlign: 'center',
                                padding: '1.5rem',
                                background: '#f0f7ff',
                                borderRadius: '12px',
                                border: '1px solid #b8e6b8'
                              }}>
                                <div style={{
                                  fontSize: '2rem',
                                  marginBottom: '0.75rem'
                                }}>
                                  🚀
                                </div>
                                <div style={{
                                  fontSize: '1.1rem',
                                  fontWeight: '600',
                                  color: '#0c5460',
                                  marginBottom: '0.5rem'
                                }}>
                                  Delivery Management
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#0c5460', lineHeight: '1.4' }}>
                                  Update order status
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                              }}>
                                {/* Primary Status Actions */}
                                {(order.delivery_status === 'scheduled' || order.delivery_status === 'in_transit') && (
                                  <ActionButton 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleUpdateDeliveryStatus(order, 'delivered', e);
                                    }}
                                    style={{ 
                                      background: '#28a745',
                                      color: 'white', 
                                      fontSize: '0.9rem', 
                                      padding: '0.875rem 1rem',
                                      fontWeight: '500',
                                      borderRadius: '8px',
                                      border: 'none',
                                      minHeight: '44px',
                                      boxShadow: '0 2px 6px rgba(40, 167, 69, 0.2)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    ✅ Mark as Delivered
                                  </ActionButton>
                                )}
                                
                                {order.delivery_status === 'scheduled' && (
                                  <ActionButton 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleUpdateDeliveryStatus(order, 'in_transit', e);
                                    }}
                                    style={{ 
                                      background: '#17a2b8',
                                      color: 'white', 
                                      fontSize: '0.9rem', 
                                      padding: '0.875rem 1rem',
                                      fontWeight: '500',
                                      borderRadius: '8px',
                                      border: 'none',
                                      minHeight: '44px',
                                      boxShadow: '0 2px 6px rgba(23, 162, 184, 0.2)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    🚚 Start Transit
                                  </ActionButton>
                                )}
                                
                                {/* Secondary Actions */}
                                <div style={{ 
                                  display: 'flex', 
                                  gap: '0.5rem',
                                  marginTop: '0.5rem'
                                }}>
                                  {(order.delivery_status === 'scheduled' || order.delivery_status === 'in_transit') && (
                                    <>
                                      <ActionButton 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleUpdateDeliveryStatus(order, 'delayed', e);
                                        }}
                                        style={{ 
                                          background: '#ffc107',
                                          color: '#212529', 
                                          fontSize: '0.8rem', 
                                          padding: '0.75rem',
                                          fontWeight: '500',
                                          borderRadius: '6px',
                                          border: 'none',
                                          flex: '1',
                                          minHeight: '36px',
                                          boxShadow: '0 1px 4px rgba(255, 193, 7, 0.2)',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        ⚠️ Delay
                                      </ActionButton>
                                      
                                      <ActionButton 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleUpdateDeliveryStatus(order, 'cancelled', e);
                                        }}
                                        style={{ 
                                          background: '#dc3545',
                                          color: 'white', 
                                          fontSize: '0.8rem', 
                                          padding: '0.75rem',
                                          fontWeight: '500',
                                          borderRadius: '6px',
                                          border: 'none',
                                          flex: '1',
                                          minHeight: '36px',
                                          boxShadow: '0 1px 4px rgba(220, 53, 69, 0.2)',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        ❌ Cancel                                      </ActionButton>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {/* Special State Actions */}
                              {order.delivery_status === 'delayed' && (
                                <ActionButton 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowScheduleModal(true);
                                    showPopup(
                                      'Reschedule Delayed Order',
                                      `Opening schedule modal for order ${order.order_number}. Set a new delivery date and assign courier.`,
                                      'info'
                                    );
                                  }}
                                  style={{ 
                                    background: '#ffc107',
                                    color: '#212529', 
                                    fontSize: '0.9rem', 
                                    padding: '1rem',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    border: 'none',
                                    width: '100%',
                                    minHeight: '44px',
                                    boxShadow: '0 2px 6px rgba(255, 193, 7, 0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  📅 Reschedule Order
                                </ActionButton>
                              )}
                              
                              {order.delivery_status === 'cancelled' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <ActionButton 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleUpdateDeliveryStatus(order, 'pending', e);
                                    }}
                                    style={{ 
                                      background: '#28a745',
                                      color: 'white', 
                                      fontSize: '0.85rem', 
                                      padding: '0.75rem',
                                      fontWeight: '500',
                                      borderRadius: '6px',
                                      border: 'none',
                                      flex: '1',
                                      minHeight: '36px',
                                      boxShadow: '0 1px 4px rgba(40, 167, 69, 0.2)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    🔄 Restore
                                  </ActionButton>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </OrderItem>
                  );
                  })
                )}
              </OrdersList>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>📋 Enhanced Delivery Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#666666' }}>
                <p><strong>🚀 Enhanced Scheduling Workflow:</strong></p>
                <p>1. Click "Select Order" for unscheduled orders</p>
                <p>2. Click on an available date in the calendar</p>
                <p>3. Set delivery time and assign courier</p>
                <p>4. Use the new action buttons to update delivery progress</p>
                <br />
                <p><strong>⚡ Laxity Least First (LLF) Priority System:</strong></p>
                <p>• <span style={{color: '#dc3545', fontWeight: 'bold'}}>🔥 URGENT</span> - Laxity ≤ 0 days (immediate attention required)</p>
                <p>• <span style={{color: '#ffc107', fontWeight: 'bold'}}>⚡ HIGH</span> - Laxity 1-2 days (high priority)</p>
                <p>• <span style={{color: '#28a745', fontWeight: 'bold'}}>📅 NORMAL</span> - Laxity {'>'}2 days (normal priority)</p>
                <p><em>Laxity = Available Time - Required Processing Time</em></p>
                <p><em>Orders are sorted by laxity (most urgent first), then by amount (highest first)</em></p>
                <br />
                <p><strong>⚡ New Action Buttons:</strong></p>
                <p>• <span style={{color: '#28a745', fontWeight: 'bold'}}>✅ Delivered</span> - Mark as delivered and paid (GCash)</p>
                <p>• <span style={{color: '#17a2b8', fontWeight: 'bold'}}>🚚 In Transit</span> - Package is on the way</p>
                <p>• <span style={{color: '#ffc107', fontWeight: 'bold'}}>⚠️ Delay</span> - Removes schedule, requires rescheduling</p>
                <br />
                <p><strong>📊 Order Types:</strong></p>
                <p>• <span style={{color: '#f093fb', fontWeight: 'bold'}}>🛍️ Regular Orders</span> - Direct scheduling</p>
                <br />
                <p><strong>⏰ Operating Schedule:</strong></p>
                <p><strong>Hours:</strong> 9:00 AM - 5:00 PM</p>
                <p><strong>Areas:</strong> Metro Manila (NCR)</p>
                <p><strong>Capacity:</strong> 3 deliveries maximum per day</p>
                <br />
                <p><strong>📈 Status Flow:</strong></p>
                <p>• Pending → Schedule → In Transit → Delivered</p>
                <p>• Any status → Delay (requires rescheduling)</p>
              </div>
            </CardContent>
          </Card>
        </RightSection>
        </ContentSection>
      </MainContent>


      {/* Schedule Delivery Modal */}
      {showScheduleModal && selectedOrder && (
        <ScheduleModal 
          order={selectedOrder}
          preSelectedDate={selectedDate}
          // Removed customOrderProductionDates - Custom orders now follow regular order workflow
          couriers={couriers}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedOrder(null);
            setSelectedDate(null);
          }}
          onSchedule={handleScheduleDelivery}
        />
      )}

      {/* Custom Popup Modal */}
      {popup.show && (
        <PopupOverlay onClick={() => setPopup({ ...popup, show: false })}>
          <PopupModal onClick={(e) => e.stopPropagation()}>
            <PopupHeader>
              <PopupTitle type={popup.type}>
                {popup.type === 'error' && '❌ '}
                {popup.type === 'warning' && '⚠️ '}
                {popup.type === 'success' && '✅ '}
                {popup.type === 'info' && 'ℹ️ '}
                {popup.title}
              </PopupTitle>
              <PopupClose onClick={() => setPopup({ ...popup, show: false })}>
                ×
              </PopupClose>
            </PopupHeader>
            <PopupContent>
              {popup.message}
            </PopupContent>
            <PopupActions>
              <PopupButton onClick={() => setPopup({ ...popup, show: false })}>
                OK
              </PopupButton>
            </PopupActions>
          </PopupModal>
        </PopupOverlay>
      )}
      
      {/* Full Calendar Modal - Enhanced version using the same logic as minimized calendar */}
      {showFullCalendar && (
        <FullCalendarModal onClick={() => setShowFullCalendar(false)}>
          <FullCalendarContent onClick={(e) => e.stopPropagation()}>
            {/* Enhanced Calendar Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e0e0e0',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  background: '#000000',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FontAwesomeIcon icon={faExpand} style={{ color: '#ffffff', fontSize: '1.5rem' }} />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '200',
                    color: '#000000',
                    margin: '0',
                    letterSpacing: '-0.02em'
                  }}>
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h1>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666666',
                    margin: '0.25rem 0 0 0',
                    fontWeight: '300'
                  }}>
                    Delivery Management Calendar
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateMonth(-1); }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '48px',
                    height: '48px'
                  }}
                  onMouseOver={(e) => {
                    if (e.target) {
                      e.target.style.background = '#f8f8f8';
                      e.target.style.borderColor = '#000000';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (e.target) {
                      e.target.style.background = '#ffffff';
                      e.target.style.borderColor = '#e0e0e0';
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} style={{ color: '#000000' }} />
                </button>
                
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateMonth(1); }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '48px',
                    height: '48px'
                  }}
                  onMouseOver={(e) => {
                    if (e.target) {
                      e.target.style.background = '#f8f8f8';
                      e.target.style.borderColor = '#000000';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (e.target) {
                      e.target.style.background = '#ffffff';
                      e.target.style.borderColor = '#e0e0e0';
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faChevronRight} style={{ color: '#000000' }} />
                </button>
                
                <button
                  onClick={() => setShowFullCalendar(false)}
                  style={{
                    background: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '48px',
                    height: '48px',
                    marginLeft: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    if (e.target) {
                      e.target.style.background = '#333333';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (e.target) {
                      e.target.style.background = '#000000';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} style={{ color: '#ffffff' }} />
                </button>
              </div>
            </div>

            {/* Enhanced Calendar Grid - Uses same logic as minimized calendar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              background: '#ffffff',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
              border: '1px solid #e0e0e0',
              borderTop: 'none'
            }}>
              {/* Day Headers */}
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                <div key={`full-header-${day}-${index}`} style={{
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  fontWeight: '400',
                  fontSize: '1rem',
                  color: '#000000',
                  background: '#f8f8f8',
                  borderRight: index < 6 ? '1px solid #e0e0e0' : 'none',
                  borderBottom: '1px solid #e0e0e0',
                  letterSpacing: '0.02em'
                }}>
                  {day}
                </div>
              ))}
              
              {/* Calendar Days - Uses same logic as minimized calendar but with enhanced styling */}
              {generateCalendarDays().map((day, index) => (
                <div
                  key={`full-calendar-day-${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`}
                  onClick={() => handleCalendarDayClick(day)}
                  style={{
                    minHeight: '180px',
                    padding: '1rem',
                    borderRight: (index + 1) % 7 !== 0 ? '1px solid #e0e0e0' : 'none',
                    borderBottom: index < 35 ? '1px solid #e0e0e0' : 'none',
                    background: (() => {
                      if (!day.isCurrentMonth) return '#f8f8f8';
                      if (day.isToday) return '#f0f8ff';
                      return '#ffffff';
                    })(),
                    cursor: day.isCurrentMonth && day.availabilityStatus !== 'unavailable' ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (e.target && day.isCurrentMonth && day.availabilityStatus !== 'unavailable') {
                      e.target.style.background = '#f5f5f5';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (e.target) {
                      if (!day.isCurrentMonth) {
                        e.target.style.background = '#f8f8f8';
                      } else if (day.isToday) {
                        e.target.style.background = '#f0f8ff';
                      } else {
                        e.target.style.background = '#ffffff';
                      }
                    }
                  }}
                >
                  {/* Day Number - Enhanced styling */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: day.isToday ? '600' : '300',
                      color: (() => {
                        if (!day.isCurrentMonth) return '#cccccc';
                        if (day.isToday) return '#0066cc';
                        return '#000000';
                      })(),
                      background: day.isToday ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
                      borderRadius: day.isToday ? '8px' : '0',
                      padding: day.isToday ? '0.5rem 0.75rem' : '0',
                      minWidth: '2rem',
                      textAlign: 'center'
                    }}>
                      {day.dayNumber}
                    </span>
                    
                    {/* Availability Indicator - Enhanced */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (day.isCurrentMonth) {
                          toggleDateAvailability(day.date);
                        }
                      }}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: (() => {
                          switch (day.availabilityStatus) {
                            case 'available': return '#28a745';
                            case 'partial': return '#ffc107';
                            case 'busy': return '#dc3545';
                            case 'unavailable': return '#6c757d';
                            default: return '#28a745';
                          }
                        })(),
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                      onMouseOver={(e) => {
                        if (e.target) {
                          e.target.style.transform = 'scale(1.2)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (e.target) {
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                      title={`Availability: ${day.availabilityStatus} (${Math.min(day.bookingCount, 3)}${day.bookingCount > 3 ? '+' : ''}/3 deliveries) - Click to toggle`}
                    >
                      {day.bookingCount > 0 ? (day.bookingCount > 3 ? '3+' : day.bookingCount) : ''}
                    </div>
                  </div>

                  {/* Enhanced Delivery Status Icon - Proper status-based icons */}
                  {(day.deliveries.length > 0 || (day.scheduledOrders && day.scheduledOrders.length > 0)) && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const allScheduledOrders = [...(day.scheduledOrders || [])];
                        if (allScheduledOrders.length > 0) {
                          const orderDetails = allScheduledOrders.map(order => {
                            const status = order.delivery_status || 'pending';
                            const statusIcon = {
                              'pending': '⏳ PENDING',
                              'scheduled': '📅 SCHEDULED',
                              'in_transit': '🚚 IN TRANSIT',
                              'delivered': '✅ DELIVERED',
                              'delayed': '⚠️ DELAYED',
                              'cancelled': '❌ CANCELLED'
                            }[status] || '📦 UNKNOWN';
                            
                            const orderType = '🛍️ Regular';
                            
                            return `${statusIcon}\n${orderType} Order: ${order.order_number}\nCustomer: ${order.customerName}\nAmount: ₱${parseFloat(order.total_amount || 0).toFixed(2)}`;
                          }).join('\n\n');
                          
                          showPopup(
                            `📦 Delivery Schedule - ${day.date.toLocaleDateString()}`,
                            `${allScheduledOrders.length} order${allScheduledOrders.length > 1 ? 's' : ''} scheduled for delivery:\n\n${orderDetails}\n\n💡 Use the action buttons in the Orders list to update delivery status.`,
                            'info'
                          );
                        }
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: (() => {
                          const allOrders = [...(day.scheduledOrders || []), ...day.deliveries];
                          if (allOrders.some(order => order.delivery_status === 'delivered')) return '#28a745';
                          if (allOrders.some(order => order.delivery_status === 'in_transit')) return '#17a2b8';
                          if (allOrders.some(order => order.delivery_status === 'delayed')) return '#ffc107';
                          if (allOrders.some(order => order.delivery_status === 'cancelled')) return '#6c757d';
                          if (allOrders.some(order => order.delivery_status === 'scheduled')) return '#007bff';
                          return '#6c757d'; // Default for pending
                        })(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        zIndex: 5
                      }}
                      onMouseOver={(e) => {
                        if (e.target) {
                          e.target.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (e.target) {
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                      title={(() => {
                        const allOrders = [...(day.scheduledOrders || []), ...day.deliveries];
                        const count = allOrders.length;
                        let primaryStatus = 'pending';
                        
                        // Determine the primary status to show
                        if (allOrders.some(order => order.delivery_status === 'delivered')) {
                          primaryStatus = 'delivered';
                        } else if (allOrders.some(order => order.delivery_status === 'in_transit')) {
                          primaryStatus = 'in_transit';
                        } else if (allOrders.some(order => order.delivery_status === 'delayed')) {
                          primaryStatus = 'delayed';
                        } else if (allOrders.some(order => order.delivery_status === 'cancelled')) {
                          primaryStatus = 'cancelled';
                        } else if (allOrders.some(order => order.delivery_status === 'scheduled')) {
                          primaryStatus = 'scheduled';
                        }
                        
                        const statusLabel = {
                          'pending': 'PENDING',
                          'scheduled': 'SCHEDULED',
                          'in_transit': 'IN TRANSIT',
                          'delivered': 'DELIVERED',
                          'delayed': 'DELAYED',
                          'cancelled': 'CANCELLED'
                        }[primaryStatus] || 'PENDING';
                        
                        return `${count} delivery(ies) - Status: ${statusLabel}\nClick to view order details`;
                      })()}
                    >
                      {(() => {
                        const allOrders = [...(day.scheduledOrders || []), ...day.deliveries];
                        // Show status-specific icon instead of generic 📦
                        if (allOrders.some(order => order.delivery_status === 'delivered')) return '✅';
                        if (allOrders.some(order => order.delivery_status === 'in_transit')) return '🚚';
                        if (allOrders.some(order => order.delivery_status === 'delayed')) return '⚠️';
                        if (allOrders.some(order => order.delivery_status === 'cancelled')) return '❌';
                        if (allOrders.some(order => order.delivery_status === 'scheduled')) return '📅';
                        return '⏳'; // Default for pending orders
                      })()}
                    </div>
                  )}

                  {/* Removed production timeline indicators - Custom orders now follow regular order workflow */}
                </div>
              ))}
            </div>
            
            {/* Enhanced Calendar Legend - Minimalist Design */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: '#f8f8f8',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: '#000000',
                fontSize: '1.1rem',
                fontWeight: '400'
              }}>
                Calendar Legend
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {/* Order Status */}
                <div>
                  <h5 style={{ margin: '0 0 0.75rem 0', color: '#333333', fontSize: '0.9rem', fontWeight: '500' }}>Order Status</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#007bff', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>
                        📦
                      </div>
                      <span>Scheduled Orders</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#28a745', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>
                        ✅
                      </div>
                      <span>Delivered Orders</span>
                    </div>
                  </div>
                </div>

                {/* Day Availability */}
                <div>
                  <h5 style={{ margin: '0 0 0.75rem 0', color: '#333333', fontSize: '0.9rem', fontWeight: '500' }}>Day Availability</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#28a745' }} />
                      <span>Available (0-1 deliveries)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ffc107' }} />
                      <span>Partial (2 deliveries)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#dc3545' }} />
                      <span>Busy (3+ deliveries)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#ffffff', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#333333',
                border: '1px solid #e0e0e0'
              }}>
                <strong>💡 Enhanced Calendar:</strong> This full calendar view uses the same logic and data as the minimized calendar, 
                but with enhanced visibility and larger interactive elements for better order management experience.
              </div>
            </div>
          </FullCalendarContent>
        </FullCalendarModal>
      )}

      {/* Courier Management Modal */}
      <CourierManagement
        isOpen={showCourierManagement}
        onClose={() => setShowCourierManagement(false)}
      />
    </PageContainer>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ order, onClose, onSchedule, preSelectedDate, couriers = [] }) => {
  const [scheduleData, setScheduleData] = useState({
    date: preSelectedDate ? 
      `${preSelectedDate.getFullYear()}-${String(preSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(preSelectedDate.getDate()).padStart(2, '0')}` : 
      '',
    time: '',
    notes: ''
  });

  // Calculate minimum date for orders
  const getMinDate = () => {
    // Regular orders can be scheduled from today
    return new Date().toISOString().split('T')[0];
  };

  // Get production status message for orders


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📅 Submitting schedule data:', scheduleData);
    console.log('📅 Selected date from calendar:', preSelectedDate);
    onSchedule(order, scheduleData);
  };

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Schedule Delivery - {order.order_number}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>          <FormGroup>
            <Label>Customer: {order.customerName}</Label>
            <Label>Address: {order.shipping_address}</Label>
            <Label>Phone: {order.contact_phone}</Label>
          </FormGroup>

          {/* Product Details Section */}
          {order.items && order.items.length > 0 && (
            <FormGroup>
              <Label>Products to Deliver ({order.items.length} item{order.items.length > 1 ? 's' : ''})</Label>
              <div style={{ 
                background: '#f8f9fa', 
                border: '1px solid #e9ecef', 
                borderRadius: '8px', 
                padding: '12px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {order.items.map((item, index) => (
                  <div key={`schedule-modal-item-${order.id}-${item.product_id || item.id}-${index}`} style={{
                    padding: '8px 0',
                    borderBottom: index < order.items.length - 1 ? '1px solid #dee2e6' : 'none'
                  }}>
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: '4px',
                      color: '#000000',
                      fontSize: '0.9rem'
                    }}>
                      {item.productname || 'Unknown Product'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666666', marginBottom: '2px' }}>
                      <strong>Product ID:</strong> {item.product_id || 'N/A'}
                      {item.productcolor && (
                        <span style={{ marginLeft: '12px' }}>
                          <strong>Color:</strong> {item.productcolor}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666666' }}>
                      {item.product_type && (
                        <span>
                          <strong>Type:</strong> {item.product_type}
                        </span>
                      )}
                      <span style={{ marginLeft: item.product_type ? '12px' : '0' }}>
                        <strong>Quantity:</strong> {item.quantity || 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </FormGroup>
          )}          <FormGroup>
            <Label>Delivery Date</Label>
            <Input
              type="date"
              value={scheduleData.date}
              onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
              min={getMinDate()}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Delivery Time</Label>
            <Select
              value={scheduleData.time}
              onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
              required
            >
              <option value="">Select Time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Assign Courier (Optional)</Label>
            <Select
              value={scheduleData.courier_id || ''}
              onChange={(e) => setScheduleData({...scheduleData, courier_id: e.target.value})}
            >
              <option value="">No courier assigned</option>
              {couriers.filter(courier => courier.status === 'active').map(courier => (
                <option key={courier.id} value={courier.id}>
                  {courier.name} - {courier.phone_number} ({courier.vehicle_type})
                </option>
              ))}
            </Select>
            {couriers.length === 0 && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#666666', 
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                ℹ️ No couriers available. Manage couriers using the courier management button.
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Driver Notes (Optional)</Label>
            <Textarea
              value={scheduleData.notes}
              onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
              placeholder="Special delivery instructions..."
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <ActionButton type="button" onClick={onClose}>
              Cancel
            </ActionButton>            <ActionButton type="submit" $primary>
              Schedule Delivery
            </ActionButton>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default DeliveryPage;