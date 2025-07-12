import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faReceipt, 
  faTimes, 
  faEye, 
  faSearch,
  faRefresh,
  faInfoCircle,
  faExclamationTriangle,
  faCheck,
  faImage,
  faSpinner,
  faChevronDown,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 80px 0 40px;
`;

const ContentWrapper = styled.div`
  max-width: 1700px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0 20px;
  }
  
  @media (max-width: 480px) {
    padding: 0 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 300;
  color: #000000;
  margin: 0 0 12px 0;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666666;
  margin: 0;
  font-weight: 300;
  max-width: 500px;
  margin: 0 auto;
`;



const ControlsSection = styled.div`
  background: #ffffff;
  padding: 24px;
  border: 1px solid #f0f0f0;
  margin-bottom: 1px;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 14px;
  background: #ffffff;
  font-weight: 300;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 1px #000000;
  }
  
  &::placeholder {
    color: #cccccc;
    font-weight: 300;
  }
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #cccccc;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 14px;
  background: #ffffff;
  cursor: pointer;
  font-weight: 300;
  min-width: 140px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 1px #000000;
  }
`;

const RefreshButton = styled.button`
  padding: 14px 20px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #333333;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TransactionsTable = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  /* Improve layout */
  display: flex;
  flex-direction: column;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 130px 95px 170px 150px 100px 85px 100px 95px 100px 130px;
  gap: 16px;
  padding: 28px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #dee2e6;
  font-weight: 700;
  font-size: 14px;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  width: 100%;
  justify-items: center;
  align-items: center;
  text-align: center;
  
  @media (max-width: 1600px) {
    grid-template-columns: 35px 130px 95px 170px 150px 100px 85px 100px 95px 100px 130px;
    gap: 14px;
    font-size: 13px;
    padding: 26px 18px;
  }
  
  @media (max-width: 1400px) {
    grid-template-columns: 30px 120px 90px 160px 140px 95px 80px 95px 90px 95px 120px;
    gap: 12px;
    padding: 24px 16px;
    font-size: 12px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 38px 120px 95px 170px 150px 95px 85px 95px 95px 95px 95px;
    gap: 14px;
    padding: 22px 28px;
    font-size: 11px;
  }
  
  @media (max-width: 768px) {
    display: none; /* Hide header on mobile, use card layout instead */
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 40px 130px 95px 170px 150px 100px 85px 100px 95px 100px 130px;
  gap: 16px;
  padding: 32px 20px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: all 0.3s ease;
  min-height: 85px;
  width: 100%;
  
  /* Match header alignment */
  /* Center specific columns that should be centered */
  > div:nth-child(1),  /* Expand button */
  > div:nth-child(6),  /* Amount */
  > div:nth-child(7),  /* Payment */
  > div:nth-child(8),  /* Status */
  > div:nth-child(9),  /* Delivery */
  > div:nth-child(10), /* Created */
  > div:nth-child(11) { /* Actions */
    justify-self: center;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Left align text-heavy columns */
  > div:nth-child(2),  /* Order # */
  > div:nth-child(3),  /* Date */
  > div:nth-child(5) { /* Products */
    justify-self: start;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  
  /* Customer column - special handling for CustomerInfo */
  > div:nth-child(4) { /* Customer */
    justify-self: start;
    text-align: left;
  }
  
  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1600px) {
    grid-template-columns: 35px 130px 95px 170px 150px 100px 85px 100px 95px 100px 130px;
    gap: 14px;
    padding: 30px 18px;
    min-height: 80px;
  }
  
  @media (max-width: 1400px) {
    grid-template-columns: 40px 130px 100px 180px 160px 100px 90px 100px 100px 100px 100px;
    gap: 16px;
    padding: 28px 32px;
    min-height: 75px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 38px 120px 95px 170px 150px 95px 85px 95px 95px 95px 95px;
    gap: 14px;
    padding: 26px 28px;
    min-height: 70px;
  }
  
  @media (max-width: 768px) {
    /* Mobile card layout - will be handled separately */
    display: block;
    padding: 28px;
    margin-bottom: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
    }
  }
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #000000;
  font-size: 15px;
  font-family: 'Monaco', 'Menlo', monospace;
  letter-spacing: 0.5px;
  line-height: 1.4;
  word-break: break-all;
  padding: 4px 0;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  
  & .name {
    font-weight: 600;
    color: #000000;
    font-size: 13px;
    line-height: 1.3;
    word-break: break-word;
    flex-shrink: 0;
  }
  
  & .separator {
    color: #cccccc;
    font-size: 11px;
    font-weight: 400;
    flex-shrink: 0;
  }
  
  & .email {
    color: #666666;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.3;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  
  @media (max-width: 1400px) {
    gap: 6px;
    
    & .name {
      font-size: 12px;
    }
    
    & .email {
      font-size: 10px;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    
    & .name {
      font-size: 12px;
    }
    
    & .email {
      font-size: 10px;
      white-space: normal;
      text-overflow: unset;
    }
    
    & .separator {
      display: none;
    }
  }
`;

const OrderDetails = styled.div`
  .amount {
    font-weight: 600;
    color: #000000;
    font-size: 15px;
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }
  
  .address {
    color: #666666;
    font-size: 13px;
    line-height: 1.4;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 100%;
    word-break: break-word;
  }
  
  @media (max-width: 768px) {
    .amount {
      font-size: 14px;
      margin-bottom: 6px;
    }
    
    .address {
      font-size: 12px;
    }
  }
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border: 1px solid;
  display: inline-block;
  text-align: center;
  min-width: 90px;
  transition: all 0.2s ease;
  line-height: 1;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 11px;
    min-width: 70px;
  }
  
  ${props => {
    switch (props.status?.toLowerCase()) {
      case 'pending':
        return `
          background: #ffffff;
          color: #f39c12;
          border-color: #f39c12;
          box-shadow: 0 2px 8px rgba(243, 156, 18, 0.15);
        `;
      case 'confirmed':
      case 'approved':
        return `
          background: #ffffff;
          color: #27ae60;
          border-color: #27ae60;
          box-shadow: 0 2px 8px rgba(39, 174, 96, 0.15);
        `;
      case 'processing':
        return `
          background: #ffffff;
          color: #3498db;
          border-color: #3498db;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
        `;
      case 'shipped':
        return `
          background: #ffffff;
          color: #9b59b6;
          border-color: #9b59b6;
          box-shadow: 0 2px 8px rgba(155, 89, 182, 0.15);
        `;
      case 'delivered':
        return `
          background: #000000;
          color: #ffffff;
          border-color: #000000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        `;
      case 'order received':
        return `
          background: #ffffff;
          color: #28a745;
          border-color: #28a745;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.15);
        `;
      case 'cancelled':
      case 'rejected':
        return `
          background: #ffffff;
          color: #e74c3c;
          border-color: #e74c3c;
          box-shadow: 0 2px 8px rgba(231, 76, 60, 0.15);
        `;
      default:
        return `
          background: #ffffff;
          color: #666666;
          border-color: #cccccc;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        `;
    }
  }}
`;

const DateInfo = styled.div`
  color: #666666;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['compact', 'loading', 'variant'].includes(prop),
})`
  min-width: ${props => props.compact ? '36px' : '80px'};
  height: ${props => props.compact ? '36px' : '40px'};
  border: 1px solid;
  border-radius: 6px;
  font-size: ${props => props.compact ? '14px' : '12px'};
  font-weight: ${props => props.compact ? '400' : '600'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.compact ? '0' : '6px'};
  padding: ${props => props.compact ? '0' : '0 8px'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  user-select: none; /* Prevent text selection */
  
  @media (max-width: 768px) {
    min-width: ${props => props.compact ? '32px' : '70px'};
    height: ${props => props.compact ? '32px' : '36px'};
    font-size: ${props => props.compact ? '12px' : '11px'};
    padding: ${props => props.compact ? '0' : '0 6px'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    pointer-events: none; /* Completely disable interaction when disabled */
  }
  
  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
  
  &:not(:disabled):active {
    transform: translateY(1px);
  }
  
  // Loading spinner
  ${props => props.loading && `
    pointer-events: none; /* Disable clicks when loading */
    
    &:before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Hide text when loading */
    color: transparent;
  `}
  
  // Pulse animation for action buttons
  ${props => (props.variant === 'approve' || props.variant === 'reject') && `
    animation: subtle-pulse 2s ease-in-out infinite;
    
    @keyframes subtle-pulse {
      0% { box-shadow: 0 3px 12px rgba(${props.variant === 'approve' ? '39, 174, 96' : '231, 76, 60'}, 0.4); }
      50% { box-shadow: 0 3px 12px rgba(${props.variant === 'approve' ? '39, 174, 96' : '231, 76, 60'}, 0.6); }
      100% { box-shadow: 0 3px 12px rgba(${props.variant === 'approve' ? '39, 174, 96' : '231, 76, 60'}, 0.4); }
    }
    
    &:hover:not(:disabled) {
      animation: none;
    }
  `}
  
  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          color: #ffffff;
          background: linear-gradient(135deg, #27ae60, #2ecc71, #58d68d);
          border-color: #27ae60;
          box-shadow: 0 3px 12px rgba(39, 174, 96, 0.4);
          position: relative;
          overflow: hidden;
          
          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #229954, #27ae60, #2ecc71);
            box-shadow: 0 5px 20px rgba(39, 174, 96, 0.5);
            transform: translateY(-3px);
            
            &:before {
              left: 100%;
            }
          }
          
          &:active:not(:disabled) {
            transform: translateY(1px);
            box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
          }
          
          &:focus:not(:disabled) {
            outline: none;
            box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.3), 0 3px 12px rgba(39, 174, 96, 0.4);
          }
        `;
      case 'reject':
        return `
          color: #ffffff;
          background: linear-gradient(135deg, #e74c3c, #c0392b, #ec7063);
          border-color: #e74c3c;
          box-shadow: 0 3px 12px rgba(231, 76, 60, 0.4);
          position: relative;
          overflow: hidden;
          
          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #c0392b, #a93226, #e74c3c);
            box-shadow: 0 5px 20px rgba(231, 76, 60, 0.5);
            transform: translateY(-3px);
            
            &:before {
              left: 100%;
            }
          }
          
          &:active:not(:disabled) {
            transform: translateY(1px);
            box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
          }
          
          &:focus:not(:disabled) {
            outline: none;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3), 0 3px 12px rgba(231, 76, 60, 0.4);
          }
        `;
      case 'view':
        return `
          color: #ffffff;
          background: linear-gradient(135deg, #34495e, #2c3e50, #5d6d7e);
          border-color: #34495e;
          box-shadow: 0 3px 12px rgba(52, 73, 94, 0.4);
          position: relative;
          overflow: hidden;
          
          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            transition: left 0.5s;
          }
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #2c3e50, #1b2631, #34495e);
            box-shadow: 0 5px 20px rgba(52, 73, 94, 0.5);
            transform: translateY(-3px);
            
            &:before {
              left: 100%;
            }
          }
          
          &:active:not(:disabled) {
            transform: translateY(1px);
            box-shadow: 0 2px 8px rgba(52, 73, 94, 0.3);
          }
          
          &:focus:not(:disabled) {
            outline: none;
            box-shadow: 0 0 0 3px rgba(52, 73, 94, 0.3), 0 3px 12px rgba(52, 73, 94, 0.4);
          }
        `;
      default:
        return `
          color: #6c757d;
          background: #ffffff;
          border-color: #dee2e6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          
          &:hover:not(:disabled) {
            background: #f8f9fa;
            border-color: #adb5bd;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          &:focus:not(:disabled) {
            outline: none;
            box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.25);
          }
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #999999;
  font-weight: 300;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #999999;
  
  .icon {
    font-size: 48px;
    color: #e0e0e0;
    margin-bottom: 24px;
  }
  
  h3 {
    margin: 0 0 12px 0;
    color: #cccccc;
    font-weight: 300;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    font-weight: 300;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #ffffff;
  border-radius: 0;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 20px;
    font-weight: 600;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const TabsContainer = styled.div`
  display: flex;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  margin-bottom: 1px;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  flex: 1;
  padding: 16px 24px;
  background: ${props => props.active ? '#000000' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#666666'};
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#000000' : '#f5f5f5'};
  }
`;

const OrderItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

const OrderItemCard = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  font-size: 12px;
`;

const OrderItemImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  svg {
    color: #6c757d;
    font-size: 16px;
  }
`;

const OrderItemDetails = styled.div`
  flex: 1;
  min-width: 0;
  
  h5 {
    margin: 0 0 4px 0;
    font-size: 12px;
    font-weight: 600;
    color: #2c3e50;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .item-meta {
    display: flex;
    gap: 6px;
    margin-bottom: 4px;
    flex-wrap: wrap;
    
    span {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 3px;
      padding: 1px 4px;
      font-size: 10px;
      color: #6c757d;
      white-space: nowrap;
    }
  }
  
  .item-price {
    font-size: 12px;
    font-weight: 600;
    color: #27ae60;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
  flex-wrap: wrap;
  
  @media (max-width: 1200px) {
    gap: 6px;
    min-width: 100px;
  }
  
  @media (max-width: 768px) {
    gap: 4px;
    min-width: 80px;
  }
  
  /* For stacked button layout */
  &.stacked {
    flex-direction: column;
    gap: 4px;
    min-width: 120px;
    
    .button-row {
      display: flex;
      gap: 4px;
      width: 100%;
      
      button {
        flex: 1;
        min-width: 0;
        font-size: 10px;
        padding: 4px 6px;
        height: 32px;
      }
    }
    
    .button-full {
      width: 100%;
      
      button {
        width: 100%;
        font-size: 10px;
        padding: 3px 6px;
        height: 28px;
      }
    }
  }
`;

// Delivery Status Components
const DeliveryStatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
  display: inline-block;
  text-align: center;
  min-width: 100px;
  transition: all 0.2s ease;
  line-height: 1;
  
  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 10px;
    min-width: 80px;
  }
  
  ${props => {
    switch (props.status?.toLowerCase()) {
      case 'pending':
        return `
          background: #fff3cd;
          color: #856404;
          border-color: #ffeaa7;
        `;
      case 'scheduled':
        return `
          background: #cce5ff;
          color: #004085;
          border-color: #74c0fc;
        `;
      case 'in_transit':
        return `
          background: #ffe0b3;
          color: #cc5500;
          border-color: #ff9f43;
        `;
      case 'delivered':
        return `
          background: #d4edda;
          color: #155724;
          border-color: #00b894;
        `;
      case 'delayed':
        return `
          background: #f8d7da;
          color: #721c24;
          border-color: #e74c3c;
        `;
      case 'cancelled':
        return `
          background: #e2e3e5;
          color: #383d41;
          border-color: #6c757d;
        `;
      default:
        return `
          background: #f8f9fa;
          color: #6c757d;
          border-color: #dee2e6;
        `;
    }
  }}
`;

// Expandable Row Components
const ExpandedRowContainer = styled.div`
  grid-column: 1 / -1; /* Span all columns */
  background: #f8f9fa;
  border-left: 4px solid #000000;
  padding: 20px;
  margin: 0 -16px;
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
      padding: 0 20px;
    }
    to {
      opacity: 1;
      max-height: 500px;
      padding: 20px;
    }
  }
  
  @media (max-width: 768px) {
    margin: 0 -8px;
    padding: 16px;
  }
`;

const ExpandedContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr; /* 4 columns: Customer | Shipping | Order Details | Order Items (wider) */
  gap: 20px;
  min-height: 200px;
  
  @media (max-width: 1400px) {
    grid-template-columns: 1fr 1fr 2fr; /* 3 columns: Customer+Shipping | Order Details | Order Items */
    gap: 16px;
    
    /* Merge customer and shipping on smaller screens */
    .customer-shipping-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr; /* 2 columns: Info | Order Items */
    gap: 16px;
    
    .info-group {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack vertically only on mobile */
    gap: 16px;
  }
`;

const InfoSection = styled.div`
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #000000;
    padding-bottom: 8px;
    flex-shrink: 0;
  }
  
  /* Content area that can scroll if needed */
  > div:not(h4) {
    flex: 1;
    overflow-y: auto;
  }
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 13px;
  
  .label {
    font-weight: 500;
    color: #666666;
    margin-right: 12px;
    min-width: 80px;
  }
  
  .value {
    font-weight: 400;
    color: #000000;
    text-align: right;
    flex: 1;
    word-break: break-word;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const HorizontalCustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  font-size: 14px;
  flex-wrap: wrap;
  
  .customer-field {
    display: flex;
    align-items: center;
    gap: 6px;
    
    .label {
      font-weight: 600;
      color: #666666;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .value {
      font-weight: 500;
      color: #000000;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
  }
  
  .separator {
    color: #cccccc;
    font-weight: 300;
    font-size: 16px;
    margin: 0 4px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    
    .customer-field .value {
      max-width: 200px;
    }
  }
`;

const ExpandToggleButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: #000000;
  }
  
  &.expanded {
    background: #000000;
    border-color: #000000;
    color: #ffffff;
  }
  
  svg {
    font-size: 12px;
    transition: transform 0.2s ease;
  }
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    
    svg {
      font-size: 10px;
    }
  }
`;

// Mobile Card Layout for better mobile experience
const MobileCard = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .card-content {
      display: grid;
      gap: 8px;
      font-size: 14px;
    }
    
    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      
      .label {
        font-weight: 600;
        color: #666666;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .value {
        color: #000000;
        font-weight: 500;
        text-align: right;
        flex: 1;
        margin-left: 12px;
      }
    }
    
    .card-actions {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 8px;
      justify-content: center;
    }
  }
`;

// Payment verification table specific styling
const PaymentVerificationTableHeader = styled.div`
  display: grid;
  grid-template-columns: 35px 75px 130px 90px 180px 150px 100px 110px 110px 140px;
  gap: 12px;
  padding: 20px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 12px;
  color: #555555;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  justify-items: center;
  text-align: center;
  
  @media (max-width: 1400px) {
    grid-template-columns: 30px 70px 120px 85px 160px 135px 90px 100px 100px 125px;
    gap: 10px;
    font-size: 11px;
    padding: 18px 16px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 28px 65px 110px 80px 140px 120px 85px 95px 95px 110px;
    gap: 8px;
    padding: 16px 12px;
    font-size: 10px;
  }
  
  @media (max-width: 768px) {
    display: none; /* Hide header on mobile, use card layout instead */
  }
`;

const PaymentVerificationTableRow = styled.div`
  display: grid;
  grid-template-columns: 40px 130px 95px 170px 150px 100px 85px 100px 95px 100px 130px;
  gap: 16px;
  padding: 20px 20px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: all 0.2s ease;
  min-height: 70px;
  
  &:hover {
    background: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1400px) {
    grid-template-columns: 30px 70px 120px 85px 160px 135px 90px 100px 100px 125px;
    gap: 10px;
    padding: 18px 16px;
    min-height: 65px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 28px 65px 110px 80px 140px 120px 85px 95px 95px 110px;
    gap: 8px;
    padding: 16px 12px;
    min-height: 60px;
  }
  
  @media (max-width: 768px) {
    /* Mobile card layout - will be handled separately */
    display: block;
    padding: 20px;
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const TransactionPage = () => {
  // Helper function to safely display values, avoiding "N/A" when possible
  const safeDisplayValue = (value, fallback = '') => {
    if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
      return fallback;
    }
    return value;
  };

  // Add debounce ref to prevent rapid button clicks and request queue
  const debounceRef = useRef({});
  const requestQueueRef = useRef(new Map()); // Queue to process requests one at a time

  // Helper function to format address components
  const formatAddress = (addressComponents) => {
    const cleanComponents = addressComponents.filter(component => 
      component && component !== 'null' && component !== 'undefined' && component.trim() !== ''
    );
    return cleanComponents.length > 0 ? cleanComponents.join(', ') : '';
  };

  // Helper function to format phone number
  const formatPhone = (phone) => {
    if (!phone || phone === 'null' || phone === 'undefined' || phone.trim() === '') {
      return '';
    }
    return phone;
  };

  // State for different types of requests
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows
  const [expandedCancellationRows, setExpandedCancellationRows] = useState(new Set()); // Track expanded cancellation rows
  const [expandedCustomDesignRows, setExpandedCustomDesignRows] = useState(new Set()); // Track expanded custom design rows
  const [expandedRefundRows, setExpandedRefundRows] = useState(new Set()); // Track expanded refund rows
  
  // Function to toggle row expansion
  const toggleRowExpansion = (transactionId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  // Function to toggle cancellation row expansion
  const toggleCancellationRowExpansion = (requestId) => {
    console.log('🔄 toggleCancellationRowExpansion called with:', requestId);
    
    // Use a callback to ensure we have the latest state
    setExpandedCancellationRows(prev => {
      const newSet = new Set(prev);
      console.log('🔄 Current expanded cancellation rows:', Array.from(prev));
      
      if (newSet.has(requestId)) {
        console.log('🔄 Collapsing cancellation row:', requestId);
        newSet.delete(requestId);
      } else {
        console.log('🔄 Expanding cancellation row:', requestId);
        newSet.add(requestId);
      }
      
      console.log('🔄 New expanded cancellation rows:', Array.from(newSet));
      return newSet;
    });
  };

  // Function to toggle custom design row expansion
  const toggleCustomDesignRowExpansion = (requestId) => {
    setExpandedCustomDesignRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  // Function to toggle refund row expansion
  const toggleRefundRowExpansion = (requestId) => {
    setExpandedRefundRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  // Function to toggle verification row expansion
  const toggleVerificationRowExpansion = (orderId) => {
    console.log('🔄 toggleVerificationRowExpansion called with:', orderId);
    setExpandedVerificationRows(prev => {
      const newSet = new Set(prev);
      console.log('🔄 Current expanded rows:', Array.from(prev));
      if (newSet.has(orderId)) {
        console.log('🔄 Collapsing row:', orderId);
        newSet.delete(orderId);
      } else {
        console.log('🔄 Expanding row:', orderId);
        newSet.add(orderId);
      }
      console.log('🔄 New expanded rows:', Array.from(newSet));
      return newSet;
    });
  };
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Cancellation request states
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  // Add missing state hooks for ESLint errors
  const [buttonLoading, setButtonLoading] = useState({});
  const [designAdminNotes, setDesignAdminNotes] = useState('');
  const [designSearchTerm, setDesignSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  
  // Design request states
  const [designRequestsLoading, setDesignRequestsLoading] = useState(false);
  const [customDesignRequests, setCustomDesignRequests] = useState([]);
  
  // Refund request state variables
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundRequestsLoading, setRefundRequestsLoading] = useState(false);
  const [refundSearchTerm, setRefundSearchTerm] = useState('');
  
  // Payment verification state (for admin users)
  const [pendingVerificationOrders, setPendingVerificationOrders] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSearchTerm, setVerificationSearchTerm] = useState('');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState('all');
  const [expandedVerificationRows, setExpandedVerificationRows] = useState(new Set()); // Track expanded verification rows
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Design images modal state
  const [showDesignImagesModal, setShowDesignImagesModal] = useState(false);
  const [selectedDesignImages, setSelectedDesignImages] = useState(null);
  
  // Remove unused user import since not needed in this component

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching transactions with delivery status...');
      
      // Fetch both regular orders and custom orders using the delivery-enhanced endpoint to get delivery_status
      const [ordersResponse, customOrdersResponse] = await Promise.all([
        api.get('/delivery-enhanced/orders'), // Use delivery-enhanced to get delivery_status
        api.get('/custom-orders/confirmed').catch(error => {
          console.warn('Custom orders endpoint not available:', error.response?.status);
          return { data: { success: false, data: [] } };
        })
      ]);
      
      let allTransactions = [];
      
      // Process confirmed regular orders from delivery-enhanced endpoint
      if (ordersResponse.data.success) {
        console.log('Orders fetched from delivery-enhanced endpoint');
        const ordersData = ordersResponse.data.data || [];
        
        // Filter only confirmed orders (status = 'confirmed' or 'Order Received')
        const confirmedOrders = ordersData
          .filter(order => order && (
            order.status === 'confirmed' || 
            order.order_status === 'confirmed' ||
            order.status === 'Order Received' ||
            order.order_status === 'Order Received'
          ));

        // Separate regular orders from custom orders in the delivery-enhanced response
        const regularOrders = confirmedOrders.filter(order => order.order_type === 'regular' || !order.order_type);
        const customOrdersFromDelivery = confirmedOrders.filter(order => order.order_type === 'custom_order' || order.order_type === 'custom');
        
        console.log(`📊 Delivery-enhanced endpoint returned: ${regularOrders.length} regular orders, ${customOrdersFromDelivery.length} custom orders`);
        
        const processedOrders = confirmedOrders
          .filter(order => order) // Extra safety check
          .map(order => {
          const fullName = order.customer_name || 
                         [order.first_name, order.last_name].filter(Boolean).join(' ') || 
                         'Unknown Customer';
          
          // Create proper order number with fallback logic
          const orderNumber = order.order_number || 
                            order.order_id || 
                            order.transaction_id || 
                            `ORD-${order.id}` || 
                            'N/A';
          
          // Create comprehensive shipping address with correct field mappings from OrderPage.js
          const shippingAddress = order.shipping_address || 
                                [
                                  order.street_address,        // From OrderPage.js: street_address
                                  order.city_municipality,     // From OrderPage.js: city mapped to city_municipality
                                  order.province,              // From OrderPage.js: province
                                  order.zip_code              // From OrderPage.js: postal_code mapped to zip_code
                                ].filter(Boolean).join(', ') ||
                                // Fallback to other possible field variations
                                [
                                  order.address,
                                  order.city,
                                  order.area,
                                  order.postal_code
                                ].filter(Boolean).join(', ') ||
                                'Address not provided';
          
          
          return {
            id: order.id,
            order_number: orderNumber,
            transaction_id: order.transaction_id,
            customer_name: fullName,
            customer_email: order.customer_email || order.user_email,
            user_email: order.user_email,
            first_name: order.first_name,
            last_name: order.last_name,
            amount: order.total_amount,
            total_amount: order.total_amount,
            invoice_total: order.invoice_total,
            payment_method: order.payment_method || 'GCash',
            order_status: order.status,
            transaction_status: order.transaction_status || order.status,
            status: order.status,
            delivery_status: order.delivery_status || 'pending', // Now includes actual delivery status from backend
            order_date: order.order_date,
            created_at: order.created_at,
            updated_at: order.updated_at,
            shipping_address: shippingAddress,
            street_address: order.street_address,
            city_municipality: order.city_municipality,
            city: order.city,
            province: order.province,
            zip_code: order.zip_code,
            postal_code: order.postal_code,
            postalCode: order.postalCode,  // For custom orders
            contact_phone: order.contact_phone || order.customer_phone || order.phone,
            notes: order.notes,
            items: order.items || order.order_items || [],
            order_type: 'regular' // Mark as regular order
          };
        });
        
        allTransactions = [...processedOrders];
        console.log('Added ' + processedOrders.length + ' confirmed/completed orders with delivery status');
        
        // Track custom order IDs that were already included from delivery-enhanced endpoint
        const customOrdersFromDeliveryIds = new Set();
        processedOrders.forEach(order => {
          // Check if this order contains a custom order reference
          if (order.notes && order.notes.includes('Reference: CUSTOM-')) {
            const customOrderMatch = order.notes.match(/Reference: (CUSTOM-[A-Z0-9-]+)/);
            if (customOrderMatch) {
              customOrdersFromDeliveryIds.add(customOrderMatch[1]);
            }
          }
          // Also check if this is directly a custom order (order_type)
          if (order.order_type === 'custom' && order.order_number && order.order_number.startsWith('CUSTOM-')) {
            customOrdersFromDeliveryIds.add(order.order_number);
          }
        });
        
        console.log(`📋 Custom orders already included from delivery endpoint: ${Array.from(customOrdersFromDeliveryIds).join(', ')}`);
      }
      
      // Process confirmed custom orders
      if (customOrdersResponse.data.success) {
        console.log('Custom orders fetched successfully');
        const customOrdersData = customOrdersResponse.data.data || [];
        
        // Filter only confirmed custom orders (payment verified and ready for delivery)
        const confirmedCustomOrders = customOrdersData
          .filter(order => order && order.status === 'confirmed');
        
        // Check for pending cancellation requests for each custom order
        let customOrdersWithCancellationStatus = [];
        
        try {
          console.log('🔍 Checking for pending cancellation requests for custom orders...');
          const cancellationResponse = await api.get('/custom-orders/cancellation-requests').catch(error => {
            console.warn('Could not fetch custom order cancellation requests:', error.response?.status);
            return { data: { success: false, data: [] } };
          });
          
          const pendingCancellations = cancellationResponse.data.success ? 
            cancellationResponse.data.data.filter(req => req.status === 'pending') : [];
          
          console.log(`📋 Found ${pendingCancellations.length} pending custom order cancellation requests`);
          
          // Create a set of custom order IDs with pending cancellations
          const pendingCancellationIds = new Set(pendingCancellations.map(req => req.custom_order_id));
          
          customOrdersWithCancellationStatus = confirmedCustomOrders.map(order => {
            const hasPendingCancellation = pendingCancellationIds.has(order.custom_order_id);
            
            if (hasPendingCancellation) {
              console.log(`🔍 Custom order ${order.custom_order_id} has pending cancellation request`);
            }
            
            return {
              ...order,
              has_pending_cancellation: hasPendingCancellation
            };
          });
          
        } catch (error) {
          console.warn('Could not check cancellation status for custom orders:', error);
          customOrdersWithCancellationStatus = confirmedCustomOrders;
        }
        
        const processedCustomOrders = customOrdersWithCancellationStatus
          .filter(order => order) // Extra safety check
          .map(order => {
          const fullName = order.customer_name || 
                         [order.first_name, order.last_name].filter(Boolean).join(' ') || 
                         'Unknown Customer';
          
          // Determine the display status based on cancellation status
          let displayStatus = 'confirmed';
          let transactionStatus = 'confirmed';
          
          if (order.has_pending_cancellation) {
            displayStatus = 'Cancellation Pending';
            transactionStatus = 'Cancellation Pending';
          }
          
          // Create proper order number with fallback logic for custom orders
          const orderNumber = order.custom_order_id || 
                            order.order_number || 
                            order.order_id || 
                            `CUSTOM-${order.id}` || 
                            'N/A';
          
          // Create comprehensive shipping address for custom orders with correct field mappings from CustomPage.js
          const shippingAddress = order.shipping_address ||
                                [
                                  order.streetNumber,          // From CustomPage.js: streetAddress mapped to streetNumber
                                  order.houseNumber,          // From CustomPage.js: houseNumber
                                  order.barangay,             // From CustomPage.js: barangay
                                  order.municipality,         // From CustomPage.js: city mapped to municipality
                                  order.province,             // From CustomPage.js: province
                                  order.postalCode           // From CustomPage.js: postalCode
                                ].filter(Boolean).join(', ') ||
                                // Fallback to other possible field variations
                                [
                                  order.street_address,
                                  order.city,
                                  order.area,
                                  order.postal_code
                                ].filter(Boolean).join(', ') ||
                                'Address not provided';
          
          
          return {
            id: 'custom-' + order.id, // Prefix to avoid ID conflicts
            order_number: orderNumber,
            transaction_id: null,
            customer_name: fullName,
            customer_email: order.customer_email || order.user_email,
            user_email: order.user_email,
            first_name: order.first_name,
            last_name: order.last_name,
            amount: order.estimated_price || order.final_price || 0,
            total_amount: order.estimated_price || order.final_price || 0,
            invoice_total: order.estimated_price || order.final_price || 0,
            payment_method: order.payment_method || 'GCash',
            order_status: displayStatus, // Show cancellation status if applicable
            transaction_status: transactionStatus, // Show cancellation status if applicable
            status: displayStatus, // Show cancellation status if applicable
            delivery_status: order.delivery_status || 'pending', // Add delivery status for custom orders
            order_date: order.created_at,
            created_at: order.created_at,
            updated_at: order.updated_at,
            shipping_address: shippingAddress,
            street_address: (order.street_number || '') + ' ' + (order.barangay || ''),
            city_municipality: order.municipality,
            city: order.municipality,
            province: order.province,
            zip_code: order.postal_code,
            postal_code: order.postal_code,
            contact_phone: order.customer_phone || order.contact_phone || order.phone,
            notes: 'Custom Order: ' + order.product_type + ' | Size: ' + order.size + ' | Color: ' + order.color + ' | Qty: ' + order.quantity + (order.special_instructions ? ' | Notes: ' + order.special_instructions : ''),
            items: [{
              id: 1,
              product_name: 'Custom ' + order.product_type + ' - ' + (order.product_name || 'Custom Design'),
              quantity: order.quantity || 1,
              price: order.estimated_price || order.final_price || 0,
              color: order.color,
              size: order.size,
              subtotal: (order.estimated_price || order.final_price || 0) * (order.quantity || 1)
            }],
            order_type: 'custom', // Mark as custom order
            custom_order_data: order, // Keep original custom order data
            has_pending_cancellation: order.has_pending_cancellation // Keep cancellation status
          };
        });
        
        allTransactions = [...allTransactions, ...processedCustomOrders];
        console.log('Added ' + processedCustomOrders.length + ' confirmed custom orders');
      }
      
      // Sort all transactions by date (newest first) and filter out any null values
      allTransactions = allTransactions
        .filter(transaction => transaction !== null && transaction !== undefined);
      
      // **CRITICAL FIX**: Remove duplicates based on custom order ID or order number
      // This prevents the same custom order from appearing twice when it's in both API responses
      const uniqueTransactions = [];
      const seenIdentifiers = new Set();
      
      allTransactions.forEach(transaction => {
        // Create a unique identifier for each transaction
        let identifier;
        
        if (transaction.order_type === 'custom') {
          // For custom orders, use the custom_order_id as identifier
          identifier = transaction.order_number; // This is the custom_order_id for custom orders
        } else {
          // For regular orders, use the order number
          identifier = transaction.order_number;
        }
        
        // Only add if we haven't seen this identifier before
        if (!seenIdentifiers.has(identifier)) {
          seenIdentifiers.add(identifier);
          uniqueTransactions.push(transaction);
        } else {
          console.log(`🚫 Removed duplicate transaction: ${identifier} (${transaction.order_type})`);
        }
      });
      
      // Sort unique transactions by date (newest first)
      allTransactions = uniqueTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      console.log('Total transactions: ' + allTransactions.length + ' (' + allTransactions.filter(t => t && t.order_type === 'regular').length + ' regular + ' + allTransactions.filter(t => t && t.order_type === 'custom').length + ' custom)');
      
      setTransactions(allTransactions);
      
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error details:', error.response?.data?.message || error.message);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []); // Remove 'user' dependency as it's not used in the function

  // Fetch cancellation requests
  const fetchCancellationRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      console.log('Fetching cancellation requests (both regular and custom orders)...');
      
      // Fetch both regular and custom order cancellation requests
      const [regularResponse, customResponse] = await Promise.all([
        api.get('/orders/cancellation-requests').catch(error => {
          console.warn('Regular order cancellation requests not available:', error.response?.status);
          return { data: { success: false, data: [] } };
        }),
        api.get('/custom-orders/cancellation-requests').catch(error => {
          console.warn('Custom order cancellation requests not available:', error.response?.status);
          return { data: { success: false, data: [] } };
        })
      ]);
      
      let allCancellationRequests = [];
      
      // Process regular order cancellation requests
      if (regularResponse.data.success) {
        const regularRequests = regularResponse.data.data || [];
        console.log(`✅ Found ${regularRequests.length} regular order cancellation requests`);
        
        // Add order_type marker for regular orders
        const processedRegularRequests = regularRequests.map(request => ({
          ...request,
          order_type: 'regular',
          request_type: 'regular_order_cancellation',
          
          // Ensure order_number is properly mapped for regular orders
          order_number: request.order_number || request.order_id || request.transaction_id || request.id,
          
          // Map other fields that might be missing
          customer_name: request.customer_name || request.user_name || request.full_name,
          customer_email: request.customer_email || request.user_email || request.email,
          customer_phone: request.customer_phone || request.phone || request.contact_phone,
          
          // Map product information
          product_type: request.product_type || request.product_name || 'Regular Order',
          total_amount: request.total_amount || request.amount || request.order_total || 0
        }));
        
        allCancellationRequests = [...allCancellationRequests, ...processedRegularRequests];
      }
      
      // Process custom order cancellation requests
      if (customResponse.data.success) {
        const customRequests = customResponse.data.data || [];
        console.log(`✅ Found ${customRequests.length} custom order cancellation requests`);
        
        // Add order_type marker for custom orders and format to match regular request structure
        const processedCustomRequests = customRequests.map(request => ({
          ...request,
          order_type: 'custom',
          request_type: 'custom_order_cancellation',
          order_number: request.custom_order_id || request.order_number, // Use custom_order_id as order_number
          // Map custom order fields to match regular order structure
          product_image: request.product_image || request.image || (request.images && request.images[0]) || null,
          total_amount: request.total_amount || request.estimated_price || request.final_price || 0,
          
          // Map address fields from custom order data (if nested)
          street_number: request.street_number || request.custom_order?.street_number || request.order?.street_number,
          house_number: request.house_number || request.custom_order?.house_number || request.order?.house_number,
          barangay: request.barangay || request.custom_order?.barangay || request.order?.barangay,
          municipality: request.municipality || request.custom_order?.municipality || request.order?.municipality,
          province: request.province || request.custom_order?.province || request.order?.province,
          postal_code: request.postal_code || request.custom_order?.postal_code || request.order?.postal_code,
          
          // Map product fields from custom order data (if nested)
          product_type: request.product_type || request.custom_order?.product_type || request.order?.product_type,
          product_name: request.product_name || request.custom_order?.product_name || request.order?.product_name,
          size: request.size || request.custom_order?.size || request.order?.size,
          color: request.color || request.custom_order?.color || request.order?.color,
          quantity: request.quantity || request.custom_order?.quantity || request.order?.quantity || 1,
          final_price: request.final_price || request.custom_order?.final_price || request.order?.final_price,
          estimated_price: request.estimated_price || request.custom_order?.estimated_price || request.order?.estimated_price,
          special_instructions: request.special_instructions || request.custom_order?.special_instructions || request.order?.special_instructions,
          
          // Map customer fields from custom order data (if nested)
          customer_name: request.customer_name || request.custom_order?.customer_name || request.order?.customer_name,
          customer_email: request.customer_email || request.custom_order?.customer_email || request.order?.customer_email,
          customer_phone: request.customer_phone || request.custom_order?.customer_phone || request.order?.customer_phone
        }));
        
        allCancellationRequests = [...allCancellationRequests, ...processedCustomRequests];
      }
      
      // Sort by creation date (newest first)
      allCancellationRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      console.log(`📊 Total cancellation requests: ${allCancellationRequests.length} (${allCancellationRequests.filter(r => r.order_type === 'regular').length} regular + ${allCancellationRequests.filter(r => r.order_type === 'custom').length} custom)`);
      
      // Debug: Check the structure of requests to see image field for both regular and custom orders
      if (allCancellationRequests.length > 0) {
        allCancellationRequests.forEach((request, index) => {
          if (index < 3) { // Log first 3 requests for debugging
            console.log(`🖼️ Cancellation request ${index + 1} data structure:`, {
              id: request.id,
              order_number: request.order_number,
              order_type: request.order_type,
              product_image: request.product_image,
              total_amount: request.total_amount,
              request_type: request.request_type,
              
              // Customer info
              customer_name: request.customer_name,
              customer_email: request.customer_email,
              customer_phone: request.customer_phone,
              
              // Address info
              street_number: request.street_number,
              barangay: request.barangay,
              municipality: request.municipality,
              province: request.province,
              postal_code: request.postal_code,
              
              // Product info
              product_type: request.product_type,
              size: request.size,
              color: request.color,
              quantity: request.quantity,
              final_price: request.final_price,
              estimated_price: request.estimated_price,
              
              // Raw request data (for debugging regular orders)
              keys: Object.keys(request).slice(0, 15),
              hasCustomOrder: !!request.custom_order,
              hasOrder: !!request.order,
              
              // Additional fields that might contain order number for regular orders
              order_id: request.order_id,
              transaction_id: request.transaction_id,
              user_name: request.user_name,
              full_name: request.full_name,
              user_email: request.user_email,
              email: request.email
            });
          }
        });
      }
      
      setCancellationRequests(allCancellationRequests);
      
    } catch (error) {
      console.error('❌ Error fetching cancellation requests:', error);
      toast.error('Failed to fetch cancellation requests');
    } finally {
      setRequestsLoading(false);
    }
  }, []);
  
  // Process cancellation request with queue system
  const processCancellationRequest = async (requestId, action) => {
    // Create a unique identifier for this specific request
    const actionKey = `${requestId}_${action}`;
    const requestKey = String(requestId); // Just the request ID for queue management
    
    console.log('� BUTTON CLICKED: ' + action + ' for request ' + requestId);
    
    // Check if there's already a request being processed for this requestId
    if (requestQueueRef.current.has(requestKey)) {
      console.log('🚫 Request already queued/processing for requestId:', requestKey);
      toast.warning('A request is already being processed for this item. Please wait.');
      return;
    }
    
    // Check debounce using ref to prevent rapid successive calls
    const now = Date.now();
    if (debounceRef.current[actionKey] && (now - debounceRef.current[actionKey] < 3000)) {
      console.log('� Debounced - preventing rapid successive calls for:', actionKey);
      toast.warning('Please wait before trying again.');
      return;
    }
    debounceRef.current[actionKey] = now;
    
    try {
      // Add to request queue
      requestQueueRef.current.set(requestKey, { action, timestamp: now });
      console.log('🚀 Added to request queue:', requestKey, 'Action:', action);
      console.log('🚀 Current queue size:', requestQueueRef.current.size);
      
      // Validate action parameter - make sure it's exactly what the backend expects
      if (action !== 'approve' && action !== 'reject') {
        console.error('❌ Invalid action:', action, 'Type:', typeof action);
        toast.error('Invalid action');
        return;
      }
      
      // Log exactly what we're sending
      console.log('🔍 Action validation passed. Sending action:', JSON.stringify(action));
      
      // Find the request to determine if it's a regular or custom order
      const request = cancellationRequests.find(r => r.id === requestId);
      if (!request) {
        console.error('❌ Request not found:', requestId);
        toast.error('Request not found');
        return;
      }
      
      // Check if request is already processed
      if (request.status !== 'pending') {
        console.log('⚠️ Request already processed with status:', request.status);
        toast.error('This cancellation request has already been processed.');
        return;
      }
      
      console.log('🔍 Processing request type:', request.order_type, 'for request ID:', requestId);
      console.log('🔍 Request status:', request.status);
      
      // Set loading state for this specific request
      const loadingKey = `cancel_${requestId}_${action}`;
      setButtonLoading(prev => ({ ...prev, [loadingKey]: true }));
      
      // Use different API endpoints based on order type
      const apiEndpoint = request.order_type === 'custom' 
        ? `/custom-orders/cancellation-requests/${requestId}`
        : `/orders/cancellation-requests/${requestId}`;
      
      console.log('📤 Making API call to:', apiEndpoint, 'with action:', action);
      console.log('📤 Full API URL:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}${apiEndpoint}`);
      console.log('📤 API Request payload:', {
        action,
        admin_notes: `Cancellation request ${action}d by admin on ${new Date().toLocaleString()}`
      });
      
      // Make the API call with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout
      });
      
      // Create the exact payload we'll send
      const requestPayload = {
        action,
        admin_notes: `Cancellation request ${action}d by admin on ${new Date().toLocaleString()}`
      };
      
      console.log('📤 EXACT REQUEST PAYLOAD:', JSON.stringify(requestPayload, null, 2));
      console.log('📤 Action type:', typeof action);
      console.log('📤 Action length:', action.length);
      console.log('📤 Action value as string:', JSON.stringify(action));
      console.log('📤 Action character codes:', Array.from(action).map(c => c.charCodeAt(0)));
      
      const apiPromise = api.put(apiEndpoint, requestPayload);
      
      console.log('📤 Starting API request...');
      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('📥 API request completed successfully');
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        toast.success(`Cancellation request ${action}d successfully`);
        
        // If cancellation was approved and stock was restored, trigger stock update events
        if (action === 'approve' && response.data.data?.stockUpdateEvent?.stockRestored) {
          const stockEvent = response.data.data.stockUpdateEvent;
          console.log('Cancellation approved - stock restored, triggering inventory updates...', stockEvent);
          
          // Show detailed stock restoration information
          if (stockEvent.stockRestorations && stockEvent.stockRestorations.length > 0) {
            const restorationDetails = stockEvent.stockRestorations.map(item => 
              `• ${item.product} (${item.size}/${item.color}): +${item.quantityRestored} units → ${item.newAvailableStock} available`
            ).join('\n');
            
            toast.success(
              `✅ Order cancelled and inventory restored:\n\n${restorationDetails}`,
              { autoClose: 8000 }
            );
          }
          
          // Trigger localStorage event for inventory pages to refresh
          localStorage.setItem('stock_updated', JSON.stringify({
            type: 'order_cancelled',
            timestamp: new Date().toISOString(),
            orderId: stockEvent.orderId,
            productIds: stockEvent.productIds || [],
            stockRestorations: stockEvent.stockRestorations || []
          }));
          
          // Trigger custom window event for real-time updates
          window.dispatchEvent(new CustomEvent('stockUpdated', {
            detail: {
              type: 'order_cancelled',
              orderId: stockEvent.orderId,
              stockRestorations: stockEvent.stockRestorations || []
            }
          }));
        }
        
        // Refresh cancellation requests after successful processing
        console.log('🔄 Refreshing cancellation requests...');
        await fetchCancellationRequests();
        
        // Also refresh the main transactions if needed
        if (activeTab === 'orders') {
          console.log('🔄 Refreshing transactions...');
          await fetchTransactions();
        }
      } else {
        console.error('❌ API returned error:', response.data);
        toast.error(response.data.message || `Failed to ${action} cancellation request`);
      }
    } catch (error) {
      console.error(`❌ Error ${action}ing cancellation request:`, error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      if (error.message === 'Request timeout') {
        toast.error('Request timed out. Please try again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        toast.error('Cancellation request not found or already processed.');
      } else if (error.response?.data?.message) {
        // Special handling for "already processed" error
        if (error.response.data.message.includes('already been processed')) {
          console.log('🔄 Request was already processed, refreshing data...');
          fetchCancellationRequests(); // Refresh to show current status
        }
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${action} cancellation request: ${error.message}`);
      }
    } finally {
      // Clear loading state
      const loadingKey = `cancel_${requestId}_${action}`;
      setButtonLoading(prev => ({ ...prev, [loadingKey]: false }));
      
      // Remove from request queue
      requestQueueRef.current.delete(requestKey);
      console.log('🧹 Removed from request queue:', requestKey);
      console.log('🧹 Remaining queue size:', requestQueueRef.current.size);
      
      // Clean up debounce ref after some time
      setTimeout(() => {
        if (debounceRef.current[actionKey]) {
          delete debounceRef.current[actionKey];
          console.log('🧹 Cleaned up debounce for:', actionKey);
        }
      }, 5000); // Clean up after 5 seconds
    }
  };
  
  // Fetch custom design requests
  const fetchCustomDesignRequests = useCallback(async () => {
    try {
      setDesignRequestsLoading(true);
      console.log('Fetching custom design requests (ALL custom orders - approved, denied, pending)...');
      
      // Fetch all custom orders - show complete history, not just pending
      const response = await api.get('/custom-orders/admin/all');
      
      if (response.data.success) {
        console.log('✅ Custom orders fetched:', response.data);
        // Show ALL custom orders as history (approved, denied, pending)
        const allOrders = response.data.data || [];
        console.log('Found ' + allOrders.length + ' total custom design requests (all statuses)');
        
        // Debug: Show the structure of the first order
        if (allOrders.length > 0) {
          console.log('🖼️ First order structure for image debugging:', {
            custom_order_id: allOrders[0].custom_order_id,
            id: allOrders[0].id,
            customer_name: allOrders[0].customer_name,
            status: allOrders[0].status,
            // Check price fields for debugging amount display
            final_price: allOrders[0].final_price,
            estimated_price: allOrders[0].estimated_price,
            total_amount: allOrders[0].total_amount,
            price: allOrders[0].price,
            // Check all possible image field names
            images: allOrders[0].images,
            design_images: allOrders[0].design_images,
            image_paths: allOrders[0].image_paths,
            image_urls: allOrders[0].image_urls,
            uploaded_images: allOrders[0].uploaded_images,
            // Log all keys to see what other fields might contain images
            all_keys: Object.keys(allOrders[0])
          });
          
          // Also log a few more orders if available to see if structure is consistent
          if (allOrders.length > 1) {
            console.log('🖼️ Second order image fields:', {
              custom_order_id: allOrders[1].custom_order_id,
              images: allOrders[1].images,
              design_images: allOrders[1].design_images,
              image_paths: allOrders[1].image_paths,
              image_urls: allOrders[1].image_urls
            });
          }
        }
        
        // Show all orders as history instead of filtering for just pending
        setCustomDesignRequests(allOrders);
      } else {
        console.error('❌ Failed to fetch custom orders:', response.data);
        toast.error('Failed to fetch custom design requests');
      }
    } catch (error) {
      console.error('❌ Error fetching custom design requests:', error);
      toast.error('Failed to fetch custom design requests');
    } finally {
      setDesignRequestsLoading(false);
    }
  }, []);
  // Process custom design request
  const processDesignRequest = async (designId, status) => {
    // Validate inputs
    if (!designId) {
      console.error('❌ Design ID is required');
      toast.error('Design ID is missing');
      return;
    }
    
    if (!status) {
      console.error('❌ Status is required');
      toast.error('Status is missing');
      return;
    }
    
    const loadingKey = `design_${designId}_${status === 'approved' ? 'approve' : 'reject'}`;
    
    // Prevent double submissions
    if (buttonLoading[loadingKey]) {
      console.log('❌ Request already in progress, ignoring duplicate click');
      return;
    }
    
    try {
      console.log('DESIGN BUTTON CLICKED');
      console.log('PROCESSING DESIGN REQUEST');
      console.log('   designId:', designId);
      console.log('   status:', status);
      console.log('   loadingKey:', loadingKey);
      console.log('   current buttonLoading state:', buttonLoading);
      
      // Set loading state
      setButtonLoading(prev => {
        const newState = { ...prev, [loadingKey]: true };
        console.log('   setting buttonLoading to:', newState);
        return newState;
      });
      
      // Use the custom-orders endpoint with the custom_order_id
      console.log('📤 Making API call to:', `/custom-orders/${designId}/status`);
      console.log('📤 Request payload:', { status, admin_notes: designAdminNotes.trim() || undefined });
      
      const response = await api.put(`/custom-orders/${designId}/status`, {
        status,
        admin_notes: designAdminNotes.trim() || undefined
      });
      
      console.log('📥 API Response received:', response);
      console.log('📥 Response data:', response.data);
      console.log('📥 Response status:', response.status);
      
      if (response.data && response.data.success) {
        const successMessage = status === 'approved' 
          ? 'Design request approved! Customer can now submit payment proof.' 
          : 'Design request rejected successfully.';
          
        console.log('✅ Success! Showing toast:', successMessage);
        toast.success(successMessage);
        
        // Refresh design requests
        console.log('🔄 Refreshing design requests...');
        await fetchCustomDesignRequests();
        console.log('✅ Design requests refreshed');
      } else {
        console.error('❌ API Error - response.data.success is false:', response.data);
        toast.error(response.data?.message || 'Failed to process request');
      }
    } catch (error) {
      console.error(`❌ Caught error in processDesignRequest:`, error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Better error message handling
      let errorMessage = `Failed to ${status} design request`;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.log('📝 Using error message from response.data.message:', errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
        console.log('📝 Using error message from error.message:', errorMessage);
      } else {
        console.log('📝 Using default error message:', errorMessage);
      }
      
      console.log('🚨 Showing error toast:', errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('🔄 Clearing loading state for key:', loadingKey);
      setButtonLoading(prev => {
        const newState = { ...prev, [loadingKey]: false };
        console.log('📝 Final buttonLoading state:', newState);
        return newState;
      });
      console.log('✅ processDesignRequest function completed');
    }
  };

  // Refund request functions
  const fetchRefundRequests = useCallback(async () => {
    try {
      setRefundRequestsLoading(true);
      const response = await api.get('/orders/refund-requests');
      if (response.data.success) {
        setRefundRequests(response.data.data || []);
      } else {
        setRefundRequests([]);
        toast.error('Failed to fetch refund requests');
      }
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      setRefundRequests([]);
      toast.error('Failed to fetch refund requests');
    } finally {
      setRefundRequestsLoading(false);
    }
  }, []);

  const processRefundRequest = async (requestId, action) => {
    try {
      const response = await api.put(`/orders/refund-requests/${requestId}`, {
        status: action,
        admin_notes: `Refund request ${action} by admin on ${new Date().toLocaleString()}`
      });
      
      if (response.data.success) {
        toast.success(`Refund request ${action} successfully`);
        fetchRefundRequests(); // Refresh the list
      } else {
        toast.error(response.data.message || `Failed to ${action} refund request`);
      }
    } catch (error) {
      console.error(`Error ${action} refund request:`, error);
      toast.error(`Failed to ${action} refund request`);
    }
  };

  // Payment verification functions
  const fetchPendingVerificationOrders = useCallback(async () => {
    try {
      setVerificationLoading(true);
      console.log('Fetching payment verification orders (ALL orders - verified, pending, rejected)...');
      
      // For now, we'll use existing endpoints and show all orders regardless of verification status
      // This creates a complete payment history instead of just pending verifications
      const [regularOrdersResponse, customOrdersResponse] = await Promise.all([
        api.get('/orders/pending-verification').catch(error => {
          console.warn('Regular orders pending verification not available:', error.response?.status);
          return { data: { success: false, data: [] } };
        }),
        api.get('/custom-orders/admin/pending-verification').catch(error => {
          console.warn('Custom orders pending verification not available:', error.response?.status);
          return { data: { success: false, data: [] } };
        })
      ]);
      
      let allOrders = [];
      
      // Process regular orders
      if (regularOrdersResponse.data.success) {
        const regularOrders = (regularOrdersResponse.data.data || []).map(order => ({
          ...order,
          order_type: 'regular'
        }));
        allOrders = [...allOrders, ...regularOrders];
        console.log(`✅ Found ${regularOrders.length} regular orders for payment verification history`);
      }
      
      // Process custom orders
      if (customOrdersResponse.data.success) {
        const customOrders = (customOrdersResponse.data.data || []).map(order => {
          console.log('Processing custom order:', order); // Debug log
          return {
            ...order,
            order_type: 'custom',
            // Map custom order fields to match the expected format
            order_number: order.custom_order_id,
            customer_name: order.payment_full_name || order.full_name,
            total_amount: order.payment_amount,
            gcash_reference_number: order.gcash_reference,
            payment_proof_image_path: order.payment_proof_filename ? `/uploads/payment-proofs/${order.payment_proof_filename}` : null,
            // payment_id is already correctly set by the backend query (cop.id as payment_id)
          };
        });
        allOrders = [...allOrders, ...customOrders];
        console.log(`✅ Found ${customOrders.length} custom orders for payment verification history`);
      }
      
      // For complete payment history, we'll also fetch confirmed orders that were previously verified
      try {
        const confirmedResponse = await api.get('/orders/confirmed').catch(() => ({ data: { success: false, data: [] } }));
        if (confirmedResponse.data.success) {
          const confirmedOrders = (confirmedResponse.data.data || [])
            .filter(order => order.payment_status === 'verified') // Only show previously verified payments
            .map(order => ({
              ...order,
              order_type: 'regular',
              payment_status: 'verified', // Mark as already verified for history
              verification_completed: true
            }));
          allOrders = [...allOrders, ...confirmedOrders];
          console.log(`✅ Added ${confirmedOrders.length} previously verified regular orders to payment history`);
        }
        
        const confirmedCustomResponse = await api.get('/custom-orders/confirmed').catch(() => ({ data: { success: false, data: [] } }));
        if (confirmedCustomResponse.data.success) {
          const confirmedCustomOrders = (confirmedCustomResponse.data.data || [])
            .filter(order => order.payment_status === 'verified') // Only show previously verified payments
            .map(order => ({
              ...order,
              order_type: 'custom',
              order_number: order.custom_order_id,
              customer_name: order.payment_full_name || order.full_name,
              total_amount: order.payment_amount,
              payment_status: 'verified', // Mark as already verified for history
              verification_completed: true
            }));
          allOrders = [...allOrders, ...confirmedCustomOrders];
          console.log(`✅ Added ${confirmedCustomOrders.length} previously verified custom orders to payment history`);
        }
      } catch (error) {
        console.warn('Could not fetch confirmed orders for payment history:', error);
      }
      
      // Remove duplicates based on order number and sort by date
      const uniqueOrders = [];
      const seenOrderNumbers = new Set();
      
      allOrders.forEach(order => {
        const orderNumber = order.order_number;
        if (!seenOrderNumbers.has(orderNumber)) {
          seenOrderNumbers.add(orderNumber);
          uniqueOrders.push(order);
        }
      });
      
      // Sort by date (newest first)
      const sortedOrders = uniqueOrders.sort((a, b) => new Date(b.created_at || b.date_created) - new Date(a.created_at || a.date_created));
      
      console.log(`✅ Total payment verification orders (all statuses): ${sortedOrders.length}`);
      setPendingVerificationOrders(sortedOrders);
      
    } catch (error) {
      console.error('❌ Error fetching payment verification orders:', error);
      
      // Check if it's a permission error (403) or server error (500)
      if (error.response?.status === 403) {
        console.log('ℹ️ User does not have permission to view payment verification orders (admin-only feature)');
        setPendingVerificationOrders([]); // Set empty array instead of showing error
      } else if (error.response?.status === 500) {
        console.error('Server error - the payment verification endpoint may need debugging');
        setPendingVerificationOrders([]); // Set empty array instead of showing error
      } else {
        toast.error('Failed to fetch payment verification orders');
        setPendingVerificationOrders([]); // Set empty array for any other error
      }
    } finally {
      setVerificationLoading(false);
    }
  }, []);

  // Approve payment
  const approvePayment = async (order) => {
    try {
      setProcessingPayment(true);
      console.log('Approving payment for order:', order);
      
      let response;
      if (order.order_type === 'custom') {
        // Use custom orders payment approval endpoint
        // The payment_id should be the numeric ID from custom_order_payments table
        const paymentId = order.payment_id;
        console.log('Approving custom order payment ID:', paymentId);
        
        if (!paymentId) {
          throw new Error('No payment ID found for custom order');
        }
        
        response = await api.put(`/custom-orders/admin/approve-payment/${paymentId}`);
      } else {
        // Use regular orders payment approval endpoint
        const orderId = order.order_number || order.id;
        console.log('Approving regular order:', orderId);
        
        if (!orderId) {
          throw new Error('No valid order ID found for regular order');
        }
        
        response = await api.put(`/orders/${orderId}/approve-payment`);
      }
      
      if (response.data.success) {
        console.log('✅ Payment approved successfully:', response.data);
        toast.success('Payment approved successfully! Order moved to confirmed status.');
        
        // Refresh the pending verification list
        fetchPendingVerificationOrders();
        
        // Also refresh the confirmed orders list if it's the active tab
        if (activeTab === 'orders') {
          fetchTransactions();
        }
      } else {
        console.error('❌ Failed to approve payment:', response.data);
        toast.error(response.data.message || 'Failed to approve payment');
      }
    } catch (error) {
      console.error('❌ Error approving payment:', error);
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Deny payment
  const denyPayment = async (order, reason) => {
    try {
      setProcessingPayment(true);
      console.log('Denying payment for order:', order);
      
      let response;
      if (order.order_type === 'custom') {
        // Use custom orders payment denial endpoint
        const paymentId = order.payment_id;
        console.log('Denying custom order payment ID:', paymentId);
        
        if (!paymentId) {
          throw new Error('No payment ID found for custom order');
        }
        
        response = await api.put(`/custom-orders/admin/deny-payment/${paymentId}`, {
          reason: reason || 'Payment verification failed'
        });
      } else {
        // Use regular orders payment denial endpoint
        const orderId = order.order_number || order.id;
        console.log('Denying regular order:', orderId);
        
        if (!orderId) {
          throw new Error('No valid order ID found for regular order');
        }
        
        response = await api.put(`/orders/${orderId}/deny-payment`, {
          reason: reason || 'Payment verification failed'
        });
      }
      
      if (response.data.success) {
        console.log('✅ Payment denied successfully:', response.data);
        toast.success('Payment denied successfully! Order cancelled and stock restored.');
        
        // Refresh the pending verification list
        fetchPendingVerificationOrders();
      } else {
        console.error('❌ Failed to deny payment:', response.data);
        toast.error(response.data.message || 'Failed to deny payment');
      }
    } catch (error) {
      console.error('❌ Error denying payment:', error);
      toast.error(error.response?.data?.message || 'Failed to deny payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  // View payment proof image
  const viewPaymentProof = (imagePath, customerName, orderNumber, gcashReference) => {
    console.log('🔍 Payment Proof Debug:', {
      imagePath,
      customerName,
      orderNumber,
      gcashReference
    });
    
    setSelectedPaymentProof({
      imagePath,
      customerName,
      orderNumber,
      gcashReference
    });
    setShowPaymentProofModal(true);
  };

  // Close payment proof modal
  const closePaymentProofModal = () => {
    setShowPaymentProofModal(false);
    setSelectedPaymentProof(null);
  };

  // View design images
  const viewDesignImages = (request) => {
    console.log('🎨 Viewing design images for request:', request.custom_order_id);
    console.log('🎨 Full request data structure:', request);
    
    // Based on CustomPage.js, images are stored in request.images array
    // Each image object should have a filename property
    let images = [];
    
    if (request.images && Array.isArray(request.images) && request.images.length > 0) {
      console.log('🎨 Found images array:', request.images);
      
      // Process images exactly like CustomPage.js does
      images = request.images.map((image, index) => {
        console.log(`🎨 Processing image ${index + 1}:`, image);
        
        // If image is an object with filename property (like in CustomPage.js)
        if (typeof image === 'object' && image.filename) {
          const imageUrl = `http://localhost:5000/uploads/custom-orders/${image.filename}`;
          console.log(`🎨 Created image URL: ${imageUrl}`);
          return imageUrl;
        }
        // If image is just a string (filename or path)
        else if (typeof image === 'string') {
          // Check if it's already a full URL
          if (image.startsWith('http')) {
            return image;
          }
          // Check if it's a path starting with /uploads/
          else if (image.startsWith('/uploads/')) {
            return `http://localhost:5000${image}`;
          }
          // Otherwise treat it as a filename
          else {
            const imageUrl = `http://localhost:5000/uploads/custom-orders/${image}`;
            console.log(`🎨 Created image URL from string: ${imageUrl}`);
            return imageUrl;
          }
        }
        // Fallback - convert to string and treat as filename
        else {
          const filename = String(image);
          const imageUrl = `http://localhost:5000/uploads/custom-orders/${filename}`;
          console.log(`🎨 Created fallback image URL: ${imageUrl}`);
          return imageUrl;
        }
      });
    }
    // Fallback: check other possible field names if images array is empty
    else {
      console.log('🎨 No images array found, checking other fields...');
      console.log('🎨 Available fields:', Object.keys(request));
      
      // Try other field names that might contain images
      const imageFields = ['image_urls', 'design_images', 'image_paths', 'uploaded_images'];
      
      for (const field of imageFields) {
        if (request[field]) {
          console.log(`🎨 Found ${field}:`, request[field]);
          
          if (Array.isArray(request[field]) && request[field].length > 0) {
            images = request[field].map(img => {
              if (typeof img === 'string') {
                if (img.startsWith('http')) return img;
                if (img.startsWith('/uploads/')) return `http://localhost:5000${img}`;
                return `http://localhost:5000/uploads/custom-orders/${img}`;
              }
              return String(img);
            });
            break;
          }
        }
      }
    }
    
    console.log('🎨 Final processed images:', images);
    
    setSelectedDesignImages({
      customerName: request.customer_name,
      orderNumber: request.custom_order_id || request.order_number,
      productType: request.product_type,
      designNotes: request.design_notes || request.special_instructions,
      images: images || []
    });
    setShowDesignImagesModal(true);
  };

  // Close design images modal
  const closeDesignImagesModal = () => {
    setShowDesignImagesModal(false);
    setSelectedDesignImages(null);
  };

  // Get delivery status display text and color
  const getDeliveryStatusInfo = (status) => {
    const statusMap = {
      'pending': { text: 'Pending', color: '#6c757d' },
      'scheduled': { text: 'Scheduled', color: '#0d6efd' },
      'in_transit': { text: 'In Transit', color: '#fd7e14' },
      'delivered': { text: 'Delivered', color: '#198754' },
      'order received': { text: 'Order Received', color: '#28a745' },
      'delayed': { text: 'Delayed', color: '#dc3545' },
      'cancelled': { text: 'Cancelled', color: '#6c757d' }
    };
    return statusMap[status?.toLowerCase()] || { text: status || 'Unknown', color: '#6c757d' };
  };
  
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchCancellationRequests();
  }, [fetchCancellationRequests]);

  useEffect(() => {
    if (activeTab === 'verify-payment') {
      fetchPendingVerificationOrders();
    }
  }, [activeTab, fetchPendingVerificationOrders]);

  useEffect(() => {
    if (activeTab === 'design-requests') {
      fetchCustomDesignRequests();
    }
  }, [activeTab, fetchCustomDesignRequests]);

  useEffect(() => {
    if (activeTab === 'refund-requests') {
      fetchRefundRequests();
    }
  }, [activeTab, fetchRefundRequests]);

  // View transaction details
  const viewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // First check if transaction exists and is not null
    if (!transaction) {
      return false;
    }
    
    // Filter out blank/invalid orders - must have order_number and customer info
    const hasValidOrderNumber = transaction.order_number && 
                               transaction.order_number !== 'null' && 
                               transaction.order_number !== 'undefined' &&
                               transaction.order_number.trim() !== '';
    
    const hasValidCustomer = (transaction.customer_name || transaction.first_name || transaction.user_email || transaction.customer_email) &&
                            (transaction.customer_name !== 'null' || transaction.first_name !== 'null' || transaction.user_email !== 'null' || transaction.customer_email !== 'null');
    
    if (!hasValidOrderNumber || !hasValidCustomer) {
      return false;
    }
    
    const matchesSearch = transaction.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const transactionStatus = transaction.status || 'pending';
    const matchesStatus = statusFilter === 'all' || transactionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'No Date';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid Date';
    }
  };

  // Get display status
  const getDisplayStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'order received': 'Order Received',
      'cancelled': 'Cancelled'
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const TableWrapper = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  overflow-x: auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  /* Custom scrollbar for better UX */
  &::-webkit-scrollbar {
    height: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #c1c1c1, #a1a1a1);
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, #a1a1a1, #888);
  }
  
  /* Ensure smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 1200px) {
    width: 100%;
    /* Add a subtle scroll indicator */
    position: relative;
    
    &:after {
      content: "← Scroll horizontally for more details →";
      position: absolute;
      bottom: 12px;
      right: 20px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      pointer-events: none;
      opacity: 0.9;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
  
  @media (max-width: 768px) {
    border-radius: 12px;
    &:after {
      display: none;
    }
  }
`;

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faReceipt} />
            Transaction Management
          </Title>
          <Subtitle>
            View all confirmed orders from all customers
          </Subtitle>
        </Header>
          {/* Tabs */}
        <TabsContainer>
          <Tab 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
          >
            All Confirmed Orders
          </Tab>
          <Tab 
            active={activeTab === 'verify-payment'} 
            onClick={() => setActiveTab('verify-payment')}
          >
            Verify Payment
          </Tab>
          <Tab 
            active={activeTab === 'cancellations'} 
            onClick={() => setActiveTab('cancellations')}
          >
            Cancellation Requests
          </Tab>

          <Tab 
            active={activeTab === 'design-requests'} 
            onClick={() => setActiveTab('design-requests')}
          >
            Custom Design Requests
          </Tab>
          <Tab 
            active={activeTab === 'refund-requests'} 
            onClick={() => setActiveTab('refund-requests')}
          >
            Refund Requests
          </Tab>
        </TabsContainer>
        
        {activeTab === 'orders' && (
          <>
            {/* Debug Info - Shows ALL users */}

            {/* Controls */}
            <ControlsSection>
          <ControlsGrid>
            <SearchContainer>
              <SearchIcon icon={faSearch} />
              <SearchInput
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >              <option value="all">All Confirmed Orders</option>
              <option value="confirmed">Ready For Delivery</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="Order Received">Order Received</option>
            </FilterSelect>
              <RefreshButton onClick={fetchTransactions} disabled={loading}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </RefreshButton>
          </ControlsGrid>
        </ControlsSection>        {/* Transactions Table */}
        <TableWrapper>
          <TransactionsTable>
            <TableHeader>
              <div></div>
              <div>Order #</div>
              <div>Date</div>
              <div>Customer</div>
              <div>Products</div>
              <div>Amount</div>
              <div>Payment</div>
              <div>Status</div>
              <div>Delivery</div>
              <div>Created</div>
              <div>Actions</div>
            </TableHeader>
          
          {loading ? (
            <LoadingContainer>
              <FontAwesomeIcon icon={faInfoCircle} size="2x" color="#ddd" />              <p>Loading confirmed orders...</p>
            </LoadingContainer>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState>
              <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />
              <h3>No confirmed orders found</h3>
              <p>No confirmed orders match your current filters.</p>
            </EmptyState>
          ) : (
            filteredTransactions.map((transaction, transactionIndex) => {
              // Safety check to ensure transaction is not null
              if (!transaction) {
                console.warn('Null transaction found at index:', transactionIndex);
                return null;
              }
              
              const transactionId = transaction.transaction_id || transaction.id;
              const uniqueKey = `transaction-${transactionId}-${transactionIndex}-${transaction.order_number || 'no-order'}`;
              const isExpanded = expandedRows.has(transactionId);
              
              return (
                <React.Fragment key={uniqueKey}>
                  <TableRow 
                    onClick={() => toggleRowExpansion(transactionId)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Expand/Collapse Button */}
                    <ExpandToggleButton
                      className={isExpanded ? 'expanded' : ''}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(transactionId);
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={faChevronDown} 
                        style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </ExpandToggleButton>

                    <OrderNumber>
                      {transaction.order_number || 
                       transaction.order_id || 
                       transaction.transaction_id || 
                       `${transaction.order_type === 'custom' ? 'CUSTOM' : 'ORD'}-${transaction.id}` || 
                       'N/A'}
                    </OrderNumber>
                    
                    <DateInfo>
                      {(() => {
                        const orderDate = transaction.order_date || transaction.created_at || transaction.date_created;
                        return formatDate(orderDate);
                      })()}
                    </DateInfo>
                    
                    <CustomerInfo>
                      <div className="name">{safeDisplayValue(transaction.customer_name || (transaction.first_name && transaction.last_name ? `${transaction.first_name} ${transaction.last_name}` : ''), 'Unknown Customer')}</div>
                      <div className="separator">•</div>
                      <div className="email">{safeDisplayValue(transaction.customer_email || transaction.user_email, 'No Email')}</div>
                    </CustomerInfo>

                    {/* Products Summary */}
                    <div style={{ 
                      fontSize: '14px',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}>
                      {transaction.items && transaction.items.length > 0 ? (
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '8px',
                            padding: '6px 8px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                          }}>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#000000',
                              fontSize: '13px'
                            }}>
                              {transaction.items.length} item{transaction.items.length > 1 ? 's' : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {transaction.items.slice(0, 1).map((item, index) => (
                              <div key={`${transactionId}-item-${index}`} style={{ 
                                fontSize: '12px',
                                color: '#555555',
                                lineHeight: '1.4',
                                padding: '8px 10px',
                                border: '1px solid #e9ecef',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontWeight: '600', 
                                    color: '#000000',
                                    marginBottom: '3px',
                                    fontSize: '13px'
                                  }}>
                                    {item.productname || 'Unknown Product'}
                                  </div>
                                  {(item.productcolor || item.product_type) && (
                                    <div style={{ 
                                      fontSize: '11px', 
                                      color: '#666666',
                                      display: 'flex',
                                      gap: '8px',
                                      flexWrap: 'wrap'
                                    }}>
                                      {item.productcolor && (
                                        <span style={{ 
                                          backgroundColor: '#f1f3f4', 
                                          padding: '2px 6px', 
                                          borderRadius: '3px',
                                                                                   fontWeight: '500'
                                        }}>
                                          {item.productcolor}
                                        </span>
                                      )}
                                      {item.product_type && (
                                        <span style={{ 
                                          backgroundColor: '#e8f0fe', 
                                          padding: '2px 6px', 
                                          borderRadius: '3px',
                                          fontWeight: '500'
                                        }}>
                                          {item.product_type}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  fontWeight: '600',
                                  color: '#000000',
                                  backgroundColor: '#f8f9fa',
                                  padding: '3px 6px',
                                  borderRadius: '3px',
                                  marginLeft: '8px'
                                }}>
                                  ×{item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>
                          {transaction.items.length > 1 && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#666666',
                              fontStyle: 'italic',
                              textAlign: 'center',
                              marginTop: '6px',
                              padding: '4px'
                            }}>
                              +{transaction.items.length - 1} more item{transaction.items.length - 1 > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#999999', 
                          fontSize: '12px',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          padding: '8px'
                        }}>
                          No items found
                        </div>
                      )}
                    </div>
                    
                    <OrderDetails>
                      <div className="amount">{formatCurrency(transaction.amount || transaction.total_amount || transaction.invoice_total)}</div>
                    </OrderDetails>
                    
                    <div>
                      {transaction.payment_method || 'GCash'}
                      {/* Add payment verification indicator */}
                      {transaction.payment_status === 'verified' && (
                        <div style={{
                          marginTop: '4px',
                          padding: '2px 6px',
                          background: 'linear-gradient(135deg, #28a745, #20c997)',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '9px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                          PAID
                        </div>
                      )}
                      {(transaction.order_status === 'confirmed' || transaction.transaction_status === 'confirmed') && !transaction.payment_status && (
                        <div style={{
                          marginTop: '4px',
                          padding: '2px 6px',
                          background: 'linear-gradient(135deg, #28a745, #20c997)',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '9px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                          VERIFIED
                        </div>
                      )}
                    </div>
                    
                    <StatusBadge status={transaction.transaction_status || transaction.order_status}>
                      {getDisplayStatus(transaction.transaction_status || transaction.order_status)}
                    </StatusBadge>
                    
                    {/* Delivery Status Column - Read Only */}
                    <div>
                      <DeliveryStatusBadge status={transaction.delivery_status || 'pending'}>
                        {getDeliveryStatusInfo(transaction.delivery_status || 'pending').text}
                      </DeliveryStatusBadge>
                    </div>
                    
                    <DateInfo>
                      {(() => {
                        const createdDate = transaction.created_at || transaction.order_date || transaction.date_created;
                        return formatDate(createdDate);
                      })()}
                    </DateInfo>
                    
                    <ActionsContainer>
                      <ActionButton
                        variant="view"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewTransaction(transaction);
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </ActionButton>
                    </ActionsContainer>
                  </TableRow>

                  {/* Expanded Row Content */}
                  {isExpanded && (
                    <ExpandedRowContainer>
                      <ExpandedContent>
                        {/* Debug: Log transaction data structure */}
                        {console.log('🔍 Transaction data for debugging N/A fields:', {
                          order_id: transaction.transaction_id || transaction.id,
                          customer_phone: transaction.customer_phone,
                          contact_phone: transaction.contact_phone,
                          city_municipality: transaction.city_municipality,
                          shipping_city: transaction.shipping_city,
                          city: transaction.city,
                          province: transaction.province,
                          shipping_province: transaction.shipping_province,
                          zip_code: transaction.zip_code,
                          postal_code: transaction.postal_code,
                          shipping_postal_code: transaction.shipping_postal_code,
                          street_address: transaction.street_address,
                          shipping_address: transaction.shipping_address,
                          full_transaction: transaction
                        })}
                        
                        {/* Customer Information */}
                        <InfoSection>
                          <h4>Customer Information</h4>
                          <HorizontalCustomerInfo>
                            <div className="customer-field">
                              <span className="label">Name:</span>
                              <span className="value">{safeDisplayValue(transaction.customer_name || (transaction.first_name && transaction.last_name ? `${transaction.first_name} ${transaction.last_name}` : ''), 'Unknown Customer')}</span>
                            </div>
                            <span className="separator">•</span>
                            <div className="customer-field">
                              <span className="label">Email:</span>
                              <span className="value">{safeDisplayValue(transaction.customer_email || transaction.user_email, 'No Email')}</span>
                            </div>
                            <span className="separator">•</span>
                            <div className="customer-field">
                              <span className="label">Phone:</span>
                              <span className="value">{safeDisplayValue(formatPhone(transaction.contact_phone || transaction.customer_phone), 'No Phone')}</span>
                            </div>
                          </HorizontalCustomerInfo>
                        </InfoSection>

                        {/* Shipping Address */}
                        <InfoSection>
                          <h4>Shipping Address</h4>
                          <InfoItem>
                            <span className="label">Address:</span>
                            <span className="value">{safeDisplayValue(transaction.shipping_address || transaction.street_address, 'No Address')}</span>
                          </InfoItem>
                          {(transaction.city_municipality || transaction.city || transaction.shipping_city) && (
                            <InfoItem>
                              <span className="label">City:</span>
                              <span className="value">{safeDisplayValue(transaction.city_municipality || transaction.city || transaction.shipping_city, 'No City')}</span>
                            </InfoItem>
                          )}
                          {(transaction.province || transaction.shipping_province) && (
                            <InfoItem>
                              <span className="label">Area:</span>
                              <span className="value">{safeDisplayValue(transaction.province || transaction.shipping_province, 'No Province')}</span>
                            </InfoItem>
                          )}
                          {(transaction.zip_code || transaction.postalCode || transaction.postal_code || transaction.shipping_postal_code) && (
                            <InfoItem>
                              <span className="label">Postal Code:</span>
                              <span className="value">{safeDisplayValue(transaction.zip_code || transaction.postalCode || transaction.postal_code || transaction.shipping_postal_code, 'No Postal Code')}</span>
                            </InfoItem>
                          )}
                          {(transaction.contact_phone || transaction.shipping_phone || transaction.customer_phone) && (
                            <InfoItem>
                              <span className="label">Contact Phone:</span>
                              <span className="value">{safeDisplayValue(formatPhone(transaction.contact_phone || transaction.shipping_phone || transaction.customer_phone), 'No Phone')}</span>
                            </InfoItem>
                          )}
                        </InfoSection>

                        {/* Order Details */}
                        <InfoSection>
                          <h4>Order Details</h4>
                          <InfoItem>
                            <span className="label">Total Amount:</span>
                            <span className="value">{formatCurrency(transaction.amount || transaction.total_amount || transaction.invoice_total)}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">Payment Method:</span>
                            <span className="value">{transaction.payment_method || 'GCash'}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">Order Status:</span>
                            <span className="value">{getDisplayStatus(transaction.transaction_status || transaction.order_status)}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">Delivery Status:</span>
                            <span className="value">
                              <DeliveryStatusBadge status={transaction.delivery_status || 'pending'}>
                                {getDeliveryStatusInfo(transaction.delivery_status || 'pending').text}
                              </DeliveryStatusBadge>
                            </span>
                          </InfoItem>
                          {(transaction.courier_name || transaction.courier_phone) && (
                            <InfoItem>
                              <span className="label">Assigned Courier:</span>
                              <span className="value">
                                {(() => {
                                  const courierName = transaction.courier_name || 'Unknown';
                                  const courierPhone = transaction.courier_phone || '';
                                  return courierPhone ? `${courierName} (${courierPhone})` : courierName;
                                })()}
                              </span>
                            </InfoItem>
                          )}
                        </InfoSection>

                        {/* Order Items - Now in grid */}
                        <InfoSection>
                          <h4>Order Items ({transaction.items ? transaction.items.length : 0})</h4>
                          {transaction.items && transaction.items.length > 0 ? (
                            <OrderItemsList>
                              {transaction.items.map((item, index) => (
                                <OrderItemCard key={`modal-${(selectedTransaction?.transaction_id || selectedTransaction?.id || 'unknown')}-item-${index}`}>
                                  <OrderItemImage>
                                    {item.productimage ? (
                                      <img
                                        src={`http://localhost:5000/uploads/${item.productimage}`}
                                        alt={item.productname}
                                        onError={(e) => {
                                          if (e.target) {
                                            e.target.style.display = 'none';
                                          }
                                        }}
                                      />
                                    ) : (
                                      <FontAwesomeIcon icon={faImage} />
                                    )}
                                  </OrderItemImage>
                                  <OrderItemDetails>
                                    <h5>{item.productname || item.product_name || 'Unknown Product'}</h5>
                                    <div className="item-meta">
                                      {item.color && <span>Color: {item.color}</span>}
                                      {item.size && <span>Size: {item.size}</span>}
                                      <span>Qty: <strong>{item.quantity}</strong></span>
                                    </div>
                                    <div className="item-price">₱{parseFloat(item.product_price || item.price || 0).toFixed(2)}</div>
                                  </OrderItemDetails>
                                </OrderItemCard>
                              ))}
                            </OrderItemsList>
                          ) : (
                            <div style={{ 
                              color: '#999999', 
                              fontSize: '14px',
                              fontStyle: 'italic',
                              textAlign: 'center',
                              padding: '20px'
                            }}>
                              No items found
                            </div>
                          )}
                        </InfoSection>
                      </ExpandedContent>
                    </ExpandedRowContainer>
                  )}
                </React.Fragment>
              );
            })
          )}
          </TransactionsTable>
        </TableWrapper>
          </>
        )}
        
        {/* Verify Payment Tab */}
        {activeTab === 'verify-payment' && (
          <>
            {/* Controls */}
            <ControlsSection>
              <ControlsGrid>
                <SearchContainer>
                  <SearchIcon icon={faSearch} />
                  <SearchInput
                    type="text"
                    placeholder="Search payment history by order number, customer name, or GCash reference..."
                    value={verificationSearchTerm}
                    onChange={(e) => setVerificationSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                <FilterSelect
                  value={verificationStatusFilter}
                  onChange={(e) => setVerificationStatusFilter(e.target.value)}
                >
                  <option value="all">All Payment History</option>
                  <option value="pending">Pending Verification</option>
                  <option value="verified">Verified Payments</option>
                  <option value="rejected">Rejected Payments</option>
                  <option value="regular">Regular Orders Only</option>
                  <option value="custom">Custom Orders Only</option>
                </FilterSelect>
                <RefreshButton onClick={fetchPendingVerificationOrders} disabled={verificationLoading}>
                  <FontAwesomeIcon icon={faRefresh} />
                  {verificationLoading ? 'Loading...' : 'Refresh'}
                </RefreshButton>
              </ControlsGrid>
            </ControlsSection>

            {/* Payment Verification Table */}
            <TableWrapper>
              <TransactionsTable>
                <TableHeader>
                  <div></div>
                  <div>Order #</div>
                  <div>Date</div>
                  <div>Customer</div>
                  <div>Products</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Payment</div>
                  <div>Delivery</div>
                  <div>Created</div>
                  <div>Actions</div>
                </TableHeader>
                
                {verificationLoading ? (
                  <PaymentVerificationTableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                      Loading payment verification history...
                    </div>
                  </PaymentVerificationTableRow>
                ) : pendingVerificationOrders.length === 0 ? (
                  <PaymentVerificationTableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
                      No payment verification history found.
                    </div>
                  </PaymentVerificationTableRow>
                ) : (
                  pendingVerificationOrders
                    .filter(order => {
                      // Search filter
                      const searchLower = verificationSearchTerm.toLowerCase();
                      const matchesSearch = !verificationSearchTerm || 
                             order.order_number?.toLowerCase().includes(searchLower) ||
                             order.customer_name?.toLowerCase().includes(searchLower) ||
                             order.customer_fullname?.toLowerCase().includes(searchLower) ||
                             `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchLower) ||
                             order.user_email?.toLowerCase().includes(searchLower) ||
                             order.gcash_reference_number?.toLowerCase().includes(searchLower) ||
                             order.gcash_reference?.toLowerCase().includes(searchLower) ||
                             order.payment_reference?.toLowerCase().includes(searchLower) ||
                             (order.items && order.items[0] && order.items[0].gcash_reference_number?.toLowerCase().includes(searchLower));
                      
                      // Status filter
                      const matchesStatus = (() => {
                        switch (verificationStatusFilter) {
                          case 'all':
                            return true;
                          case 'pending':
                            return !order.payment_status || order.payment_status === 'pending';
                          case 'verified':
                            return order.payment_status === 'verified' || order.verification_completed;
                          case 'rejected':
                            return order.payment_status === 'rejected' || order.payment_status === 'denied';
                          case 'regular':
                            return order.order_type === 'regular' || !order.order_type;
                          case 'custom':
                            return order.order_type === 'custom';
                          default:
                            return true;
                        }
                      })();
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map((order, index) => {
                      // Create a unique identifier for this verification row - use a stable unique key
                      const orderId = order.order_id || order.payment_id || order.order_number || `verification-row-${index}`;
                      const uniqueKey = `verification-${orderId}-${index}`;
                      const isExpanded = expandedVerificationRows.has(uniqueKey);
                      
                      return (
                        <React.Fragment key={uniqueKey}>
                          <PaymentVerificationTableRow
                            onClick={() => {
                              console.log('🔄 Row clicked, toggling verification row:', uniqueKey);
                              toggleVerificationRowExpansion(uniqueKey);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Expand/Collapse Button */}
                            <ExpandToggleButton
                              className={isExpanded ? 'expanded' : ''}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔄 Button clicked, toggling verification row:', uniqueKey);
                                toggleVerificationRowExpansion(uniqueKey);
                              }}
                            >
                              <FontAwesomeIcon 
                                icon={faChevronDown} 
                                style={{ 
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                              />
                            </ExpandToggleButton>
                            
                            {/* Order # with type badge */}
                            <div>
                              <OrderNumber>
                                {order.order_number || 
                                 order.order_id || 
                                 order.transaction_id || 
                                 `${order.order_type === 'custom' ? 'CUSTOM' : 'ORD'}-${order.id}` || 
                                 'N/A'}
                              </OrderNumber>
                              <div style={{ marginTop: '2px' }}>
                                <span style={{ 
                                  background: order.order_type === 'custom' ? '#e3f2fd' : '#fff3e0',
                                  color: order.order_type === 'custom' ? '#1976d2' : '#f57c00',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  textTransform: 'uppercase'
                                }}>
                                  {order.order_type === 'custom' ? 'Custom' : 'Regular'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Date */}
                            <DateInfo>
                              {formatDate(order.order_date || order.created_at)}
                            </DateInfo>
                            
                            <div>
                              <CustomerInfo>
                                <div className="name">
                                  {order.customer_name || order.customer_fullname || `${order.first_name} ${order.last_name}`}
                                </div>
                                <div className="separator">•</div>
                                <div className="email">{order.user_email || order.contact_number}</div>
                              </CustomerInfo>
                            </div>
                            
                            <div>
                              {order.order_type === 'custom' ? (
                                <div>
                                  <div style={{ 
                                    fontSize: '11px', 
                                    fontWeight: '500',
                                    marginBottom: '2px' 
                                  }}>
                                    Custom {order.product_type || 'Product'}
                                  </div>
                                  <div style={{ 
                                    fontSize: '9px', 
                                    color: '#666666',
                                    fontStyle: 'italic',
                                    lineHeight: '1.2'
                                  }}>
                                    {order.size && `Size: ${order.size}`}
                                    {order.color && ` • Color: ${order.color}`}
                                    {order.quantity && ` • Qty: ${order.quantity}`}
                                  </div>
                                </div>
                              ) : order.items && order.items.length > 0 ? (
                                <div>
                                  <div style={{ 
                                    fontSize: '11px', 
                                    fontWeight: '500',
                                    marginBottom: '2px' 
                                  }}>
                                    {order.items[0].productname}
                                  </div>
                                  {order.items.length > 1 && (
                                    <div style={{ 
                                      fontSize: '9px', 
                                      color: '#666666',
                                      fontStyle: 'italic'
                                    }}>
                                      +{order.items.length - 1} more item{order.items.length - 1 > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{
                                  color: '#999999', 
                                  fontSize: '12px',
                                  fontStyle: 'italic' 
                                }}>
                                  No items
                                </div>
                              )}
                            </div>
                            
                            <OrderDetails>
                              <div className="amount">{formatCurrency(order.total_amount)}</div>
                            </OrderDetails>
                            
                            {/* Payment Status */}
                            <div>
                              <span style={{ 
                                background: order.payment_status === 'verified' || order.verification_completed 
                                  ? '#d4edda' 
                                  : order.payment_status === 'rejected' 
                                    ? '#f8d7da' 
                                    : '#fff3cd',
                                color: order.payment_status === 'verified' || order.verification_completed 
                                  ? '#155724' 
                                  : order.payment_status === 'rejected' 
                                    ? '#721c24' 
                                    : '#856404',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '500',
                                textTransform: 'uppercase'
                              }}>
                                {order.payment_status === 'verified' || order.verification_completed 
                                  ? 'Verified' 
                                  : order.payment_status === 'rejected' 
                                    ? 'Rejected' 
                                    : 'Pending'}
                              </span>
                              {(() => {
                                // Try multiple possible GCash reference fields
                                const gcashRef = order.gcash_reference_number || 
                                               order.gcash_reference || 
                                               order.payment_reference ||
                                               (order.items && order.items[0] && order.items[0].gcash_reference_number) ||
                                               null;
                                return gcashRef ? (
                                  <div style={{ 
                                    fontSize: '9px', 
                                    color: '#666666',
                                    marginTop: '2px',
                                    fontFamily: 'monospace'
                                  }}>
                                    GCash: {gcashRef}
                                  </div>
                                ) : null;
                              })()}
                            </div>

                            {/* Payment Proof */}
                            <div>
                              {(order.payment_status === 'verified' || order.verification_completed) ? (
                                <ActionButton
                                  variant="view"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('🔍 Order data for payment proof:', {
                                      payment_proof_image_path: order.payment_proof_image_path,
                                      payment_proof_filename: order.payment_proof_filename,
                                      payment_proof: order.payment_proof,
                                      gcash_reference_number: order.gcash_reference_number,
                                      gcash_reference: order.gcash_reference,
                                      customer_name: order.customer_name,
                                      order_number: order.order_number
                                    });
                                    
                                    // Try multiple possible image path fields
                                    const imagePath = order.payment_proof_image_path || 
                                                    order.payment_proof_filename || 
                                                    order.payment_proof ||
                                                    (order.payment_proof_filename ? `/uploads/payment-proofs/${order.payment_proof_filename}` : null);
                                    
                                    // Try multiple possible GCash reference fields
                                    const gcashRef = order.gcash_reference_number || 
                                                   order.gcash_reference || 
                                                   order.payment_reference ||
                                                   (order.items && order.items[0] && order.items[0].gcash_reference_number) ||
                                                   null;
                                    
                                    viewPaymentProof(
                                      imagePath, 
                                      order.customer_name, 
                                      order.order_number, 
                                      gcashRef
                                    );
                                  }}
                                >
                                  <FontAwesomeIcon icon={faImage} style={{ marginRight: '4px' }} />
                                  Proof
                                </ActionButton>
                              ) : (
                                <span style={{ color: '#999', fontSize: '12px' }}>
                                  No proof available
                                </span>
                              )}
                            </div>

                            {/* Delivery Status */}
                            <div>
                              <DeliveryStatusBadge status={order.delivery_status || 'pending'}>
                                {order.delivery_status || 'pending'}
                              </DeliveryStatusBadge>
                            </div>

                            {/* Created Date */}
                            <DateInfo>
                              {(() => {
                                // Try multiple possible date fields
                                const createdDate = order.created_at || order.order_date || order.date_created || order.payment_date;
                                return formatDate(createdDate);
                              })()}
                            </DateInfo>
                            
                            <ActionsContainer className="stacked">
                              {order.payment_status === 'verified' || order.verification_completed ? (
                                // Already verified - no actions needed
                                <div className="button-full" style={{ color: '#28a745', fontWeight: '500' }}>
                                  ✓ Verified
                                </div>
                              ) : order.payment_status === 'rejected' ? (
                                // Rejected - no actions needed
                                <div className="button-full" style={{ color: '#dc3545', fontWeight: '500' }}>
                                  ✗ Rejected
                                </div>
                              ) : (
                                // Pending - show approve/deny buttons
                                <>
                                  <div className="button-row">
                                    <ActionButton
                                      variant="approve"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        approvePayment(order);
                                      }}
                                      disabled={processingPayment}
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                      {processingPayment ? 'Processing...' : 'Approve'}
                                    </ActionButton>
                                    <ActionButton
                                      variant="reject"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        denyPayment(order);
                                      }}
                                      disabled={processingPayment}
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                      {processingPayment ? 'Processing...' : 'Deny'}
                                    </ActionButton>
                                  </div>
                                </>
                              )}
                            </ActionsContainer>
                          </PaymentVerificationTableRow>

                          {/* Expanded Row Content */}
                          {isExpanded && (
                            <ExpandedRowContainer>
                              <ExpandedContent>
                                {/* Customer Information */}
                                <InfoSection>
                                  <h4>Customer Information</h4>
                                  <HorizontalCustomerInfo>
                                    <div className="customer-field">
                                      <span className="label">Name:</span>
                                      <span className="value">{safeDisplayValue(order.customer_name || order.customer_fullname || (order.first_name && order.last_name ? `${order.first_name} ${order.last_name}` : ''), 'Unknown Customer')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Email:</span>
                                      <span className="value">{safeDisplayValue(order.user_email || order.contact_email, 'No Email')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Phone:</span>
                                      <span className="value">{safeDisplayValue(formatPhone(order.contact_phone || order.customer_phone), 'No Phone')}</span>
                                    </div>
                                  </HorizontalCustomerInfo>
                                </InfoSection>

                                {/* Payment Information */}
                                <InfoSection>
                                  <h4>Payment Information</h4>
                                  <InfoItem>
                                    <span className="label">Total Amount:</span>
                                    <span className="value">{formatCurrency(order.total_amount)}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Payment Method:</span>
                                    <span className="value">GCash</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">GCash Reference:</span>
                                    <span className="value">
                                      {safeDisplayValue(order.gcash_reference_number || 
                                       order.gcash_reference || 
                                       order.payment_reference ||
                                       (order.items && order.items[0] && order.items[0].gcash_reference_number), 'No Reference')}
                                    </span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Payment Status:</span>
                                    <span className="value">
                                      {order.payment_status === 'verified' || order.verification_completed 
                                        ? 'Verified' 
                                        : order.payment_status === 'rejected' 
                                          ? 'Rejected' 
                                          : 'Pending Verification'}
                                    </span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Payment Proof:</span>
                                    <span className="value">
                                      {(order.payment_status === 'verified' || order.verification_completed) ? (
                                        <ActionButton
                                          variant="view"
                                          size="small"
                                          onClick={() => {
                                            // Try multiple possible image path fields
                                            const imagePath = order.payment_proof_image_path || 
                                                            order.payment_proof_filename || 
                                                            order.payment_proof ||
                                                            (order.payment_proof_filename ? `/uploads/payment-proofs/${order.payment_proof_filename}` : null);
                                            
                                            // Try multiple possible GCash reference fields
                                            const gcashRef = order.gcash_reference_number || 
                                                           order.gcash_reference || 
                                                           order.payment_reference ||
                                                           (order.items && order.items[0] && order.items[0].gcash_reference_number) ||
                                                           null;
                                            
                                            viewPaymentProof(imagePath, order.customer_name, order.order_number, gcashRef);
                                          }}
                                        >
                                          <FontAwesomeIcon icon={faImage} style={{ marginRight: '4px' }} />
                                          View Payment Proof
                                        </ActionButton>
                                      ) : (
                                        <span style={{ color: '#999', fontSize: '12px' }}>
                                          No proof available
                                        </span>
                                      )}
                                    </span>
                                  </InfoItem>
                                </InfoSection>

                                {/* Order Items */}
                                <InfoSection>
                                  <h4>Order Items ({order.items ? order.items.length : 0})</h4>
                                  {order.items && order.items.length > 0 ? (
                                    <OrderItemsList>
                                      {order.items.map((item, index) => (
                                        <OrderItemCard key={index}>
                                          <OrderItemImage>
                                            {item.productimage ? (
                                              <img 
                                                src={(() => {
                                                  const imagePath = item.productimage;
                                                  if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
                                                    return `http://localhost:5000/uploads/default-product.png`;
                                                  }
                                                  if (imagePath.startsWith('http')) {
                                                    return imagePath;
                                                  }
                                                  if (imagePath.startsWith('/uploads/')) {
                                                    return `http://localhost:5000${imagePath}`;
                                                  }
                                                  return `http://localhost:5000/uploads/${imagePath}`;
                                                })()}
                                                alt={item.productname}
                                                onError={(e) => {
                                                  e.target.src = `http://localhost:5000/uploads/default-product.png`;
                                                }}
                                              />
                                            ) : (
                                              <FontAwesomeIcon icon={faImage} />
                                            )}
                                          </OrderItemImage>
                                          <OrderItemDetails>
                                            <div className="item-name">{item.productname || 'Unknown Product'}</div>
                                            <div className="item-specs">
                                              {item.productcolor && <span className="spec">Color: {item.productcolor}</span>}
                                              {item.size && <span className="spec">Size: {item.size}</span>}
                                              {item.product_type && <span className="spec">Type: {item.product_type}</span>}
                                            </div>
                                            <div className="item-quantity">Quantity: {item.quantity}</div>
                                            <div className="item-price">Price: {formatCurrency(item.product_price || item.price)}</div>
                                            <div className="item-subtotal">Subtotal: {formatCurrency(item.subtotal || (item.quantity * (item.product_price || item.price)))}</div>
                                          </OrderItemDetails>
                                        </OrderItemCard>
                                      ))}
                                    </OrderItemsList>
                                  ) : order.order_type === 'custom' ? (
                                    <OrderItemsList>
                                      <OrderItemCard>
                                        <OrderItemImage>
                                          {order.image_paths && order.image_paths.length > 0 ? (
                                            <img 
                                              src={(() => {
                                                const imagePath = order.image_paths[0];
                                                if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
                                                  return `http://localhost:5000/uploads/default-product.png`;
                                                }
                                                if (imagePath.startsWith('http')) {
                                                  return imagePath;
                                                }
                                                if (imagePath.startsWith('/uploads/')) {
                                                  return `http://localhost:5000${imagePath}`;
                                                }
                                                return `http://localhost:5000/uploads/${imagePath}`;
                                              })()}
                                              alt="Custom Product"
                                              onError={(e) => {
                                                e.target.src = `http://localhost:5000/uploads/default-product.png`;
                                              }}
                                            />
                                          ) : (
                                            <FontAwesomeIcon icon={faImage} />
                                          )}
                                        </OrderItemImage>
                                        <OrderItemDetails>
                                          <div className="item-name">Custom {order.product_type || 'Product'}</div>
                                          <div className="item-specs">
                                            {order.color && <span className="spec">Color: {order.color}</span>}
                                            {order.size && <span className="spec">Size: {order.size}</span>}
                                          </div>
                                          <div className="item-quantity">Quantity: {order.quantity || 1}</div>
                                          <div className="item-price">Price: {formatCurrency(order.total_amount)}</div>
                                        </OrderItemDetails>
                                      </OrderItemCard>
                                    </OrderItemsList>
                                  ) : (
                                    <div style={{ 
                                      color: '#999999', 
                                      fontSize: '14px',
                                      fontStyle: 'italic',
                                      textAlign: 'center',
                                      padding: '20px'
                                    }}>
                                      No items found for this order
                                    </div>
                                  )}
                                </InfoSection>

                                {/* Shipping Information */}
                                {(order.shipping_address || order.street_address) && (
                                  <InfoSection>
                                    <h4>Shipping Information</h4>
                                    <InfoItem>
                                      <span className="label">Address:</span>
                                      <span className="value">{safeDisplayValue(order.shipping_address || order.street_address, 'No Address')}</span>
                                    </InfoItem>
                                    {(order.city_municipality || order.city || order.shipping_city) && (
                                      <InfoItem>
                                        <span className="label">City:</span>
                                        <span className="value">{safeDisplayValue(order.city_municipality || order.city || order.shipping_city, 'No City')}</span>
                                      </InfoItem>
                                    )}
                                    {(order.province || order.shipping_province) && (
                                      <InfoItem>
                                        <span className="label">Area:</span>
                                        <span className="value">{safeDisplayValue(order.province || order.shipping_province, 'No Province')}</span>
                                      </InfoItem>
                                    )}
                                    {(order.zip_code || order.postalCode || order.postal_code || order.shipping_postal_code) && (
                                      <InfoItem>
                                        <span className="label">Postal Code:</span>
                                        <span className="value">{safeDisplayValue(order.zip_code || order.postalCode || order.postal_code || order.shipping_postal_code, 'No Postal Code')}</span>
                                      </InfoItem>
                                    )}
                                    {(order.contact_phone || order.shipping_phone || order.customer_phone) && (
                                      <InfoItem>
                                        <span className="label">Contact Phone:</span>
                                        <span className="value">{safeDisplayValue(formatPhone(order.contact_phone || order.shipping_phone || order.customer_phone), 'No Phone')}</span>
                                      </InfoItem>
                                    )}
                                  </InfoSection>
                                )}
                              </ExpandedContent>
                            </ExpandedRowContainer>
                          )}
                        </React.Fragment>
                      );
                    })
                )}
              </TransactionsTable>
            </TableWrapper>
          </>
        )}
        
        {/* Cancellation Requests Tab */}
        {activeTab === 'cancellations' && (
          <>
            {/* Search Bar */}
            <ControlsSection>
              <ControlsGrid>
                <SearchContainer>
                  <SearchIcon icon={faSearch} />
                  <SearchInput
                    type="text"
                    placeholder="Search cancellation requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                <RefreshButton onClick={fetchCancellationRequests} disabled={requestsLoading}>
                  <FontAwesomeIcon icon={faRefresh} />
                  {requestsLoading ? 'Loading...' : 'Refresh'}
                </RefreshButton>
              </ControlsGrid>
            </ControlsSection>

            {/* Cancellation Requests Table */}
            <TableWrapper>
              <TransactionsTable>
                <TableHeader>
                  <div></div>
                  <div>Order #</div>
                  <div>Date</div>
                  <div>Customer</div>
                  <div>Products</div>
                  <div>Amount</div>
                  <div>Payment</div>
                  <div>Status</div>
                  <div>Delivery</div>
                  <div>Created</div>
                  <div>Actions</div>
                </TableHeader>
                
                {requestsLoading ? (
                  <TableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                      Loading cancellation requests...
                    </div>
                  </TableRow>
                ) : cancellationRequests.length === 0 ? (
                  <TableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
                      No cancellation requests found.
                    </div>
                  </TableRow>
                ) : (
                  cancellationRequests
                    .filter(request => {
                      const searchLower = searchTerm.toLowerCase();
                      return request.custom_order_id?.toLowerCase().includes(searchLower) ||
                             request.customer_name?.toLowerCase().includes(searchLower) ||
                             request.reason?.toLowerCase().includes(searchLower) ||
                             request.status?.toLowerCase().includes(searchLower);
                    })
                    .map((request, index) => {
                      const requestId = request.id;
                      const uniqueKey = `cancellation-${requestId}-${index}`;
                      const isExpanded = expandedCancellationRows.has(uniqueKey);
                      
                      return (
                        <React.Fragment key={uniqueKey}>
                          <TableRow 
                            onClick={(e) => {
                              // Only trigger row expansion if not clicking on buttons
                              if (!e.target.closest('button')) {
                                console.log('🔄 Cancellation row clicked (not button), toggling:', uniqueKey);
                                toggleCancellationRowExpansion(uniqueKey);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Expand/Collapse Button */}
                            <ExpandToggleButton
                              className={isExpanded ? 'expanded' : ''}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔄 Cancellation button clicked, toggling:', uniqueKey);
                                console.log('🔄 Current expanded state:', isExpanded);
                                console.log('🔄 Current expanded rows:', Array.from(expandedCancellationRows));
                                toggleCancellationRowExpansion(uniqueKey);
                              }}
                            >
                              <FontAwesomeIcon 
                                icon={faChevronDown} 
                                style={{ 
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                              />
                            </ExpandToggleButton>
                            
                            {/* Order Number */}
                            <OrderNumber>
                              {request.order_number || 
                               request.custom_order_id || 
                               request.order_id || 
                               request.transaction_id || 
                               `${request.order_type === 'custom' ? 'CUSTOM' : 'ORD'}-${request.id}` || 
                               'N/A'}
                            </OrderNumber>
                            
                            {/* Date */}
                            <DateInfo>
                              {(() => {
                                const createdDate = request.created_at || request.date_created || request.request_date;
                                return formatDate(createdDate);
                              })()}
                            </DateInfo>
                            
                            {/* Customer */}
                            <CustomerInfo>
                              <div className="name">{request.customer_name}</div>
                              <div className="separator">•</div>
                              <div className="email">{request.customer_email}</div>
                            </CustomerInfo>
                            
                            {/* Products */}
                            <div style={{ 
                              fontSize: '14px',
                              maxWidth: '100%',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px',
                                padding: '6px 8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef'
                              }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#000000',
                                  fontSize: '13px'
                                }}>
                                  1 item
                                </div>
                              </div>
                              <div style={{ 
                                fontSize: '12px',
                                color: '#555555',
                                lineHeight: '1.4',
                                padding: '8px 10px',
                                border: '1px solid #e9ecef',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontWeight: '600', 
                                    color: '#000000',
                                    marginBottom: '3px',
                                    fontSize: '13px'
                                  }}>
                                    {request.product_name || request.product_type || 'Product'}
                                  </div>
                                  {(request.size || request.color) && (
                                    <div style={{ 
                                      fontSize: '11px', 
                                      color: '#666666',
                                      display: 'flex',
                                      gap: '8px',
                                      flexWrap: 'wrap'
                                    }}>
                                      {request.size && (
                                        <span style={{ 
                                          backgroundColor: '#f1f3f4', 
                                          padding: '2px 6px', 
                                          borderRadius: '3px',
                                          fontWeight: '500'
                                        }}>
                                          {request.size}
                                        </span>
                                      )}
                                      {request.color && (
                                        <span style={{ 
                                          backgroundColor: '#e8f0fe', 
                                          padding: '2px 6px', 
                                          borderRadius: '3px',
                                          fontWeight: '500'
                                        }}>
                                          {request.color}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  fontWeight: '600',
                                  color: '#000000',
                                  backgroundColor: '#f8f9fa',
                                  padding: '3px 6px',
                                  borderRadius: '3px',
                                  marginLeft: '8px'
                                }}>
                                  ×{request.quantity || 1}
                                </div>
                              </div>
                            </div>
                            
                            {/* Amount */}
                            <OrderDetails>
                              <div className="amount">{formatCurrency(request.final_price || request.estimated_price || 0)}</div>
                            </OrderDetails>
                            
                            {/* Payment (Reason) */}
                            <div style={{ 
                              fontSize: '12px', 
                              maxWidth: '85px',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              color: '#333'
                            }}>
                              {request.reason || 'No reason'}
                            </div>
                            
                            {/* Status */}
                            <StatusBadge status={request.status}>
                              {request.status}
                            </StatusBadge>
                            
                            {/* Delivery Status */}
                            <DeliveryStatusBadge status={request.delivery_status || 'pending'}>
                              {getDeliveryStatusInfo(request.delivery_status || 'pending').text}
                            </DeliveryStatusBadge>
                            
                            {/* Created */}
                            <DateInfo>
                              {(() => {
                                const createdDate = request.created_at || request.date_created || request.request_date;
                                return formatDate(createdDate);
                              })()}
                            </DateInfo>
                            
                            {/* Actions */}
                            <ActionsContainer>
                              {request.status === 'pending' ? (
                                <>
                                  <ActionButton 
                                    variant="approve" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      // Prevent double clicks with multiple checks
                                      if (buttonLoading[`cancel_${request.id}_approve`] || buttonLoading[`cancel_${request.id}_reject`]) {
                                        console.log('🚫 Button disabled, ignoring click');
                                        return;
                                      }
                                      
                                      // Check global debounce
                                      const actionKey = `${request.id}_approve`;
                                      if (window.ongoingCancellationRequests?.has(actionKey)) {
                                        console.log('🚫 Global debounce active, ignoring click');
                                        return;
                                      }
                                      
                                      console.log('✅ Approve button clicked for request:', request.id);
                                      processCancellationRequest(request.id, 'approve');
                                    }}
                                    style={{ 
                                      marginRight: '8px',
                                      minWidth: '100px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase'
                                    }}
                                    loading={buttonLoading[`cancel_${request.id}_approve`]}
                                    disabled={
                                      buttonLoading[`cancel_${request.id}_approve`] || 
                                      buttonLoading[`cancel_${request.id}_reject`] ||
                                      request.status !== 'pending' ||
                                      (window.ongoingCancellationRequests && 
                                       Array.from(window.ongoingCancellationRequests).some(key => key.startsWith(`${request.id}_`)))
                                    }
                                  >
                                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: '14px' }} />
                                    Approve
                                  </ActionButton>
                                  <ActionButton 
                                    variant="reject" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      // Prevent double clicks with multiple checks
                                      if (buttonLoading[`cancel_${request.id}_approve`] || buttonLoading[`cancel_${request.id}_reject`]) {
                                        console.log('🚫 Button disabled, ignoring click');
                                        return;
                                      }
                                      
                                      // Check global debounce
                                      const actionKey = `${request.id}_reject`;
                                      if (window.ongoingCancellationRequests?.has(actionKey)) {
                                        console.log('🚫 Global debounce active, ignoring click');
                                        return;
                                      }
                                      
                                      console.log('✅ Reject button clicked for request:', request.id);
                                      processCancellationRequest(request.id, 'reject');
                                    }}
                                    style={{ 
                                      minWidth: '100px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase'
                                    }}
                                    loading={buttonLoading[`cancel_${request.id}_reject`]}
                                    disabled={
                                      buttonLoading[`cancel_${request.id}_approve`] || 
                                      buttonLoading[`cancel_${request.id}_reject`] ||
                                      request.status !== 'pending' ||
                                      (window.ongoingCancellationRequests && 
                                       Array.from(window.ongoingCancellationRequests).some(key => key.startsWith(`${request.id}_`)))
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: '14px' }} />
                                    Reject
                                  </ActionButton>
                                </>
                              ) : (
                                // Request has been processed - show status with enhanced styling
                                <div style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  background: request.status === 'approved' 
                                    ? 'linear-gradient(135deg, #d4edda, #c3e6cb)' 
                                    : 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                                  color: request.status === 'approved' ? '#155724' : '#721c24',
                                  border: `1px solid ${request.status === 'approved' ? '#c3e6cb' : '#f5c6cb'}`,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                  <FontAwesomeIcon 
                                    icon={request.status === 'approved' ? faCheckCircle : faTimesCircle} 
                                    style={{ fontSize: '14px' }}
                                  />
                                  {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                </div>
                              )}
                            </ActionsContainer>
                          </TableRow>

                          {/* Expanded Row Content */}
                          {isExpanded && (
                            <ExpandedRowContainer>
                              <ExpandedContent>
                                {/* Customer Information */}
                                <InfoSection>
                                  <h4>Customer Information</h4>
                                  <HorizontalCustomerInfo>
                                    <div className="customer-field">
                                      <span className="label">Name:</span>
                                      <span className="value">{safeDisplayValue(request.customer_name, 'Unknown Customer')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Email:</span>
                                      <span className="value">{safeDisplayValue(request.customer_email, 'No Email')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Phone:</span>
                                      <span className="value">{safeDisplayValue(formatPhone(request.customer_phone), 'No Phone')}</span>
                                    </div>
                                  </HorizontalCustomerInfo>
                                </InfoSection>

                                {/* Shipping Address */}
                                <InfoSection>
                                  <h4>Shipping Address</h4>
                                  <InfoItem>
                                    <span className="label">Address:</span>
                                    <span className="value">
                                      {safeDisplayValue(formatAddress([
                                        request.street_number,
                                        request.house_number,
                                        request.barangay,
                                        request.street_address,
                                        request.address
                                      ]), 'No Address')}
                                    </span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">City:</span>
                                    <span className="value">{safeDisplayValue(request.municipality, 'No City')}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Province:</span>
                                    <span className="value">{safeDisplayValue(request.province, 'No Province')}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Postal Code:</span>
                                    <span className="value">{safeDisplayValue(request.postal_code, 'No Postal Code')}</span>
                                  </InfoItem>
                                </InfoSection>

                                {/* Order Information */}
                                <InfoSection>
                                  <h4>Order Information</h4>
                                  <InfoItem>
                                    <span className="label">Order Number:</span>
                                    <span className="value">{safeDisplayValue(request.order_number || request.custom_order_id, 'No Order Number')}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Product Type:</span>
                                    <span className="value">{safeDisplayValue(request.product_type, 'Unknown Product')}</span>
                                  </InfoItem>
                                  {request.product_name && (
                                    <InfoItem>
                                      <span className="label">Product Name:</span>
                                      <span className="value">{request.product_name}</span>
                                    </InfoItem>
                                  )}
                                  <InfoItem>
                                    <span className="label">Size:</span>
                                    <span className="value">{safeDisplayValue(request.size, 'No Size')}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Color:</span>
                                    <span className="value">{safeDisplayValue(request.color, 'No Color')}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Quantity:</span>
                                    <span className="value">{request.quantity || 1}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Amount:</span>
                                    <span className="value">{formatCurrency(request.final_price || request.estimated_price || 0)}</span>
                                  </InfoItem>
                                  {request.special_instructions && (
                                    <InfoItem>
                                      <span className="label">Special Instructions:</span>
                                      <span className="value" style={{ whiteSpace: 'pre-wrap' }}>
                                        {request.special_instructions}
                                      </span>
                                    </InfoItem>
                                  )}
                                </InfoSection>

                                {/* Cancellation Details */}
                                <InfoSection>
                                  <h4>Cancellation Details</h4>
                                  <InfoItem>
                                    <span className="label">Status:</span>
                                    <span className="value">
                                      <StatusBadge status={request.status}>
                                        {request.status}
                                      </StatusBadge>
                                    </span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Requested On:</span>
                                    <span className="value">{formatDate(request.created_at || request.date_created)}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Reason:</span>
                                    <span className="value" style={{ whiteSpace: 'pre-wrap' }}>
                                      {request.reason || 'No reason provided'}
                                    </span>
                                  </InfoItem>
                                  {request.admin_notes && (
                                    <InfoItem>
                                      <span className="label">Admin Notes:</span>
                                      <span className="value" style={{ whiteSpace: 'pre-wrap' }}>
                                        {request.admin_notes}
                                      </span>
                                    </InfoItem>
                                  )}
                                </InfoSection>
                              </ExpandedContent>
                            </ExpandedRowContainer>
                          )}
                        </React.Fragment>
                      );
                    })
                )}
              </TransactionsTable>
            </TableWrapper>
          </>
        )}

        {/* Refund Requests Tab */}
        {activeTab === 'refund-requests' && (
          <>
            {/* Search Bar */}
            <ControlsSection>
              <ControlsGrid>
                <SearchContainer>
                  <SearchIcon icon={faSearch} />
                  <SearchInput
                    type="text"
                    placeholder="Search refund requests..."
                    value={refundSearchTerm}
                    onChange={(e) => setRefundSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                <RefreshButton onClick={fetchRefundRequests} disabled={refundRequestsLoading}>
                  <FontAwesomeIcon icon={faRefresh} />
                  {refundRequestsLoading ? 'Loading...' : 'Refresh'}
                </RefreshButton>
              </ControlsGrid>
            </ControlsSection>

            <TableWrapper>
              <TransactionsTable>
                <TableHeader>
                  <div></div>
                  <div>Order #</div>
                  <div>Date</div>
                  <div>Customer</div>
                  <div>Products</div>
                  <div>Amount</div>
                  <div>Payment</div>
                  <div>Status</div>
                  <div>Delivery</div>
                  <div>Created</div>
                  <div>Actions</div>
                </TableHeader>
                {refundRequestsLoading ? (
                  <TableRow>
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666666' }}>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                      Loading refund requests...
                    </div>
                  </TableRow>
                ) : refundRequests.length === 0 ? (
                  <TableRow>
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666666' }}>
                      <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
                      No refund requests found.
                    </div>
                  </TableRow>
                ) : (
                  refundRequests
                    .filter(request => {
                      const searchLower = refundSearchTerm.toLowerCase();
                      return (request.order_id?.toString().includes(searchLower) ||
                              request.custom_order_id?.toString().includes(searchLower) ||
                              request.product_name?.toLowerCase().includes(searchLower) ||
                              request.customer_name?.toLowerCase().includes(searchLower) ||
                              request.status?.toLowerCase().includes(searchLower));
                    })
                    .map((request) => {
                      const requestId = request.id;
                      const uniqueKey = `refund-request-${requestId}`;
                      const isExpanded = expandedRefundRows.has(requestId);
                      
                      return (
                        <React.Fragment key={uniqueKey}>
                          <TableRow 
                            onClick={() => toggleRefundRowExpansion(requestId)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Expand/Collapse Button */}
                            <ExpandToggleButton
                              className={isExpanded ? 'expanded' : ''}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRefundRowExpansion(requestId);
                              }}
                            >
                              <FontAwesomeIcon 
                                icon={faChevronDown} 
                                style={{ 
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                              />
                            </ExpandToggleButton>
                            
                            {/* Order Number */}
                            <OrderNumber>
                              {request.order_number || 
                               request.order_id || 
                               request.custom_order_id || 
                               request.transaction_id || 
                               `${request.order_type === 'custom' ? 'CUSTOM' : 'ORD'}-${request.id}` || 
                               'N/A'}
                            </OrderNumber>
                            
                            {/* Date */}
                            <DateInfo>
                              {(() => {
                                const createdDate = request.created_at || request.date_created || request.request_date;
                                return formatDate(createdDate);
                              })()}
                            </DateInfo>
                            
                            {/* Customer */}
                            <CustomerInfo>
                              <div className="name">{safeDisplayValue(request.customer_name, 'Unknown Customer')}</div>
                              <div className="separator">•</div>
                              <div className="email">{safeDisplayValue(request.customer_email || request.phone_number, 'No Contact Info')}</div>
                            </CustomerInfo>
                            
                            {/* Products */}
                            <div style={{ 
                              fontSize: '14px',
                              maxWidth: '100%',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px',
                                padding: '6px 8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef'
                              }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#000000',
                                  fontSize: '13px'
                                }}>
                                  1 item
                                </div>
                              </div>
                              <div style={{ 
                                fontSize: '12px',
                                color: '#555555',
                                lineHeight: '1.4',
                                padding: '8px 10px',
                                border: '1px solid #e9ecef',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontWeight: '600', 
                                    color: '#000000',
                                    marginBottom: '3px',
                                    fontSize: '13px'
                                  }}>
                                    {request.product_name || 'Product'}
                                  </div>
                                  {(request.size || request.color) && (
                                    <div style={{ 
                                      fontSize: '11px', 
                                      color: '#666666',
                                      display: 'flex',
                                      gap: '8px',
                                      flexWrap: 'wrap'
                                    }}>
                                      {request.size && (
                                        <span style={{ 
                                          backgroundColor: '#f1f3f4', 
                                          padding: '2px 6px', 
                                          borderRadius: '3px',
                                          fontWeight: '500'
                                        }}>
                                          {request.size}
                                        </span>
                                      )}
                                      {request.color && (
                                        <span style={{ 
                                          backgroundColor: '#e8f0fe', 
                                          padding: '2px 6px', 
                                          borderRadius: '3px',
                                          fontWeight: '500'
                                        }}>
                                          {request.color}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  fontWeight: '600',
                                  color: '#000000',
                                  backgroundColor: '#f8f9fa',
                                  padding: '3px 6px',
                                  borderRadius: '3px',
                                  marginLeft: '8px'
                                }}>
                                  ×{request.quantity || 1}
                                </div>
                              </div>
                            </div>
                            
                            {/* Amount */}
                            <OrderDetails>
                              <div className="amount">{formatCurrency(request.price)}</div>
                            </OrderDetails>
                            
                            {/* Payment (Reason) */}
                            <div style={{ 
                              fontSize: '12px', 
                              maxWidth: '85px',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              color: '#333'
                            }}>
                              {request.reason || 'No reason'}
                            </div>
                            
                            {/* Status */}
                            <StatusBadge status={request.status}>{request.status}</StatusBadge>
                            
                            {/* Delivery Status */}
                            <DeliveryStatusBadge status={request.delivery_status || 'pending'}>
                              {getDeliveryStatusInfo(request.delivery_status || 'pending').text}
                            </DeliveryStatusBadge>
                            
                            {/* Created Date */}
                            <DateInfo>
                              {(() => {
                                const createdDate = request.created_at || request.date_created || request.request_date;
                                return formatDate(createdDate);
                              })()}
                            </DateInfo>
                            
                            {/* Actions */}
                            <ActionsContainer>
                              {request.status === 'pending' ? (
                                <>
                                  <ActionButton 
                                    variant="approve" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      processRefundRequest(request.id, 'approved');
                                    }}
                                    style={{ 
                                      marginRight: '8px',
                                      minWidth: '100px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase'
                                    }}
                                    loading={buttonLoading[`refund_${request.id}_approve`]}
                                    disabled={buttonLoading[`refund_${request.id}_approve`] || buttonLoading[`refund_${request.id}_reject`]}
                                  >
                                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: '14px' }} />
                                    Approve
                                  </ActionButton>
                                  <ActionButton 
                                    variant="reject" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      processRefundRequest(request.id, 'rejected');
                                    }}
                                    style={{ 
                                      minWidth: '100px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase'
                                    }}
                                    loading={buttonLoading[`refund_${request.id}_reject`]}
                                    disabled={buttonLoading[`refund_${request.id}_approve`] || buttonLoading[`refund_${request.id}_reject`]}
                                  >
                                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: '14px' }} />
                                    Reject
                                  </ActionButton>
                                </>
                              ) : (
                                // Request has been processed - show status with enhanced styling
                                <div style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  background: request.status === 'approved' 
                                    ? 'linear-gradient(135deg, #d4edda, #c3e6cb)' 
                                    : 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                                  color: request.status === 'approved' ? '#155724' : '#721c24',
                                  border: `1px solid ${request.status === 'approved' ? '#c3e6cb' : '#f5c6cb'}`,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                  <FontAwesomeIcon 
                                    icon={request.status === 'approved' ? faCheckCircle : faTimesCircle} 
                                    style={{ fontSize: '14px' }}
                                  />
                                  {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                </div>
                            )}
                            </ActionsContainer>
                          </TableRow>

                          {/* Expanded Row Content */}
                          {isExpanded && (
                            <ExpandedRowContainer>
                              <ExpandedContent>
                                {/* Customer Information */}
                                <InfoSection>
                                  <h4>Customer Information</h4>
                                  <HorizontalCustomerInfo>
                                    <div className="customer-field">
                                      <span className="label">Name:</span>
                                      <span className="value">{safeDisplayValue(request.customer_name, 'Unknown Customer')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Email:</span>
                                      <span className="value">{safeDisplayValue(request.customer_email, 'No Email')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Phone:</span>
                                      <span className="value">{safeDisplayValue(formatPhone(request.phone_number), 'No Phone')}</span>
                                    </div>
                                  </HorizontalCustomerInfo>
                                </InfoSection>

                                {/* Product Details */}
                                <InfoSection>
                                  <h4>Product Details</h4>
                                  <InfoItem>
                                    <span className="label">Product Name:</span>
                                    <span className="value">{request.product_name || 'Product'}</span>
                                  </InfoItem>
                                  {request.size && (
                                    <InfoItem>
                                      <span className="label">Size:</span>
                                      <span className="value">{request.size}</span>
                                    </InfoItem>
                                  )}
                                  {request.color && (
                                    <InfoItem>
                                      <span className="label">Color:</span>
                                      <span className="value">{request.color}</span>
                                    </InfoItem>
                                  )}
                                  <InfoItem>
                                    <span className="label">Quantity:</span>
                                    <span className="value">{request.quantity || 1}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Price:</span>
                                    <span className="value">{formatCurrency(request.price)}</span>
                                  </InfoItem>
                                </InfoSection>

                                {/* Refund Request Details */}
                                <InfoSection>
                                  <h4>Refund Request Details</h4>
                                  <InfoItem>
                                    <span className="label">Order ID:</span>
                                    <span className="value">
                                      {request.order_number || 
                                       request.order_id || 
                                       request.custom_order_id || 
                                       request.transaction_id || 
                                       `${request.order_type === 'custom' ? 'CUSTOM' : 'ORD'}-${request.id}` || 
                                       'N/A'}
                                    </span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Reason:</span>
                                    <span className="value">{request.reason || 'No reason provided'}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Status:</span>
                                    <span className="value">
                                      <StatusBadge status={request.status}>
                                        {request.status}
                                      </StatusBadge>
                                    </span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Delivery Status:</span>
                                    <span className="value">
                                      <DeliveryStatusBadge status={request.delivery_status || 'pending'}>
                                        {getDeliveryStatusInfo(request.delivery_status || 'pending').text}
                                      </DeliveryStatusBadge>
                                    </span>
                                  </InfoItem>
                                </InfoSection>

                                {/* Product Image */}
                                {request.product_image && (
                                  <InfoSection>
                                    <h4>Product Image</h4>
                                    <img 
                                      src={(() => {
                                        const imagePath = request.product_image;
                                        if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
                                          return `http://localhost:5000/uploads/default-product.png`;
                                        }
                                        if (imagePath.startsWith('http')) {
                                          return imagePath;
                                        }
                                        if (imagePath.startsWith('/uploads/')) {
                                          return `http://localhost:5000${imagePath}`;
                                        }
                                        return `http://localhost:5000/uploads/${imagePath}`;
                                      })()} 
                                      alt="Product" 
                                      style={{ 
                                        width: '120px', 
                                        height: '120px', 
                                        objectFit: 'cover', 
                                        borderRadius: '6px',
                                        border: '1px solid #e9ecef'
                                      }} 
                                      onError={(e) => {
                                        e.target.src = `http://localhost:5000/uploads/default-product.png`;
                                      }}
                                    />
                                  </InfoSection>
                                )}

                              </ExpandedContent>
                            </ExpandedRowContainer>
                          )}
                        </React.Fragment>
                      );
                    })
                )}
              </TransactionsTable>
            </TableWrapper>
          </>
        )}
        
        {/* Custom Design Requests Tab */}
        {activeTab === 'design-requests' && (
          <>
            {/* Search Bar */}
            <ControlsSection>
              <ControlsGrid>
                <SearchContainer>
                  <SearchIcon icon={faSearch} />
                  <SearchInput
                    type="text"
                    placeholder="Search custom design history by customer, product type, or status..."
                    value={designSearchTerm}
                    onChange={(e) => setDesignSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                <RefreshButton onClick={fetchCustomDesignRequests} disabled={designRequestsLoading}>
                  <FontAwesomeIcon icon={faRefresh} />
                  {designRequestsLoading ? 'Loading...' : 'Refresh'}
                </RefreshButton>
              </ControlsGrid>
            </ControlsSection>

            {/* Custom Design Requests History Table */}
            <TableWrapper>
              <TransactionsTable>
                <TableHeader>
                  <div></div>
                  <div>Order #</div>
                  <div>Date</div>
                  <div>Customer</div>
                  <div>Products</div>
                  <div>Amount</div>
                  <div>Payment</div>
                  <div>Status</div>
                  <div>Delivery</div>
                  <div>Created</div>
                  <div>Actions</div>
                </TableHeader>
                
                {designRequestsLoading ? (
                  <TableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                      Loading custom design history...
                    </div>
                  </TableRow>
                ) : customDesignRequests.length === 0 ? (
                  <TableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
                      No custom design requests found.
                    </div>
                  </TableRow>
                ) : (
                  customDesignRequests
                    .filter(request => {
                      const searchLower = designSearchTerm.toLowerCase();
                      return request.customer_name?.toLowerCase().includes(searchLower) ||
                             request.product_type?.toLowerCase().includes(searchLower) ||
                             request.design_notes?.toLowerCase().includes(searchLower) ||
                             request.status?.toLowerCase().includes(searchLower);
                    })
                    .map((request) => {
                      const requestId = request.custom_order_id;
                      const uniqueKey = `design-request-${requestId}`;
                      const isExpanded = expandedCustomDesignRows.has(requestId);
                      
                      return (
                        <React.Fragment key={uniqueKey}>
                          <TableRow 
                            onClick={() => toggleCustomDesignRowExpansion(requestId)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Expand/Collapse Button */}
                            <ExpandToggleButton
                              className={isExpanded ? 'expanded' : ''}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCustomDesignRowExpansion(requestId);
                              }}
                            >
                              <FontAwesomeIcon 
                                icon={faChevronDown} 
                                style={{ 
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                              />
                            </ExpandToggleButton>
                            
                            {/* Order Number */}
                            <OrderNumber>
                              {request.order_number || 
                               request.custom_order_id || 
                               request.order_id || 
                               request.transaction_id || 
                               `${request.order_type === 'custom' ? 'CUSTOM' : 'ORD'}-${request.id}` || 
                               'N/A'}
                            </OrderNumber>
                            
                            {/* Date */}
                            <DateInfo>
                              {(() => {
                                const createdDate = request.created_at || request.date_created || request.order_date;
                                return formatDate(createdDate);
                              })()}
                            </DateInfo>
                            
                            {/* Customer */}
                            <CustomerInfo>
                              <div className="name">{request.customer_name}</div>
                              <div className="separator">•</div>
                              <div className="email">{request.customer_email}</div>
                            </CustomerInfo>
                            
                            {/* Products */}
                            <div style={{ 
                              fontSize: '14px',
                              maxWidth: '100%',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px',
                                padding: '6px 8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef'
                              }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#000000',
                                  fontSize: '13px'
                                }}>
                                  Custom Design
                                </div>
                              </div>
                              <div style={{ 
                                fontSize: '12px',
                                color: '#555555',
                                lineHeight: '1.4',
                                padding: '8px 10px',
                                border: '1px solid #e9ecef',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontWeight: '600', 
                                    color: '#000000',
                                    marginBottom: '3px',
                                    fontSize: '13px'
                                  }}>
                                    {request.product_type || 'Custom Product'}
                                  </div>
                                  {request.design_notes && (
                                    <div style={{ 
                                      fontSize: '11px', 
                                      color: '#666666',
                                      marginTop: '4px',
                                      maxWidth: '120px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {request.design_notes}
                                    </div>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  fontWeight: '600',
                                  color: '#000000',
                                  backgroundColor: '#f8f9fa',
                                  padding: '3px 6px',
                                  borderRadius: '3px',
                                  marginLeft: '8px'
                                }}>
                                  ×1
                                </div>
                              </div>
                            </div>
                            
                            {/* Amount */}
                            <OrderDetails>
                              <div className="amount">{formatCurrency(request.final_price || request.estimated_price || request.total_amount || request.price || 0)}</div>
                            </OrderDetails>
                            
                            {/* Payment - Design Status */}
                            <div style={{ 
                              fontSize: '12px', 
                              maxWidth: '85px',
                              textAlign: 'center',
                              lineHeight: '1.3'
                            }}>
                              <div style={{
                                padding: '2px 6px',
                                background: request.status === 'approved' ? '#e8f5e8' : '#fff3cd',
                                color: request.status === 'approved' ? '#155724' : '#856404',
                                borderRadius: '10px',
                                fontSize: '9px',
                                fontWeight: '600'
                              }}>
                                {request.status === 'approved' ? 'APPROVED' : 'PENDING'}
                              </div>
                            </div>
                            
                            {/* Status */}
                            <StatusBadge status={request.status}>
                              {request.status}
                            </StatusBadge>
                            
                            {/* Delivery Status */}
                            <div>
                              <DeliveryStatusBadge status={request.delivery_status || 'pending'}>
                                {getDeliveryStatusInfo(request.delivery_status || 'pending').text}
                              </DeliveryStatusBadge>
                            </div>
                            
                            {/* Created */}
                            <DateInfo>
                              {(() => {
                                const createdDate = request.created_at || request.date_created || request.order_date;
                                return formatDate(createdDate);
                              })()}
                            </DateInfo>
                            
                            {/* Actions */}
                            <ActionsContainer>
                              {request.status === 'pending' ? (
                                <>
                                  <ActionButton 
                                    variant="approve" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      processDesignRequest(request.custom_order_id, 'approved');
                                    }}
                                    style={{ 
                                      marginRight: '8px',
                                      minWidth: '100px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase'
                                    }}
                                    loading={buttonLoading[`design_${request.custom_order_id}_approve`]}
                                    disabled={buttonLoading[`design_${request.custom_order_id}_approve`] || buttonLoading[`design_${request.custom_order_id}_reject`]}
                                  >
                                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: '14px' }} />
                                    Approve
                                  </ActionButton>
                                  <ActionButton 
                                    variant="reject" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      processDesignRequest(request.custom_order_id, 'rejected');
                                    }}
                                    style={{ 
                                      minWidth: '100px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase'
                                    }}
                                    loading={buttonLoading[`design_${request.custom_order_id}_reject`]}
                                    disabled={buttonLoading[`design_${request.custom_order_id}_approve`] || buttonLoading[`design_${request.custom_order_id}_reject`]}
                                  >
                                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: '14px' }} />
                                    Reject
                                  </ActionButton>
                                  <ActionButton 
                                    variant="view"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      viewDesignImages(request);
                                    }}
                                    style={{ 
                                      marginLeft: '8px',
                                      minWidth: '120px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faImage} style={{ fontSize: '14px' }} />
                                    View Images
                                  </ActionButton>
                                </>
                              ) : (
                                <ActionButton 
                                  variant="view"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewDesignImages(request);
                                  }}
                                  style={{ 
                                    minWidth: '120px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  <FontAwesomeIcon icon={faImage} style={{ fontSize: '14px' }} />
                                  View Images
                                </ActionButton>
                              )}
                            </ActionsContainer>
                          </TableRow>

                          {/* Expanded Row Content */}
                          {isExpanded && (
                            <ExpandedRowContainer>
                              <ExpandedContent>
                                {/* Customer Information */}
                                <InfoSection>
                                  <h4>Customer Information</h4>
                                  <HorizontalCustomerInfo>
                                    <div className="customer-field">
                                      <span className="label">Name:</span>
                                      <span className="value">{safeDisplayValue(request.customer_name, 'Unknown Customer')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Email:</span>
                                      <span className="value">{safeDisplayValue(request.customer_email, 'No Email')}</span>
                                    </div>
                                    <span className="separator">•</span>
                                    <div className="customer-field">
                                      <span className="label">Phone:</span>
                                      <span className="value">{safeDisplayValue(formatPhone(request.customer_phone), 'No Phone')}</span>
                                    </div>
                                  </HorizontalCustomerInfo>
                                </InfoSection>

                                {/* Design Request Details */}
                                <InfoSection>
                                  <h4>Design Request Details</h4>
                                  <InfoItem>
                                    <span className="label">Product Type:</span>
                                    <span className="value">{request.product_type || 'Custom Product'}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Design Notes:</span>
                                    <span className="value">{request.design_notes || 'No notes provided'}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Price:</span>
                                    <span className="value">{formatCurrency(request.final_price || request.estimated_price || request.total_amount || request.price || 0)}</span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Status:</span>
                                    <span className="value">
                                      <StatusBadge status={request.status}>
                                        {request.status}
                                      </StatusBadge>
                                    </span>
                                  </InfoItem>
                                  <InfoItem>
                                    <span className="label">Delivery Status:</span>
                                    <span className="value">
                                      <DeliveryStatusBadge status={request.delivery_status || 'pending'}>
                                        {getDeliveryStatusInfo(request.delivery_status || 'pending').text}
                                      </DeliveryStatusBadge>
                                    </span>
                                  </InfoItem>
                                </InfoSection>

                                {/* Request Images */}
                                {request.image_paths && request.image_paths.length > 0 && (
                                  <InfoSection>
                                    <h4>Design Images</h4>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                      {request.image_paths.map((imagePath, index) => (
                                        <img 
                                          key={index}
                                          src={(() => {
                                            if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
                                              return `http://localhost:5000/uploads/default-product.png`;
                                            }
                                            if (imagePath.startsWith('http')) {
                                              return imagePath;
                                            }
                                            if (imagePath.startsWith('/uploads/')) {
                                              return `http://localhost:5000${imagePath}`;
                                            }
                                            return `http://localhost:5000/uploads/${imagePath}`;
                                          })()}
                                          alt={`Design ${index + 1}`}
                                          style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            objectFit: 'cover', 
                                            borderRadius: '6px',
                                            border: '1px solid #e9ecef',
                                            cursor: 'pointer'
                                          }}
                                          onError={(e) => {
                                            e.target.src = `http://localhost:5000/uploads/default-product.png`;
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </InfoSection>
                                )}

                              </ExpandedContent>
                            </ExpandedRowContainer>
                          )}
                        </React.Fragment>
                      );
                    })
                )}
              </TransactionsTable>
            </TableWrapper>
          </>
        )}
      </ContentWrapper>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalContent>
              <ModalHeader>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Transaction Details</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '20px', 
                    cursor: 'pointer' 
                  }}
                >
                  ×
                </button>
              </ModalHeader>
              <div>
                <p><strong>Order Number:</strong> {selectedTransaction.order_number}</p>
                <p><strong>Customer:</strong> {selectedTransaction.customer_name}</p>
                <p><strong>Total:</strong> ₱{parseFloat(selectedTransaction.total_amount || 0).toFixed(2)}</p>
                <p><strong>Status:</strong> {selectedTransaction.status}</p>
                <p><strong>Date:</strong> {(() => {
                  const createdDate = selectedTransaction.created_at || selectedTransaction.order_date || selectedTransaction.date_created;
                  return formatDate(createdDate);
                })()}</p>
                {/* Invoice Download Button */}
                {selectedTransaction.id && (
                  <ActionButton
                    variant="view"
                    style={{ marginTop: 16 }}
                    onClick={async () => {
                      try {
                        // Get the invoice_id from the transaction data
                        let invoiceId = selectedTransaction.invoice_id || selectedTransaction.order_number;
                        
                        // For custom orders, use the custom_order_id as invoice ID
                        if (selectedTransaction.order_type === 'custom') {
                          invoiceId = selectedTransaction.custom_order_data?.custom_order_id || selectedTransaction.order_number;
                        }
                        if (!invoiceId) {
                          toast.error('No invoice ID found for this transaction.');
                          return;
                        }
                        const url = `/api/orders/admin/invoice/${invoiceId}/pdf`;
                        console.log('🔍 Attempting to download invoice with ID:', invoiceId);
                        console.log('🔗 URL:', url);
                        
                        const response = await fetch(url, {
                          method: 'GET',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        
                        console.log('📊 Response status:', response.status);
                        
                        if (!response.ok) {
                          const errorText = await response.text();
                          console.error('❌ Invoice download failed:', errorText);
                          toast.error(`Failed to download invoice PDF: ${response.status} ${response.statusText}`);
                          return;
                        }
                        const blob = await response.blob();
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `Invoice-${selectedTransaction.order_number || invoiceId}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(downloadUrl);
                        toast.success('Invoice downloaded!');
                      } catch (err) {
                        toast.error('Error downloading invoice.');
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faReceipt} style={{ marginRight: 8 }} />
                    Download/View Invoice
                  </ActionButton>
                )}
              </div>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}

      {/* Payment Proof Modal */}
      {showPaymentProofModal && selectedPaymentProof && (
        <ModalOverlay onClick={closePaymentProofModal}>
          <Modal onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <ModalHeader>
              <h3>Payment Proof</h3>
              <button 
                onClick={closePaymentProofModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </ModalHeader>
            <ModalContent style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>Customer:</strong> {selectedPaymentProof.customerName}<br />
                <strong>Order:</strong> {selectedPaymentProof.orderNumber}<br />
                {selectedPaymentProof.gcashReference && (
                  <><strong>GCash Reference:</strong> {selectedPaymentProof.gcashReference}<br /></>
                )}
              </div>
              
              {selectedPaymentProof.imagePath && selectedPaymentProof.imagePath !== 'N/A' && selectedPaymentProof.imagePath !== 'null' ? (
                <>
                  <img 
                    src={(() => {
                      const path = selectedPaymentProof.imagePath;
                      console.log('🖼️ Original image path:', path);
                      
                      // Handle different path formats
                      if (path?.startsWith('http')) {
                        console.log('🖼️ Using HTTP path:', path);
                        return path;
                      } else if (path?.startsWith('/uploads/')) {
                        const fullPath = `http://localhost:5000${path}`;
                        console.log('🖼️ Using uploads path:', fullPath);
                        return fullPath;
                      } else if (path && !path.startsWith('/')) {
                        // Just filename
                        const fullPath = `http://localhost:5000/uploads/payment-proofs/${path}`;
                        console.log('🖼️ Using filename path:', fullPath);
                        return fullPath;
                      } else {
                        const fullPath = `http://localhost:5000${path}`;
                        console.log('🖼️ Using default path:', fullPath);
                        return fullPath;
                      }
                    })()}
                    alt="Payment Proof"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      console.error('🚨 Payment proof image failed to load:', selectedPaymentProof.imagePath);
                      if (e.target) {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'block';
                        }
                      }
                    }}
                    onLoad={() => {
                      console.log('✅ Payment proof image loaded successfully');
                    }}
                  />
                  <div style={{ display: 'none', padding: '40px', color: '#666' }}>
                    Failed to load payment proof image. Path: {selectedPaymentProof.imagePath}
                  </div>
                </>
              ) : (
                <div style={{ 
                  padding: '60px 40px', 
                  color: '#666', 
                  fontSize: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6'
                }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '48px', color: '#ffc107', marginBottom: '16px' }} />
                  <div style={{ marginBottom: '8px' }}>No payment proof image found</div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    {selectedPaymentProof.gcashReference 
                      ? `Please verify the GCash reference number: ${selectedPaymentProof.gcashReference}` 
                      : 'Please verify payment details manually'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc', marginTop: '8px' }}>
                    Debug: imagePath = {String(selectedPaymentProof.imagePath)}
                  </div>
                </div>
              )}
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}

      {/* Design Images Modal */}
      {showDesignImagesModal && selectedDesignImages && (
        <ModalOverlay onClick={closeDesignImagesModal}>
          <Modal onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
            <ModalHeader>
              <h3>Design Images</h3>
              <button 
                onClick={closeDesignImagesModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </ModalHeader>
            <ModalContent style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <strong>Customer:</strong> {selectedDesignImages.customerName}<br />
                <strong>Order:</strong> {selectedDesignImages.orderNumber}<br />
                <strong>Product Type:</strong> {selectedDesignImages.productType}<br />
                {selectedDesignImages.designNotes && (
                  <><strong>Design Notes:</strong> {selectedDesignImages.designNotes}<br /></>
                )}
              </div>
              
              {selectedDesignImages.images && selectedDesignImages.images.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px',
                  marginTop: '20px'
                }}>
                  {selectedDesignImages.images.map((imagePath, index) => {
                    console.log(`🖼️ Rendering image ${index + 1}:`, imagePath);
                    
                    return (
                      <div key={index} style={{ textAlign: 'center' }}>
                        <div style={{ 
                          marginBottom: '8px', 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: '#666' 
                        }}>
                          Design {index + 1}
                        </div>
                        <img 
                          src={(() => {
                            // First, ensure imagePath is a string or convert it to string
                            const imagePathStr = typeof imagePath === 'string' ? imagePath : String(imagePath || '');
                            
                            if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePathStr.trim() === '') {
                              console.log(`🖼️ Image ${index + 1} is empty, using default`);
                              return `http://localhost:5000/uploads/default-product.png`;
                            }
                            if (imagePathStr.startsWith('http')) {
                              console.log(`🖼️ Image ${index + 1} is full URL:`, imagePathStr);
                              return imagePathStr;
                            }
                            if (imagePathStr.startsWith('/uploads/')) {
                              console.log(`🖼️ Image ${index + 1} starts with /uploads/:`, imagePathStr);
                              return `http://localhost:5000${imagePathStr}`;
                            }
                            // Handle cases where the path might be just the filename or relative path
                            const finalUrl = `http://localhost:5000/uploads/${imagePathStr}`;
                            console.log(`🖼️ Image ${index + 1} final URL:`, finalUrl);
                            return finalUrl;
                          })()}
                          alt={`Design ${index + 1}`}
                          style={{
                            width: '100%',
                            maxWidth: '250px',
                            height: '200px',
                            objectFit: 'cover',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease'
                          }}
                          onError={(e) => {
                            console.error(`🖼️ Failed to load image ${index + 1}:`, e.target.src);
                            
                            // Extract filename from the original imagePath for fallback URLs
                            const originalImagePath = selectedDesignImages.images[index];
                            let filename = originalImagePath;
                            
                            // Try to extract filename if it's a full URL or path
                            if (originalImagePath.includes('/')) {
                              filename = originalImagePath.split('/').pop();
                            }
                            
                            console.log(`🖼️ Trying alternative paths for filename: ${filename}`);
                            
                            // Use the same fallback logic as CustomPage.js
                            const altUrls = [
                              `http://localhost:5000/uploads/custom-designs/${filename}`,
                              `http://localhost:5000/uploads/${filename}`,
                              `http://localhost:5000/images/${filename}`,
                              `http://localhost:5000/uploads/custom-orders/${filename}`,
                              `http://localhost:5000/uploads/default-product.png` // Final fallback
                            ];
                            
                            // Try the first alternative URL
                            const currentSrc = e.target.src;
                            const currentIndex = altUrls.indexOf(currentSrc);
                            const nextIndex = currentIndex + 1;
                            
                            if (nextIndex < altUrls.length) {
                              console.log(`🖼️ Trying alternative URL ${nextIndex + 1}:`, altUrls[nextIndex]);
                              e.target.src = altUrls[nextIndex];
                            } else {
                              console.log(`🖼️ All alternatives failed, using default`);
                              e.target.style.border = '2px solid #dc3545';
                              e.target.style.opacity = '0.7';
                            }
                          }}
                          onLoad={(e) => {
                            console.log(`🖼️ Successfully loaded image ${index + 1}:`, e.target.src);
                          }}
                          onClick={(e) => {
                            // Show image in a larger modal instead of opening new tab
                            e.stopPropagation();
                            // You can implement a full-screen image viewer here
                            // For now, let's create a simple image preview modal
                            const imageModal = document.createElement('div');
                            imageModal.style.cssText = `
                              position: fixed;
                              top: 0;
                              left: 0;
                              width: 100%;
                              height: 100%;
                              background: rgba(0, 0, 0, 0.9);
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              z-index: 10000;
                              cursor: pointer;
                            `;
                            
                            const fullImage = document.createElement('img');
                            fullImage.src = e.target.src;
                            fullImage.style.cssText = `
                              max-width: 90%;
                              max-height: 90%;
                              object-fit: contain;
                              border-radius: 8px;
                              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                            `;
                            
                            const closeButton = document.createElement('button');
                            closeButton.innerHTML = '×';
                            closeButton.style.cssText = `
                              position: absolute;
                              top: 20px;
                              right: 30px;
                              background: rgba(255, 255, 255, 0.9);
                              border: none;
                              border-radius: 50%;
                              width: 40px;
                              height: 40px;
                              font-size: 24px;
                              font-weight: bold;
                              cursor: pointer;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              color: #333;
                              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                            `;
                            
                            imageModal.appendChild(fullImage);
                            imageModal.appendChild(closeButton);
                            document.body.appendChild(imageModal);
                            
                            // Close modal when clicking anywhere or close button
                            const closeModal = () => {
                              // Check if the modal still exists and is a child of document.body before removing
                              if (imageModal && document.body.contains(imageModal)) {
                                document.body.removeChild(imageModal);
                              }
                              // Clean up event listener
                              document.removeEventListener('keydown', handleEscape);
                            };
                            
                            imageModal.onclick = closeModal;
                            closeButton.onclick = closeModal;
                            
                            // Prevent image click from closing modal
                            fullImage.onclick = (e) => e.stopPropagation();
                            
                            // Close with Escape key
                            const handleEscape = (e) => {
                              if (e.key === 'Escape') {
                                closeModal();
                              }
                            };
                            document.addEventListener('keydown', handleEscape);
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ 
                  padding: '60px 40px', 
                  color: '#666', 
                  fontSize: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6'
                }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '48px', color: '#ffc107', marginBottom: '16px' }} />
                  <div style={{ marginBottom: '8px' }}>No design images found</div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    This design request doesn't have any uploaded images.
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={closeDesignImagesModal}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default TransactionPage;
