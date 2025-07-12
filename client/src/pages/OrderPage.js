import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faUser, 
  faPhone, 
  faMoneyBillWave,
  faCheck,
  faSpinner,
  faEye,
  faMinus,
  faPlus,
  faClipboardList,
  faTrash,
  faTruck,
  faUpload,
  faCreditCard,
  faShieldAlt,
  faExclamationTriangle,
  faTimes,
  faCheckCircle,
  faClock,
  faUndo,
  faDownload,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import InvoiceModal from '../components/InvoiceModal';
import TopBar from '../components/TopBar';

// Philippine address data - Metro Manila (NCR)
const philippineAddressData = {
  "Metro Manila": [
    "Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Muntinlupa", 
    "Parañaque", "Las Piñas", "Marikina", "Pasay", "Caloocan", "Malabon", 
    "Navotas", "Valenzuela", "San Juan", "Mandaluyong", "Pateros"
  ]
};

// Modern Minimalist Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 80px 16px 40px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  text-align: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666666;
  margin: 0;
  font-weight: 400;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? '#000000' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#666666'};
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#000000' : '#f5f5f5'};
    color: ${props => props.active ? '#ffffff' : '#000000'};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 800px;
  }
`;

const CartSection = styled.div`
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const CheckoutSection = styled.div`
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 100px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;  
  
  svg {
    color: #666666;
  }
`;

const OrderSummary = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666666;
  
  &.total {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    border-top: 1px solid #e0e0e0;
    padding-top: 12px;
    margin-top: 12px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover {
    background: #333333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: #cccccc;
    color: #666666;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 32px;
  color: #666666;
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  margin: 20px 0;
  
  svg {
    margin-bottom: 20px;
    color: #000000;
  }
  
  p {
    font-size: 16px;
    margin: 0;
    font-weight: 500;
    color: #000000;
  }
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const OrderCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #cccccc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const OrderNumber = styled.h3`
  margin: 0;
  color: #000000;
  font-size: 18px;
  font-weight: 600;
`;

const OrderStatus = styled.span`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      case 'confirmed':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      case 'processing':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'shipped':
        return 'background: #cce5ff; color: #004085; border: 1px solid #99d1ff;';
      case 'delivered':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'cancelled':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'denied':
        return 'background: #ffeaa7; color: #856404; border: 1px solid #ffdb70;';
      default:
        return 'background: #e2e3e5; color: #383d41; border: 1px solid #d1ecf1;';
    }
  }}
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const OrderInfo = styled.div`
  font-size: 14px;
  color: #666666;
  
  strong {
    color: #000000;
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary',
})`
  padding: 8px 16px;
  border: 1px solid ${props => props.primary ? '#000000' : '#e0e0e0'};
  background: ${props => props.primary ? '#000000' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#333333'};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.primary ? '#333333' : '#f5f5f5'};
    border-color: ${props => props.primary ? '#333333' : '#cccccc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  background: #dc3545;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    background: #c82333;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// Order Items Display Components
const OrderItems = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  
  &:hover {
    background: #f5f5f5;
    border-color: #cccccc;
  }
`;

const OrderItemsHeader = styled.div`
  font-weight: 600;
  margin-bottom: 16px;
  color: #000000;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 2px solid #f0f0f0;
`;

const OrderItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #cccccc;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: #fafafa;
  }
`;

const OrderItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #000000;
    transform: scale(1.05);
  }
`;

const OrderItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 8px;
`;

const OrderItemName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #000000;
  margin-bottom: 4px;
`;

const OrderItemMeta = styled.div`
  font-size: 13px;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const OrderItemBadge = styled.span`
  padding: 3px 8px;
  background: #f0f0f0;
  color: #333333;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #e0e0e0;
  white-space: nowrap;
`;

const OrderItemDescription = styled.div`
  font-size: 12px;
  color: #888888;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const OrderItemPrice = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #000000;
  text-align: right;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const OrderItemPriceBreakdown = styled.div`
  font-size: 11px;
  color: #888888;
  text-align: right;
`;

const ShippingSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: 1 / -1;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  margin-bottom: 8px;
  color: #333333;
  font-weight: 500;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  option {
    padding: 8px;
  }
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #999999;
  }
`;

// Cart Item Components
const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #000000;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #000000;
`;

const ItemSpecs = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ItemBadge = styled.span`
  padding: 4px 8px;
  background: #000000;
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #000000;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 2px solid #000000;
  background: #ffffff;
  color: #000000;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: 600;
  
  &:hover:not(:disabled) {
    background: #000000;
    color: #ffffff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #000000;
`;

const ItemPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const Price = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: #000000;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #999999;
  }
`;

// Delivery Tracking Components
const DeliveryTrackingSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  border-radius: 8px;
  border: 1px solid #e1f5fe;
`;

const DeliveryTrackingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  
  h4 {
    margin: 0;
    color: #1976d2;
    font-size: 14px;
    font-weight: 600;
  }
  
  svg {
    color: #1976d2;
  }
`;

const DeliveryStatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    // Map all backend statuses to the allowed display statuses
    const displayStatus = (() => {
      const status = props.status;
      if (status === 'delivered') return 'delivered';
      if (status === 'delayed') return 'delayed';
      if (status === 'shipped' || status === 'in_transit') return 'in_transit';
      // All other statuses (pending, scheduled, confirmed, processing, etc.) map to confirmed
      return 'confirmed';
    })();
    
    switch (displayStatus) {
      case 'confirmed':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      case 'in_transit':
        return 'background: #000000; color: #ffffff; border: 1px solid #333333;';
      case 'delivered':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'delayed':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      default:
        return 'background: #e2e3e5; color: #383d41; border: 1px solid #d1ecf1;';
    }
  }}
`;

const DeliveryInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  font-size: 13px;
  
  .delivery-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .label {
      color: #666666;
      font-weight: 500;
    }
    
    .value {
      color: #000000;
      font-weight: 400;
    }
  }
`;

const CourierInfo = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  border: 1px solid rgba(25, 118, 210, 0.2);
  font-size: 12px;
  
  .courier-name {
    font-weight: 600;
    color: #1976d2;
    margin-bottom: 2px;
  }
  
  .courier-phone {
    color: #666666;
  }
`;

// Refund Request Components  
const RefundModal = styled.div`
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

const RefundModalContent = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const RefundForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RefundFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RefundInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const RefundTextarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

// Payment Section Components
const PaymentSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 8px;
  border: 1px solid #4caf50;
`;

const PaymentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  
  h4 {
    margin: 0;
    color: #2e7d32;
    font-size: 14px;
    font-weight: 600;
  }
  
  svg {
    color: #2e7d32;
  }
`;

const PaymentInfo = styled.div`
  font-size: 13px;
  color: #333333;
  margin-bottom: 12px;
`;

const PaymentProofUpload = styled.div`
  padding: 12px;
  border: 2px dashed #4caf50;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2e7d32;
    background: rgba(76, 175, 80, 0.05);
  }
`;

const PaymentProofPreview = styled.div`
  margin-top: 12px;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 6px;
    border: 1px solid #4caf50;
  }
`;

// Refund Components
const RefundSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 8px;
  border: 1px solid #ffcc02;
`;

const RefundHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  
  h4 {
    margin: 0;
    color: #f57c00;
    font-size: 14px;
    font-weight: 600;
  }
  
  svg {
    color: #f57c00;
  }
`;

const RefundStatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      case 'approved':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'rejected':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'processing':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      default:
        return 'background: #e2e3e5; color: #383d41; border: 1px solid #d1ecf1;';
    }
  }}
`;

const RefundModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    color: #000000;
    font-size: 18px;
    font-weight: 600;
  }
`;

const RefundLabel = styled.label`
  font-weight: 500;
  color: #333333;
  font-size: 14px;
`;

const RefundButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const RefundButton = styled.button`
  padding: 10px 20px;
  border: 1px solid ${props => props.primary ? '#000000' : '#e0e0e0'};
  background: ${props => props.primary ? '#000000' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#333333'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#333333' : '#f5f5f5'};
    border-color: ${props => props.primary ? '#333333' : '#cccccc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Order Page Component
const OrderPage = () => {  const [activeTab, setActiveTab] = useState('cart');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: '',
    customer_email: '',
    contact_phone: '',
    province: '',
    city: '',
    street_address: '',
    postal_code: '',
    payment_method: 'gcash',
    notes: '',
    payment_proof: null,
    payment_reference: ''
  });
  
  // Add state for managing city options
  const [availableCities, setAvailableCities] = useState([]);
  
  // Payment proof upload state
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  
  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  
  // Refund request state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundProofFile, setRefundProofFile] = useState(null);
  const [refundProofPreview, setRefundProofPreview] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  
  // Cancellation reason modal states
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationCallback, setCancellationCallback] = useState(null);
  

  
  const { cartItems, cartTotal, cartCount, updateCartItem, removeFromCart, loading: cartLoading } = useCart();
  const { currentUser: user } = useAuth(); // Get current user
  const { updateMultipleProductsStock } = useStock(); // Get stock context
  
  // Function to fetch order items separately if not included
  const fetchOrderItems = useCallback(async (orderId) => {
    try {
      // Don't fetch items for custom orders - they already have items included
      if (typeof orderId === 'string' && orderId.startsWith('custom-')) {
        console.log(`🎨 Skipping items fetch for custom order ID: ${orderId} (items already included)`);
        return [];
      }
      
      console.log(`🔍 Fetching items for order ID: ${orderId}`);
      const response = await api.get(`/orders/${orderId}/items`);
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} items for order ${orderId}:`, response.data.data);
        return response.data.data;
      } else {
        console.log(`❌ No items found for order ${orderId}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching items for order ${orderId}:`, error);
      return [];
    }
  }, []);

  // Function to ensure all orders have their items loaded
  const ensureOrderItemsLoaded = useCallback(async (orders) => {
    const updatedOrders = [];
    
    for (const order of orders) {
      if (!order.items || order.items.length === 0) {
        console.log(`🔄 Order ${order.order_number} has no items, fetching separately...`);
        const items = await fetchOrderItems(order.id);
        updatedOrders.push({ ...order, items });
      } else {
        updatedOrders.push(order);
      }
    }
    
    return updatedOrders;
  }, [fetchOrderItems]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both regular orders and custom orders in parallel
      const [regularOrdersResponse, customOrdersResponse] = await Promise.allSettled([
        api.get('/orders/me-with-items'),
        api.get('/custom-orders/my-orders')
      ]);
      
      let allOrders = [];
      
      // Process regular orders
      if (regularOrdersResponse.status === 'fulfilled' && regularOrdersResponse.value.data.success) {
        const regularOrders = regularOrdersResponse.value.data.data || [];
        
        // Filter out any test/sample orders and remove duplicates
        const filteredRegularOrders = regularOrders.filter(order => {
          const orderNumber = order.order_number || '';
          const isTestOrder = orderNumber.toLowerCase().includes('test') || 
                             orderNumber.toLowerCase().includes('sample') ||
                             orderNumber.startsWith('TEST_');
          return !isTestOrder;
        });
        
        // Remove duplicates based on order ID and add order type
        const uniqueRegularOrders = filteredRegularOrders
          .filter((order, index, self) => index === self.findIndex(o => o.id === order.id))
          .map(order => ({ ...order, order_type: 'regular' }));
        
        console.log(`📦 Fetched ${uniqueRegularOrders.length} regular orders`);
        allOrders = [...allOrders, ...uniqueRegularOrders];
      } else {
        console.warn('Failed to fetch regular orders:', regularOrdersResponse.reason);
      }
      
      // Process custom orders
      if (customOrdersResponse.status === 'fulfilled' && customOrdersResponse.value.data.success) {
        const customOrders = customOrdersResponse.value.data.data || [];
        
        // Transform custom orders to match the regular order structure
        const transformedCustomOrders = customOrders.map(customOrder => ({
          id: `custom-${customOrder.custom_order_id}`, // Unique ID to avoid conflicts
          order_number: customOrder.custom_order_id,
          order_date: customOrder.created_at,
          total_amount: customOrder.final_price || customOrder.total_amount,
          payment_method: 'gcash', // Custom orders use GCash
          payment_status: customOrder.payment_status,
          status: customOrder.status,
          delivery_status: customOrder.delivery_status,
          order_type: 'custom',
          
          // Map delivery-related fields for custom orders
          contact_phone: customOrder.customer_phone,
          street_address: customOrder.street_number, // custom orders use street_number
          city_municipality: customOrder.municipality, // custom orders use municipality
          province: customOrder.province,
          zip_code: customOrder.postal_code,
          shipping_address: customOrder.shipping_address || 
            [customOrder.street_number, customOrder.house_number, customOrder.municipality, customOrder.province].filter(Boolean).join(', '),
          
          // Delivery scheduling fields
          scheduled_delivery_date: customOrder.estimated_delivery_date,
          scheduled_delivery_time: customOrder.scheduled_delivery_time,
          delivery_date: customOrder.actual_delivery_date,
          delivery_notes: customOrder.delivery_notes,
          
          // Payment and confirmation dates
          payment_verified_at: customOrder.payment_verified_at,
          confirmed_at: customOrder.payment_verified_at || customOrder.created_at,
          
          // Courier information (may not be available in custom orders)
          courier_name: customOrder.courier_name,
          courier_phone: customOrder.courier_phone,
          
          // Create items array from custom order data
          items: [{
            product_id: `custom-${customOrder.custom_order_id}`,
            productname: customOrder.product_display_name || customOrder.product_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            productdescription: `Custom ${customOrder.product_type || 'Item'} - ${customOrder.description || 'Custom Design'}`,
            quantity: customOrder.quantity || 1,
            price: customOrder.final_price || customOrder.total_amount,
            product_type: customOrder.product_type,
            // Set the main image from custom order images
            productimage: customOrder.images && customOrder.images.length > 0 
              ? customOrder.images[0].filename 
              : null,
            // Store all custom order images for gallery view
            custom_order_images: customOrder.images || [],
            // Add custom order specific fields
            is_custom_order: true,
            custom_order_id: customOrder.custom_order_id,
            product_size: customOrder.size,
            product_color: customOrder.color,
            customer_name: customOrder.customer_name
          }],
          // Store original custom order data for reference
          custom_order_data: customOrder
        }));
        
        console.log(`🎨 Fetched ${transformedCustomOrders.length} custom orders`);
        allOrders = [...allOrders, ...transformedCustomOrders];
      } else {
        console.warn('Failed to fetch custom orders:', customOrdersResponse.reason);
      }
      
      // Sort all orders by date (newest first)
      allOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      
      // Debug: Log combined orders
      console.log('📦 Combined orders:', allOrders);
      allOrders.forEach(order => {
        console.log(`Order ${order.order_number} (${order.order_type}):`, {
          status: order.status,
          delivery_status: order.delivery_status,
          payment_status: order.payment_status,
          items: order.items,
          itemsCount: order.items ? order.items.length : 'No items array'
        });
      });
      
      // Ensure all regular orders have their items loaded
      console.log('🔄 Ensuring all regular orders have items loaded...');
      const regularOrdersWithItems = await ensureOrderItemsLoaded(allOrders.filter(o => o.order_type === 'regular'));
      const customOrdersWithItems = allOrders.filter(o => o.order_type === 'custom');
      
      // Combine and sort again
      const finalOrders = [...regularOrdersWithItems, ...customOrdersWithItems]
        .sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      
      setOrders(finalOrders);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [ensureOrderItemsLoaded]);

  // Utility function for formatting currency
  // Determine display status based on order status and cancellation request status
  const getOrderDisplayStatus = (order) => {
    // Check if there's a cancellation request for this order
    if (order.cancellation_request_status) {
      switch (order.cancellation_request_status) {
        case 'approved':
          return {
            status: 'cancelled',
            displayText: 'Cancelled'
          };
        case 'denied':
          return {
            status: 'denied', // Use special denied status for styling
            displayText: 'Cancellation Request Denied'
          };
        case 'pending':
          return {
            status: order.status,
            displayText: `${order.status} (Cancellation Pending)`
          };
        default:
          return {
            status: order.status,
            displayText: order.status
          };
      }
    }
    
    // No cancellation request, show normal status
    return {
      status: order.status,
      displayText: order.status
    };
  };


  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'myorders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, user]);

  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        customer_name: user.username || '',
        customer_email: user.email || ''
      }));
    }
  }, [user]);

  // Auto-select Metro Manila and load cities on component mount
  useEffect(() => {
    setCheckoutForm(prev => ({
      ...prev,
      province: 'Metro Manila'
    }));
    setAvailableCities(philippineAddressData['Metro Manila'] || []);
  }, []);

  // Auto-refresh orders every 30 seconds when on orders tab
  useEffect(() => {
    let interval;
    
    if (activeTab === 'orders' || activeTab === 'myorders') {
      interval = setInterval(() => {
        console.log('🔄 Auto-refreshing orders...');
        fetchOrders();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTab, fetchOrders]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'province') {
      // Reset city when province changes and update available cities
      setCheckoutForm(prev => ({
        ...prev,
        [name]: value,
        city: '' // Reset city selection
      }));
      setAvailableCities(philippineAddressData[value] || []);
    } else {
      setCheckoutForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleCheckout = async () => {
    try {
      // Validate required address fields
      if (!checkoutForm.contact_phone || !checkoutForm.province || !checkoutForm.city || !checkoutForm.street_address) {
        toast.error('Please fill in all required fields including complete address');
        return;
      }

      // Validate payment proof is uploaded
      if (!paymentProofFile) {
        toast.error('Please upload GCash payment proof before proceeding');
        return;
      }

      // Validate payment reference
      if (!checkoutForm.payment_reference || checkoutForm.payment_reference.length < 8) {
        toast.error('Please enter a valid GCash reference number (at least 8 characters)');
        return;
      }

      setLoading(true);
      
      console.log('🛒 Creating order with cart items:', cartItems);
      console.log('📦 Cart total:', cartTotal);
      console.log('👤 User:', user?.id);
      
      // Combine address fields into shipping_address for backend compatibility
      const combinedAddress = [
        checkoutForm.street_address,
        checkoutForm.city,
        checkoutForm.province,
        checkoutForm.postal_code
      ].filter(Boolean).join(', ');
      
      // Create FormData for order with payment proof
      const formData = new FormData();
      formData.append('customer_name', checkoutForm.customer_name);
      formData.append('customer_email', checkoutForm.customer_email);
      formData.append('contact_phone', checkoutForm.contact_phone); // Note: different field name
      formData.append('shipping_address', combinedAddress);
      formData.append('province', checkoutForm.province);
      formData.append('city_municipality', checkoutForm.city); // Note: different field name
      formData.append('street_address', checkoutForm.street_address);
      formData.append('zip_code', checkoutForm.postal_code); // Note: different field name
      formData.append('payment_method', 'gcash');
      formData.append('payment_reference', checkoutForm.payment_reference);
      formData.append('notes', checkoutForm.notes);
      formData.append('payment_proof', paymentProofFile);
      
      // Debug: Log what we're sending
      console.log('🚀 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (key === 'payment_proof') {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: "${value}"`);
        }
      }
      console.log('📱 Combined address:', combinedAddress);
      console.log('☎️ Contact phone:', checkoutForm.contact_phone);
      
      const response = await api.post('/orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Order created successfully! Stock has been updated immediately.');
        
        // Update stock context immediately with the affected products
        if (response.data.stockUpdateEvent && response.data.stockUpdateEvent.productIds) {
          console.log('📦 Updating stock immediately for products:', response.data.stockUpdateEvent.productIds);
          await updateMultipleProductsStock(response.data.stockUpdateEvent.productIds);
          
          // Broadcast stock update event for real-time UI updates
          window.dispatchEvent(new CustomEvent('stockUpdated', {
            detail: {
              type: 'order_placed',
              productIds: response.data.stockUpdateEvent.productIds,
              timestamp: new Date().toISOString()
            }
          }));
          
          // Update localStorage for cross-tab communication
          localStorage.setItem('stock_updated', JSON.stringify({
            type: 'order_placed',
            productIds: response.data.stockUpdateEvent.productIds,
            timestamp: new Date().toISOString()
          }));
        }
        
        setActiveTab('orders');
        setCheckoutForm({
          customer_name: user?.username || '',
          customer_email: user?.email || '',
          contact_phone: '',
          province: '',
          city: '',
          street_address: '',
          postal_code: '',
          payment_method: 'gcash',
          notes: '',
          payment_proof: null,
          payment_reference: ''
        });
        setAvailableCities([]); // Reset cities
        setPaymentProofFile(null);
        setPaymentProofPreview(null);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      // Handle token expiration specifically
      if (error.message === 'Token has expired' || error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        // Clear user data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // More detailed error diagnosis
      if (error.code === 'ERR_NETWORK') {
        console.error('🚫 NETWORK ERROR: Server is not responding');
        toast.error('Network error: Please check if the server is running and try again.');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🚫 CONNECTION REFUSED: Server is not running');
        toast.error('Connection refused: Server is not running. Please contact support.');
      } else if (!error.response) {
        console.error('🚫 NO RESPONSE: Server did not respond');
        toast.error('Server is not responding. Please try again later or contact support.');
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            `Failed to create order (${error.code || 'Unknown error'})`;
        
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      setLoading(true);
      console.log('🔄 Confirming order for admin verification:', orderId);
      
      // Find the order to determine its type
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }
      
      // Use different API endpoints for custom vs regular orders
      let apiEndpoint;
      let actualOrderId;
      
      if (order.order_type === 'custom') {
        // For custom orders, extract the numeric ID and use custom orders endpoint
        const customOrderId = order.custom_order_data?.custom_order_id || order.order_number;
        apiEndpoint = `/custom-orders/${customOrderId}/confirm`;
        actualOrderId = customOrderId;
      } else {
        // For regular orders, use the numeric ID
        actualOrderId = parseInt(orderId);
        apiEndpoint = `/orders/${actualOrderId}/confirm`;
      }
      
      console.log('Using endpoint:', apiEndpoint, 'for order:', actualOrderId);
      
      const response = await api.post(apiEndpoint);
      
      if (response.data.success) {
        if (response.data.stockAlreadyDeducted) {
          toast.success('Order submitted for admin verification! Stock was already deducted when you placed the order.');
        } else if (response.data.awaitingVerification) {
          toast.success('Order submitted for admin verification! Your stock has been reserved.');
        } else {
          toast.success('Order confirmed successfully! Stock has been updated.');
        }
        
        // Update stock context with the affected products (if not already deducted)
        if (response.data.stockUpdateEvent && response.data.stockUpdateEvent.productIds) {
          console.log('📦 Refreshing stock data for products:', response.data.stockUpdateEvent.productIds);
          await updateMultipleProductsStock(response.data.stockUpdateEvent.productIds);
        }
        
        // Refresh orders to show updated status
        fetchOrders();
        
        console.log('✅ Order confirmation completed');
      }
    } catch (error) {
      console.error('❌ Error confirming order:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to confirm order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark order as received by customer
  const markOrderReceived = async (orderId) => {
    try {
      setLoading(true);
      console.log('🔄 Marking order as received:', orderId);
      
      // Find the order to determine its type
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }
      
      // Use different API endpoints for custom vs regular orders
      let apiEndpoint;
      let actualOrderId;
      
      if (order.order_type === 'custom') {
        // For custom orders, extract the numeric ID and use custom orders endpoint
        const customOrderId = order.custom_order_data?.custom_order_id || order.order_number;
        apiEndpoint = `/custom-orders/${customOrderId}/mark-received`;
        actualOrderId = customOrderId;
        
        console.log('🎨 Custom order debug:');
        console.log('  - order.custom_order_data?.custom_order_id:', order.custom_order_data?.custom_order_id);
        console.log('  - order.order_number:', order.order_number);
        console.log('  - selected customOrderId:', customOrderId);
      } else {
        // For regular orders, use the numeric ID
        actualOrderId = parseInt(orderId);
        apiEndpoint = `/orders/${actualOrderId}/mark-received`;
      }
      
      console.log('Using endpoint:', apiEndpoint, 'for order:', actualOrderId);
      
      const response = await api.post(apiEndpoint);
      
      if (response.data.success) {
        toast.success('Order marked as received! Admin has been notified.');
        
        // Refresh orders to show updated status
        fetchOrders();
        
        console.log('✅ Order marked as received successfully');
      }
    } catch (error) {
      console.error('❌ Error marking order as received:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error('Order not found or not eligible for received confirmation');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to continue');
      } else {
        toast.error('Failed to mark order as received. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel order - create cancellation request
  const cancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      toast.error('Order not found');
      return;
    }

    // Use modal instead of prompt
    openCancellationModal((reason) => {
      if (reason.trim().length < 10) {
        toast.error('Cancellation reason must be at least 10 characters long');
        return;
      }

      submitCancellationRequest(orderId, reason.trim());
    });
  };

  // Extracted function to handle the actual cancellation request
  const submitCancellationRequest = async (orderId, reason) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      toast.error('Order not found');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Creating cancellation request for order:', orderId);
      console.log('Order details:', { id: orderId, order_number: order.order_number, order_type: order.order_type });
      console.log('Reason:', reason);
      
      // Handle custom orders vs regular orders
      let requestData;
      if (order.order_type === 'custom') {
        // For custom orders, use the custom_order_id from the original data
        const customOrderId = order.custom_order_data?.custom_order_id || order.order_number;
        
        // Debug: Log the custom order data structure
        console.log('🎨 Custom order data:', order.custom_order_data);
        console.log('🎨 Extracted custom order ID:', customOrderId);
        console.log('🎨 Order number:', order.order_number);
        
        requestData = {
          customOrderId: customOrderId,  // Backend expects camelCase customOrderId
          reason: reason
        };
        console.log('Custom order cancellation request data:', requestData);
      } else {
        // For regular orders, use the numeric order ID
        requestData = {
          order_id: parseInt(orderId), // Ensure it's a number
          order_number: order.order_number,
          reason: reason
        };
        console.log('Regular order cancellation request data:', requestData);
      }
      
      console.log('Sending request data:', requestData);
      
      // Use different API endpoints for custom vs regular orders
      const apiEndpoint = order.order_type === 'custom' 
        ? '/custom-orders/cancellation-requests' 
        : '/orders/cancellation-requests';
      
      const response = await api.post(apiEndpoint, requestData);
      
      if (response.data.success) {
        toast.success('Cancellation request submitted successfully! Admin will review your request.');
        // Refresh orders to show updated status
        fetchOrders();
        console.log('✅ Cancellation request created successfully');
      }
    } catch (error) {
      console.error('❌ Error creating cancellation request:', error);
      console.error('Error response:', error.response?.data || error.data);
      console.error('Error status:', error.response?.status || error.status);
      
      // Handle enhanced error structure from API interceptor
      const errorMessage = error.message || error.response?.data?.message || error.data?.message;
      const errorStatus = error.status || error.response?.status;
      
      if (errorMessage) {
        // Provide additional guidance for common error scenarios
        if (errorMessage.includes('already pending')) {
          toast.error('A cancellation request for this order is already pending. Please wait for admin review or check your existing requests.');
        } else if (errorMessage.includes('not found')) {
          toast.error('Order not found or you do not have permission to cancel this order.');
        } else if (errorMessage.includes('delivered') || errorMessage.includes('cancelled')) {
          toast.error('This order cannot be cancelled as it has already been delivered or cancelled.');
        } else {
          toast.error(errorMessage);
        }
      } else if (errorStatus === 400) {
        toast.error('Invalid request. Please check if this order can be cancelled.');
      } else if (errorStatus === 401) {
        toast.error('Please login again to cancel this order.');
      } else if (errorStatus === 403) {
        toast.error('You do not have permission to cancel this order.');
      } else {
        toast.error('Failed to submit cancellation request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      console.log('🧾 Downloading invoice:', invoiceId);
      const response = await api.get(`/orders/invoice/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      console.log('✅ PDF response received:', response.status, response.headers);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('📄 Invoice download initiated successfully');
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('❌ Error downloading invoice:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('Invoice not found or access denied.');
      } else if (error.response?.status === 500) {
        toast.error('Server error generating PDF. Please try again.');
      } else {
        toast.error('Failed to download invoice. Please check your connection.');
      }
    }
  };

  // View invoice in modal
  const viewInvoice = async (order) => {
    try {
      setLoading(true);
      
      // Handle custom orders differently - they already have items included
      if (order.order_type === 'custom' || (typeof order.id === 'string' && order.id.startsWith('custom-'))) {
        console.log(`🎨 Viewing invoice for custom order: ${order.order_number}`);
        setSelectedOrder(order);
        setSelectedOrderItems(order.items || []); // Use items already included in custom order
        setShowInvoiceModal(true);
        return;
      }
      
      // For regular orders, fetch items from backend
      const response = await api.get(`/orders/${order.id}/items`);
      if (response.data.success) {
        setSelectedOrder(order);
        setSelectedOrderItems(response.data.data);
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  // Close invoice modal
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedOrder(null);
    setSelectedOrderItems([]);
  };
  
  // Refund request handlers
  const handleRefundRequest = (order) => {
    setSelectedOrderForRefund(order);
    setRefundReason('');
    setRefundProofFile(null);
    setRefundProofPreview(null);
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setSelectedOrderForRefund(null);
    setRefundReason('');
    setRefundProofFile(null);
    setRefundProofPreview(null);
  };

  // Open cancellation reason modal
  const openCancellationModal = (callback) => {
    setCancellationCallback(() => callback);
    setCancellationReason('');
    setShowCancellationModal(true);
  };

  // Close cancellation reason modal
  const closeCancellationModal = () => {
    setShowCancellationModal(false);
    setCancellationReason('');
    setCancellationCallback(null);
  };

  const submitRefundRequest = async () => {
    if (!refundReason || refundReason.length < 10) {
      return toast.error('Refund reason must be at least 10 characters long');
    }

    try {
      setRefundLoading(true);
      
      // Get order items for the refund request
      const orderItems = selectedOrderForRefund.items || [];
      if (orderItems.length === 0) {
        toast.error('No items found for this order');
        return;
      }

      // For now, we'll create a refund request for the first item
      // In a more advanced implementation, you might want to let users select specific items
      const firstItem = orderItems[0];
      
      // Prepare refund request data
      const refundData = {
        order_id: selectedOrderForRefund.id,
        custom_order_id: selectedOrderForRefund.custom_order_id || null,
        product_name: firstItem.productname || firstItem.product_name || 'Unknown Product',
        product_image: firstItem.productimage || firstItem.product_image || null,
        price: firstItem.productprice || firstItem.product_price || selectedOrderForRefund.total_amount || 0,
        quantity: firstItem.quantity || 1,
        size: firstItem.size || 'N/A',
        color: firstItem.color || firstItem.productcolor || 'N/A',
        phone_number: selectedOrderForRefund.contact_phone || selectedOrderForRefund.customer_phone || 'N/A',
        street_address: selectedOrderForRefund.street_address || selectedOrderForRefund.shipping_address || 'N/A',
        city_municipality: selectedOrderForRefund.city_municipality || 'N/A',
        province: selectedOrderForRefund.province || 'N/A',
        reason: refundReason
      };
      
      const response = await api.post('/orders/refund-request', refundData);
      
      if (response.data.success) {
        toast.success('Refund request submitted successfully!');
        closeRefundModal();
        fetchOrders();
      } else {
        toast.error('Failed to submit refund request');
      }
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast.error('Failed to submit refund request');
    } finally {
      setRefundLoading(false);
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    const confirmed = window.confirm(`Are you sure you want to remove "${itemName}" from your cart?`);
    if (confirmed) {
      try {
        await removeFromCart(itemId);
        toast.success(`${itemName} removed from cart`);
      } catch (error) {
        toast.error('Failed to remove item from cart');
      }
    }
  };
  const renderCartTab = () => {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%',
        padding: '0 24px'
      }}>
        {cartItems.length === 0 ? (
          <div style={{ 
            maxWidth: '600px', 
            width: '100%',
            textAlign: 'center'
          }}>
            <SectionTitle style={{ 
              justifyContent: 'center',
              marginBottom: '32px' 
            }}>
              <FontAwesomeIcon icon={faShoppingBag} />
              Shopping Cart ({cartCount} items)
            </SectionTitle>
            <EmptyState>
              <FontAwesomeIcon icon={faShoppingBag} size="3x" />
              <p>Your cart is empty</p>
            </EmptyState>
          </div>
        ) : (
          <Content>
            <CartSection>
              <SectionTitle>
                <FontAwesomeIcon icon={faShoppingBag} />
                Shopping Cart ({cartCount} items)
              </SectionTitle>
              <div>
                {cartItems.map((item) => (
                  <CartItem key={item.id}>
                    <ItemImage 
                      src={item.main_image ? `http://localhost:5000/uploads/${item.main_image}` : 'http://localhost:5000/images/placeholder.svg'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'http://localhost:5000/images/placeholder.svg';
                      }}
                    />
                    <ItemDetails>
                      <ItemName>{item.name}</ItemName>
                      <ItemSpecs>
                        <ItemBadge>Color: {item.color}</ItemBadge>
                        <ItemBadge>Size: {item.size}</ItemBadge>
                      </ItemSpecs>
                      <QuantityControls>
                        <QuantityButton 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={cartLoading}
                        >
                          <FontAwesomeIcon icon={faMinus} size="xs" />
                        </QuantityButton>
                        <QuantityDisplay>{item.quantity}</QuantityDisplay>
                        <QuantityButton 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={cartLoading}
                        >
                          <FontAwesomeIcon icon={faPlus} size="xs" />
                        </QuantityButton>
                      </QuantityControls>
                    </ItemDetails>
                    <ItemPrice>
                      <Price>₱{(item.price * item.quantity).toFixed(2)}</Price>
                    </ItemPrice>
                    <RemoveButton 
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      disabled={cartLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </RemoveButton>
                  </CartItem>
                ))}
              </div>
            </CartSection>
            {cartItems.length > 0 && (
              <CheckoutSection>
                <SectionTitle>
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  Checkout Information
                </SectionTitle>
                
                {/* Important Payment Notice */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', 
                  color: 'white',
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '2px solid #ff4757',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                    🚨 PAYMENT REQUIRED BEFORE ORDER COMPLETION 🚨
                  </div>
                  <div style={{ fontSize: '14px', opacity: '0.9' }}>
                    You must upload GCash payment proof and enter reference number to place your order
                  </div>
                </div>
                <FormGroup>
                  <Label><FontAwesomeIcon icon={faUser} /> Full Name</Label>
                  <Input
                    type="text"
                    name="customer_name"
                    value={checkoutForm.customer_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </FormGroup>
                <FormGroup>
                  <Label><FontAwesomeIcon icon={faPhone} /> Contact Phone</Label>
                  <Input
                    type="tel"
                    name="contact_phone"
                    value={checkoutForm.contact_phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </FormGroup>
                
                {/* GCash Payment Section - Moved to top for visibility */}
                <PaymentSection>
                  <PaymentHeader>
                    <FontAwesomeIcon icon={faCreditCard} size="lg" />
                    <h3>GCash Payment (Required)</h3>
                  </PaymentHeader>
                  
                  <PaymentInfo>
                    <div className="gcash-number">📱 GCash Number: 0917-123-4567</div>
                    <div className="gcash-name">Account Name: Seven Four Clothing</div>
                    <div className="amount">Total Amount: ₱{(cartTotal || 0).toFixed(2)}</div>
                  </PaymentInfo>
                  
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    <strong>Payment Instructions:</strong>
                    <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                      <li>Send ₱{(cartTotal || 0).toFixed(2)} to the GCash number above</li>
                      <li>Take a screenshot of your payment confirmation</li>
                      <li>Enter your GCash reference number below</li>
                      <li>Upload the payment proof screenshot</li>
                    </ol>
                  </div>
                  
                  <FormGroup style={{ marginBottom: '16px' }}>
                    <Label style={{ color: 'white' }}>
                      <FontAwesomeIcon icon={faShieldAlt} /> GCash Reference Number *
                    </Label>
                    <Input
                      type="text"
                      name="payment_reference"
                      value={checkoutForm.payment_reference}
                      onChange={handleInputChange}
                      placeholder="Enter your GCash reference number"
                      required
                      style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                    />
                  </FormGroup>
                  
                  <PaymentProofUpload onClick={() => document.getElementById('payment-proof-upload').click()}>
                    <input
                      type="file"
                      id="payment-proof-upload"
                      accept="image/*"
                      onChange={handlePaymentProofUpload}
                    />
                    <FontAwesomeIcon icon={faUpload} size="2x" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      {paymentProofFile ? 'Payment Proof Uploaded ✅' : 'Upload Payment Proof *'}
                    </div>
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>
                      {paymentProofFile ? paymentProofFile.name : 'Click to upload screenshot (JPG, PNG - Max 5MB)'}
                    </div>
                  </PaymentProofUpload>
                  
                  {paymentProofPreview && (
                    <PaymentProofPreview>
                      <img src={paymentProofPreview} alt="Payment proof preview" />
                    </PaymentProofPreview>
                  )}
                </PaymentSection>
                <ShippingSection>
                  <SectionTitle>📍 Shipping Address (Metro Manila Only)</SectionTitle>
                  <div style={{ 
                    background: '#e3f2fd', 
                    border: '1px solid #2196f3', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: '#1976d2'
                  }}>
                    <strong>🚚 Delivery Notice:</strong> We currently deliver only within Metro Manila (National Capital Region). Free delivery for all orders within our service area.
                  </div>
                  
                  <AddressGrid>
                    <FormGroup>
                      <Label htmlFor="province">Area *</Label>
                      <Select
                        id="province"
                        name="province"
                        value={checkoutForm.province}
                        onChange={handleInputChange}
                        required
                        disabled
                      >
                        <option value="Metro Manila">Metro Manila</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="city">City/Municipality *</Label>
                      <Select
                        id="city"
                        name="city"
                        value={checkoutForm.city}
                        onChange={handleInputChange}
                        required
                        disabled={!checkoutForm.province}
                      >
                        <option value="">Select City</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

                    <FormGroup className="full-width">
                      <Label htmlFor="street_address">Street Address / House Number *</Label>
                      <Input
                        type="text"
                        id="street_address"
                        name="street_address"
                        value={checkoutForm.street_address}
                        onChange={handleInputChange}
                        placeholder="Enter complete street address, house/building number"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        value={checkoutForm.postal_code}
                        onChange={handleInputChange}
                        placeholder="e.g., 1234"
                        maxLength="4"
                        pattern="[0-9]{4}"
                      />
                    </FormGroup>
                  </AddressGrid>
                </ShippingSection>
                
                <FormGroup>
                  <Label>Order Notes (Optional)</Label>
                  <TextArea
                    name="notes"
                    value={checkoutForm.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for your order"
                  />
                </FormGroup>
                
                <OrderSummary>
                  <SummaryRow>
                    <span>Subtotal:</span>
                    <span>₱{cartTotal.toFixed(2)}</span>
                  </SummaryRow>
                  <SummaryRow>
                    <span>Shipping:</span>
                    <span>Free</span>
                  </SummaryRow>
                  <SummaryRow className="total">
                    <span>Total:</span>
                    <span>₱{cartTotal.toFixed(2)}</span>
                  </SummaryRow>
                </OrderSummary>
                
                <Button 
                  onClick={handleCheckout}
                  disabled={loading || cartLoading || cartItems.length === 0 || !paymentProofFile || !checkoutForm.payment_reference}
                  style={{
                    background: (!paymentProofFile || !checkoutForm.payment_reference) ? 
                      'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 
                      'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    opacity: (!paymentProofFile || !checkoutForm.payment_reference) ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (!paymentProofFile || !checkoutForm.payment_reference) ? (
                    <>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      Complete Payment First
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                      Complete Order
                    </>
                  )}
                </Button>
              </CheckoutSection>
            )}
          </Content>
        )}
      </div>
    );
  };
  
  const renderOrdersTab = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%'
    }}>
      <SectionTitle style={{ 
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <FontAwesomeIcon icon={faClipboardList} />
        My Orders {user && <span style={{ fontSize: '0.8em', color: '#666', fontWeight: '400' }}>({user.username || user.email})</span>}
      </SectionTitle>
      
      {/* Refresh Button */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => {
            console.log('🔄 Manually refreshing orders...');
            fetchOrders();
          }}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#f5f5f5' : '#000000',
            color: loading ? '#999' : '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            marginBottom: '8px'
          }}
        >
          <FontAwesomeIcon 
            icon={faSpinner} 
            spin={loading} 
            style={{ opacity: loading ? 1 : 0.8 }}
          />
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </button>
        
        {lastRefresh && (
          <div style={{
            fontSize: '12px',
            color: '#666',
            textAlign: 'center'
          }}>
            Last updated: {lastRefresh.toLocaleTimeString()} on {lastRefresh.toLocaleDateString()}
          </div>
        )}
      </div>
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#666" />
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '14px' }}>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          width: '100%'
        }}>
          <EmptyState>
            <FontAwesomeIcon icon={faShoppingBag} size="3x" />
            <p>No orders found</p>
            <p style={{ fontSize: '14px', marginTop: '8px', opacity: '0.7' }}>
              Your order history will appear here once you make a purchase
            </p>
          </EmptyState>
        </div>
      ) : (
        <OrderList>
          {orders.map((order) => {
            const displayStatus = getOrderDisplayStatus(order);
            return (
            <OrderCard key={`order-${order.id}-${order.order_number}`}>
              <OrderHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <OrderNumber>Order #{order.order_number}</OrderNumber>
                  {order.order_type === 'custom' && (
                    <span style={{
                      padding: '2px 8px',
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      🎨 Custom Design
                    </span>
                  )}
                </div>
                <OrderStatus status={displayStatus.status}>{displayStatus.displayText}</OrderStatus>
              </OrderHeader>
              
              {/* Delayed Order Notice */}
              {(order.delivery_status === 'delayed') && (
                <div style={{
                  background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                  border: '2px solid #ffd700',
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
                }}>
                  <div style={{
                    fontSize: '24px',
                    animation: 'pulse 2s infinite'
                  }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '700',
                      color: '#856404',
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      DELIVERY DELAYED
                    </div>
                    <div style={{
                      color: '#856404',
                      fontSize: '12px',
                      lineHeight: '1.4'
                    }}>
                      Your order delivery has been delayed. Our team is working to reschedule your delivery as soon as possible. You will be notified once a new delivery date is confirmed.
                    </div>
                  </div>
                </div>
              )}
              
              <OrderDetails>
                <OrderInfo>
                  <strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}
                </OrderInfo>
                <OrderInfo>
                  <strong>Total:</strong> ₱{parseFloat(order.total_amount).toFixed(2)}
                </OrderInfo>
                <OrderInfo>
                  <strong>Payment:</strong> {order.payment_method === 'gcash' ? 'GCash' : (order.payment_method || 'GCash')}
                  {/* Payment verification indicator */}
                  {order.payment_status === 'verified' && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                      PAID
                    </span>
                  )}
                  {order.payment_status === 'pending' && order.status === 'pending' && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FontAwesomeIcon icon={faClock} size="xs" />
                      PENDING VERIFICATION
                    </span>
                  )}
                  {order.status === 'confirmed' && !order.payment_status && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                      VERIFIED
                    </span>
                  )}
                </OrderInfo>
                <OrderInfo>
                  <strong>Status:</strong> {displayStatus.displayText}
                </OrderInfo>
              </OrderDetails>

              {/* Display order items with enhanced details and images */}
              {order.items && order.items.length > 0 && (
                <OrderItems>
                  <OrderItemsHeader>
                    <span>Ordered Items ({order.items.length})</span>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '400' }}>
                      Click on product images for better view
                    </span>
                  </OrderItemsHeader>
                  <OrderItemsList>
                    {order.items.map((item, index) => (
                      <OrderItem key={`${order.id}-item-${index}-${item.product_id || index}`}>
                        {/* Custom Order Image Gallery or Regular Product Image */}
                        {item.is_custom_order && item.custom_order_images && item.custom_order_images.length > 0 ? (
                          <div style={{ position: 'relative' }}>
                            <OrderItemImage 
                              src={`http://localhost:5000/uploads/custom-orders/${item.custom_order_images[0].filename}`}
                              alt={item.productname || 'Custom Design'}
                              onError={(e) => {
                                e.target.src = 'http://localhost:5000/images/placeholder.svg';
                              }}
                              onClick={(e) => {
                                // Open image in new tab for better viewing
                                const imageUrl = e.target.src;
                                if (imageUrl && !imageUrl.includes('placeholder.svg')) {
                                  window.open(imageUrl, '_blank');
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                              title="Click to view larger image"
                            />
                            {/* Custom Order Badge */}
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '8px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                              Custom
                            </div>
                            {/* Image Count Badge */}
                            {item.custom_order_images.length > 1 && (
                              <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                fontSize: '8px',
                                fontWeight: '600',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}>
                                +{item.custom_order_images.length - 1} more
                              </div>
                            )}
                            {/* Custom Order Images Gallery (shown on hover/click) */}
                            {item.custom_order_images.length > 1 && (
                              <div style={{
                                position: 'absolute',
                                bottom: '4px',
                                left: '4px',
                                right: '4px',
                                display: 'flex',
                                gap: '2px',
                                opacity: '0.8'
                              }}>
                                {item.custom_order_images.slice(1, 4).map((img, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={`http://localhost:5000/uploads/custom-orders/${img.filename}`}
                                    alt={`Design ${imgIndex + 2}`}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '4px',
                                      border: '1px solid white',
                                      cursor: 'pointer',
                                      objectFit: 'cover'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`http://localhost:5000/uploads/custom-orders/${img.filename}`, '_blank');
                                    }}
                                    onError={(e) => {
                                      if (e.target) {
                                        e.target.style.display = 'none';
                                      }
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <OrderItemImage 
                            src={(() => {
                              // Try multiple image sources in order of preference for regular products
                              if (item.productimage) return `http://localhost:5000/uploads/${item.productimage}`;
                              if (item.image) return `http://localhost:5000/uploads/${item.image}`;
                              if (item.main_image) return `http://localhost:5000/uploads/${item.main_image}`;
                              if (item.product_image) return `http://localhost:5000/uploads/${item.product_image}`;
                              return 'http://localhost:5000/images/placeholder.svg';
                            })()}
                            alt={item.productname || item.product_name || item.name || 'Product'}
                            onError={(e) => {
                              e.target.src = 'http://localhost:5000/images/placeholder.svg';
                            }}
                            onClick={(e) => {
                              // Open image in new tab for better viewing
                              const imageUrl = e.target.src;
                              if (imageUrl && !imageUrl.includes('placeholder.svg')) {
                                window.open(imageUrl, '_blank');
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to view larger image"
                          />
                        )}
                        <OrderItemDetails>
                          <OrderItemName>
                            {item.productname || item.product_name || item.name || 'Unknown Product'}
                          </OrderItemName>
                          
                          {/* Product description if available */}
                          {(item.productdescription || item.product_description || item.description) && (
                            <OrderItemDescription>
                              {item.productdescription || item.product_description || item.description}
                            </OrderItemDescription>
                          )}
                          
                          {/* Custom order additional info */}
                          {item.is_custom_order && (
                            <div style={{
                              background: 'linear-gradient(135deg, #fff5f5, #ffe8e8)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #ffcdd2',
                              margin: '8px 0',
                              fontSize: '12px'
                            }}>
                              <div style={{ fontWeight: '600', color: '#d32f2f', marginBottom: '4px' }}>
                                🎨 Custom Design Order
                              </div>
                              {item.custom_order_images && item.custom_order_images.length > 0 && (
                                <div style={{ color: '#666', marginBottom: '2px' }}>
                                  📸 {item.custom_order_images.length} design image{item.custom_order_images.length > 1 ? 's' : ''} uploaded
                                </div>
                              )}
                              {item.customer_name && (
                                <div style={{ color: '#666' }}>
                                  👤 Ordered by: {item.customer_name}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <OrderItemMeta>
                            {/* Color information */}
                            {(item.color || item.productcolor) && (
                              <OrderItemBadge style={{ background: '#e3f2fd', color: '#1976d2', borderColor: '#bbdefb' }}>
                                🎨 {item.color || item.productcolor}
                              </OrderItemBadge>
                            )}
                            
                            {/* Size information */}
                            {(item.size || item.product_size) && (
                              <OrderItemBadge style={{ background: '#f3e5f5', color: '#7b1fa2', borderColor: '#ce93d8' }}>
                                📏 {item.size || item.product_size}
                              </OrderItemBadge>
                            )}
                            
                            {/* Product type */}
                            {(item.product_type || item.type) && (
                              <OrderItemBadge style={{ 
                                background: item.is_custom_order ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : '#e8f5e8', 
                                color: item.is_custom_order ? 'white' : '#2e7d32', 
                                borderColor: item.is_custom_order ? '#ff6b6b' : '#a5d6a7',
                                fontWeight: item.is_custom_order ? '700' : '500'
                              }}>
                                {item.is_custom_order ? '🎨' : '🏷️'} {(item.product_type || item.type).replace('_', ' ').replace('-', ' ')}
                                {item.is_custom_order && ' (Custom)'}
                              </OrderItemBadge>
                            )}
                            
                            {/* Quantity */}
                            <OrderItemBadge style={{ background: '#fff3e0', color: '#f57c00', borderColor: '#ffcc02' }}>
                              📦 Qty: {item.quantity}
                            </OrderItemBadge>
                          </OrderItemMeta>
                          
                          {/* Additional product details */}
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#999', 
                            marginTop: '4px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            {item.product_id && (
                              <span>Product ID: {item.product_id}</span>
                            )}
                            {(item.sku || item.product_sku) && (
                              <span>SKU: {item.sku || item.product_sku}</span>
                            )}
                          </div>
                        </OrderItemDetails>
                        
                        <OrderItemPrice>
                          <div style={{ fontSize: '16px', fontWeight: '700' }}>
                            ₱{parseFloat(item.price || item.product_price || 0).toFixed(2)}
                          </div>
                          {item.quantity > 1 && (
                            <OrderItemPriceBreakdown>
                              ₱{parseFloat(item.price || item.product_price || 0).toFixed(2)} × {item.quantity}
                            </OrderItemPriceBreakdown>
                          )}
                          <OrderItemPriceBreakdown style={{ fontWeight: '600', color: '#000' }}>
                            Total: ₱{parseFloat((item.price || item.product_price || 0) * item.quantity).toFixed(2)}
                          </OrderItemPriceBreakdown>
                        </OrderItemPrice>
                      </OrderItem>
                    ))}
                  </OrderItemsList>
                </OrderItems>
              )}

              {/* Delivery Tracking Section - Show when payment is verified or order is confirmed */}
              {(order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' || 
                (order.order_type === 'custom' && (order.payment_status === 'verified' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'))) && (
                <DeliveryTrackingSection>
                  <DeliveryTrackingHeader>
                    <FontAwesomeIcon icon={faTruck} />
                    <h4>Delivery Tracking</h4>
                    {(order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                      <span style={{
                        padding: '2px 8px',
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                        VERIFIED
                      </span>
                    )}
                  </DeliveryTrackingHeader>
                  
                  <DeliveryInfo>
                    <div className="delivery-item">
                      <span className="label">Status:</span>
                      <span className="value">
                        <DeliveryStatusBadge status={order.delivery_status || order.status}>
                          {(() => {
                            const status = order.delivery_status || order.status;
                            console.log(`🚚 Order ${order.order_number} status mapping:`, {
                              delivery_status: order.delivery_status,
                              order_status: order.status,
                              final_status: status
                            });
                            
                            // Map all backend statuses to display statuses
                            if (status === 'delivered') return 'DELIVERED';
                            if (status === 'delayed') return '⚠️ DELAYED';
                            if (status === 'shipped' || status === 'in_transit') return 'IN TRANSIT';
                            // All other statuses (confirmed, processing, pending, etc.) map to confirmed
                            return 'CONFIRMED';
                          })()}
                        </DeliveryStatusBadge>
                      </span>
                    </div>
                    
                    <div className="delivery-item">
                      <span className="label">Current Status:</span>
                      <span className="value">
                        {(() => {
                          const status = order.delivery_status || order.status;
                          // Map all statuses to display descriptions
                          if (status === 'delivered') return 'Order has been delivered';
                          if (status === 'delayed') return 'Delivery has been delayed - rescheduling in progress';
                          if (status === 'shipped' || status === 'in_transit') return 'Order is in transit';
                          // All other statuses map to confirmed
                          return 'Order confirmed - preparing for shipment';
                        })()}
                      </span>
                    </div>
                    
                    <div className="delivery-item">
                      <span className="label">Shipping Address:</span>
                      <span className="value">
                        {[
                          order.street_address,
                          order.city_municipality,
                          order.province,
                          order.zip_code
                        ].filter(Boolean).join(', ') || order.shipping_address}
                      </span>
                    </div>
                    
                    {order.contact_phone && (
                      <div className="delivery-item">
                        <span className="label">Contact Phone:</span>
                        <span className="value">{order.contact_phone}</span>
                      </div>
                    )}
                    
                    {order.scheduled_delivery_date && (
                      <div className="delivery-item">
                        <span className="label">Scheduled Delivery:</span>
                        <span className="value">
                          {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                          {order.scheduled_delivery_time && ` at ${order.scheduled_delivery_time}`}
                        </span>
                      </div>
                    )}
                    
                    {order.delivery_date && (
                      <div className="delivery-item">
                        <span className="label">Delivered On:</span>
                        <span className="value">
                          {new Date(order.delivery_date).toLocaleDateString()} at {new Date(order.delivery_date).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    
                    {(order.payment_verified_at || order.confirmed_at) && (
                      <div className="delivery-item">
                        <span className="label">Payment Verified:</span>
                        <span className="value">
                          {new Date(order.payment_verified_at || order.confirmed_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </DeliveryInfo>
                  
                  {order.delivery_notes && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      <strong>Delivery Notes:</strong> {order.delivery_notes}
                    </div>
                  )}
                  
                  {order.courier_name && (
                    <CourierInfo>
                      <div className="courier-name">
                        📦 Assigned Courier: {order.courier_name}
                      </div>
                      {order.courier_phone && (
                        <div className="courier-phone">
                          📞 Courier Contact: {order.courier_phone}
                        </div>
                      )}
                    </CourierInfo>
                  )}
                  
                  {/* Progress indicator for order status - Only show 3 statuses */}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1976d2' }}>
                      Delivery Progress:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {(() => {
                        const status = order.delivery_status || order.status;
                        console.log(`📊 Progress bar for order ${order.order_number}:`, {
                          status,
                          delivery_status: order.delivery_status,
                          order_status: order.status
                        });
                        
                        // Handle delayed status specially
                        if (status === 'delayed') {
                          return (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              padding: '8px',
                              background: '#fff3cd',
                              borderRadius: '4px',
                              border: '1px solid #ffeaa7'
                            }}>
                              <span style={{ color: '#856404', fontWeight: '600' }}>⚠️ DELIVERY DELAYED</span>
                              <span style={{ fontSize: '11px', color: '#856404' }}>
                                - Rescheduling in progress
                              </span>
                            </div>
                          );
                        }
                        
                        // Normal progress for other statuses
                        const isConfirmed = order.status === 'confirmed' || ['confirmed', 'processing', 'shipped', 'delivered', 'in_transit'].includes(status);
                        const isInTransit = ['shipped', 'in_transit', 'delivered'].includes(status);
                        const isDelivered = status === 'delivered';
                        
                        console.log(`📊 Progress states for ${order.order_number}:`, {
                          isConfirmed,
                          isInTransit,
                          isDelivered
                        });
                        
                        return (
                          <>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isConfirmed ? '#28a745' : '#6c757d',
                              color: 'white',
                              fontSize: '10px'
                            }}>✓ Confirmed</span>
                            <span>→</span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isInTransit ? '#28a745' : '#6c757d',
                              color: 'white',
                              fontSize: '10px'
                            }}>{isInTransit ? '✓' : '○'} In Transit</span>
                            <span>→</span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isDelivered ? '#28a745' : '#6c757d',
                              color: 'white',
                              fontSize: '10px'
                            }}>{isDelivered ? '✓' : '○'} Delivered</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </DeliveryTrackingSection>
              )}

              {/* Refund Request Section - Only for eligible orders */}
              {(['cancelled', 'denied'].includes(order.status) && order.refund_request_status !== 'approved') && (
                <RefundSection>
                  <RefundHeader>
                    <FontAwesomeIcon icon={faTruck} />
                    <h4>Refund Request</h4>
                    <RefundStatusBadge status={order.refund_request_status || 'pending'}>
                      {(order.refund_request_status || 'pending').replace('_', ' ')}
                    </RefundStatusBadge>
                  </RefundHeader>
                  
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    You are eligible to request a refund for this order. Please provide a reason and upload any supporting documents.
                  </div>
                  
                  <OrderActions>
                    <ActionButton 
                      onClick={() => handleRefundRequest(order)}
                      disabled={loading}
                    >
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                      Request Refund
                    </ActionButton>
                  </OrderActions>
                </RefundSection>
              )}

              <OrderActions>
                {(order.status === 'pending' || order.status === 'confirmed') && !order.cancellation_request_status && (
                  <>
                    {order.status === 'pending' && !order.user_confirmed_at && order.order_type !== 'custom' && (
                      <ActionButton 
                        primary 
                        onClick={() => confirmOrder(order.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FontAwesomeIcon icon={faCheck} />
                        )}
                        Submit for Verification
                      </ActionButton>
                    )}
                    
                    {order.order_type === 'custom' && order.status === 'pending' && (
                      <div style={{ 
                        padding: '12px', 
                        background: '#f8f9fa', 
                        borderRadius: '8px', 
                        border: '1px solid #e9ecef',
                        textAlign: 'center',
                        color: '#6c757d',
                        fontSize: '14px'
                      }}>
                        <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px', color: '#6c757d' }} />
                        Waiting for admin approval of your custom design request
                      </div>
                    )}
                    
                    {order.status === 'pending' && order.user_confirmed_at && (
                      <ActionButton 
                        disabled={true}
                        style={{
                          background: '#28a745',
                          borderColor: '#28a745',
                          color: '#ffffff',
                          opacity: 1,
                          cursor: 'default'
                        }}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Submitted for Verification
                      </ActionButton>
                    )}
                    
                    <ActionButton 
                      onClick={() => cancelOrder(order.id)}
                      disabled={loading}
                      style={{
                        background: '#e74c3c',
                        borderColor: '#e74c3c',
                        color: '#ffffff'
                      }}
                    >
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} />
                      )}
                      Cancel Order
                    </ActionButton>
                  </>
                )}
                
                {order.cancellation_request_status === 'pending' && (
                  <div style={{
                    padding: '8px 12px',
                    background: '#fff3cd',
                    color: '#856404',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Cancellation Pending
                  </div>
                )}
                
                {/* Show View Invoice only for confirmed and later status orders */}
                {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                  <>
                    <ActionButton onClick={() => viewInvoice(order)} disabled={loading}>
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faEye} />
                      )}
                      View Details
                    </ActionButton>
                    
                    {order.invoice_id && (
                      <ActionButton onClick={() => downloadInvoice(order.invoice_id)} disabled={loading}>
                        <FontAwesomeIcon icon={faDownload} />
                        Download Invoice
                      </ActionButton>
                    )}
                  </>
                )}
                
                {/* Show Order Received button for delivered orders */}
                {(() => {
                  const shouldShow = (order.delivery_status === 'delivered' || order.status === 'delivered');
                  console.log(`🔘 Order Received button check for ${order.order_number}:`, {
                    delivery_status: order.delivery_status,
                    status: order.status,
                    shouldShow: shouldShow,
                    condition: `(${order.delivery_status} === 'delivered' || ${order.status} === 'delivered') = ${shouldShow}`,
                    orderId: order.id,
                    userId: order.user_id
                  });
                  return shouldShow;
                })() && (
                  <ActionButton 
                    onClick={() => {
                      console.log(`🎯 Clicking Order Received for order ${order.order_number} (ID: ${order.id})`);
                      markOrderReceived(order.id);
                    }}
                    disabled={loading}
                    style={{
                      background: '#28a745',
                      borderColor: '#28a745',
                      color: '#ffffff'
                    }}
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faCheckCircle} />
                    )}
                    Order Received
                  </ActionButton>
                )}

                {/* Show refund request button for delivered orders */}
                {(order.delivery_status === 'delivered' || order.status === 'delivered') && !order.refund_request_status && (
                  <ActionButton 
                    onClick={() => handleRefundRequest(order)}
                    style={{
                      background: '#f39c12',
                      borderColor: '#e67e22',
                      color: '#ffffff'
                    }}
                  >
                    <FontAwesomeIcon icon={faUndo} />
                    Request Refund
                  </ActionButton>
                )}
              </OrderActions>
            </OrderCard>
            );
          })}
        </OrderList>
      )}
    </div>
  );
  


  // Payment proof handling functions
  const handlePaymentProofUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setPaymentProofFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPaymentProofPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Update form data
      setCheckoutForm(prev => ({
        ...prev,
        payment_proof: file
      }));
      
      toast.success('Payment proof uploaded successfully');
    }
  };


  return (
    <PageContainer>
      <TopBar />
      <ContentWrapper>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faShoppingBag} />
            Order Management
          </Title>
          <Subtitle>
            Manage your shopping cart, view your orders, and handle payments
          </Subtitle>
        </Header>          <TabContainer>
          <Tab 
            active={activeTab === 'cart'} 
            onClick={() => setActiveTab('cart')}
          >
            Shopping Cart ({cartCount})
          </Tab>
          <Tab 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </Tab>
        </TabContainer>
        
        {activeTab === 'cart' ? renderCartTab() : renderOrdersTab()}
          {/* Invoice Modal */}
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={closeInvoiceModal}
          order={selectedOrder}
          orderItems={selectedOrderItems}
          onDownloadPDF={downloadInvoice}
        />
        
        {/* Refund Request Modal */}
        {showRefundModal && (
          <RefundModal>
            <RefundModalContent>
              <RefundModalHeader>
                <h3>Request Refund</h3>
                <button onClick={closeRefundModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </RefundModalHeader>
              
              <RefundForm onSubmit={(e) => { e.preventDefault(); submitRefundRequest(); }}>
                <RefundFormGroup>
                  <RefundLabel>Order ID</RefundLabel>
                  <RefundInput
                    type="text"
                    value={selectedOrderForRefund?.order_number || ''}
                    readOnly
                  />
                </RefundFormGroup>
                
                <RefundFormGroup>
                  <RefundLabel>Reason for Refund *</RefundLabel>
                  <RefundTextarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter the reason for refund (at least 10 characters)"
                    required
                  />
                </RefundFormGroup>
                
                <RefundFormGroup>
                  <RefundLabel>Upload Proof (Optional)</RefundLabel>
                  <div style={{ 
                    border: '2px dashed #007bff', 
                    borderRadius: '6px', 
                    padding: '12px', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }} onClick={() => document.getElementById('refund-proof-upload').click()}>
                    <input
                      type="file"
                      id="refund-proof-upload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('File size must be less than 5MB');
                            return;
                          }
                          setRefundProofFile(file);
                          const reader = new FileReader();
                          reader.onload = (e) => setRefundProofPreview(e.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {refundProofFile ? (
                      <div style={{ color: '#28a745', fontWeight: '500' }}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                        {refundProofFile.name}
                      </div>
                    ) : (
                      <div style={{ color: '#007bff' }}>
                        <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} />
                        Click to upload proof (JPG, PNG - Max 5MB)
                      </div>
                    )}
                  </div>
                  

                  {refundProofPreview && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <img 
                        src={refundProofPreview} 
                        alt="Refund proof preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '6px', 
                          border: '1px solid #007bff',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                </RefundFormGroup>
                
                <RefundButtonGroup>
                  <RefundButton 
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                  >
                    Cancel
                  </RefundButton>
                  <RefundButton 
                    type="submit"
                    primary
                    disabled={!refundReason.trim() || refundLoading}
                  >
                    {refundLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                        Submitting...
                      </>
                    ) : (
                      'Submit Refund Request'
                    )}
                  </RefundButton>
                </RefundButtonGroup>
              </RefundForm>
            </RefundModalContent>
          </RefundModal>
        )}

        {/* Cancellation Reason Modal */}
        {showCancellationModal && (
          <RefundModal onClick={closeCancellationModal}>
            <RefundModalContent onClick={(e) => e.stopPropagation()}>
              <RefundModalHeader>
                <h3>Enter Cancellation Reason</h3>
                <button onClick={closeCancellationModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </RefundModalHeader>
              
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 16px 0', color: '#666' }}>
                    Please provide a reason for cancelling this order:
                  </p>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Enter reason for cancellation (minimum 10 characters)..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'flex-end',
                  marginTop: '24px'
                }}>
                  <button
                    onClick={closeCancellationModal}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: '#fff',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (cancellationReason.trim()) {
                        if (cancellationCallback) {
                          cancellationCallback(cancellationReason.trim());
                        }
                        closeCancellationModal();
                      } else {
                        toast.error('Please provide a reason for cancellation');
                      }
                    }}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#dc3545',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Submit Cancellation
                  </button>
                </div>
              </div>
            </RefundModalContent>
          </RefundModal>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default OrderPage;