import React, { useState, useEffect, useCallback } from 'react';
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
  faCheckCircle
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2px;
  margin: 40px auto;
  background: #f5f5f5;
  border-radius: 16px;
  overflow: hidden;
  max-width: 1200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const StatCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})`
  background: #ffffff;
  padding: 40px 32px;
  text-align: center;
  transition: all 0.3s ease;
  border-radius: 12px;
  
  &:hover {
    background: #fafafa;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  h3 {
    font-size: 36px;
    font-weight: 300;
    margin: 0 0 12px 0;
    color: ${props => props.color || '#000000'};
    line-height: 1;
    letter-spacing: -1px;
  }
  
  p {
    color: #666666;
    margin: 0;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-weight: 600;
  }
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
  max-width: 1500px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  /* Center the table content and improve layout */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 150px 110px 200px 180px 120px 100px 120px 120px 120px 120px;
  gap: 20px;
  padding: 28px 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #dee2e6;
  font-weight: 700;
  font-size: 14px;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  width: 100%;
  justify-items: start;
  align-items: center;
  
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
  }
  
  /* Left align text-heavy columns */
  > div:nth-child(2),  /* Order # */
  > div:nth-child(3),  /* Date */
  > div:nth-child(4),  /* Customer */
  > div:nth-child(5) { /* Products */
    justify-self: start;
    text-align: left;
  }
  
  @media (max-width: 1600px) {
    grid-template-columns: 45px 140px 105px 190px 170px 110px 95px 110px 110px 110px 110px;
    gap: 18px;
    font-size: 13px;
    padding: 26px 36px;
  }
  
  @media (max-width: 1400px) {
    grid-template-columns: 40px 130px 100px 180px 160px 100px 90px 100px 100px 100px 100px;
    gap: 16px;
    padding: 24px 32px;
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
  grid-template-columns: 50px 150px 110px 200px 180px 120px 100px 120px 120px 120px 120px;
  gap: 20px;
  padding: 32px 40px;
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
    grid-template-columns: 45px 140px 105px 190px 170px 110px 95px 110px 110px 110px 110px;
    gap: 18px;
    padding: 30px 36px;
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
  }
  
  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
  
  &:not(:disabled):active {
    transform: translateY(1px);
  }
  
  // Loading spinner
  ${props => props.loading && `
    pointer-events: none;
    
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
  
  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          color: #ffffff;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          border-color: #27ae60;
          box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #229954, #27ae60);
            box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
          }
          
          &:focus:not(:disabled) {
            outline: none;
            box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.3);
          }
        `;
      case 'reject':
        return `
          color: #ffffff;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          border-color: #e74c3c;
          box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #c0392b, #a93226);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
          }
          
          &:focus:not(:disabled) {
            outline: none;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3);
          }
        `;
      case 'view':
        return `
          color: #ffffff;
          background: linear-gradient(135deg, #34495e, #2c3e50);
          border-color: #34495e;
          box-shadow: 0 2px 8px rgba(52, 73, 94, 0.3);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #2c3e50, #1b2631);
            box-shadow: 0 4px 12px rgba(52, 73, 94, 0.4);
          }
          
          &:focus:not(:disabled) {
            outline: none;
            box-shadow: 0 0 0 3px rgba(52, 73, 94, 0.3);
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

const ImageContainer = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
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
  justify-content: center;
  
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
  grid-template-columns: 35px 75px 130px 90px 180px 150px 100px 110px 110px 140px;
  gap: 12px;
  padding: 20px 20px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: all 0.2s ease;
  min-height: 70px;
  justify-content: center;
  
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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows
  
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
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    rejected: 0,
    totalAmount: 0
  });
  
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
  const [showDesignProcessingModal, setShowDesignProcessingModal] = useState(false);
  const [processingDesignRequest, setProcessingDesignRequest] = useState(null);
  
  // Processing modal states
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Refund request state variables
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundRequestsLoading, setRefundRequestsLoading] = useState(false);
  const [refundSearchTerm, setRefundSearchTerm] = useState('');
  
  // Image modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Payment verification state (for admin users)
  const [pendingVerificationOrders, setPendingVerificationOrders] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSearchTerm, setVerificationSearchTerm] = useState('');
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
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
          
          return {
            id: order.id,
            order_number: order.order_number,
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
            shipping_address: order.shipping_address,
            contact_phone: order.contact_phone,
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
          if (order.order_type === 'custom' && order.order_number.startsWith('CUSTOM-')) {
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
        
        const processedCustomOrders = confirmedCustomOrders
          .filter(order => order) // Extra safety check
          .map(order => {
          const fullName = order.customer_name || 
                         [order.first_name, order.last_name].filter(Boolean).join(' ') || 
                         'Unknown Customer';
          
          return {
            id: 'custom-' + order.id, // Prefix to avoid ID conflicts
            order_number: order.custom_order_id,
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
            order_status: 'confirmed', // Custom orders have confirmed status
            transaction_status: 'confirmed', // Show as confirmed in transaction view
            status: 'confirmed', // Show as confirmed for consistency
            delivery_status: order.delivery_status || 'pending', // Add delivery status for custom orders
            order_date: order.created_at,
            created_at: order.created_at,
            updated_at: order.updated_at,
            shipping_address: (order.street_number || '') + ' ' + (order.barangay || '') + ', ' + (order.municipality || '') + ', ' + (order.province || ''),
            street_address: (order.street_number || '') + ' ' + (order.barangay || ''),
            city_municipality: order.municipality,
            city: order.municipality,
            province: order.province,
            zip_code: order.postal_code,
            postal_code: order.postal_code,
            contact_phone: order.customer_phone,
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
            custom_order_data: order // Keep original custom order data
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
      calculateStats(allTransactions);
      
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
      console.log('Fetching cancellation requests...');
      
      const response = await api.get('/orders/cancellation-requests');
      
      if (response.data.success) {
        console.log('✅ Cancellation requests fetched:', response.data);
        // Debug: Check the structure of requests to see image field for both regular and custom orders
        if (response.data.data && response.data.data.length > 0) {
          response.data.data.forEach((request, index) => {
            if (index < 3) { // Log first 3 requests for debugging
              console.log(`🖼️ Cancellation request ${index + 1} image data:`, {
                id: request.id,
                order_number: request.order_number,
                product_image: request.product_image,
                is_custom: request.order_number?.startsWith('CUSTOM'),
                total_amount: request.total_amount
              });
            }
          });
        }
        setCancellationRequests(response.data.data || []);
      } else {
        console.error('❌ Failed to fetch cancellation requests:', response.data);
        toast.error('Failed to fetch cancellation requests');
      }
    } catch (error) {
      console.error('❌ Error fetching cancellation requests:', error);
      toast.error('Failed to fetch cancellation requests');
    } finally {
      setRequestsLoading(false);
    }
  }, []);
  
  // Process cancellation request
  const processCancellationRequest = async (requestId, action) => {
    try {
      console.log('BUTTON CLICKED: ' + action + ' for request ' + requestId);
      console.log((action === 'approve' ? 'Approving' : 'Rejecting') + ' cancellation request ' + requestId + '...');
      
      // Set loading state for this specific request
      setButtonLoading(prev => ({ ...prev, [`cancel_${requestId}_${action}`]: true }));
      
      const response = await api.put(`/orders/cancellation-requests/${requestId}`, {
        action,
        admin_notes: `Cancellation request ${action}d by admin on ${new Date().toLocaleString()}`
      });
      
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
        
        // Refresh cancellation requests
        fetchCancellationRequests();
        
        // Also refresh the main transactions if needed
        if (activeTab === 'orders') {
          fetchTransactions();
        }
      } else {
        console.error('❌ API returned error:', response.data);
        toast.error(response.data.message || `Failed to ${action} cancellation request`);
      }
    } catch (error) {
      console.error(`❌ Error ${action}ing cancellation request:`, error);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        toast.error('Cancellation request not found or already processed.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${action} cancellation request`);
      }
    } finally {
      // Clear loading state
      setButtonLoading(prev => ({ ...prev, [`cancel_${requestId}_${action}`]: false }));
    }
  };
  
  // Open processing modal
  const openProcessingModal = (request, action) => {
    setProcessingRequest({ ...request, action });
    setAdminNotes('');
    setShowProcessingModal(true);
  };
  
  // Close processing modal
  const closeProcessingModal = () => {
    setShowProcessingModal(false);
    setProcessingRequest(null);
    setAdminNotes('');
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
          console.log('First order structure:', {
            custom_order_id: allOrders[0].custom_order_id,
            id: allOrders[0].id,
            customer_name: allOrders[0].customer_name,
            status: allOrders[0].status
          });
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
        setShowDesignProcessingModal(false);
        setDesignAdminNotes('');
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

  const viewRefundDetails = (request) => {
    // You can implement a modal to view refund details here
    console.log('Viewing refund details:', request);
  };

  // Filtered refund requests for search
  const filteredRefundRequests = refundRequests.filter(request => {
    if (!refundSearchTerm) return true;
    
    const searchLower = refundSearchTerm.toLowerCase();
    return (
      request.order_number?.toLowerCase().includes(searchLower) ||
      request.customer_name?.toLowerCase().includes(searchLower) ||
      request.reason?.toLowerCase().includes(searchLower) ||
      request.status?.toLowerCase().includes(searchLower)
    );
  });
      
















































  // Open design processing modal
  const openDesignProcessingModal = (request, status) => {
    setProcessingDesignRequest({ ...request, status });
    setDesignAdminNotes('');
    setShowDesignProcessingModal(true);
  };
  // Close design processing modal
  const closeDesignProcessingModal = () => {
    setShowDesignProcessingModal(false);
    setProcessingDesignRequest(null);
    setDesignAdminNotes('');  };
  
  // Image handling functions
  const handleImageView = (imageSrc, imageName) => {
    setSelectedImage(imageSrc);
    setImageName(imageName || 'Image');
    setShowImageModal(true);
  };
  
  const handleImageDownload = async (imageSrc, imageName) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };
  
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setImageName('');
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
  const viewPaymentProof = (imagePath, customerName, orderNumber) => {
    setSelectedPaymentProof({
      imagePath,
      customerName,
      orderNumber
    });
    setShowPaymentProofModal(true);
  };

  // Close payment proof modal
  const closePaymentProofModal = () => {
    setShowPaymentProofModal(false);
    setSelectedPaymentProof(null);
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

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'pending').length,
      approved: data.filter(t => t.status === 'confirmed' || t.status === 'Order Received').length,
      processing: data.filter(t => t.status === 'processing').length,
      shipped: data.filter(t => t.status === 'shipped').length,
      delivered: data.filter(t => t.status === 'delivered' || t.status === 'order received').length,
      rejected: data.filter(t => t.status === 'cancelled').length,
      totalAmount: data.reduce((sum, t) => sum + parseFloat(t.total_amount || t.amount || 0), 0)
    };
    setStats(stats);
  };

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  /* Center the table content */
  display: flex;
  justify-content: center;
  
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
            {/* Statistics */}
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{stats.total}</h3>
                <p>Total Confirmed</p>
              </StatCard>
              <StatCard color="#27ae60">
                <h3>{stats.approved}</h3>
                <p>Confirmed Orders</p>
              </StatCard>
              <StatCard color="#000000">
                <h3>{formatCurrency(stats.totalAmount)}</h3>
                <p>Total Revenue</p>
              </StatCard>
              <StatCard color="#3498db">
                <h3>{stats.total > 0 ? (stats.totalAmount / stats.total).toFixed(0) : 0}</h3>
                <p>Avg Order Value</p>
              </StatCard>            </StatsContainer>

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
                      {transaction.order_number}
                    </OrderNumber>
                    
                    <DateInfo>
                      {formatDate(transaction.order_date)}
                    </DateInfo>
                    
                    <CustomerInfo>
                      <div className="name">{transaction.customer_name || transaction.first_name + ' ' + transaction.last_name || 'N/A'}</div>
                      <div className="separator">•</div>
                      <div className="email">{transaction.customer_email || transaction.user_email || 'N/A'}</div>
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
                      {formatDate(transaction.created_at)}
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
                              <span className="value">{transaction.customer_name || transaction.first_name + ' ' + transaction.last_name || 'N/A'}</span>
                            </div>
                            <span className="separator">•</span>
                            <div className="customer-field">
                              <span className="label">Email:</span>
                              <span className="value">{transaction.customer_email || transaction.user_email || 'N/A'}</span>
                            </div>
                            <span className="separator">•</span>
                            <div className="customer-field">
                              <span className="label">Phone:</span>
                              <span className="value">{
                                (transaction.contact_phone && transaction.contact_phone !== 'null' && transaction.contact_phone !== 'undefined') 
                                  ? transaction.contact_phone 
                                  : (transaction.customer_phone && transaction.customer_phone !== 'null' && transaction.customer_phone !== 'undefined') 
                                    ? transaction.customer_phone 
                                    : 'N/A'
                              }</span>
                            </div>
                          </HorizontalCustomerInfo>
                        </InfoSection>

                        {/* Shipping Address */}
                        <InfoSection>
                          <h4>Shipping Address</h4>
                          <InfoItem>
                            <span className="label">Shipping Information:</span>
                            <span className="value">{transaction.street_address || transaction.shipping_address || 'N/A'}</span>
                          </InfoItem>
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
                            <span className="value">{getDeliveryStatusInfo(transaction.delivery_status || 'pending').text}</span>
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
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{pendingVerificationOrders.length}</h3>
                <p>Total Orders</p>
              </StatCard>
              <StatCard color="#28a745">
                <h3>{pendingVerificationOrders.filter(order => order.payment_status === 'verified' || order.verification_completed).length}</h3>
                <p>Verified</p>
              </StatCard>
              <StatCard color="#ffc107">
                <h3>{pendingVerificationOrders.filter(order => !order.payment_status || order.payment_status === 'pending').length}</h3>
                <p>Pending</p>
              </StatCard>
              <StatCard color="#3498db">
                <h3>{formatCurrency(pendingVerificationOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0))}</h3>
                <p>Total Amount</p>
              </StatCard>
            </StatsContainer>

            {/* Search Bar */}
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
                <RefreshButton onClick={fetchPendingVerificationOrders} disabled={verificationLoading}>
                  <FontAwesomeIcon icon={faRefresh} />
                  {verificationLoading ? 'Loading...' : 'Refresh'}
                </RefreshButton>
              </ControlsGrid>
            </ControlsSection>

            {/* Payment History Table */}
            <TableWrapper>
              <TransactionsTable>
                <PaymentVerificationTableHeader>
                  <div>Image</div>
                  <div>Type</div>
                  <div>Order #</div>
                  <div>Date</div>
                  <div>Customer</div>
                  <div>Products</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Delivery Date</div>
                  <div>Courier</div>
                  <div>Payment Proof</div>
                  <div>Actions</div>
                </PaymentVerificationTableHeader>
                
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
                      const searchLower = verificationSearchTerm.toLowerCase();
                      return order.order_number?.toLowerCase().includes(searchLower) ||
                             order.customer_name?.toLowerCase().includes(searchLower) ||
                             order.customer_fullname?.toLowerCase().includes(searchLower) ||
                             `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchLower) ||
                             order.user_email?.toLowerCase().includes(searchLower) ||
                             order.gcash_reference_number?.toLowerCase().includes(searchLower);
                    })
                    .map((order) => (
                      <PaymentVerificationTableRow key={order.order_id || order.payment_id}>
                        <div style={{ width: '50px' }}>
                          {/* Product Image */}
                          {order.order_type === 'custom' ? (
                            <img 
                              src={order.image_paths && order.image_paths.length > 0 
                                ? `http://localhost:5000${order.image_paths[0]}` 
                                : `http://localhost:5000/uploads/default-product.png`} 
                              alt="Custom Product" 
                              style={{ 
                                width: 40, 
                                height: 40, 
                                objectFit: 'cover', 
                                borderRadius: 6, 
                                border: '1px solid #eee' 
                              }} 
                              onError={(e) => {
                                e.target.src = `http://localhost:5000/uploads/default-product.png`;
                              }}
                            />
                          ) : order.items && order.items.length > 0 && order.items[0].productimage ? (
                            <img 
                              src={`http://localhost:5000/uploads/${order.items[0].productimage}`}
                              alt="Product" 
                              style={{ 
                                width: 40, 
                                height: 40, 
                                objectFit: 'cover', 
                                borderRadius: 6, 
                                border: '1px solid #eee' 
                              }} 
                              onError={(e) => {
                                e.target.src = `http://localhost:5000/uploads/default-product.png`;
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #eee',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              No Img
                            </div>
                          )}
                        </div>
                        
                        <div>
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
                        
                        <div>
                          <OrderNumber>{order.order_number}</OrderNumber>
                        </div>
                        
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
                          {order.gcash_reference_number && (
                            <div style={{ 
                              fontSize: '9px', 
                              color: '#666666',
                              marginTop: '2px',
                              fontFamily: 'monospace'
                            }}>
                              GCash: {order.gcash_reference_number}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          {order.payment_proof_image_path ? (
                            <ActionButton
                              variant="view"
                              onClick={() => viewPaymentProof(order.payment_proof_image_path, order.customer_name, order.order_number)}
                            >
                              <FontAwesomeIcon icon={faImage} style={{ marginRight: '4px' }} />
                              View
                            </ActionButton>
                          ) : (
                            <span style={{ 
                              color: '#999999', 
                              fontSize: '11px',
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px',
                              background: '#f8f9fa',
                              borderRadius: '4px',
                              border: '1px solid #e9ecef'
                            }}>
                              No proof
                            </span>
                          )}
                        </div>
                        
                        <ActionsContainer className="stacked">
                          {order.payment_status === 'verified' || order.verification_completed ? (
                            // Already verified - show only view details
                            <div className="button-full">
                              <ActionButton
                                variant="view"
                                onClick={() => viewTransaction(order)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                                Details
                              </ActionButton>
                            </div>
                          ) : order.payment_status === 'rejected' ? (
                            // Rejected - show view details only
                            <div className="button-full">
                              <ActionButton
                                variant="view"
                                onClick={() => viewTransaction(order)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                                Details (Rejected)
                              </ActionButton>
                            </div>
                          ) : (
                            // Pending - show approve/deny buttons
                            <>
                              <div className="button-row">
                                <ActionButton
                                  variant="approve"
                                  onClick={() => approvePayment(order)}
                                  disabled={processingPayment}
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                  {processingPayment ? 'Processing...' : 'Approve'}
                                </ActionButton>
                                <ActionButton
                                  variant="reject"
                                  onClick={() => denyPayment(order)}
                                  disabled={processingPayment}
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                  {processingPayment ? 'Processing...' : 'Deny'}
                                </ActionButton>
                              </div>
                              <div className="button-full">
                                <ActionButton
                                  variant="view"
                                  onClick={() => viewTransaction(order)}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  Details
                                </ActionButton>
                              </div>
                            </>
                          )}
                        </ActionsContainer>
                      </PaymentVerificationTableRow>
                    ))
                )}
              </TransactionsTable>
            </TableWrapper>
          </>
        )}
        
        {/* Cancellation Requests Tab */}
        {activeTab === 'cancellations' && (
          <>
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{cancellationRequests.length}</h3>
                <p>Total Requests</p>
              </StatCard>
              <StatCard color="#ffc107">
                <h3>{cancellationRequests.filter(req => req.status === 'pending').length}</h3>
                <p>Pending</p>
              </StatCard>
              <StatCard color="#28a745">
                <h3>{cancellationRequests.filter(req => req.status === 'approved').length}</h3>
                <p>Approved</p>
              </StatCard>
              <StatCard color="#dc3545">
                <h3>{cancellationRequests.filter(req => req.status === 'rejected').length}</h3>
                <p>Rejected</p>
              </StatCard>
            </StatsContainer>

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
                  <div>Image</div>
                  <div>Request ID</div>
                  <div>Order Number</div>
                  <div>Product</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Reason</div>
                  <div>Status</div>
                  <div>Date</div>
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
                      return request.order_number?.toLowerCase().includes(searchLower) ||
                             request.customer_name?.toLowerCase().includes(searchLower) ||
                             request.reason?.toLowerCase().includes(searchLower) ||
                             request.status?.toLowerCase().includes(searchLower);
                    })
                    .map((request) => (
                      <TableRow key={request.id}>
                        <div style={{ width: '50px' }}>
                          {/* Product Image - enhanced for custom orders */}
                          {console.log('🖼️ Cancellation request:', {
                            id: request.id,
                            orderNumber: request.order_number,
                            orderType: request.order_type,
                            productImage: request.product_image,
                            isCustomPattern: request.order_number?.startsWith('CUSTOM-')
                          })}
                          
                          {request.product_image && request.product_image !== 'null' ? (
                            <>
                              <img 
                                src={(() => {
                                  // Handle different image path formats
                                  if (request.product_image.startsWith('http')) {
                                    return request.product_image;
                                  } else if (request.product_image.startsWith('/uploads/')) {
                                    return `http://localhost:5000${request.product_image}`;
                                  } else if (request.product_image === 'default-product.png') {
                                    return `http://localhost:5000/uploads/default-product.png`;
                                  } else if (request.product_image.startsWith('custom-orders/')) {
                                    return `http://localhost:5000/uploads/${request.product_image}`;
                                  } else if (request.order_type === 'custom' || request.order_number?.startsWith('CUSTOM-')) {
                                    // For custom orders, try custom-orders path first
                                    return `http://localhost:5000/uploads/custom-orders/${request.product_image}`;
                                  } else {
                                    return `http://localhost:5000/uploads/${request.product_image}`;
                                  }
                                })()} 
                                alt="Product" 
                                style={{ 
                                  width: 40, 
                                  height: 40, 
                                  objectFit: 'cover', 
                                  borderRadius: 6, 
                                  border: '1px solid #eee' 
                                }} 
                                onError={(e) => {
                                  // Enhanced error handling for different image types
                                  const originalSrc = e.target.src;
                                  console.log('🖼️ Image load error for:', originalSrc, 'Order:', request.order_number, 'Type:', request.order_type);
                                  
                                  // For custom orders, try custom-orders path if not already tried
                                  if ((request.order_type === 'custom' || request.order_number?.startsWith('CUSTOM-')) && 
                                      !originalSrc.includes('custom-orders/')) {
                                    e.target.src = `http://localhost:5000/uploads/custom-orders/${request.product_image}`;
                                    return;
                                  }
                                  
                                  // Try product-images path
                                  if (!originalSrc.includes('product-images/') && !originalSrc.includes('default-product.png')) {
                                    e.target.src = `http://localhost:5000/uploads/product-images/${request.product_image}`;
                                  } else if (!originalSrc.includes('default-product.png')) {
                                    e.target.src = `http://localhost:5000/uploads/default-product.png`;
                                  } else {
                                    // Final fallback: hide image and show placeholder
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = 'flex';
                                    }
                                  }
                                }}
                              />
                              <div 
                                style={{ 
                                  display: 'none', 
                                  width: 40, 
                                  height: 40, 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: 6,
                                  border: '1px solid #eee'
                                }}
                              >
                                <FontAwesomeIcon icon={faImage} style={{ color: '#ccc', fontSize: 16 }} />
                              </div>
                            </>
                          ) : (
                            <div style={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #eee',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              <FontAwesomeIcon icon={faImage} style={{ color: '#ccc' }} />
                            </div>
                          )}
                        </div>
                        
                        <div>{request.id}</div>
                        
                        <div>
                          <OrderNumber>{request.order_number}</OrderNumber>
                        </div>
                        
                        <div>
                          <div style={{ 
                            fontSize: '11px', 
                            fontWeight: '500',
                            marginBottom: '2px' 
                          }}>
                            {request.product_name || 'Product'}
                          </div>
                          <div style={{ 
                            fontSize: '9px', 
                            color: '#666666',
                            fontStyle: 'italic'
                          }}>
                            {request.size && `Size: ${request.size}`}
                            {request.color && ` • Color: ${request.color}`}
                            {request.quantity && ` • Qty: ${request.quantity}`}
                          </div>
                        </div>
                        
                        <div>
                          <CustomerInfo>
                            <div className="name">{request.customer_name}</div>
                            <div className="separator">•</div>
                            <div className="email">{request.customer_email}</div>
                          </CustomerInfo>
                        </div>
                        
                        <div>
                          {formatCurrency(request.amount || 0)}
                        </div>
                        
                        <div style={{ fontSize: '12px', maxWidth: '200px' }}>
                          {request.reason}
                        </div>
                        
                        <div>
                          <StatusBadge status={request.status}>
                            {request.status}
                          </StatusBadge>
                        </div>
                        
                        <DateInfo>
                          {formatDate(request.created_at)}
                        </DateInfo>
                        
                        <ActionsContainer>
                          {request.status === 'pending' ? (
                            <>
                              <ActionButton 
                                variant="success" 
                                onClick={() => processCancellationRequest(request.id, 'approve')}
                                style={{ marginRight: '8px' }}
                                loading={buttonLoading[`cancel_${request.id}_approve`]}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                                Approve
                              </ActionButton>
                              <ActionButton 
                                variant="danger" 
                                onClick={() => processCancellationRequest(request.id, 'deny')}
                                loading={buttonLoading[`cancel_${request.id}_deny`]}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                                Deny
                              </ActionButton>
                            </>
                          ) : (
                            <ActionButton 
                              variant="view"
                              onClick={() => viewTransaction(request)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              Details
                            </ActionButton>
                          )}
                        </ActionsContainer>
                      </TableRow>
                    ))
                )}
              </TransactionsTable>
            </TableWrapper>
          </>
        )}

        {/* Refund Requests Tab */}
        {activeTab === 'refund-requests' && (
          <>
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{refundRequests.length}</h3>
                <p>Total Requests</p>
              </StatCard>
              <StatCard color="#ffc107">
                <h3>{refundRequests.filter(req => req.status === 'pending').length}</h3>
                <p>Pending</p>
              </StatCard>
              <StatCard color="#28a745">
                <h3>{refundRequests.filter(req => req.status === 'approved').length}</h3>
                <p>Approved</p>
              </StatCard>
              <StatCard color="#dc3545">
                <h3>{refundRequests.filter(req => req.status === 'rejected').length}</h3>
                <p>Rejected</p>
              </StatCard>
            </StatsContainer>

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
                  <div>Image</div>
                  <div>Request ID</div>
                  <div>Order/Custom ID</div>
                  <div>Product</div>
                  <div>Reason</div>
                  <div>Price</div>
                  <div>Quantity</div>
                  <div>Size</div>
                  <div>Color</div>
                  <div>Phone</div>
                  <div>Shipping</div>
                  <div>Status</div>
                  <div>Date</div>
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
                    .map((request) => (
                      <TableRow key={request.id}>
                        <div style={{ width: '50px' }}>
                          {/* Product Image - improved with better path handling */}
                          {request.product_image ? (
                            <img 
                              src={request.product_image.startsWith('http') ? 
                                request.product_image : 
                                `http://localhost:5000/uploads/${request.product_image}`
                              } 
                              alt="Product" 
                              style={{ 
                                width: 40, 
                                height: 40, 
                                objectFit: 'cover', 
                                borderRadius: 6, 
                                border: '1px solid #eee' 
                              }} 
                              onError={(e) => {
                                // Try alternative paths if the first one fails
                                const originalSrc = e.target.src;
                                if (!originalSrc.includes('product-images/') && !originalSrc.includes('default-product.png')) {
                                  e.target.src = `http://localhost:5000/uploads/product-images/${request.product_image}`;
                                } else if (!originalSrc.includes('default-product.png')) {
                                  e.target.src = `http://localhost:5000/uploads/default-product.png`;
                                } else {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #eee',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              <FontAwesomeIcon icon={faImage} style={{ color: '#ccc' }} />
                            </div>
                          )}
                        </div>
                        <div>{request.id}</div>
                        <div>{request.order_id || request.custom_order_id}</div>
                        <div>
                          <div style={{ 
                            fontSize: '11px', 
                            fontWeight: '500',
                            marginBottom: '2px' 
                          }}>
                            {request.product_name}
                          </div>
                          <div style={{ 
                            fontSize: '9px', 
                            color: '#666666',
                            fontStyle: 'italic'
                          }}>
                            Product Details
                          </div>
                        </div>
                        
                        <div style={{ 
                          fontSize: '12px', 
                          maxWidth: '200px',
                          lineHeight: '1.3',
                          color: '#333'
                        }}>
                          {request.reason || 'No reason provided'}
                        </div>
                        
                        <div>{formatCurrency(request.price)}</div>
                        <div>{request.quantity}</div>
                        <div>{request.size}</div>
                        <div>{request.color}</div>
                        <div>{request.phone_number}</div>
                        <div style={{ fontSize: 12 }}>
                          {request.street_address}<br/>
                          {request.city_municipality}, {request.province}
                        </div>
                        <div>
                          <StatusBadge status={request.status}>{request.status}</StatusBadge>
                        </div>
                        <DateInfo>{formatDate(request.created_at)}</DateInfo>
                        <ActionsContainer>
                          {request.status === 'pending' ? (
                            <>
                              <ActionButton 
                                variant="success" 
                                onClick={() => processRefundRequest(request.id, 'approved')}
                                style={{ marginRight: '8px' }}
                                loading={buttonLoading[`refund_${request.id}_approve`]}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                                Approve
                              </ActionButton>
                              <ActionButton 
                                variant="danger" 
                                onClick={() => processRefundRequest(request.id, 'rejected')}
                                loading={buttonLoading[`refund_${request.id}_reject`]}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                                Deny
                              </ActionButton>
                            </>
                          ) : (
                            <ActionButton 
                              variant="view"
                              onClick={() => viewTransaction(request)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              Details
                            </ActionButton>
                          )}
                        </ActionsContainer>
                      </TableRow>
                    ))
                )}
              </TransactionsTable>
            </TableWrapper>
          </>
        )}
        
        {/* Custom Design Requests Tab */}
        {activeTab === 'design-requests' && (
          <>
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{customDesignRequests.length}</h3>
                <p>Total Requests</p>
              </StatCard>
              <StatCard color="#ffc107">
                <h3>{customDesignRequests.filter(req => req.status === 'pending').length}</h3>
                <p>Pending</p>
              </StatCard>
              <StatCard color="#28a745">
                <h3>{customDesignRequests.filter(req => req.status === 'approved').length}</h3>
                <p>Approved</p>
              </StatCard>
              <StatCard color="#dc3545">
                <h3>{customDesignRequests.filter(req => req.status === 'rejected').length}</h3>
                <p>Rejected</p>
              </StatCard>
            </StatsContainer>

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
                  <div>Image</div>
                  <div>Request ID</div>
                  <div>Customer</div>
                  <div>Product Type</div>
                  <div>Design Details</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Date</div>
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
                    .map((request) => (
                      <TableRow key={request.custom_order_id}>
                        <div style={{ width: '50px' }}>
                          {/* Product Image */}
                          {request.image_paths && request.image_paths.length > 0 ? (
                            <img 
                              src={`http://localhost:5000${request.image_paths[0]}`} 
                              alt="Custom Product" 
                              style={{ 
                                width: 40, 
                                height: 40, 
                                objectFit: 'cover', 
                                borderRadius: 6, 
                                border: '1px solid #eee' 
                              }} 
                              onError={(e) => {
                                e.target.src = `http://localhost:5000/uploads/default-product.png`;
                              }}
                            />
                          ) : request.product_image ? (
                            <img 
                              src={`http://localhost:5000/uploads/${request.product_image}`}
                              alt="Product" 
                              style={{ 
                                width: 40, 
                                height: 40, 
                                objectFit: 'cover', 
                                borderRadius: 6, 
                                border: '1px solid #eee' 
                              }} 
                              onError={(e) => {
                                e.target.src = `http://localhost:5000/uploads/default-product.png`;
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #eee',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              No Img
                            </div>
                          )}
                        </div>
                        
                        <div>{request.custom_order_id}</div>
                        
                        <div>
                          <CustomerInfo>
                            <div className="name">{request.customer_name}</div>
                            <div className="separator">•</div>
                            <div className="email">{request.customer_email}</div>
                          </CustomerInfo>
                        </div>
                        
                        <div>{request.product_type}</div>
                        
                        <div style={{ fontSize: '12px', maxWidth: '200px' }}>
                          {request.design_notes}
                        </div>
                        
                        <div>
                          {formatCurrency(request.price || 0)}
                        </div>
                        
                        <div>
                          <StatusBadge status={request.status}>
                            {request.status}
                          </StatusBadge>
                        </div>
                        
                        {/* Delivery Date Column */}
                        <div style={{ fontSize: '12px', textAlign: 'center' }}>
                          {request.estimated_delivery_date || request.scheduled_delivery_date ? (
                            <div>
                              <div style={{ fontWeight: '500', color: '#2c3e50', marginBottom: '2px' }}>
                                {formatDate(request.scheduled_delivery_date || request.estimated_delivery_date)}
                              </div>
                              {request.delivery_time_slot && (
                                <div style={{ fontSize: '10px', color: '#7f8c8d' }}>
                                  {request.delivery_time_slot}
                                </div>
                              )}
                              {request.delivery_status && (
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: request.delivery_status === 'delivered' ? '#27ae60' : 
                                         request.delivery_status === 'in_transit' ? '#f39c12' : 
                                         request.delivery_status === 'scheduled' ? '#3498db' : '#95a5a6',
                                  textTransform: 'capitalize',
                                  marginTop: '1px'
                                }}>
                                  {request.delivery_status.replace('_', ' ')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#bdc3c7', fontSize: '11px', fontStyle: 'italic' }}>
                              Not scheduled
                            </span>
                          )}
                        </div>
                        
                        {/* Courier Information Column */}
                        <div style={{ fontSize: '12px', textAlign: 'center' }}>
                          {request.courier_name ? (
                            <div>
                              <div style={{ fontWeight: '500', color: '#2c3e50', marginBottom: '2px' }}>
                                {request.courier_name}
                              </div>
                              {request.courier_phone && (
                                <div style={{ fontSize: '10px', color: '#7f8c8d' }}>
                                  {request.courier_phone}
                                </div>
                              )}
                              {request.courier_vehicle && (
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: '#9b59b6',
                                  textTransform: 'capitalize',
                                  marginTop: '1px'
                                }}>
                                  {request.courier_vehicle}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#bdc3c7', fontSize: '11px', fontStyle: 'italic' }}>
                              Not assigned
                            </span>
                          )}
                        </div>
                        
                        <DateInfo>
                          {formatDate(request.created_at)}
                        </DateInfo>
                        
                        <ActionsContainer>
                          {request.status === 'pending' ? (
                            <>
                              <ActionButton 
                                variant="approve" 
                                onClick={() => processDesignRequest(request.custom_order_id, 'approved')}
                                style={{ marginRight: '8px' }}
                                loading={buttonLoading[`design_${request.custom_order_id}_approve`]}
                                disabled={buttonLoading[`design_${request.custom_order_id}_approve`] || buttonLoading[`design_${request.custom_order_id}_reject`]}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                                Approve
                              </ActionButton>
                              <ActionButton 
                                variant="reject" 
                                onClick={() => processDesignRequest(request.custom_order_id, 'rejected')}
                                loading={buttonLoading[`design_${request.custom_order_id}_reject`]}
                                disabled={buttonLoading[`design_${request.custom_order_id}_approve`] || buttonLoading[`design_${request.custom_order_id}_reject`]}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                                Reject
                              </ActionButton>
                            </>
                          ) : (
                            <ActionButton 
                              variant="view"
                              onClick={() => viewTransaction(request)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              Details
                            </ActionButton>
                          )}
                        </ActionsContainer>
                      </TableRow>
                    ))
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
                <p><strong>Date:</strong> {new Date(selectedTransaction.created_at).toLocaleDateString()}</p>
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
                <strong>Order:</strong> {selectedPaymentProof.orderNumber}
              </div>
              <img 
                src={`http://localhost:5000${selectedPaymentProof.imagePath}`}
                alt="Payment Proof"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  if (e.target) {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'block';
                    }
                  }
                }}
              />
              <div style={{ display: 'none', padding: '40px', color: '#666' }}>
                Failed to load payment proof image
              </div>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default TransactionPage;
