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
  faDownload,
  faExpand,
  faImage,
  faSpinner,
  faChevronDown
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

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #1a1a1a;
  }
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

const CancellationRequestCard = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  margin-bottom: 1px;
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fafafa;
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const RequestInfo = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #000000;
  }
  
  .meta {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    
    .item {
      font-size: 14px;
      color: #666666;
      
      strong {
        color: #000000;
      }
    }
  }
`;



const ReasonBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #000000;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #666666;
    line-height: 1.5;
  }
`;

const ProductDetailsBox = styled.div`
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #000000;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #007bff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  }
`;

// Enhanced Image Gallery Components
const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin: 16px 0;
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

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ImageContainer}:hover & {
    transform: scale(1.1);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 123, 255, 0.3));
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  ${ImageContainer}:hover & {
    opacity: 1;
  }
`;

const ImageAction = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
  
  &:hover {
    background: white;
    transform: scale(1.1);
    color: #007bff;
  }
`;

// Image Modal Components
const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
`;

const ImageModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ImageModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const ImageModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ImageModalActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ModalButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary',
})`
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#545b62'};
    transform: translateY(-1px);
  }
`;

const ModalImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 400px;
  max-height: 70vh;
  overflow: hidden;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  flex: 1;
  
  .name {
    font-size: 14px;
    font-weight: 500;
    color: #000000;
    margin-bottom: 4px;
  }
  
  .details {
    font-size: 12px;
    color: #666666;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .price {
    font-size: 14px;
    font-weight: 500;
    color: #000000;
    text-align: right;
  }
`;

const ProductVariant = styled.span`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 2px;
  padding: 2px 6px;
  font-size: 11px;
  color: #666666;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
`;

const AdminNotesTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const ProcessingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ProcessingModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #2c3e50;    }
  }
  
  .actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e9ecef;
  }
  
  p {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin: 16px 0;
    line-height: 1.6;
    color: #495057;
    border-left: 4px solid #007bff;
  }
`;

// Verification Tab Styled Components
const VerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const VerificationCard = styled.div`
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const VerificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const VerificationOrderInfo = styled.div`
  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  p {
    margin: 4px 0;
    font-size: 14px;
    color: #6c757d;
    
    &:last-child {
      font-size: 16px;
      font-weight: 600;
      color: #27ae60;
    }
  }
`;

const VerificationActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const VerificationButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'type',
})`
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.type === 'approve' && `
    background: #27ae60;
    color: white;
    
    &:hover {
      background: #229954;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
    }
  `}
  
  ${props => props.type === 'deny' && `
    background: #e74c3c;
    color: white;
    
    &:hover {
      background: #c0392b;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const VerificationDetails = styled.div`
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const DetailsSection = styled.div`
  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    padding-bottom: 8px;
    border-bottom: 2px solid #3498db;
  }
`;

const DetailItem = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
  
  strong {
    color: #2c3e50;
    font-weight: 600;
    margin-right: 8px;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PaymentProofContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PaymentProofImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3498db;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    transform: scale(1.02);
  }
`;

const PaymentProofActions = styled.div`
  display: flex;
  gap: 8px;
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

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const ItemCard = styled.div`
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  
  .item-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e9ecef;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    
    svg {
      color: #999999;
      font-size: 16px;
    }
  }
  
  .item-details {
    flex: 1;
    
    .item-name {
      font-size: 12px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    
    .item-specs {
      font-size: 11px;
      color: #666666;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      span {
        background: #f1f3f4;
        padding: 2px 6px;
        border-radius: 3px;
      }
    }
    
    .item-price {
      font-size: 12px;
      font-weight: 600;
      color: #27ae60;
      margin-top: 4px;
    }
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
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedCancellationRequest, setSelectedCancellationRequest] = useState(null);
  const [processingCancellation, setProcessingCancellation] = useState(false);
  
  // Custom design processing states
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [selectedDesignRequest, setSelectedDesignRequest] = useState(null);
  const [processingDesign, setProcessingDesign] = useState(false);
  
  // Add missing state hooks for ESLint errors
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [designRequestsLoading, setDesignRequestsLoading] = useState(false);
  const [customDesignRequests, setCustomDesignRequests] = useState([]);
  const [buttonLoading, setButtonLoading] = useState({});
  const [designAdminNotes, setDesignAdminNotes] = useState('');
  const [showDesignProcessingModal, setShowDesignProcessingModal] = useState(false);
  const [processingDesignRequest, setProcessingDesignRequest] = useState(null);
  const [designSearchTerm, setDesignSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  
  // Add missing state variables
  const [adminNotes, setAdminNotes] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageName, setImageName] = useState('');
  
  // Payment verification state (for admin users)
  const [pendingVerificationOrders, setPendingVerificationOrders] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSearchTerm, setVerificationSearchTerm] = useState('');
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cancellationSearchTerm, setCancellationSearchTerm] = useState('');
  const [cancellationStatusFilter, setCancellationStatusFilter] = useState('all');
  
  // Remove unused user import since not needed in this component

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching transactions with delivery status...');
      
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
        console.log('✅ Orders fetched from delivery-enhanced endpoint');
        const ordersData = ordersResponse.data.data || [];
        
        // Filter only confirmed orders (status = 'confirmed')
        const confirmedOrders = ordersData.filter(order => 
          order.status === 'confirmed' || order.order_status === 'confirmed'
        );
        
        const processedOrders = confirmedOrders.map(order => {
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
            payment_method: order.payment_method || 'Cash on Delivery',
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
        console.log(`📦 Added ${processedOrders.length} confirmed regular orders with delivery status`);
      }
      
      // Process approved custom orders
      if (customOrdersResponse.data.success) {
        console.log('✅ Custom orders fetched successfully');
        const customOrdersData = customOrdersResponse.data.data || [];
        
        // Filter only approved custom orders
        const approvedCustomOrders = customOrdersData.filter(order => order.status === 'approved');
        
        const processedCustomOrders = approvedCustomOrders.map(order => {
          const fullName = order.customer_name || 
                         [order.first_name, order.last_name].filter(Boolean).join(' ') || 
                         'Unknown Customer';
          
          return {
            id: `custom-${order.id}`, // Prefix to avoid ID conflicts
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
            payment_method: order.payment_method || 'Cash on Delivery',
            order_status: 'approved', // Custom orders have different status
            transaction_status: 'confirmed', // Show as confirmed in transaction view
            status: 'confirmed', // Show as confirmed for consistency
            delivery_status: order.delivery_status || 'pending', // Add delivery status for custom orders
            order_date: order.created_at,
            created_at: order.created_at,
            updated_at: order.updated_at,
            shipping_address: `${order.street_number || ''} ${order.barangay || ''}, ${order.municipality || ''}, ${order.province || ''}`.trim(),
            contact_phone: order.customer_phone,
            notes: `Custom Order: ${order.product_type} | Size: ${order.size} | Color: ${order.color} | Qty: ${order.quantity}${order.special_instructions ? ' | Notes: ' + order.special_instructions : ''}`,
            items: [{
              id: 1,
              product_name: `Custom ${order.product_type} - ${order.product_name || 'Custom Design'}`,
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
        console.log(`🎨 Added ${processedCustomOrders.length} approved custom orders`);
      }
      
      // Sort all transactions by date (newest first)
      allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      console.log(`📊 Total transactions: ${allTransactions.length} (${allTransactions.filter(t => t.order_type === 'regular').length} regular + ${allTransactions.filter(t => t.order_type === 'custom').length} custom)`);
      
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
      console.log('🔄 Fetching cancellation requests...');
      
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
      console.log(`🔄 ${action === 'approve' ? 'Approving' : 'Denying'} cancellation request ${requestId}...`);
      
      const response = await api.put(`/orders/cancellation-requests/${requestId}`, {
        action,
        adminNotes: adminNotes.trim() || undefined
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        
        // If cancellation was approved and stock was restored, trigger stock update events
        if (action === 'approve' && response.data.data?.stockUpdateEvent?.stockRestored) {
          const stockEvent = response.data.data.stockUpdateEvent;
          console.log('📦 Cancellation approved - stock restored, triggering inventory updates...', stockEvent);
          
          // Trigger localStorage event for inventory pages to refresh
          localStorage.setItem('stock_updated', JSON.stringify({
            type: 'order_cancelled',
            timestamp: new Date().toISOString(),
            orderId: stockEvent.orderId,
            productIds: stockEvent.productIds || [],
            stockRestorations: stockEvent.stockRestorations || []
          }));
          
          // Remove the flag immediately to allow future updates
          localStorage.removeItem('stock_updated');
          
          // Also dispatch a custom event for components that might not use localStorage
          window.dispatchEvent(new CustomEvent('stockUpdated', {
            detail: {
              type: 'order_cancelled',
              orderId: stockEvent.orderId,
              productIds: stockEvent.productIds || [],
              restoredQuantities: stockEvent.stockRestorations || []
            }
          }));
          
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
        } else if (action === 'approve') {
          console.log('📝 Cancellation approved but no stock restoration needed');
        }
        
        setShowProcessingModal(false);
        setProcessingRequest(null);
        setAdminNotes('');
        // Refresh both lists
        fetchCancellationRequests();
        fetchTransactions();
      } else {
        toast.error(response.data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error(`❌ Error processing cancellation request:`, error);
      toast.error('Failed to process cancellation request');
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
      console.log('🔄 Fetching custom design requests...');
      console.log('🔍 API base URL:', api.defaults.baseURL);
      console.log('🔍 Current user token available:', !!localStorage.getItem('token'));
      console.log('🔍 Current user:', localStorage.getItem('user'));
      
      const response = await api.get('/custom-orders/admin/all');
      
      console.log('📋 Raw API response:', response);
      console.log('📋 Response data:', response.data);
      console.log('📋 Response status:', response.status);
      console.log('📋 Response headers:', response.headers);
      
      if (response.data.success) {
        console.log('✅ Custom design requests fetched successfully');
        console.log('📊 Data count:', response.data.data?.length || 0);
        console.log('📄 Raw data:', response.data.data);
        console.log('📄 First few requests:', response.data.data?.slice(0, 3));
        
        const requestsData = response.data.data || [];
        setCustomDesignRequests(requestsData);
        
        // Add to window for debugging
        if (typeof window !== 'undefined') {
          window.customDesignRequests = requestsData;
          window.customDesignDebugInfo = {
            response: response.data,
            count: requestsData.length,
            timestamp: new Date().toISOString()
          };
        }
        
        console.log('✅ State updated with', requestsData.length, 'requests');
      } else {
        console.error('❌ Failed to fetch custom design requests - API returned success: false');
        console.error('📋 Full response:', response.data);
        console.error('📋 Response message:', response.data.message);
        toast.error(`Failed to fetch custom design requests: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error fetching custom design requests:', error);
      console.error('📋 Error details:', error.response?.data);
      console.error('📋 Error status:', error.response?.status);
      console.error('📋 Error message:', error.message);
      console.error('📋 Full error object:', error);
      
      let errorMessage = 'Failed to fetch custom design requests';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setDesignRequestsLoading(false);
      console.log('🏁 fetchCustomDesignRequests completed');
    }
  }, []);
  // Process custom design request
  const processDesignRequest = async (customOrderId, status) => {
    const loadingKey = `${customOrderId}-${status}`;
    try {
      console.log(`🔄 ${status === 'approved' ? 'Approving' : 'Rejecting'} design request ${customOrderId}...`);
      
      // Set loading state
      setButtonLoading(prev => ({ ...prev, [loadingKey]: true }));
      
      const response = await api.put(`/custom-orders/${customOrderId}/status`, {
        status,
        admin_notes: designAdminNotes.trim() || undefined
      });
        if (response.data.success) {
        const successMessage = status === 'approved' 
          ? 'Design request approved! Order moved to delivery queue.' 
          : 'Design request rejected successfully.';
          
        toast.success(
          successMessage,
          {
            icon: status === 'approved' ? '✅' : '❌',
            duration: 5000,
            style: {
              background: status === 'approved' ? '#d4edda' : '#f8d7da',
              color: status === 'approved' ? '#155724' : '#721c24',
              border: `1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}`,
            },
          }
        );
        setShowDesignProcessingModal(false);
        setProcessingDesignRequest(null);
        setDesignAdminNotes('');
        // Refresh the list
        fetchCustomDesignRequests();
      } else {
        toast.error(response.data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error(`❌ Error processing design request:`, error);
      toast.error('Failed to process design request');
    } finally {
      // Clear loading state
      setButtonLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

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
      console.log('🔄 Fetching pending verification orders...');
      
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
      console.log(`🔄 Approving payment for order ${orderId}...`);
      
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

  // Fetch custom design requests when the design-requests tab is active
  useEffect(() => {
    console.log('🔍 useEffect for design-requests triggered', { activeTab });
    if (activeTab === 'design-requests') {
      console.log('✅ Active tab is design-requests, calling fetchCustomDesignRequests');
      fetchCustomDesignRequests();
    } else {
      console.log('❌ Active tab is not design-requests, skipping fetch');
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
              const transactionId = transaction.transaction_id || transaction.id;
              const uniqueKey = `transaction-${transactionId}-${transaction.order_number || 'unknown'}-${transactionIndex}`;
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
                              <div key={`transaction-${transactionId}-${transactionIndex}-item-${index}`} style={{ 
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
                    
                    <div>{transaction.payment_method || 'COD'}</div>
                    
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
                            <span className="value">{transaction.customer_phone || 'N/A'}</span>
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
                            <span className="value">{transaction.zip_code || 'N/A'}</span>
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
                            <span className="value">{transaction.payment_method || 'COD'}</span>
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
                          <InfoSection style={{ gridColumn: '1 / -1' }}>
                            <h4>Order Items ({transaction.items.length})</h4>
                            <ItemsGrid>
                              {transaction.items.map((item, index) => (
                                <ItemCard key={`transaction-${transactionId}-${transactionIndex}-expanded-item-${index}`}>
                                  <div className="item-image">
                                    {item.product_image_path ? (
                                      <img 
                                        src={item.product_image_path} 
                                        alt={item.productname || 'Product'} 
                                      />
                                    ) : (
                                      <FontAwesomeIcon icon={faImage} />
                                    )}
                                  </div>
                                  <div className="item-details">
                                    <div className="item-name">
                                      {item.productname || 'Unknown Product'}
                                    </div>
                                    <div className="item-specs">
                                      {item.productcolor && <span>Color: {item.productcolor}</span>}
                                      {item.product_type && <span>Type: {item.product_type}</span>}
                                      <span>Qty: <strong>{item.quantity}</strong></span>
                                    </div>
                                    <div className="item-price">
                                      {formatCurrency(item.item_price || item.price || 0)}
                                    </div>
                                  </div>
                                </ItemCard>
                              ))}
                            </ItemsGrid>
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

        {/* Verify Payment Tab */}
        {activeTab === 'verify-payment' && (
          <>
            {/* Verification Statistics */}
            <StatsContainer>
              <StatCard color="#f39c12">
                <h3>{pendingVerificationOrders.length}</h3>
                <p>Pending Verification</p>
              </StatCard>
              <StatCard color="#e74c3c">
                <h3>{pendingVerificationOrders.filter(order => !order.payment_proof_image_path || order.payment_proof_image_path === 'N/A').length}</h3>
                <p>Missing Proof</p>
              </StatCard>
              <StatCard color="#3498db">
                <h3>{pendingVerificationOrders.filter(order => order.payment_proof_image_path && order.payment_proof_image_path !== 'N/A').length}</h3>
                <p>With Proof</p>
              </StatCard>
              <StatCard color="#27ae60">
                <h3>{formatCurrency(pendingVerificationOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0))}</h3>
                <p>Total Value</p>
              </StatCard>
            </StatsContainer>

            {/* Verification Controls */}
            <ControlsSection>
              <ControlsGrid>
                <SearchContainer>
                  <SearchIcon icon={faSearch} />
                  <SearchInput
                    type="text"
                    placeholder="Search by order number or customer name..."
                    value={verificationSearchTerm}
                    onChange={(e) => setVerificationSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                <RefreshButton onClick={fetchPendingVerificationOrders} disabled={verificationLoading}>
                  <FontAwesomeIcon icon={faRefresh} />
                  Refresh
                </RefreshButton>
              </ControlsGrid>
            </ControlsSection>

            {/* Verification Orders List */}
            {verificationLoading ? (
              <LoadingContainer>
                <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#ddd" />
                <p>Loading pending verification orders...</p>
              </LoadingContainer>
            ) : pendingVerificationOrders.length === 0 ? (
              <EmptyState>
                <FontAwesomeIcon icon={faInfoCircle} className="icon" />
                <h3>No orders pending verification</h3>
                <p>All orders have been processed or no payment proofs have been submitted.</p>
              </EmptyState>
            ) : (
              <VerificationContainer>
                {pendingVerificationOrders
                  .filter(order => {
                    const matchesSearch = order.order_number?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                                         order.customer_fullname?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                                         order.first_name?.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                                         order.last_name?.toLowerCase().includes(verificationSearchTerm.toLowerCase());
                    return matchesSearch;
                  })
                  .map((order, orderIndex) => (
                    <VerificationCard key={`verification-${order.order_id}-${order.order_number || 'unknown'}-${orderIndex}`}>
                      <VerificationHeader>
                        <VerificationOrderInfo>
                          <h3>Order #{order.order_number}</h3>
                          <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
                          <p>Customer: {order.customer_fullname || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown'}</p>
                          <p>Total: ₱{parseFloat(order.total_amount || 0).toFixed(2)}</p>
                        </VerificationOrderInfo>
                        <VerificationActions>
                          <VerificationButton
                            type="approve"
                            onClick={() => approvePayment(order.order_id)}
                            disabled={processingPayment}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            Approve
                          </VerificationButton>
                          <VerificationButton
                            type="deny"
                            onClick={() => denyPayment(order.order_id, 'Payment verification failed')}
                            disabled={processingPayment}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                            Deny
                          </VerificationButton>
                        </VerificationActions>
                      </VerificationHeader>

                      <VerificationDetails>
                        <DetailsSection>
                          <h4>Customer Information</h4>
                          <DetailItem>
                            <strong>Full Name:</strong> {order.customer_fullname || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'N/A'}
                          </DetailItem>
                          <DetailItem>
                            <strong>Email:</strong> {order.user_email || 'N/A'}
                          </DetailItem>
                          <DetailItem>
                            <strong>Phone:</strong> {order.customer_phone || 'N/A'}
                          </DetailItem>
                        </DetailsSection>

                        <DetailsSection>
                          <h4>Payment Information</h4>
                          <DetailItem>
                            <strong>GCash Reference:</strong> {order.gcash_reference_number || 'N/A'}
                          </DetailItem>
                          <DetailItem>
                            <strong>Amount:</strong> ₱{parseFloat(order.total_amount || 0).toFixed(2)}
                          </DetailItem>
                        </DetailsSection>

                        <DetailsSection>
                          <h4>Shipping Address</h4>
                          <DetailItem>
                            <strong>Province:</strong> {order.province || 'N/A'}
                          </DetailItem>
                          <DetailItem>
                            <strong>City:</strong> {order.city_municipality || 'N/A'}
                          </DetailItem>
                          <DetailItem>
                            <strong>Street:</strong> {order.street_address || 'N/A'}
                          </DetailItem>
                          <DetailItem>
                            <strong>Postal Code:</strong> {order.postal_code || 'N/A'}
                          </DetailItem>
                        </DetailsSection>

                        {order.order_notes && order.order_notes !== 'N/A' && (
                          <DetailsSection>
                            <h4>Order Notes</h4>
                            <DetailItem>{order.order_notes}</DetailItem>
                          </DetailsSection>
                        )}

                        <DetailsSection>
                          <h4>Payment Proof</h4>
                          {order.payment_proof_image_path && order.payment_proof_image_path !== 'N/A' ? (
                            <PaymentProofContainer>
                              <PaymentProofImage
                                src={`http://localhost:5000/uploads/payment-proofs/${order.payment_proof_image_path}`}
                                alt="Payment Proof"
                                onClick={() => viewPaymentProof(
                                  `http://localhost:5000/uploads/payment-proofs/${order.payment_proof_image_path}`,
                                  order.customer_fullname || 'Customer',
                                  order.order_number
                                )}
                              />
                              <PaymentProofActions>
                                <ActionButton
                                  variant="view"
                                  onClick={() => viewPaymentProof(
                                    `http://localhost:5000/uploads/payment-proofs/${order.payment_proof_image_path}`,
                                    order.customer_fullname || 'Customer',
                                    order.order_number
                                  )}
                                >
                                  <FontAwesomeIcon icon={faExpand} />
                                  View Full
                                </ActionButton>
                              </PaymentProofActions>
                            </PaymentProofContainer>
                          ) : (
                            <DetailItem style={{ color: '#e74c3c', fontStyle: 'italic' }}>
                              No payment proof uploaded
                            </DetailItem>
                          )}
                        </DetailsSection>

                        {order.items && order.items.length > 0 && (
                          <DetailsSection>
                            <h4>Order Items ({order.items.length})</h4>
                            <OrderItemsList>
                              {order.items.map((item, index) => (
                                <OrderItemCard key={`verification-order-${order.order_id}-${orderIndex}-item-${index}`}>
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
                                    <h5>{item.productname || item.product_name}</h5>
                                    <div className="item-meta">
                                      {item.color && <span>Color: {item.color}</span>}
                                      {item.size && <span>Size: {item.size}</span>}
                                      <span>Qty: <strong>{item.quantity}</strong></span>
                                    </div>
                                    <div className="item-price">₱{parseFloat(item.product_price || 0).toFixed(2)}</div>
                                  </OrderItemDetails>
                                </OrderItemCard>
                              ))}
                            </OrderItemsList>
                          </DetailsSection>
                        )}
                      </VerificationDetails>
                    </VerificationCard>
                  ))}
              </VerificationContainer>
            )}
          </>
        )}

        {/* Cancellation Requests Tab */}
        {activeTab === 'cancellations' && (
          <>
            {/* Cancellation Requests Header */}
        <ControlsSection>
          <ControlsGrid>
            <SearchContainer>
              <SearchIcon icon={faSearch} />
              <SearchInput
                type="text"
                placeholder="Search by order number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setCancellationStatusFilter(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </FilterSelect>
            <RefreshButton onClick={fetchCancellationRequests} disabled={requestsLoading}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </RefreshButton>
          </ControlsGrid>
        </ControlsSection>
        
        {/* Cancellation Requests List */}
        {requestsLoading ? (
          <LoadingContainer>
            <FontAwesomeIcon icon={faInfoCircle} size="2x" color="#ddd" />
            <p>Loading cancellation requests...</p>
          </LoadingContainer>
        ) : cancellationRequests.length === 0 ? (
          <EmptyState>
            <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />
            <h3>No cancellation requests found</h3>
            <p>No cancellation requests match your current filters.</p>
          </EmptyState>
        ) : (
          cancellationRequests
            .filter(request => {
              const matchesSearch = request.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   request.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   request.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
              return matchesSearch && matchesStatus;
            })
            .map((request, requestIndex) => (
              <CancellationRequestCard key={`cancellation-${request.id}-${request.order_number || 'unknown'}-${requestIndex}`}>
                <RequestHeader>
                  <RequestInfo>
                    <h3>Order #{request.order_number}</h3>
                    <div className="meta">
                      <div className="item">
                        <strong>Customer:</strong> {request.customer_first_name} {request.customer_last_name}
                      </div>
                      <div className="item">
                        <strong>Email:</strong> {request.customer_email}
                      </div>
                      <div className="item">
                        <strong>Amount:</strong> {formatCurrency(request.order_total)}
                      </div>
                      <div className="item">
                        <strong>Submitted:</strong> {formatDate(request.created_at)}
                      </div>
                    </div>
                  </RequestInfo>                      <StatusBadge status={request.status}>
                    {getDisplayStatus(request.status)}
                  </StatusBadge>
                </RequestHeader>
                
                <ReasonBox>
                  <h4>Cancellation Reason</h4>
                  <p>{request.reason}</p>
                </ReasonBox>
                
                {/* Product Details Section */}
                {request.order_items && request.order_items.length > 0 && (
                  <ProductDetailsBox>
                    <h4>
                      Order Items ({request.order_items.length})
                    </h4>
                    {request.order_items.map((item, index) => (
                      <ProductItem key={`cancellation-${request.id}-${requestIndex}-item-${index}`}>
                        <ProductImage 
                          src={item.productimage ? `http://localhost:5000/uploads/${item.productimage}` : '/placeholder-image.png'}
                          alt={item.product_name || item.productname}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                        <ProductInfo>
                          <div className="name">
                            {item.product_name || item.productname || 'Unknown Product'}
                          </div>
                          <div className="details">
                            <span>Qty: <strong>{item.quantity}</strong></span>
                            {item.size && <ProductVariant>{item.size}</ProductVariant>}
                            {item.color && <ProductVariant>{item.color}</ProductVariant>}
                            <span>Price: <strong>{formatCurrency(item.product_price)}</strong></span>
                          </div>
                        </ProductInfo>
                        <div className="price">
                          {formatCurrency(item.subtotal || (item.product_price * item.quantity))}
                        </div>
                      </ProductItem>
                    ))}
                  </ProductDetailsBox>
                )}
                
                {request.admin_notes && (
                  <ReasonBox>
                    <h4>Admin Notes</h4>
                    <p>{request.admin_notes}</p>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Processed by: {request.admin_first_name} {request.admin_last_name} on {formatDate(request.processed_at)}
                    </div>
                  </ReasonBox>
                )}
                
                {request.status === 'pending' && (
                  <RequestActions>
                    <ActionButton
                      variant="approve"
                      onClick={() => openProcessingModal(request, 'approve')}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      Approve
                    </ActionButton>
                    <ActionButton
                      variant="reject"
                      onClick={() => openProcessingModal(request, 'deny')}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Deny
                    </ActionButton>
                  </RequestActions>
                )}
              </CancellationRequestCard>
            ))
        )}
        
        {activeTab === 'design-requests' && (
          <>
            {/* Design Request Statistics */}
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{customDesignRequests.length}</h3>
                <p>Total Requests</p>
              </StatCard>
              <StatCard color="#f39c12">
                <h3>{customDesignRequests.filter(req => req.status === 'pending').length}</h3>
                <p>Pending Review</p>
              </StatCard>
              <StatCard color="#27ae60">
                <h3>{customDesignRequests.filter(req => req.status === 'approved').length}</h3>
                <p>Approved</p>
              </StatCard>
              <StatCard color="#e74c3c">
                <h3>{customDesignRequests.filter(req => req.status === 'rejected').length}</h3>
                <p>Rejected</p>
              </StatCard>
            </StatsContainer>

            {/* Design Request Controls */}
            <ControlsSection>
              <ControlsGrid>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <SearchInput
                    type="text"
                    placeholder="Search custom design requests..."
                    value={designSearchTerm}
                    onChange={(e) => setDesignSearchTerm(e.target.value)}
                    style={{ minWidth: '300px' }}
                  />
                  <RefreshButton onClick={fetchCustomDesignRequests} disabled={designRequestsLoading}>
                    <FontAwesomeIcon icon={faRefresh} />
                    {designRequestsLoading ? 'Loading...' : 'Refresh'}
                  </RefreshButton>
                  {/* Debug Test Button */}
                  <RefreshButton 
                    onClick={() => {
                      console.log('🧪 Manual debug test triggered');
                      console.log('Current state:', { 
                        customDesignRequests: customDesignRequests.length,
                        designRequestsLoading,
                        designSearchTerm,
                        activeTab
                      });
                      fetchCustomDesignRequests();
                    }}
                    style={{ backgroundColor: '#dc3545' }}
                  >
                    🧪 Debug Test
                  </RefreshButton>
                </div>
              </ControlsGrid>
            </ControlsSection>

            {/* Debug Information */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              marginBottom: '16px', 
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#495057' }}>🐛 Debug Information</h4>
              <div>Current Tab: <strong>{activeTab}</strong></div>
              <div>Requests State: <strong>{customDesignRequests.length} items</strong></div>
              <div>Loading: <strong>{designRequestsLoading ? 'Yes' : 'No'}</strong></div>
              <div>Search Term: <strong>"{designSearchTerm}"</strong></div>
              <div>Token Available: <strong>{typeof window !== 'undefined' && localStorage.getItem('token') ? 'Yes' : 'No'}</strong></div>
              <div>User: <strong>{typeof window !== 'undefined' ? localStorage.getItem('user') : 'N/A'}</strong></div>
            </div>

            {/* Design Requests List */}
            {designRequestsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading custom design requests...</p>
              </div>
            ) : (() => {
              // Filter custom design requests based on search term
              const filteredRequests = customDesignRequests.filter(request => {
                if (!designSearchTerm) return true;
                
                const searchLower = designSearchTerm.toLowerCase();
                return (
                  request.custom_order_id?.toString().includes(searchLower) ||
                  request.product_display_name?.toLowerCase().includes(searchLower) ||
                  request.customer_name?.toLowerCase().includes(searchLower) ||
                  request.customer_email?.toLowerCase().includes(searchLower) ||
                  request.status?.toLowerCase().includes(searchLower) ||
                  request.status_display?.toLowerCase().includes(searchLower) ||
                  request.size?.toLowerCase().includes(searchLower) ||
                  request.color?.toLowerCase().includes(searchLower) ||
                  request.special_instructions?.toLowerCase().includes(searchLower)
                );
              });

              // Debug logging
              console.log('🔍 Filtering custom design requests:');
              console.log('📊 Total requests:', customDesignRequests.length);
              console.log('🔍 Search term:', designSearchTerm);
              console.log('📄 Filtered count:', filteredRequests.length);
              if (customDesignRequests.length > 0) {
                console.log('📋 Sample request fields:', Object.keys(customDesignRequests[0]));
              }

              // Add to window for debugging
              if (typeof window !== 'undefined') {
                window.designSearchTerm = designSearchTerm;
                window.designRequestsLoading = designRequestsLoading;
              }

              return filteredRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FontAwesomeIcon icon={faInfoCircle} size="3x" style={{ color: '#ddd', marginBottom: '16px' }} />
                  <p>
                    {designSearchTerm ? 
                      `No custom design requests found matching "${designSearchTerm}".` : 
 
                      'No custom design requests found.'
                    }
                  </p>
                </div>
              ) : (
                filteredRequests.map((request, requestIndex) => (
                <CancellationRequestCard key={`custom-design-${request.custom_order_id}-${requestIndex}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3>Order #{request.custom_order_id}</h3>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Product:</strong> {request.product_display_name}
                      </p>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Customer:</strong> {request.customer_name} ({request.customer_email})
                      </p>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Size:</strong> {request.size} | <strong>Color:</strong> {request.color} | <strong>Quantity:</strong> {request.quantity}
                      </p>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Estimated Price:</strong> ₱{parseFloat(request.estimated_price || 0).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        background: request.status === 'pending' ? '#f39c12' : 
                                   request.status === 'approved' ? '#27ae60' : 
                                   request.status === 'rejected' ? '#e74c3c' : '#95a5a6',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        {request.status_display}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {request.days_since_order} day(s) ago
                      </div>
                    </div>
                  </div>

                  {/* Design Images */}
                  {request.images && request.images.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Design Images ({request.images.length})</h4>
                      <ImageGallery>
                        {request.images.map((image, idx) => (
                          <ImageContainer 
                            key={`custom-design-${request.custom_order_id}-image-${idx}`} 
                            onClick={() => handleImageView(`/uploads/custom-orders/${image.filename}`, image.original_filename)}
                          >
                            <ImagePreview 
                              src={`/uploads/custom-orders/${image.filename}`}
                              alt={image.original_filename}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div style={{ display: 'none', fontSize: '12px', color: '#666', textAlign: 'center', padding: '8px' }}>
                              <FontAwesomeIcon icon={faImage} size="2x" style={{ marginBottom: '8px', opacity: 0.5 }} />
                              <br />
                              Image not found
                            </div>
                            <ImageOverlay>
                              <ImageAction onClick={(e) => {
                                e.stopPropagation();
                                handleImageView(`/uploads/custom-orders/${image.filename}`, image.original_filename);
                              }}>
                                <FontAwesomeIcon icon={faExpand} size="sm" />
                              </ImageAction>
                              <ImageAction onClick={(e) => {
                                e.stopPropagation();
                                handleImageDownload(`/uploads/custom-orders/${image.filename}`, image.original_filename || `design-${idx + 1}.jpg`);
                              }}>
                                <FontAwesomeIcon icon={faDownload} size="sm" />
                              </ImageAction>
                            </ImageOverlay>
                          </ImageContainer>
                        ))}
                      </ImageGallery>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {request.special_instructions && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Special Instructions</h4>
                      <div style={{ 
                        background: '#f8f9fa', 
                        padding: '12px', 
                        borderRadius: '4px',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {request.special_instructions}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes (if any) */}
                  {request.admin_notes && (
                    <ReasonBox>
                      <h4>Admin Notes</h4>
                      <p>{request.admin_notes}</p>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        Last updated: {new Date(request.updated_at).toLocaleDateString()}
                      </div>
                    </ReasonBox>
                  )}
                    {/* Action Buttons - only show for pending requests */}
                  {request.status === 'pending' && (
                    <RequestActions>
                      <ActionButton
                        variant="approve"
                        loading={buttonLoading[`${request.custom_order_id}-approved`]}
                        disabled={buttonLoading[`${request.custom_order_id}-approved`] || buttonLoading[`${request.custom_order_id}-rejected`]}
                        onClick={() => openDesignProcessingModal(request, 'approved')}
                        title="Approve this design request"
                      >
                        {buttonLoading[`${request.custom_order_id}-approved`] ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} />
                            Approve Design
                          </>
                        )}
                      </ActionButton>
                      <ActionButton
                        variant="reject"
                        loading={buttonLoading[`${request.custom_order_id}-rejected`]}
                        disabled={buttonLoading[`${request.custom_order_id}-approved`] || buttonLoading[`${request.custom_order_id}-rejected`]}
                        onClick={() => openDesignProcessingModal(request, 'rejected')}
                        title="Reject this design request"
                      >
                        {buttonLoading[`${request.custom_order_id}-rejected`] ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faTimes} />
                            Reject Design
                          </>
                        )}
                      </ActionButton>
                    </RequestActions>
                  )}</CancellationRequestCard>
                ))
              );
            })()}
          </>
        )}
        
        {/* Close design-requests tab fragment */}
        </>
      )}
      
      {/* Processing Modal */}
        {showProcessingModal && processingRequest && (
          <ProcessingModal>
            <ProcessingModalContent>
              <h3>
                {processingRequest.action === 'approve' ? 'Approve' : 'Deny'} Cancellation Request
              </h3>
              <p>
                <strong>Order:</strong> #{processingRequest.order_number}<br />
                <strong>Customer:</strong> {processingRequest.customer_first_name} {processingRequest.customer_last_name}<br />
                <strong>Reason:</strong> {processingRequest.reason}
              </p>
              
              <div className="form-group">
                <label>Admin Notes (Optional)</label>
                <AdminNotesTextarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                />
              </div>
              
              <div className="actions">
                <ActionButton onClick={closeProcessingModal}>
                  Cancel
                </ActionButton>
                <ActionButton
                  variant={processingRequest.action === 'approve' ? 'approve' : 'reject'}
                  onClick={() => processCancellationRequest(processingRequest.id, processingRequest.action)}
                >
                  {processingRequest.action === 'approve' ? 'Approve Request' : 'Deny Request'}
                </ActionButton>
              </div>
            </ProcessingModalContent>
          </ProcessingModal>
        )}
          {/* Processing Modal for Custom Design Request */}
        {showDesignProcessingModal && processingDesignRequest && (
          <ProcessingModal>
            <ProcessingModalContent>
              <h3>
                <FontAwesomeIcon 
                  icon={processingDesignRequest.action === 'approve' ? faCheck : faTimes}
                  style={{ 
                    color: processingDesignRequest.action === 'approve' ? '#27ae60' : '#e74c3c'
                  }}
                />
                {processingDesignRequest.action === 'approve' ? 'Approve' : 'Reject'} Design Request
              </h3>
              <p>
                <strong>Order ID:</strong> #{processingDesignRequest.custom_order_id}<br />
                <strong>Customer:</strong> {processingDesignRequest.customer_name}<br />
                <strong>Product:</strong> {processingDesignRequest.product_display_name}<br />
                <strong>Email:</strong> {processingDesignRequest.customer_email}<br />
                {processingDesignRequest.quantity && <><strong>Quantity:</strong> {processingDesignRequest.quantity}<br /></>}
                {processingDesignRequest.size && <><strong>Size:</strong> {processingDesignRequest.size}<br /></>}
                {processingDesignRequest.color && <><strong>Color:</strong> {processingDesignRequest.color}</>}
              </p>
              
              <div className="form-group">
                <label>
                  Admin Notes {processingDesignRequest.action === 'approve' ? '(Optional)' : '(Recommended for rejections)'}
                </label>
                <AdminNotesTextarea
                  value={designAdminNotes}
                  onChange={(e) => setDesignAdminNotes(e.target.value)}
                  placeholder={
                    processingDesignRequest.action === 'approve' 
                      ? "Add any notes about pricing, timeline, or special considerations..."
                      : "Please provide a reason for rejection to help the customer understand..."
                  }
                />
              </div>
                <div className="actions">
                <ActionButton 
                  onClick={closeDesignProcessingModal}
                  disabled={buttonLoading[`${processingDesignRequest.custom_order_id}-${processingDesignRequest.status}`]}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  variant={processingDesignRequest.status === 'approved' ? 'approve' : 'reject'}
                  loading={buttonLoading[`${processingDesignRequest.custom_order_id}-${processingDesignRequest.status}`]}
                  disabled={buttonLoading[`${processingDesignRequest.custom_order_id}-${processingDesignRequest.status}`]}
                  onClick={() => processDesignRequest(processingDesignRequest.custom_order_id, processingDesignRequest.status)}
                >
                  {buttonLoading[`${processingDesignRequest.custom_order_id}-${processingDesignRequest.status}`] ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={processingDesignRequest.status === 'approved' ? faCheck : faTimes} />
                      {processingDesignRequest.status === 'approved' ? 'Approve Design' : 'Reject Design'}
                    </>
                  )}
                </ActionButton>
              </div>
            </ProcessingModalContent>
          </ProcessingModal>
        )}
        
        {/* Image Modal */}
        {showImageModal && (
          <ImageModal onClick={closeImageModal}>
            <ImageModalContent onClick={(e) => e.stopPropagation()}>
              <ImageModalHeader>
                <ImageModalTitle>{imageName}</ImageModalTitle>
                <ImageModalActions>
                  <ModalButton onClick={() => handleImageDownload(selectedImage, imageName)}>
                    <FontAwesomeIcon icon={faDownload} />
                    Download
                  </ModalButton>
                  <ModalButton onClick={closeImageModal}>
                    <FontAwesomeIcon icon={faTimes} />
                    Close
                  </ModalButton>
                </ImageModalActions>
              </ImageModalHeader>
              <ModalImageContainer>
                <ModalImage 
                  src={selectedImage} 
                  alt={imageName}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ 
                  display: 'none', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  <FontAwesomeIcon icon={faImage} size="3x" style={{ marginBottom: '16px', opacity: 0.5 }} />
                  Image could not be loaded
                </div>
              </ModalImageContainer>
            </ImageModalContent>
          </ImageModal>
        )}
        
        {/* Payment Proof Modal */}
        {showPaymentProofModal && selectedPaymentProof && (
          <ModalOverlay onClick={closePaymentProofModal}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Payment Proof - Order #{selectedPaymentProof.orderNumber}</h2>
                <CloseButton onClick={closePaymentProofModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>
              <ModalContent>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ 
                    width: '100%', 
                    maxWidth: '500px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img 
                      src={selectedPaymentProof.imagePath} 
                      alt={`Payment proof for ${selectedPaymentProof.customerName}`} 
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <div style={{ 
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <ActionButton
                        compact
                        onClick={() => handleImageDownload(selectedPaymentProof.imagePath, `payment-proof-${selectedPaymentProof.orderNumber}.jpg`)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </ActionButton>
                    </div>
                  </div>
                  
                  <div style={{ 
                    width: '100%',
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Payment Details
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <div>Customer:</div>
                      <div>{selectedPaymentProof.customerName}</div>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <div>Order #:</div>
                      <div>{selectedPaymentProof.orderNumber}</div>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <div>Amount:</div>
                      <div>
                        {formatCurrency(transactions.find(t => t.order_number === selectedPaymentProof.orderNumber)?.amount)}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <div>Status:</div>
                      <div>
                        <StatusBadge status={
                          transactions.find(t => t.order_number === selectedPaymentProof.orderNumber)?.transaction_status
                        }>
                          {getDisplayStatus(transactions.find(t => t.order_number === selectedPaymentProof.orderNumber)?.transaction_status)}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalContent>
            </Modal>
          </ModalOverlay>
        )}
        
        {/* Transaction Details Modal */}
        {showModal && selectedTransaction && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Transaction Details - {selectedTransaction.order_number}</h2>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>
              <ModalContent>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <h3>Order Information</h3>
                    <DetailItem><strong>Order Number:</strong> {selectedTransaction.order_number}</DetailItem>
                    <DetailItem><strong>Order Date:</strong> {formatDate(selectedTransaction.order_date)}</DetailItem>
                    <DetailItem><strong>Order Type:</strong> {selectedTransaction.order_type === 'custom' ? 'Custom Order' : 'Regular Order'}</DetailItem>
                    <DetailItem><strong>Order Status:</strong> <StatusBadge status={selectedTransaction.status}>{getDisplayStatus(selectedTransaction.status)}</StatusBadge></DetailItem>
                    <DetailItem><strong>Delivery Status:</strong> <DeliveryStatusBadge status={selectedTransaction.delivery_status || 'pending'}>{getDeliveryStatusInfo(selectedTransaction.delivery_status || 'pending').text}</DeliveryStatusBadge></DetailItem>
                    <DetailItem><strong>Total Amount:</strong> {formatCurrency(selectedTransaction.total_amount)}</DetailItem>
                    <DetailItem><strong>Payment Method:</strong> {selectedTransaction.payment_method}</DetailItem>
                  </div>
                  <div>
                    <h3>Customer Information</h3>
                    <DetailItem><strong>Name:</strong> {selectedTransaction.customer_name}</DetailItem>
                    <DetailItem><strong>Email:</strong> {selectedTransaction.customer_email}</DetailItem>
                    <DetailItem><strong>Phone:</strong> {selectedTransaction.contact_phone || 'N/A'}</DetailItem>
                    <DetailItem><strong>Address:</strong> {selectedTransaction.shipping_address || 'N/A'}</DetailItem>
                  </div>
                </div>
                
                {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h3>Order Items ({selectedTransaction.items.length})</h3>
                    <OrderItemsList>
                      {selectedTransaction.items.map((item, index) => (
                        <OrderItemCard key={`modal-transaction-${selectedTransaction.transaction_id || selectedTransaction.id}-item-${index}`}>
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
                    </OrderItemsList>
                  </div>
                )}
                
                {selectedTransaction.notes && (
                  <div style={{ marginTop: '24px' }}>
                    <h3>Notes</h3>
                    <DetailItem>{selectedTransaction.notes}</DetailItem>
                  </div>
                )}
              </ModalContent>
            </Modal>
          </ModalOverlay>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default TransactionPage;
