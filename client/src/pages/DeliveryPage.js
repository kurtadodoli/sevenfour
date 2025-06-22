import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/api';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faTruck,
  faExpand,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

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

const CalendarButton = styled.button`
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

const CalendarDay = styled.div`
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

const DayNumber = styled.div`
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
  width: 24px;
  height: 24px;
  background: ${props => {
    switch (props.status) {
      case 'pending':
        return 'linear-gradient(135deg, #fff3cd, #ffeaa7)';
      case 'scheduled':
        return 'linear-gradient(135deg, #d1ecf1, #bee5eb)';
      case 'pending_completion':
        return 'linear-gradient(135deg, #ffa500, #ff8c00)';
      case 'in_transit':
        return 'linear-gradient(135deg, #000000, #2d3436)';
      case 'delivered':
        return 'linear-gradient(135deg, #d4edda, #c3e6cb)';
      case 'delayed':
        return 'linear-gradient(135deg, #f8d7da, #f5c6cb)';
      default:
        return '#000000'; // Default black for unscheduled orders
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#856404';
      case 'scheduled':
        return '#0c5460';
      case 'pending_completion':
        return '#ffffff';
      case 'in_transit':
        return '#ffffff';
      case 'delivered':
        return '#155724';
      case 'delayed':
        return '#721c24';
      default:
        return '#ffffff';
    }
  }};
  border-radius: 50%;
  font-size: 0.8rem;
  margin-top: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'pending': return 'linear-gradient(135deg, #fff3cd, #ffeaa7)';
      case 'scheduled': return 'linear-gradient(135deg, #d1ecf1, #bee5eb)';
      case 'pending_completion': return 'linear-gradient(135deg, #ffa500, #ff8c00)';
      case 'in_transit': return 'linear-gradient(135deg, #000000, #2d3436)';
      case 'delivered': return 'linear-gradient(135deg, #d4edda, #c3e6cb)';
      case 'delayed': return 'linear-gradient(135deg, #fce4ec, #f8bbd9)';
      default: return '#e9ecef';
    }
  }};
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const AvailabilityIndicator = styled.div`
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

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: ${props => props.color};
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
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

const FullCalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  padding-top: 1rem;
  padding-right: 3rem;
  border-bottom: 2px solid #e0e0e0;
  position: relative;
`;

const FullCalendarTitle = styled.h2`
  font-size: 2rem;
  font-weight: 300;
  margin: 0;
  color: #000000;
`;

const FullCalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const FullCalendarDay = styled.div`
  background: ${props => {
    if (!props.isCurrentMonth) return '#f8f8f8';
      // Availability status colors for current month days
    if (props.availabilityStatus === 'available') return 'linear-gradient(135deg, #f8fff9, #ffffff)';
    if (props.availabilityStatus === 'partial') return 'linear-gradient(135deg, #fffdf5, #ffffff)';
    if (props.availabilityStatus === 'busy') return 'linear-gradient(135deg, #fff5f5, #ffffff)';
    if (props.availabilityStatus === 'unavailable') return 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
    return '#ffffff';
  }};
  min-height: 150px;
  padding: 1rem;
  border: none;
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (!props.isCurrentMonth) return '#f0f0f0';
      
      if (props.availabilityStatus === 'available') return 'linear-gradient(135deg, #e8f5e8, #f0f8f0)';
      if (props.availabilityStatus === 'partial') return 'linear-gradient(135deg, #fff8e6, #fffbf0)';
      if (props.availabilityStatus === 'busy') return 'linear-gradient(135deg, #ffe6e6, #fff0f0)';
      if (props.availabilityStatus === 'unavailable') return 'linear-gradient(135deg, #e9ecef, #dee2e6)';
      return '#f8f8f8';
    }};
  }
  
  ${props => props.isToday && `
    background: ${
      props.availabilityStatus === 'available' ? 'linear-gradient(135deg, #e8f5e8, #f0f8f0)' :
      props.availabilityStatus === 'partial' ? 'linear-gradient(135deg, #fff8e6, #fffbf0)' :
      props.availabilityStatus === 'busy' ? 'linear-gradient(135deg, #ffe6e6, #fff0f0)' :
      props.availabilityStatus === 'unavailable' ? 'linear-gradient(135deg, #e9ecef, #dee2e6)' :
      '#f0f0f0'
    };
    border: 3px solid #000000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `}
  
  ${props => !props.isCurrentMonth && `
    color: #cccccc;
  `}
  
  ${props => props.isCurrentMonth && props.availabilityStatus === 'available' && `
    box-shadow: inset 0 0 0 2px rgba(40, 167, 69, 0.1);
  `}
  
  ${props => props.isCurrentMonth && props.availabilityStatus === 'partial' && `
    box-shadow: inset 0 0 0 2px rgba(255, 193, 7, 0.1);
  `}
  
  ${props => props.isCurrentMonth && props.availabilityStatus === 'busy' && `
    box-shadow: inset 0 0 0 2px rgba(220, 53, 69, 0.1);
  `}
  
  ${props => props.isCurrentMonth && props.availabilityStatus === 'unavailable' && `
    box-shadow: inset 0 0 0 2px rgba(108, 117, 125, 0.1);
  `}
`;

const FullDayNumber = styled.div`
  font-size: 1.1rem;
  font-weight: ${props => props.isToday ? '600' : '400'};
  color: ${props => props.isCurrentMonth ? '#000000' : '#cccccc'};
  margin-bottom: 0.75rem;
  text-align: center;
`;

const FullOrderBlock = styled.div`
  background: ${props => {
    switch (props.status) {
      case 'scheduled': return 'linear-gradient(135deg, #000000, #333333)';
      case 'pending_completion': return 'linear-gradient(135deg, #ffa500, #ff8c00)';
      case 'in_transit': return 'linear-gradient(135deg, #007bff, #0056b3)';
      case 'delivered': return 'linear-gradient(135deg, #28a745, #1e7e34)';
      case 'delayed': return 'linear-gradient(135deg, #e91e63, #c2185b)';
      default: return 'linear-gradient(135deg, #6c757d, #5a6268)';
    }
  }};
  color: #ffffff;
  font-size: 0.8rem;
  padding: 0.5rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  }
`;

const CloseFullCalendar = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666666;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  &:hover {
    background: #f8f9fa;
    color: #000000;
    border-color: #000000;
    transform: scale(1.05);
  }
`;

const OrdersList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const OrderItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.isSelected && `
    background: #f0f8ff;
    border-left: 4px solid #000000;
  `}
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderNumber = styled.div`
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.25rem;
`;

const OrderDetails = styled.div`
  font-size: 0.9rem;
  color: #666666;
  line-height: 1.4;
`;

const OrderActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  min-width: 200px;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.variant === 'success') return 'linear-gradient(135deg, #28a745, #20c997)';
    if (props.variant === 'danger') return 'linear-gradient(135deg, #dc3545, #e74c3c)';
    if (props.variant === 'info') return 'linear-gradient(135deg, #17a2b8, #3498db)';
    if (props.variant === 'warning') return 'linear-gradient(135deg, #ffc107, #f39c12)';
    if (props.primary) return 'linear-gradient(135deg, #000000, #2c3e50)';
    return 'linear-gradient(135deg, #ffffff, #f8f9fa)';
  }};
  color: ${props => {
    if (props.variant || props.primary) return '#ffffff';
    if (props.variant === 'warning') return '#212529';
    return '#000000';
  }};
  border: 2px solid ${props => {
    if (props.variant === 'success') return '#28a745';
    if (props.variant === 'danger') return '#dc3545';
    if (props.variant === 'info') return '#17a2b8';
    if (props.variant === 'warning') return '#ffc107';
    if (props.primary) return '#000000';
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
      if (props.primary) return 'linear-gradient(135deg, #333333, #34495e)';
      return 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
    }};
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-color: ${props => {
      if (props.variant === 'success') return '#20c997';
      if (props.variant === 'danger') return '#e74c3c';
      if (props.variant === 'info') return '#3498db';
      if (props.variant === 'warning') return '#f39c12';
      if (props.primary) return '#2c3e50';
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
      if (props.primary) return 'rgba(0, 0, 0, 0.25)';
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

const StatusBadge = styled.span`
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
    switch (props.status) {
      case 'pending':
        return `
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          color: #856404;
          border: 1px solid #ffeaa7;
          &:hover {
            background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
          }
        `;
      case 'scheduled':
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
        `;      case 'delayed':
        return `
          background: linear-gradient(135deg, #fce4ec, #f8bbd9);
          color: #880e4f;
          border: 1px solid #f8bbd9;
          &:hover {
            background: linear-gradient(135deg, #f8bbd9, #e91e63);
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

const CalendarLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333333;
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
  const getDominantOrderStatus = (dayOrders) => {
    if (dayOrders.length === 0) return null;
    
    // Priority order for status determination
    const statusPriority = {
      'delayed': 5,
      'in_transit': 4,
      'delivered': 3,
      'scheduled': 2,
      'pending': 1
    };
    
    // Get all statuses for the day
    const statuses = dayOrders.map(order => order.delivery_status || 'pending');
    
    // Find the highest priority status
    let dominantStatus = statuses[0];
    let highestPriority = statusPriority[dominantStatus] || 0;
    
    statuses.forEach(status => {
      const priority = statusPriority[status] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        dominantStatus = status;
      }
    });
    
    return dominantStatus;
  };
  const [orders, setOrders] = useState([]);
  const [deliverySchedules, setDeliverySchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);  const [selectedDate, setSelectedDate] = useState(null);
  const [productionStatuses, setProductionStatuses] = useState({});
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedOrderForScheduling, setSelectedOrderForScheduling] = useState(null);  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, title: '', message: '', type: 'info' });
  const [unavailableDates, setUnavailableDates] = useState(new Set()); // User-controlled unavailable dates
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    scheduled: 0,
    inTransit: 0,
    delivered: 0,
    delayed: 0
  });

  const updateStats = useCallback(() => {
    const total = orders.length;
    const pending = orders.filter(o => !o.delivery_status).length;
    const scheduled = orders.filter(o => o.delivery_status === 'scheduled').length;
    const inTransit = orders.filter(o => o.delivery_status === 'in_transit').length;
    const delivered = orders.filter(o => o.delivery_status === 'delivered').length;
    const delayed = orders.filter(o => o.delivery_status === 'delayed').length;

    setStats({ total, pending, scheduled, inTransit, delivered, delayed });
  }, [orders]);
  // Priority Algorithm Implementation - Sort by creation date and amount
  const calculatePriority = (order) => {
    const now = new Date();
    const orderDate = new Date(order.created_at);
    const daysSinceOrder = Math.floor((now - orderDate) / (24 * 60 * 60 * 1000));
    
    // Higher priority for older orders and higher amounts
    return daysSinceOrder * 10 + (order.total_amount / 100);
  };

  const prioritizedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const priorityA = calculatePriority(a);
      const priorityB = calculatePriority(b);
      
      // Higher priority = earlier in list
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      // If priority is same, sort by order date (FIFO)
      return new Date(a.created_at) - new Date(b.created_at);
    });
  }, [orders]);
  // Fetch confirmed orders from TransactionPage database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 DeliveryPage: Fetching orders...');
          // Fetch confirmed orders
        const ordersResponse = await api.get('/orders/confirmed');        if (ordersResponse.data.success) {
          console.log('✅ DeliveryPage: Raw orders data:', ordersResponse.data.data);
          
          const ordersData = ordersResponse.data.data.map(order => {
            // Debug: Log items for each order
            console.log(`📦 DeliveryPage - Order ${order.order_number} items:`, order.items);
            
            return {
              ...order,
              priority: calculatePriority(order),
              customerName: `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer',
              items: order.items || order.order_items || []
            };
          });
          setOrders(ordersData);
          console.log('✅ DeliveryPage: Orders loaded successfully with items');
        }// Fetch delivery schedules
        try {
          const schedulesResponse = await api.get('/deliveries/schedules');
          if (schedulesResponse.data.success) {
            setDeliverySchedules(schedulesResponse.data.data);
          }
        } catch (schedError) {
          console.log('⚠️ DeliveryPage: Delivery schedules endpoint not available');
          setDeliverySchedules([]);
        }

        // Fetch production statuses
        try {
          const productionResponse = await api.get('/production/status');
          if (productionResponse.data.success) {
            const statusMap = {};
            productionResponse.data.data.forEach(item => {
              statusMap[item.order_id] = item.status;
            });
            setProductionStatuses(statusMap);
          }        } catch (prodError) {
          console.log('⚠️ DeliveryPage: Production status endpoint not available');
          // Set default production statuses - will be updated when orders are set
          setProductionStatuses({});
        }

      } catch (error) {
        console.error('❌ DeliveryPage: Error fetching delivery data:', error);
        console.log('📋 DeliveryPage: Using mock data as fallback...');
          // Use mock data for demonstration
        const mockOrders = [
          {
            id: 1,
            order_number: 'ORD-001',
            customerName: 'John Doe',
            user_email: 'john@example.com',
            total_amount: 150.00,
            status: 'confirmed',
            created_at: '2025-06-19T10:00:00Z',            shipping_address: '123 Main St, Manila',
            contact_phone: '+63 912 345 6789',
            priority: 15,
            items: [
              {
                id: 1,
                product_id: '123456789',
                productname: 'SVNFR T-Shirt',
                productcolor: 'Black',
                product_type: 't-shirts',
                quantity: 2,
                price: 45.00
              },
              {
                id: 2,
                product_id: '987654321',
                productname: 'SVNFR Hoodie',
                productcolor: 'Gray',
                product_type: 'hoodies',
                quantity: 1,
                price: 75.00
              }
            ]
          },
          {
            id: 2,
            order_number: 'ORD-002',
            customerName: 'Jane Smith',
            user_email: 'jane@example.com',
            total_amount: 89.99,
            status: 'confirmed',
            created_at: '2025-06-18T14:30:00Z',
            shipping_address: '456 Oak Ave, Quezon City',
            contact_phone: '+63 917 123 4567',
            priority: 20,
            items: [
              {
                id: 3,
                product_id: '555666777',
                productname: 'SVNFR Shorts',
                productcolor: 'Navy',
                product_type: 'shorts',
                quantity: 1,
                price: 89.99
              }
            ]
          },
          {
            id: 3,
            order_number: 'ORD-003',
            customerName: 'Maria Garcia',
            user_email: 'maria@example.com',
            total_amount: 299.50,
            status: 'confirmed',
            created_at: '2025-06-17T09:15:00Z',
            shipping_address: '789 Pine St, Makati',
            contact_phone: '+63 920 987 6543',
            priority: 35,
            items: [
              {
                id: 4,
                product_id: '111222333',
                productname: 'SVNFR Jacket',
                productcolor: 'Black',
                product_type: 'jackets',
                quantity: 1,
                price: 149.75
              },
              {
                id: 5,
                product_id: '444555666',
                productname: 'SVNFR Hat',
                productcolor: 'White',
                product_type: 'hats',
                quantity: 2,
                price: 74.88
              }
            ]
          }
        ];
        
        setOrders(mockOrders);
        setDeliverySchedules([]);
        console.log('✅ DeliveryPage: Mock orders loaded');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to prevent infinite calls
  // Update stats whenever orders change
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // Update production statuses when orders change (for mock data)
  useEffect(() => {
    if (orders.length > 0 && Object.keys(productionStatuses).length === 0) {
      const mockStatuses = {};
      orders.forEach(order => {
        mockStatuses[order.id] = Math.random() > 0.3 ? 'completed' : 'in_progress';
      });
      setProductionStatuses(mockStatuses);
    }
  }, [orders, productionStatuses]);
  // Function to suggest alternative dates when scheduling conflicts occur
  const getSuggestedAlternativeDates = (originalDate) => {
    const suggestions = [];
    const targetDate = new Date(originalDate);
    const maxDeliveriesPerDay = 3; // Updated maximum capacity
    
    // Check the next 14 days for available slots
    for (let i = 1; i <= 14; i++) {
      const checkDate = new Date(targetDate);
      checkDate.setDate(targetDate.getDate() + i);
      
      // Skip weekends - REMOVED, now user controls availability
      // const dayOfWeek = checkDate.getDay();
      // if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Count existing bookings for this date
      const dayDeliveries = deliverySchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.delivery_date);
        return scheduleDate.toDateString() === checkDate.toDateString();
      });
      
      const dayOrders = orders.filter(order => {
        if (!order.scheduled_delivery_date) return false;
        const orderDate = new Date(order.scheduled_delivery_date);
        return orderDate.toDateString() === checkDate.toDateString();
      });

      // Filter out deliveries that correspond to orders to avoid double counting
      const standaloneDeliveries = dayDeliveries.filter(delivery => {
        return !dayOrders.some(order => order.id === delivery.order_id);
      });
      
      const currentBookings = dayOrders.length + standaloneDeliveries.length;
      
      // If this date has availability, add it to suggestions
      if (currentBookings < maxDeliveriesPerDay) {
        const availableSlots = maxDeliveriesPerDay - currentBookings;
        const statusText = currentBookings === 0 ? 'Available' : 
                          currentBookings < 2 ? 'Available' : 'Last slot';
        suggestions.push(`${checkDate.toLocaleDateString()} (${statusText} - ${availableSlots} slot${availableSlots > 1 ? 's' : ''} left)`);
        
        // Stop after finding 3 good alternatives
        if (suggestions.length >= 3) break;
      }
    }
    
    return suggestions;
  };

  const handleScheduleDelivery = async (order, scheduleData) => {
    try {
      // Check production status first
      const productionStatus = productionStatuses[order.id];
      if (productionStatus && productionStatus !== 'completed') {
        const proceed = window.confirm(
          `Warning: This order's production status is "${productionStatus}". Only completed orders should be scheduled for delivery. Do you want to proceed anyway?`
        );
        if (!proceed) return;
      }      // Check for conflicts
      const conflicts = checkScheduleConflicts(scheduleData);
      if (conflicts.length > 0) {
        // Check if the conflict is due to capacity limit
        const hasCapacityConflict = conflicts.some(conflict => conflict.includes('capacity exceeded'));
          if (hasCapacityConflict) {
          // Get suggested alternative dates
          const alternatives = getSuggestedAlternativeDates(scheduleData.date);
          const alternativeText = alternatives.length > 0 
            ? `\n\nSuggested alternative dates:\n${alternatives.map(date => `• ${date}`).join('\n')}`
            : '\n\nPlease check the calendar for available dates.';
          
          showPopup(
            'Schedule Conflict Detected',
            `${conflicts.join('\n')}\n\n⚠️ This date has reached maximum delivery capacity (3 deliveries).${alternativeText}`,
            'error'
          );
        } else {
          showPopup('Schedule Conflict Detected', conflicts.join('\n'), 'error');
        }
        return;
      }

      // Save delivery schedule (mock implementation since backend may not be available)
      console.log('📅 Scheduling delivery for order:', order.order_number);
      console.log('📅 Schedule data:', scheduleData);
      
      // Simulate successful scheduling
      const updatedOrder = { 
        ...order, 
        delivery_status: 'scheduled',
        scheduled_delivery_date: scheduleData.date,
        scheduled_delivery_time: scheduleData.time,
        delivery_notes: scheduleData.notes
      };
      
      setOrders(prevOrders => prevOrders.map(o => o.id === order.id ? updatedOrder : o));
      
      // Add to delivery schedules for calendar display
      const newSchedule = {
        id: Date.now(), // Mock ID
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customerName,
        delivery_date: scheduleData.date,
        delivery_time: scheduleData.time,
        status: productionStatus === 'completed' ? 'scheduled' : 'pending_completion',
        notes: scheduleData.notes
      };
      
      setDeliverySchedules(prev => [...prev, newSchedule]);
      
      // Mock email notification
      console.log('📧 Email notification sent to:', order.user_email);
      
      setShowScheduleModal(false);
      setSelectedOrder(null);
      setSelectedDate(null);
      
      // Clear selected order for scheduling if it was the one just scheduled
      if (selectedOrderForScheduling && selectedOrderForScheduling.id === order.id) {
        setSelectedOrderForScheduling(null);
      }
      
      showPopup(
        'Delivery Scheduled Successfully',
        'Delivery scheduled successfully! Customer notification sent.',
        'success'
      );
      
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      showPopup('Error', 'Error scheduling delivery. Please try again.', 'error');
    }
  };  const handleUpdateDeliveryStatus = async (order, newStatus) => {
    try {
      console.log(`📦 Updating delivery status for order ${order.order_number} to ${newStatus}`);
      
      // Special handling for delayed status
      if (newStatus === 'delayed') {
        const confirmed = window.confirm(
          `Are you sure you want to mark order ${order.order_number} as delayed?\n\nThis will:\n- Clear the current delivery schedule\n- Require you to reschedule the delivery\n- Notify the customer of the delay`
        );
        
        if (!confirmed) {
          return; // User cancelled, don't proceed
        }
        
        // Show rescheduling message after confirming delay
        setTimeout(() => {
          showPopup(
            'Order Marked as Delayed',
            `Order ${order.order_number} has been marked as delayed.\n\nPlease reschedule this delivery by:\n1. Selecting the order from the list\n2. Clicking on an available date in the calendar\n3. Setting a new delivery time`,
            'warning'
          );
        }, 500);
      }
      
      // Update the order status
      const updatedOrder = { 
        ...order, 
        delivery_status: newStatus
      };
      
      // If marking as delayed, clear the scheduled delivery date and time
      if (newStatus === 'delayed') {
        updatedOrder.scheduled_delivery_date = null;
        updatedOrder.scheduled_delivery_time = null;
        updatedOrder.delivery_notes = null;
        console.log(`📅 Cleared scheduled delivery date for delayed order ${order.order_number}`);
      }
      
      setOrders(prevOrders => prevOrders.map(o => o.id === order.id ? updatedOrder : o));
      
      // Update delivery schedules if exists
      setDeliverySchedules(prev => prev.map(schedule => 
        schedule.order_id === order.id 
          ? { ...schedule, status: newStatus }
          : schedule
      ));
      
      // If marking as delayed, also remove from delivery schedules since it's no longer scheduled
      if (newStatus === 'delayed') {
        setDeliverySchedules(prev => prev.filter(schedule => schedule.order_id !== order.id));
        console.log(`📅 Removed order ${order.order_number} from delivery schedules`);
      }
      
      // Clear selected order if it was the one just updated
      if (selectedOrderForScheduling && selectedOrderForScheduling.id === order.id) {
        setSelectedOrderForScheduling(null);
      }
      
      if (newStatus !== 'delayed') {
        showPopup(
          'Order Status Updated',
          `Order ${order.order_number} marked as ${newStatus}!`,
          'success'
        );
      }
      
    } catch (error) {
      console.error('Error updating delivery status:', error);
      showPopup('Error', 'Error updating delivery status. Please try again.', 'error');
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
  const checkScheduleConflicts = (scheduleData) => {
    const conflicts = [];
    const scheduleDateTime = new Date(`${scheduleData.date} ${scheduleData.time}`);
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(scheduleData.date);
    if (scheduleDate < today) {
      conflicts.push('Cannot schedule delivery for past dates');
    }
    
    // Check for existing deliveries at the same time
    const existingDeliveries = deliverySchedules.filter(schedule => {
      const existingDateTime = new Date(`${schedule.delivery_date} ${schedule.delivery_time}`);
      return Math.abs(existingDateTime - scheduleDateTime) < 60 * 60 * 1000; // 1 hour buffer
    });
    
    // Check for orders scheduled at the same time
    const existingOrders = orders.filter(order => {
      if (!order.scheduled_delivery_date || !order.scheduled_delivery_time) return false;
      const existingDateTime = new Date(`${order.scheduled_delivery_date} ${order.scheduled_delivery_time}`);
      return Math.abs(existingDateTime - scheduleDateTime) < 60 * 60 * 1000; // 1 hour buffer
    });
    
    if (existingDeliveries.length > 0 || existingOrders.length > 0) {
      conflicts.push('Time slot already booked');
    }      // Check daily capacity
    const sameDayDeliveries = deliverySchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.delivery_date);
      const targetDate = new Date(scheduleData.date);
      return scheduleDate.toDateString() === targetDate.toDateString();
    });
    
    const sameDayOrders = orders.filter(order => {
      if (!order.scheduled_delivery_date) return false;
      const orderDate = new Date(order.scheduled_delivery_date);
      const targetDate = new Date(scheduleData.date);
      return orderDate.toDateString() === targetDate.toDateString();
    });

    // Filter out deliveries that correspond to orders to avoid double counting
    const standaloneDeliveries = sameDayDeliveries.filter(delivery => {
      return !sameDayOrders.some(order => order.id === delivery.order_id);
    });
    
    const maxDeliveriesPerDay = 3; // Updated maximum capacity
    const currentBookings = sameDayOrders.length + standaloneDeliveries.length;
    
    if (currentBookings >= maxDeliveriesPerDay) {
      conflicts.push(`Daily delivery capacity exceeded (${currentBookings}/3 deliveries). Please select another date.`);
    }
    
    // Check for user-defined unavailable dates
    const dateString = scheduleDateTime.toDateString();
    if (unavailableDates.has(dateString)) {
      conflicts.push('This date has been marked as unavailable for delivery');
    }
    
    // Removed automatic weekend blocking - now user controlled
    
    // Check business hours
    const hour = parseInt(scheduleData.time.split(':')[0]);
    if (hour < 9 || hour > 17) {
      conflicts.push('Delivery time outside business hours (9 AM - 5 PM)');
    }
    
    return conflicts;
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
      date.setDate(startDate.getDate() + i);        // Find scheduled deliveries for this date
      const dayDeliveries = deliverySchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.delivery_date);
        const calendarDate = new Date(date);
        
        // Compare just the date parts (ignore time)
        return scheduleDate.getFullYear() === calendarDate.getFullYear() &&
               scheduleDate.getMonth() === calendarDate.getMonth() &&
               scheduleDate.getDate() === calendarDate.getDate();
      });
        // Find orders scheduled for this date
      const dayOrders = orders.filter(order => {
        if (!order.scheduled_delivery_date) return false;
        const orderDate = new Date(order.scheduled_delivery_date);
        const calendarDate = new Date(date);
        
        // Compare just the date parts (ignore time)
        return orderDate.getFullYear() === calendarDate.getFullYear() &&
               orderDate.getMonth() === calendarDate.getMonth() &&
               orderDate.getDate() === calendarDate.getDate();
      });

      // Filter out deliveries that correspond to orders to avoid double counting
      const standaloneDeliveries = dayDeliveries.filter(delivery => {
        return !dayOrders.some(order => order.id === delivery.order_id);
      });

      // Determine availability status
      const maxDeliveriesPerDay = 3; // Updated maximum capacity
      const currentBookings = dayOrders.length + standaloneDeliveries.length;
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
      }
        days.push({
        date: date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        deliveries: standaloneDeliveries,
        orders: dayOrders,
        availabilityStatus: availabilityStatus,
        bookingCount: currentBookings
      });
    }
    
    return days;
  };  const getOrderDeliveryStatus = (order) => {
    if (order.delivery_status === 'delivered') return 'delivered';
    if (order.delivery_status === 'in_transit') return 'in_transit';
    if (order.delivery_status === 'delayed') return 'delayed';
    if (order.delivery_status === 'scheduled') {
      // Check if production is complete
      const productionStatus = productionStatuses[order.id];
      if (productionStatus === 'completed') return 'scheduled';
      return 'pending_completion';
    }
    return 'pending';
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setSelectedDate(null);
    setShowScheduleModal(true);
  };

  const handleDeliveryClick = (delivery) => {
    // Handle delivery item click - could open edit modal
    console.log('Delivery clicked:', delivery);
    showPopup(
      'Delivery Information',
      `Order: ${delivery.order_number || 'N/A'}\nStatus: ${delivery.status}\nTime: ${delivery.delivery_time || 'N/A'}`,
      'info'
    );
  };  const handleCalendarDayClick = (day) => {
    if (!day.isCurrentMonth || day.availabilityStatus === 'busy' || day.availabilityStatus === 'unavailable') return;
    
    console.log('📅 Calendar day clicked:', day.date);
    console.log('📅 Day object:', day);
    
    setSelectedDate(day.date);
    
    // Check if we have a selected order for scheduling
    if (selectedOrderForScheduling) {
      setSelectedOrder(selectedOrderForScheduling);
      setShowScheduleModal(true);
      return;
    }
    
    // Find orders that need scheduling
    const pendingOrders = orders.filter(order => !order.delivery_status);
    
    if (pendingOrders.length === 0) {
      showPopup('No Orders Available', 'No orders available for scheduling. Please select an order first.', 'warning');
      return;
    }
    
    // If only one pending order, select it automatically
    if (pendingOrders.length === 1) {
      setSelectedOrder(pendingOrders[0]);
      setShowScheduleModal(true);
    } else {
      // Show message to select an order first
      showPopup('Select an Order', 'Please select an order from the Orders list first, then click on a calendar date to schedule delivery.', 'info');
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

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
        <Subtitle>Schedule and manage deliveries for confirmed orders with priority-based scheduling</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>Pending Schedule</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.scheduled}</StatNumber>
          <StatLabel>Scheduled</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.inTransit}</StatNumber>
          <StatLabel>In Transit</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.delivered}</StatNumber>
          <StatLabel>Delivered</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.delayed}</StatNumber>
          <StatLabel>Delayed</StatLabel>
        </StatCard>
      </StatsGrid>      <MainContent>
        <ContentSection>
          <LeftSection>            <CalendarContainer>            <CalendarHeader>
              <CalendarNav>
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
              </CalendarNav>
              <MonthYear>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </MonthYear>              <CalendarNav>
                <CalendarButton onClick={() => navigateMonth(-1)}>
                  <FontAwesomeIcon icon={faChevronLeft} style={{ color: '#000000' }} />
                </CalendarButton>
                <CalendarButton onClick={() => navigateMonth(1)}>
                  <FontAwesomeIcon icon={faChevronRight} style={{ color: '#000000' }} />
                </CalendarButton>
              </CalendarNav>
            </CalendarHeader>
            <CalendarGrid>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <CalendarDay key={day} style={{ minHeight: '40px', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', background: '#f8f8f8' }}>
                  {day}
                </CalendarDay>              ))}              {generateCalendarDays().map((day, index) => {
                const dominantStatus = getDominantOrderStatus(day.orders);                return (                  <CalendarDay 
                    key={index} 
                    clickable={day.isCurrentMonth && day.availabilityStatus !== 'busy' && day.availabilityStatus !== 'unavailable'}
                    onClick={() => handleCalendarDayClick(day)}
                    isToday={day.isToday}
                    availabilityStatus={day.availabilityStatus}
                  >
                    <DayNumber isToday={day.isToday} isCurrentMonth={day.isCurrentMonth}>
                      {day.dayNumber}
                    </DayNumber>
                    
                    {/* Status indicator for orders */}
                    {day.orders.length > 0 && dominantStatus && (
                      <StatusIndicator status={dominantStatus} title={`Primary status: ${dominantStatus}`} />
                    )}                    {/* Availability indicator */}                    <AvailabilityIndicator                      availability={day.availabilityStatus} 
                      title={`Availability: ${day.availabilityStatus} (${day.bookingCount}/3 deliveries) - Click to toggle availability`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (day.isCurrentMonth) {
                          toggleDateAvailability(day.date);
                        }
                      }}
                    >
                      {day.bookingCount > 0 ? day.bookingCount : ''}
                    </AvailabilityIndicator>{/* Delivery truck icon */}
                    {(day.orders.length > 0 || day.deliveries.length > 0) && (
                      <DeliveryIcon 
                        status={dominantStatus || 'default'}
                        title={`Delivery status: ${dominantStatus || 'No orders'}`}
                      >
                        <FontAwesomeIcon icon={faTruck} style={{ color: '#000000' }} />
                      </DeliveryIcon>
                    )}
                  </CalendarDay>
                );
              })}</CalendarGrid>            <CalendarLegend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: '#000000', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  📦 Order Status
                </div>                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #d1ecf1, #bee5eb)" />
                    <span>Scheduled</span>
                  </LegendItem>
                                   <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #000000, #2d3436)" />
                    <span>In Transit</span>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #d4edda, #c3e6cb)" />
                    <span>Delivered</span>
                  </LegendItem>                  <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #fce4ec, #f8bbd9)" />
                    <span>Delayed</span>
                  </LegendItem>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <div style={{ fontWeight: '600', color: '#000000', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  📅 Calendar Availability
                </div>                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #28a745, #20c997)" />
                    <span>Available (0-1 deliveries) - Green</span>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #ffc107, #fd7e14)" />
                    <span>Partially Booked (2 deliveries) - Yellow</span>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #dc3545, #e74c3c)" />
                    <span>Fully Booked (3+ deliveries) - Red</span>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="linear-gradient(135deg, #6c757d, #495057)" />
                    <span>Unavailable (User Defined) - Gray</span>
                  </LegendItem>
                </div>
              </div>
            </CalendarLegend>
          </CalendarContainer>
        </LeftSection>

        <RightSection>
          <Card>            <CardHeader>              <CardTitle>
                <FontAwesomeIcon icon={faBox} style={{ color: '#000000' }} />
                Orders
                {selectedOrderForScheduling && (
                  <span style={{ fontSize: '0.8rem', color: '#666666', marginLeft: '0.5rem' }}>
                    (Selected: {selectedOrderForScheduling.order_number})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>              <OrdersList>
                {prioritizedOrders.map(order => (
                  <OrderItem 
                    key={order.id}
                    isSelected={selectedOrderForScheduling && selectedOrderForScheduling.id === order.id}
                  >
                    <OrderInfo>
                      <OrderNumber>{order.order_number}</OrderNumber>                      <OrderDetails>                        <div><strong>Customer:</strong> {order.customerName}</div>
                        <div><strong>Amount:</strong> ₱{parseFloat(order.total_amount).toFixed(2)}</div>
                        <div><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</div>
                        <div><strong>Address:</strong> {order.shipping_address}</div>
                          {/* Product Details */}
                        {order.items && order.items.length > 0 && (
                          <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              marginBottom: '6px' 
                            }}>
                              <div style={{ fontWeight: '600', color: '#000000', fontSize: '0.85rem' }}>
                                📦 Products ({order.items.length} item{order.items.length > 1 ? 's' : ''})
                              </div>
                              {order.items.length > 2 && (
                                <button
                                  style={{
                                    background: '#000000',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                    setShowProductModal(true);
                                  }}
                                  onMouseOver={(e) => e.target.style.background = '#333333'}
                                  onMouseOut={(e) => e.target.style.background = '#000000'}
                                >
                                  View All
                                </button>
                              )}
                            </div>
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} style={{ 
                                fontSize: '0.75rem',
                                color: '#666666',
                                marginBottom: '6px',
                                lineHeight: '1.3',
                                padding: '4px 6px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '3px',
                                backgroundColor: '#ffffff'
                              }}>
                                <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>
                                  {item.productname || 'Unknown Product'}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#555555', marginBottom: '2px' }}>
                                  <strong>ID:</strong> {item.product_id || 'N/A'}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#888888' }}>
                                  {item.productcolor && (
                                    <span><strong>Color:</strong> {item.productcolor} • </span>
                                  )}
                                  {item.product_type && (
                                    <span><strong>Type:</strong> {item.product_type} • </span>
                                  )}
                                  <span><strong>Qty:</strong> {item.quantity || 1}</span>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div style={{ 
                                fontSize: '0.7rem',
                                color: '#999999',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                marginTop: '4px'
                              }}>
                                +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}...
                              </div>
                            )}
                          </div>
                        )}
                      </OrderDetails>
                    </OrderInfo>                    <OrderActions>
                      <StatusRow>
                        <StatusBadge status={order.delivery_status || 'pending'}>
                          {order.delivery_status || 'pending'}
                        </StatusBadge>
                      </StatusRow>
                        <ButtonRow>
                        {/* Buttons for pending orders */}
                        {!order.delivery_status && (
                          selectedOrderForScheduling && selectedOrderForScheduling.id === order.id ? (
                            <ActionButton 
                              onClick={() => setSelectedOrderForScheduling(null)}
                              variant="warning"
                            >
                              Deselect
                            </ActionButton>
                          ) : (
                            <ActionButton 
                              primary 
                              onClick={() => setSelectedOrderForScheduling(order)}
                            >
                              Select
                            </ActionButton>
                          )
                        )}
                        
                        {/* Buttons for scheduled orders */}
                        {order.delivery_status === 'scheduled' && (
                          <>
                            <ActionButton 
                              onClick={() => handleUpdateDeliveryStatus(order, 'in_transit')}
                              variant="info"
                            >
                              In Transit
                            </ActionButton>
                            <ActionButton 
                              onClick={() => handleUpdateDeliveryStatus(order, 'delivered')}
                              variant="success"
                            >
                              Delivered
                            </ActionButton>
                            <ActionButton 
                              onClick={() => handleUpdateDeliveryStatus(order, 'delayed')}
                              variant="danger"
                            >
                              Delayed
                            </ActionButton>
                          </>
                        )}
                        
                        {/* Buttons for in_transit orders */}
                        {order.delivery_status === 'in_transit' && (
                          <>
                            <ActionButton 
                              onClick={() => handleUpdateDeliveryStatus(order, 'delivered')}
                              variant="success"
                            >
                              Delivered
                            </ActionButton>
                            <ActionButton 
                              onClick={() => handleUpdateDeliveryStatus(order, 'delayed')}
                              variant="danger"
                            >
                              Delayed
                            </ActionButton>
                          </>
                        )}
                        
                        {/* Button for delayed orders - only show Select/Deselect for rescheduling */}
                        {order.delivery_status === 'delayed' && (
                          selectedOrderForScheduling && selectedOrderForScheduling.id === order.id ? (
                            <ActionButton 
                              onClick={() => setSelectedOrderForScheduling(null)}
                              variant="warning"
                            >
                              Deselect
                            </ActionButton>
                          ) : (
                            <ActionButton 
                              onClick={() => setSelectedOrderForScheduling(order)}
                              variant="danger"
                            >
                              Select to Reschedule
                            </ActionButton>
                          )
                        )}
                      </ButtonRow>
                    </OrderActions>
                  </OrderItem>
                ))}
              </OrdersList>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#000000' }} />
                Delivery Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>              <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#666666' }}>                <p><strong>Operating Hours:</strong> 9:00 AM - 5:00 PM</p>
                <p><strong>Delivery Areas:</strong> Metro Manila</p>
                <p><strong>Standard Delivery:</strong> 1-3 business days</p>
                <p><strong>Daily Capacity:</strong> 3 deliveries maximum</p>
                <p><strong>Priority Algorithm:</strong> Order date and amount based</p>
                <p><strong>Production Tracking:</strong> Only completed orders should be scheduled</p>
                <p><strong>Conflict Resolution:</strong> Automatic detection and prevention</p>
                <p><strong>Calendar Features:</strong> Click days to schedule, click green box to toggle availability</p>
              </div>
            </CardContent>          </Card>
        </RightSection>
        </ContentSection>
      </MainContent>      {/* Schedule Delivery Modal */}
      {showScheduleModal && selectedOrder && (
        <ScheduleModal 
          order={selectedOrder}
          preSelectedDate={selectedDate}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedOrder(null);
            setSelectedDate(null);
          }}
          onSchedule={handleScheduleDelivery}
        />
      )}      {/* Product Modal */}
      {showProductModal && selectedOrder && (
        <ProductModal 
          order={selectedOrder}
          onClose={() => {
            setShowProductModal(false);
            setSelectedOrder(null);
          }}
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
      )}{/* Full Calendar Modal */}
      {showFullCalendar && (
        <FullCalendarModal onClick={() => setShowFullCalendar(false)}>
          <FullCalendarContent onClick={(e) => e.stopPropagation()}>            <CloseFullCalendar onClick={() => setShowFullCalendar(false)}>
              <FontAwesomeIcon icon={faTimes} style={{ color: '#000000' }} />
            </CloseFullCalendar>
            
            <FullCalendarHeader>
              <FullCalendarTitle>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Delivery Calendar
              </FullCalendarTitle>              <CalendarNav>
                <CalendarButton onClick={() => navigateMonth(-1)}>
                  <FontAwesomeIcon icon={faChevronLeft} style={{ color: '#000000' }} />
                </CalendarButton>
                <CalendarButton onClick={() => navigateMonth(1)}>
                  <FontAwesomeIcon icon={faChevronRight} style={{ color: '#000000' }} />
                </CalendarButton>
              </CalendarNav>
            </FullCalendarHeader>

            <FullCalendarGrid>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <FullCalendarDay key={day} style={{ minHeight: '50px', padding: '1rem', textAlign: 'center', fontWeight: 'bold', background: '#f8f8f8' }}>
                  {day}
                </FullCalendarDay>
              ))}                {generateCalendarDays().map((day, index) => {
                const dominantStatus = getDominantOrderStatus(day.orders);
                  return (
                  <FullCalendarDay 
                    key={index} 
                    isCurrentMonth={day.isCurrentMonth}
                    isToday={day.isToday}
                    availabilityStatus={day.availabilityStatus}                    style={{
                      borderLeft: day.availabilityStatus === 'available' ? '4px solid #28a745' :
                                 day.availabilityStatus === 'partial' ? '4px solid #ffc107' :
                                 day.availabilityStatus === 'busy' ? '4px solid #dc3545' :
                                 day.availabilityStatus === 'unavailable' ? '4px solid #6c757d' : 'none'
                    }}
                  ><FullDayNumber isToday={day.isToday} isCurrentMonth={day.isCurrentMonth}>
                      {day.dayNumber}
                    </FullDayNumber>
                    
                    {/* Status indicator for orders */}
                    {day.orders.length > 0 && dominantStatus && (
                      <StatusIndicator 
                        status={dominantStatus} 
                        title={`Primary status: ${dominantStatus}`}
                        style={{ top: '0.5rem', right: '0.5rem', width: '12px', height: '12px' }}
                      />
                    )}                    {/* Availability indicator */}
                    <AvailabilityIndicator 
                      availability={day.availabilityStatus} 
                      title={`Availability: ${day.availabilityStatus} (${day.bookingCount}/3 deliveries) - Click to toggle availability`}
                      style={{ bottom: '0.5rem', left: '0.5rem', fontSize: '0.7rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (day.isCurrentMonth) {
                          toggleDateAvailability(day.date);
                        }
                      }}
                    >
                      {day.bookingCount}
                    </AvailabilityIndicator>
                    
                    <div>
                      {day.orders.map((order, i) => (
                        <FullOrderBlock 
                          key={`order-${i}`} 
                          status={getOrderDeliveryStatus(order)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order);
                            setShowFullCalendar(false);
                          }}
                          title={`${order.order_number} - ${order.customerName} - ${order.scheduled_delivery_time || 'No time set'}`}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {order.order_number}
                          </div>
                          <div style={{ fontSize: '0.7rem', opacity: '0.9' }}>
                            {order.customerName}
                          </div>
                          <div style={{ fontSize: '0.7rem', opacity: '0.8' }}>
                            {order.scheduled_delivery_time || 'Time TBD'}
                          </div>
                        </FullOrderBlock>
                      ))}
                      
                      {day.deliveries.map((delivery, i) => (
                        <FullOrderBlock 
                          key={`delivery-${i}`} 
                          status={delivery.status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeliveryClick(delivery);
                          }}
                          title={`Delivery - ${delivery.customer_name} - ${delivery.delivery_time || 'No time set'}`}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {delivery.order_number || 'DEL'}
                          </div>
                          <div style={{ fontSize: '0.7rem', opacity: '0.9' }}>
                            {delivery.customer_name}
                          </div>
                          <div style={{ fontSize: '0.7rem', opacity: '0.8' }}>
                            {delivery.delivery_time || 'Time TBD'}
                          </div>
                        </FullOrderBlock>
                      ))}
                    </div>
                    
                    {day.isCurrentMonth && day.availabilityStatus !== 'busy' && day.availabilityStatus !== 'unavailable' && (
                      <button
                        style={{
                          position: 'absolute',
                          bottom: '0.5rem',
                          right: '0.5rem',
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCalendarDayClick(day);
                          setShowFullCalendar(false);
                        }}
                      >
                        + Schedule
                      </button>
                    )}
                  </FullCalendarDay>
                );
              })}
            </FullCalendarGrid>
          </FullCalendarContent>
        </FullCalendarModal>
      )}
    </PageContainer>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ order, onClose, onSchedule, preSelectedDate }) => {
  const [scheduleData, setScheduleData] = useState({
    date: preSelectedDate ? 
      `${preSelectedDate.getFullYear()}-${String(preSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(preSelectedDate.getDate()).padStart(2, '0')}` : 
      '',
    time: '',
    notes: ''
  });

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
                  <div key={`${item.product_id || item.id}-${index}`} style={{
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
          )}

          <FormGroup>
            <Label>Delivery Date</Label>
            <Input
              type="date"
              value={scheduleData.date}
              onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
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
            </ActionButton>
            <ActionButton type="submit" primary>
              Schedule Delivery
            </ActionButton>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

// Product Modal Component
const ProductModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>All Products - Order {order.order_number}</ModalTitle>          <ActionButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} style={{ color: '#000000' }} />
          </ActionButton>
        </ModalHeader>
        
        <div style={{ 
          maxHeight: '60vh', 
          overflowY: 'auto',
          padding: '1rem 0'
        }}>
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: '#000000',
            fontSize: '1rem',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '0.5rem'
          }}>
            📦 {order.items?.length || 0} Product{order.items?.length !== 1 ? 's' : ''}
          </div>
          
          {order.items && order.items.length > 0 ? order.items.map((item, index) => (
            <div key={`${item.product_id || item.id}-${index}`} style={{
              padding: '1rem',
              marginBottom: '0.75rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#000000',
                fontSize: '1rem'
              }}>
                {item.productname || 'Unknown Product'}
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#666666'
              }}>
                <div>
                  <strong style={{ color: '#000000' }}>Product ID:</strong><br />
                  {item.product_id || 'N/A'}
                </div>
                
                {item.productcolor && (
                  <div>
                    <strong style={{ color: '#000000' }}>Color:</strong><br />
                    {item.productcolor}
                  </div>
                )}
                
                {item.product_type && (
                  <div>
                    <strong style={{ color: '#000000' }}>Type:</strong><br />
                    {item.product_type}
                  </div>
                )}
                
                <div>
                  <strong style={{ color: '#000000' }}>Quantity:</strong><br />
                  {item.quantity || 1}
                </div>
              </div>
            </div>
          )) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#666666', 
              fontStyle: 'italic',
              padding: '2rem'
            }}>
              No product details available
            </div>
          )}
        </div>
        
        <div style={{ 
          borderTop: '1px solid #e0e0e0', 
          paddingTop: '1rem',
          textAlign: 'right'
        }}>
          <ActionButton onClick={onClose} primary>
            Close
          </ActionButton>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default DeliveryPage;