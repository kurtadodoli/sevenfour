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
  faPalette,
  faShoppingBag,
  faDownload,
  faExpand,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 80px 24px 40px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
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
  border: 1px solid #f0f0f0;
  overflow: hidden;
  overflow-x: auto;
  min-width: 100%;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 140px 180px 280px 220px 140px 120px 140px 140px 120px;
  gap: 20px;
  padding: 28px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  font-size: 13px;
  color: #555555;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  min-width: 1380px;
  
  @media (max-width: 1400px) {
    grid-template-columns: 130px 160px 250px 200px 120px 100px 120px 120px 100px;
    gap: 16px;
    padding: 24px 20px;
    font-size: 12px;
    min-width: 1200px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 120px 140px 220px 180px 110px 90px 110px 110px 90px;
    gap: 14px;
    padding: 20px 16px;
    font-size: 11px;
    min-width: 1080px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 140px 180px 280px 220px 140px 120px 140px 140px 120px;
  gap: 20px;
  padding: 32px 24px;
  border-bottom: 1px solid #f8f8f8;
  align-items: center;
  transition: all 0.2s ease;
  min-width: 1380px;
  
  &:hover {
    background: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1400px) {
    grid-template-columns: 130px 160px 250px 200px 120px 100px 120px 120px 100px;
    gap: 16px;
    padding: 28px 20px;
    min-width: 1200px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 120px 140px 220px 180px 110px 90px 110px 110px 90px;
    gap: 14px;
    padding: 24px 16px;
    min-width: 1080px;
  }
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #000000;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', monospace;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OrderTypeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  
  &.custom {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  &.regular {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }
`;

const CustomerInfo = styled.div`
  .name {
    font-weight: 600;
    color: #000000;
    font-size: 15px;
    margin-bottom: 6px;
    line-height: 1.3;
  }
  
  .email {
    color: #666666;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.2;
    word-break: break-word;
  }
`;

const OrderDetails = styled.div`
  .amount {
    font-weight: 600;
    color: #000000;
    font-size: 15px;
    margin-bottom: 6px;
  }
  
  .address {
    color: #666666;
    font-size: 13px;
    line-height: 1.3;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 100%;
  }
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border: 1px solid;
  display: inline-block;
  text-align: center;
  min-width: 90px;
  transition: all 0.2s ease;
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
      case 'completed':
        return `
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        `;
      default:
        return `
          background: #ffffff;
          color: #999999;
          border-color: #cccccc;
        `;
    }
  }}
`;

const DateInfo = styled.div`
  color: #666666;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.3;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['compact', 'loading', 'variant'].includes(prop),
})`
  min-width: ${props => props.compact ? '40px' : '120px'};
  height: ${props => props.compact ? '40px' : '44px'};
  border: 1px solid;
  border-radius: 8px;
  font-size: ${props => props.compact ? '16px' : '14px'};
  font-weight: ${props => props.compact ? '400' : '600'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.compact ? '0' : '8px'};
  padding: ${props => props.compact ? '0' : '0 16px'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  position: relative;
  overflow: hidden;
  
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

const ImagePlaceholder = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 20px;
  border: 2px dashed #dee2e6;
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

// Helper function to display status with custom labels
const getDisplayStatus = (status) => {
  const normalizedStatus = status?.toLowerCase();
  if (normalizedStatus === 'confirmed') {
    return 'Ready For Delivery';
  }
  if (normalizedStatus === 'delivered') {
    return 'Delivered';
  }
  if (normalizedStatus === 'processing') {
    return 'Processing';
  }
  if (normalizedStatus === 'shipped') {
    return 'Shipped';
  }
  return status;
};

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
  
  const { user } = useAuth();

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching transactions...');
      
      // Fetch both regular orders and custom orders
      const [ordersResponse, customOrdersResponse] = await Promise.all([
        api.get('/orders/confirmed'),
        api.get('/custom-orders/approved')
      ]);
      
      let allTransactions = [];
      
      // Process confirmed regular orders
      if (ordersResponse.data.success) {
        console.log('✅ Regular orders fetched successfully');
        const ordersData = ordersResponse.data.data || [];
        
        const processedOrders = ordersData.map(order => {
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
        console.log(`📦 Added ${processedOrders.length} regular orders`);
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
  }, [user]);

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
      
      const response = await api.get('/custom-orders/admin/all');
      
      if (response.data.success) {
        console.log('✅ Custom design requests fetched:', response.data);
        setCustomDesignRequests(response.data.data || []);
      } else {
        console.error('❌ Failed to fetch custom design requests:', response.data);
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

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchCancellationRequests();
  }, [fetchCancellationRequests]);

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
        <div style={{ 
          overflowX: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <TransactionsTable><TableHeader>
            <div>Order #</div>
            <div>Date</div>
            <div>Customer</div>
            <div>Products</div>
            <div>Amount</div>
            <div>Payment</div>
            <div>Status</div>
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
          ) : (            filteredTransactions.map((transaction) => (              <TableRow key={transaction.transaction_id || transaction.id}>
                <OrderNumber>
                  <OrderTypeIcon className={transaction.order_type || 'regular'}>
                    <FontAwesomeIcon 
                      icon={transaction.order_type === 'custom' ? faPalette : faShoppingBag} 
                    />
                  </OrderTypeIcon>
                  {transaction.order_number}
                </OrderNumber>
                
                <DateInfo>
                  {formatDate(transaction.order_date)}
                </DateInfo>
                
                <CustomerInfo>
                  <div className="name">{transaction.customer_name || transaction.first_name + ' ' + transaction.last_name || 'N/A'}</div>
                  <div className="email">{transaction.customer_email || transaction.user_email || 'N/A'}</div>
                </CustomerInfo>                {/* Products Summary */}
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
                        {transaction.items.length > 2 && (
                          <button
                            style={{
                              background: '#000000',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              viewTransaction(transaction);
                            }}
                            onMouseOver={(e) => e.target.style.background = '#333333'}
                            onMouseOut={(e) => e.target.style.background = '#000000'}
                          >
                            View All
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {transaction.items.slice(0, 2).map((item, index) => (
                          <div key={index} style={{ 
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
                      {transaction.items.length > 2 && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#666666',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          marginTop: '6px',
                          padding: '4px'
                        }}>                          +{transaction.items.length - 2} more item{transaction.items.length - 2 > 1 ? 's' : ''}
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
                
                <DateInfo>
                  {formatDate(transaction.created_at)}
                </DateInfo>
                  <ActionsContainer>
                  <ActionButton
                    variant="view"
                    onClick={() => viewTransaction(transaction)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </ActionButton>
                </ActionsContainer>
              </TableRow>
            ))          )}
        </TransactionsTable>
        </div>

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
              onChange={(e) => setStatusFilter(e.target.value)}
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
            .map((request) => (
              <CancellationRequestCard key={request.id}>
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
                      <FontAwesomeIcon icon={faShoppingBag} />
                      Order Items ({request.order_items.length})
                    </h4>
                    {request.order_items.map((item, index) => (
                      <ProductItem key={index}>
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
                </div>
              </ControlsGrid>
            </ControlsSection>

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
                filteredRequests.map(request => (
                <CancellationRequestCard key={request.custom_order_id}>
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
                            key={idx} 
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
      </ContentWrapper>
    </PageContainer>
  );
};

export default TransactionPage;
