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
  padding: 80px 24px 40px;
`;

const ContentWrapper = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 10px;
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
  gap: 1px;
  margin-bottom: 40px;
  background: #f5f5f5;
  border-radius: 2px;
  overflow: hidden;
`;

const StatCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})`
  background: #ffffff;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fafafa;
  }
  
  h3 {
    font-size: 32px;
    font-weight: 200;
    margin: 0 0 8px 0;
    color: ${props => props.color || '#000000'};
    line-height: 1;
  }
  
  p {
    color: #999999;
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 140px 180px 220px 200px 120px 120px 120px 150px 120px 100px;
  gap: 12px;
  padding: 20px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 12px;
  color: #555555;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 35px 120px 160px 180px 160px 100px 100px 100px 130px 100px 80px;
    gap: 10px;
    padding: 18px 12px;
    font-size: 11px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 30px 100px 140px 150px 140px 80px 80px 80px 110px 80px 60px;
    gap: 8px;
    padding: 16px 8px;
    font-size: 10px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 40px 140px 180px 220px 200px 120px 120px 120px 150px 120px 100px;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 35px 120px 160px 180px 160px 100px 100px 100px 130px 100px 80px;
    gap: 10px;
    padding: 18px 12px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 30px 100px 140px 150px 140px 80px 80px 80px 110px 80px 60px;
    gap: 8px;
    padding: 16px 8px;
  }
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #000000;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', monospace;
  letter-spacing: 0.5px;
  line-height: 1.4;
  word-break: break-all;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const CustomerInfo = styled.div`
  .name {
    font-weight: 600;
    color: #000000;
    font-size: 14px;
    margin-bottom: 6px;
    line-height: 1.3;
    word-break: break-word;
  }
  
  .email {
    color: #666666;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.2;
    word-break: break-word;
  }
  
  @media (max-width: 768px) {
    .name {
      font-size: 13px;
      margin-bottom: 4px;
    }
    
    .email {
      font-size: 11px;
    }
  }
`;

const OrderDetails = styled.div`
  .amount {
    font-weight: 600;
    color: #000000;
    font-size: 14px;
    margin-bottom: 6px;
  }
  
  .address {
    color: #666666;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 100%;
    word-break: break-word;
  }
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border: 1px solid;
  display: inline-block;
  text-align: center;
  min-width: 80px;
  transition: all 0.2s ease;
  line-height: 1;
  
  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 10px;
    min-width: 60px;
  }
  
  ${props => {
    switch (props.status?.toLowerCase()) {
      case 'pending':
        return `
          background: #ffffff;
          color: #f39c12;
          border-color: #f39c12;
        `;
      case 'confirmed':
      case 'approved':
        return `
          background: #ffffff;
          color: #27ae60;
          border-color: #27ae60;
        `;
      case 'processing':
        return `
          background: #ffffff;
          color: #3498db;
          border-color: #3498db;
        `;
      case 'shipped':
        return `
          background: #ffffff;
          color: #9b59b6;
          border-color: #9b59b6;
        `;
      case 'delivered':
        return `
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        `;
      case 'cancelled':
      case 'rejected':
        return `
          background: #ffffff;
          color: #e74c3c;
          border-color: #e74c3c;
        `;
      default:
        return `
          background: #ffffff;
          color: #666666;
          border-color: #cccccc;
        `;
    }
  }}
`;

const DateInfo = styled.div`
  color: #666666;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['compact', 'loading', 'variant'].includes(prop),
})`
  min-width: ${props => props.compact ? '32px' : '100px'};
  height: ${props => props.compact ? '32px' : '36px'};
  border: 1px solid;
  border-radius: 6px;
  font-size: ${props => props.compact ? '14px' : '12px'};
  font-weight: ${props => props.compact ? '400' : '600'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.compact ? '0' : '6px'};
  padding: ${props => props.compact ? '0' : '0 12px'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-width: ${props => props.compact ? '28px' : '80px'};
    height: ${props => props.compact ? '28px' : '32px'};
    font-size: ${props => props.compact ? '12px' : '11px'};
    padding: ${props => props.compact ? '0' : '0 8px'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
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
  `}
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
            transform: translateY(-2px);
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
            transform: translateY(-2px);
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
            transform: translateY(-2px);
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
            transform: translateY(-1px);
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
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

const OrderItemCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const OrderItemImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  svg {
    color: #6c757d;
    font-size: 20px;
  }
`;

const OrderItemDetails = styled.div`
  flex: 1;
  
  h5 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .item-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    
    span {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 12px;
      color: #6c757d;
    }
  }
  
  .item-price {
    font-size: 14px;
    font-weight: 600;
    color: #27ae60;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 4px;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InfoSection = styled.div`
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #000000;
    padding-bottom: 8px;
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

const ExpandToggleButton = styled.button`
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f0f0f0;
    color: #000000;
  }
  
  svg {
    transition: transform 0.2s ease;
  }
  
  &.expanded svg {
    transform: rotate(180deg);
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
  const [refundSearchTerm] = useState('');
  
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
        api.get('/custom-orders/approved').catch(error => {
          console.warn('Custom orders endpoint not available:', error.response?.status);
          return { data: { success: false, data: [] } };
        })
      ]);
      
      let allTransactions = [];
      
      // Process confirmed regular orders from delivery-enhanced endpoint
      if (ordersResponse.data.success) {
        console.log('Orders fetched from delivery-enhanced endpoint');
        const ordersData = ordersResponse.data.data || [];
        
        // Filter only confirmed orders (status = 'confirmed')
        const confirmedOrders = ordersData
          .filter(order => order && (order.status === 'confirmed' || order.order_status === 'confirmed'));
        
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
        console.log('Added ' + processedOrders.length + ' confirmed regular orders with delivery status');
      }
      
      // Process approved custom orders
      if (customOrdersResponse.data.success) {
        console.log('Custom orders fetched successfully');
        const customOrdersData = customOrdersResponse.data.data || [];
        
        // Filter only approved custom orders
        const approvedCustomOrders = customOrdersData
          .filter(order => order && order.status === 'approved');
        
        const processedCustomOrders = approvedCustomOrders
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
            order_status: 'approved', // Custom orders have different status
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
        console.log('Added ' + processedCustomOrders.length + ' approved custom orders');
      }
      
      // Sort all transactions by date (newest first) and filter out any null values
      allTransactions = allTransactions
        .filter(transaction => transaction !== null && transaction !== undefined)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
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
      console.log('Fetching custom design requests (pending custom orders)...');
      
      // Fetch all custom orders and filter for pending ones
      const response = await api.get('/custom-orders/admin/all');
      
      if (response.data.success) {
        console.log('✅ Custom orders fetched:', response.data);
        // Filter for only pending custom orders (these are the "design requests")
        const allOrders = response.data.data || [];
        const pendingOrders = allOrders.filter(order => order.status === 'pending');
        console.log('Found ' + pendingOrders.length + ' pending custom design requests out of ' + allOrders.length + ' total orders');
        
        // Debug: Show the structure of the first pending order
        if (pendingOrders.length > 0) {
          console.log('First pending order structure:', {
            custom_order_id: pendingOrders[0].custom_order_id,
            id: pendingOrders[0].id,
            customer_name: pendingOrders[0].customer_name,
            status: pendingOrders[0].status
          });
        }
        
        setCustomDesignRequests(pendingOrders);
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
    const loadingKey = designId + '-' + status;
    try {
      console.log('DESIGN BUTTON CLICKED');
      console.log('PROCESSING DESIGN REQUEST');
      console.log('   designId:', designId);
      console.log('   status:', status);
      
      // Set loading state
      setButtonLoading(prev => ({ ...prev, [loadingKey]: true }));
      
      // Use the custom-orders endpoint with the custom_order_id
      const response = await api.put(`/custom-orders/${designId}/status`, {
        status,
        admin_notes: designAdminNotes.trim() || undefined
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const successMessage = status === 'approved' 
          ? 'Design request approved! Order moved to delivery queue.' 
          : 'Design request rejected successfully.';
          
        toast.success(successMessage);
        
        // Refresh design requests
        fetchCustomDesignRequests();
        setShowDesignProcessingModal(false);
        setDesignAdminNotes('');
      } else {
        console.error('❌ API Error:', response.data);
        toast.error(response.data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error(`❌ Error processing design request:`, error);
      console.error('❌ Error details:', error.response?.data);
      toast.error(`Failed to ${status} design request`);
    } finally {
      setButtonLoading(prev => ({ ...prev, [loadingKey]: false }));
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
      console.log('Fetching pending verification orders...');
      
      const response = await api.get('/orders/pending-verification');
      
      if (response.data.success) {
        console.log('✅ Pending verification orders fetched:', response.data);
        setPendingVerificationOrders(response.data.data || []);
      } else {
        console.error('❌ Failed to fetch pending verification orders:', response.data);
        toast.error('Failed to fetch pending verification orders');
      }
    } catch (error) {
      console.error('❌ Error fetching pending verification orders:', error);
      
      // Check if it's a permission error (403) or server error (500)
      if (error.response?.status === 403) {
        console.log('ℹ️ User does not have permission to view pending verification orders (admin-only feature)');
        setPendingVerificationOrders([]); // Set empty array instead of showing error
      } else if (error.response?.status === 500) {
        console.error('Server error - the pending verification endpoint may need debugging');
        setPendingVerificationOrders([]); // Set empty array instead of showing error
      } else {
        toast.error('Failed to fetch pending verification orders');
        setPendingVerificationOrders([]); // Set empty array for any other error
      }
    } finally {
      setVerificationLoading(false);
    }
  }, []);

  // Approve payment
  const approvePayment = async (orderId) => {
    try {
      setProcessingPayment(true);
      console.log('Approving payment for order ' + orderId + '...');
      
      const response = await api.put(`/orders/${orderId}/approve-payment`);
      
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
  const denyPayment = async (orderId, reason) => {
    try {
      setProcessingPayment(true);
      console.log(`🔄 Denying payment for order ${orderId}...`);
      
      const response = await api.put(`/orders/${orderId}/deny-payment`, {
        reason: reason || 'Payment verification failed'
      });
      
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
      'delayed': { text: 'Delayed', color: '#dc3545' },
      'cancelled': { text: 'Cancelled', color: '#6c757d' }
    };
    return statusMap[status] || { text: status || 'Unknown', color: '#6c757d' };
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

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'pending').length,
      approved: data.filter(t => t.status === 'confirmed').length,
      processing: data.filter(t => t.status === 'processing').length,
      shipped: data.filter(t => t.status === 'shipped').length,
      delivered: data.filter(t => t.status === 'delivered').length,
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
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const TableWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: auto;
  
  @media (max-width: 1200px) {
    max-width: 100%;
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
                        {/* Customer Information */}
                        <InfoSection>
                          <h4>Customer Information</h4>
                          <InfoItem>
                            <span className="label">Name:</span>
                            <span className="value">{transaction.customer_name || transaction.first_name + ' ' + transaction.last_name || 'N/A'}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">Email:</span>
                            <span className="value">{transaction.customer_email || transaction.user_email || 'N/A'}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">Phone:</span>
                            <span className="value">{transaction.customer_phone || transaction.contact_phone || 'N/A'}</span>
                          </InfoItem>
                        </InfoSection>

                        {/* Shipping Address */}
                        <InfoSection>
                          <h4>Shipping Address</h4>
                          <InfoItem>
                            <span className="label">Street:</span>
                            <span className="value">{transaction.street_address || transaction.shipping_address || 'N/A'}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">City:</span>
                            <span className="value">{transaction.city_municipality || transaction.city || 'N/A'}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">Province:</span>
                            <span className="value">{transaction.province || 'N/A'}</span>
                          </InfoItem>
                          <InfoItem>
                            <span className="label">ZIP Code:</span>
                            <span className="value">{transaction.zip_code || transaction.postal_code || 'N/A'}</span>
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
                        </InfoSection>

                        {/* All Items */}
                        {transaction.items && transaction.items.length > 0 && (
                          <div style={{ marginTop: '24px' }}>
                            <h3>Order Items ({transaction.items.length})</h3>
                            <OrderItemsList>
                              {transaction.items.map((item, index) => (
                                <OrderItemCard key={`modal-${(selectedTransaction?.transaction_id || selectedTransaction?.id || 'unknown')}-item-${index}`}>
                                  <OrderItemImage>
                                    {item.productimage ? (
                                      <img
                                        src={`http://localhost:5000/uploads/${item.productimage}`}
                                        alt={item.productname}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
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

                              {/* Debug - Show all item properties in a structured way */}
                              {transaction.items.map((item, index) => (
                                <div key={`debug-item-${index}`} style={{ 
                                  background: '#f1f3f4', 
                                  padding: '8px', 
                                  borderRadius: '4px',
                                  marginTop: '8px',
                                  fontSize: '12px',
                                  color: '#333',
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '12px'
                                }}>
                                  <div>
                                    <strong>Item ID:</strong> {item.id}<br />
                                    <strong>Product Name:</strong> {item.productname || 'N/A'}<br />
                                    <strong>Product Type:</strong> {item.product_type || 'N/A'}<br />
                                  </div>
                                  <div>
                                    <strong>Color:</strong> {item.color || 'N/A'}<br />
                                    <strong>Size:</strong> {item.size || 'N/A'}<br />
                                    <strong>Quantity:</strong> {item.quantity}<br />
                                    <strong>Price:</strong> ₱{parseFloat(item.product_price || 0).toFixed(2)}<br />
                                    <strong>Subtotal:</strong> ₱{parseFloat(item.subtotal || 0).toFixed(2)}<br />
                                  </div>
                                </div>
                              ))}
                            </OrderItemsList>
                          </div>
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
        
        {/* Verify Payment Tab */}
        {activeTab === 'verify-payment' && (
          <>
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{pendingVerificationOrders.length}</h3>
                <p>Total Pending</p>
              </StatCard>
              <StatCard color="#ffc107">
                <h3>{pendingVerificationOrders.filter(order => order.gcash_reference_number).length}</h3>
                <p>With GCash Ref</p>
              </StatCard>
              <StatCard color="#28a745">
                <h3>{pendingVerificationOrders.filter(order => order.payment_proof_image_path).length}</h3>
                <p>With Payment Proof</p>
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
                    placeholder="Search by order number, customer name, or GCash reference..."
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

            {/* Pending Verification Orders Table */}
            <TableWrapper>
              <TransactionsTable>
                <TableHeader>
                  <div></div>
                  <div>Order #</div>
                  <div>Date</div>
                  <div>Customer</div>
                  <div>Products</div>
                  <div>Amount</div>
                  <div>GCash Ref</div>
                  <div>Payment Proof</div>
                  <div>Actions</div>
                </TableHeader>
                
                {verificationLoading ? (
                  <TableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                      Loading pending verification orders...
                    </div>
                  </TableRow>
                ) : pendingVerificationOrders.length === 0 ? (
                  <TableRow>
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#666666' 
                    }}>
                      <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
                      No orders pending payment verification found.
                    </div>
                  </TableRow>
                ) : (
                  pendingVerificationOrders
                    .filter(order => {
                      const searchLower = verificationSearchTerm.toLowerCase();
                      return order.order_number?.toLowerCase().includes(searchLower) ||
                             order.customer_fullname?.toLowerCase().includes(searchLower) ||
                             `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchLower) ||
                             order.user_email?.toLowerCase().includes(searchLower) ||
                             order.gcash_reference_number?.toLowerCase().includes(searchLower);
                    })
                    .map((order) => (
                      <TableRow key={order.order_id}>
                        <div style={{ width: '40px' }}>
                          <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ffc107' }} />
                        </div>
                        
                        <div>
                          <OrderNumber>{order.order_number}</OrderNumber>
                        </div>
                        
                        <DateInfo>
                          {formatDate(order.order_date)}
                        </DateInfo>
                        
                        <div>
                          <CustomerInfo>
                            <div className="name">
                              {order.customer_fullname || `${order.first_name} ${order.last_name}`}
                            </div>
                            <div className="email">{order.user_email}</div>
                          </CustomerInfo>
                        </div>
                        
                        <div>
                          {order.items && order.items.length > 0 ? (
                            <div>
                              <div style={{ 
                                fontSize: '13px', 
                                fontWeight: '500',
                                marginBottom: '4px' 
                              }}>
                                {order.items[0].productname}
                              </div>
                              {order.items.length > 1 && (
                                <div style={{ 
                                  fontSize: '11px', 
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
                        
                        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                          {order.gcash_reference_number || 'N/A'}
                        </div>
                        
                        <div>
                          {order.payment_proof_image_path ? (
                            <ActionButton
                            >
                              <FontAwesomeIcon icon={faImage} style={{ marginRight: '4px' }} />
                              View
                            </ActionButton>
                          ) : (
                            <span style={{ color: '#999999', fontSize: '12px' }}>No proof</span>
                          )}
                        </div>
                        
                        <ActionsContainer>
                          <ActionButton
                            variant="success"
                            onClick={() => approvePayment(order.order_id)}
                            disabled={processingPayment}
                            style={{ marginRight: '8px' }}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            {processingPayment ? 'Processing...' : 'Approve'}
                          </ActionButton>
                          <ActionButton
                            variant="view"
                            onClick={() => viewTransaction(order)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                            Details
                          </ActionButton>
                        </ActionsContainer>
                      </TableRow>
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
                  <div></div>
                  <div>Request ID</div>
                  <div>Order Number</div>
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
                        <div style={{ width: '40px' }}>
                          <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ffc107' }} />
                        </div>
                        
                        <div>{request.id}</div>
                        
                        <div>
                          <OrderNumber>{request.order_number}</OrderNumber>
                        </div>
                        
                        <div>
                          <CustomerInfo>
                            <div className="name">{request.customer_name}</div>
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
                    placeholder="Search custom design requests..."
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

            {/* Custom Design Requests Table */}
            <TableWrapper>
              <TransactionsTable>
                <TableHeader>
                  <div></div>
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
                      Loading custom design requests...
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
                        <div style={{ width: '40px' }}>
                          <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ffc107' }} />
                        </div>
                        
                        <div>{request.custom_order_id}</div>
                        
                        <div>
                          <CustomerInfo>
                            <div className="name">{request.customer_name}</div>
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
                        
                        <DateInfo>
                          {formatDate(request.created_at)}
                        </DateInfo>
                        
                        <ActionsContainer>
                          {request.status === 'pending' ? (
                            <>
                              <ActionButton 
                                variant="success" 
                                onClick={() => processDesignRequest(request.custom_order_id, 'approved')}
                                style={{ marginRight: '8px' }}
                                loading={buttonLoading[`design_${request.custom_order_id}_approve`]}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                                Approve
                              </ActionButton>
                              <ActionButton 
                                variant="danger" 
                                onClick={() => processDesignRequest(request.custom_order_id, 'rejected')}
                                loading={buttonLoading[`design_${request.custom_order_id}_reject`]}
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
      </ContentWrapper>
    </PageContainer>
  );
};

export default TransactionPage;
