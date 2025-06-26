import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudUploadAlt, 
  faUser, 
  faPhone, 
  faMapMarkerAlt,
  faShoppingCart,
  faSpinner,
  faCheck,
  faTimes,
  faImage,
  faPalette,
  faTshirt,
  faRulerCombined
} from '@fortawesome/free-solid-svg-icons';

// Icon component using FontAwesome
const Icon = ({ icon, ...props }) => <FontAwesomeIcon icon={icon} {...props} />;

// Enhanced Modern SVG Icons for clothing types
const TShirtIcon = ({ color = '#000000', size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tshirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <path d="M14 14h6v-3c0-1.5 1.5-3 3-3h10c1.5 0 3 1.5 3 3v3h6l2 6-2 2v25H14V22l-2-2 2-6z" fill="url(#tshirtGrad)" stroke={color} strokeWidth="1"/>
    <path d="M20 14h16M16 18v26M40 18v26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="28" cy="26" r="1.5" fill="#ffffff" opacity="0.7"/>
  </svg>
);

const ShortsIcon = ({ color = '#000000', size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shortsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <path d="M16 12h24v6l-3 4v18h-7V24h-4v16h-7V22l-3-4V12z" fill="url(#shortsGrad)" stroke={color} strokeWidth="1"/>
    <path d="M20 12v8M36 12v8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 24h4M32 24h4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const HoodieIcon = ({ color = '#000000', size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <path d="M14 16h6v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h6l2 2v28H12V18l2-2z" fill="url(#hoodieGrad)" stroke={color} strokeWidth="1"/>
    <path d="M18 8c0-3 3-6 10-6s10 3 10 6c0 2-2 4-3 5H21c-1-1-3-3-3-5z" fill="url(#hoodieGrad)" stroke={color} strokeWidth="1"/>
    <path d="M20 16h16M16 20v24M40 20v24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 20v6h12v-6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="24" cy="22" r="1" fill="#ffffff"/>
    <circle cx="32" cy="22" r="1" fill="#ffffff"/>
  </svg>
);

const JerseyIcon = ({ color = '#000000', size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <path d="M14 14h6v-2c0-1 1-2 2-2h12c1 0 2 1 2 2v2h6v6l-2 2v22H16V22l-2-2v-6z" fill="url(#jerseyGrad)" stroke={color} strokeWidth="1"/>
    <path d="M20 14h16M16 18v26M40 18v26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    <rect x="24" y="20" width="8" height="12" rx="1" fill="#ffffff" opacity="0.9"/>
    <text x="28" y="30" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">7</text>
  </svg>
);

const JacketIcon = ({ color = '#000000', size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </linearGradient>
    </defs>
    {/* Main jacket body */}
    <path d="M12 14h6v-2c0-2 2-4 4-4h12c2 0 4 2 4 4v2h6l2 4v26H10V18l2-4z" fill="url(#jacketGrad)" stroke={color} strokeWidth="1"/>
    
    {/* Jacket details - collar, sleeves, pockets */}
    <path d="M18 14h20M16 20v22M40 20v22M20 22h7M29 22h7M20 26h7M29 26h7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
    
    {/* Jacket collar */}
    <path d="M22 18v4h5v-4M29 18v4h5v-4" stroke="#ffffff" strokeWidth="1.5" fill="none"/>
    
    {/* Side buttons */}
    <circle cx="18" cy="24" r="1.5" fill="#ffffff"/>
    <circle cx="18" cy="28" r="1.5" fill="#ffffff"/>
    <circle cx="38" cy="24" r="1.5" fill="#ffffff"/>
    <circle cx="38" cy="28" r="1.5" fill="#ffffff"/>
    
    {/* Central vertical zipper line */}
    <line x1="28" y1="18" x2="28" y2="42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Zipper teeth/details */}
    <g stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8">
      <line x1="26" y1="20" x2="30" y2="20"/>
      <line x1="26" y1="22" x2="30" y2="22"/>
      <line x1="26" y1="24" x2="30" y2="24"/>
      <line x1="26" y1="26" x2="30" y2="26"/>
      <line x1="26" y1="28" x2="30" y2="28"/>
      <line x1="26" y1="30" x2="30" y2="30"/>
      <line x1="26" y1="32" x2="30" y2="32"/>
      <line x1="26" y1="34" x2="30" y2="34"/>
      <line x1="26" y1="36" x2="30" y2="36"/>
      <line x1="26" y1="38" x2="30" y2="38"/>
      <line x1="26" y1="40" x2="30" y2="40"/>
    </g>
    
    {/* Zipper pull tab */}
    <rect x="26" y="17" width="4" height="3" rx="1" fill="#ffffff" opacity="0.9"/>
  </svg>
);

const SweaterIcon = ({ color = '#000000', size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sweaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </linearGradient>
      <pattern id="sweaterPattern" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="transparent"/>
        <circle cx="2" cy="2" r="0.5" fill="#ffffff" opacity="0.3"/>
      </pattern>
    </defs>
    <path d="M14 16h6v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h6l2 2v26H12V18l2-2z" fill="url(#sweaterGrad)" stroke={color} strokeWidth="1"/>
    <rect x="16" y="18" width="24" height="24" fill="url(#sweaterPattern)"/>
    <path d="M20 16h16M16 20v22M40 20v22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 22h16M20 26h16M20 30h16M20 34h16" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

// Metro Manila Cities for dropdown
const metroManilaCities = [
  'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
  'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
  'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
];

// Product configurations with pricing
const productTypes = {
  't-shirts': {
    name: 'T-Shirts',
    price: 1050,
    icon: TShirtIcon,
    colors: ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink']
  },
  'shorts': {
    name: 'Shorts',
    price: 850,
    icon: ShortsIcon,
    colors: ['Black', 'Navy', 'Gray', 'Khaki', 'Blue', 'Green', 'Red']
  },
  'hoodies': {
    name: 'Hoodies',
    price: 1600,
    icon: HoodieIcon,
    colors: ['Black', 'Gray', 'Navy', 'White', 'Maroon', 'Blue', 'Green']
  },
  'jerseys': {
    name: 'Jerseys',
    price: 1000,
    icon: JerseyIcon,
    colors: ['White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Purple']
  },
  'jackets': {
    name: 'Jackets',
    price: 1800,
    icon: JacketIcon,
    colors: ['Black', 'Navy', 'Gray', 'Brown', 'Olive', 'Charcoal']
  },
  'sweaters': {
    name: 'Sweaters',
    price: 1400,
    icon: SweaterIcon,
    colors: ['Black', 'Gray', 'Cream', 'Navy', 'Burgundy', 'Forest Green']
  }
};

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Styled Components - Modern Minimalist Design
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  padding-top: 100px;
  background: #ffffff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 5rem;
  
  h1 {
    font-size: 3rem;
    font-weight: 200;
    color: #000000;
    margin-bottom: 1.5rem;
    letter-spacing: -1px;
    line-height: 1.1;
    
    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }
  
  p {
    color: #666666;
    font-size: 1.125rem;
    font-weight: 300;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.7;
    letter-spacing: 0.2px;
  }
`;

const StepContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 3rem;
  margin-bottom: 3rem;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #e0e0e0;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin-bottom: 2rem;
  }
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 300;
    color: #000000;
    margin: 0;
    letter-spacing: -0.5px;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #000000, #333333);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    h2 {
      font-size: 1.25rem;
    }
    
    .step-number {
      width: 36px;
      height: 36px;
      font-size: 0.9rem;
    }
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const ProductCard = styled.div`
  background: ${props => props.selected ? '#000000' : '#ffffff'};
  color: ${props => props.selected ? '#ffffff' : '#000000'};
  border: 2px solid ${props => props.selected ? '#000000' : '#f0f0f0'};
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    border-color: #000000;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: ${props => props.selected ? 1 : 0};
    }
  }
  
  .icon {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
  }
  
  h3 {
    font-size: 1rem;
    font-weight: 500;
    margin: 1rem 0 0.5rem 0;
    letter-spacing: -0.25px;
  }
  
  .price {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.selected ? '#ffffff' : '#000000'};
    margin-top: 0.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    
    .icon {
      height: 80px;
      margin-bottom: 1rem;
    }
    
    h3 {
      font-size: 0.9rem;
    }
    
    .price {
      font-size: 1.1rem;
    }
  }
`;

const ImageUploadSection = styled.div`
  border: 2px dashed ${props => props.isDragOver ? '#000000' : '#d0d0d0'};
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  background: ${props => props.isDragOver ? '#f8f8f8' : '#fafafa'};
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #000000;
    background: #f5f5f5;
  }
  
  .upload-icon {
    font-size: 3rem;
    color: #d0d0d0;
    margin-bottom: 1.5rem;
    transition: color 0.3s ease;
  }
  
  &:hover .upload-icon {
    color: #000000;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 400;
    color: #000000;
    margin: 0 0 0.75rem 0;
    letter-spacing: -0.25px;
  }
  
  p {
    font-size: 1rem;
    color: #666666;
    margin: 0 0 1.5rem 0;
    font-weight: 300;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    
    .upload-icon {
      font-size: 2.5rem;
    }
    
    h3 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #000000, #333333);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background: linear-gradient(135deg, #333333, #555555);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f8f8;
  aspect-ratio: 1;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #000000;
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 1);
      transform: scale(1.1);
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  letter-spacing: -0.2px;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
  color: #000000;
  
  &::placeholder {
    color: #999999;
  }
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  &:invalid:not(:focus) {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  font-family: inherit;
  color: #000000;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  option {
    padding: 0.5rem;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  color: #000000;
  line-height: 1.5;
  
  &::placeholder {
    color: #999999;
  }
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

const OrderSummary = styled.div`
  background: #fafafa;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 2.5rem;
  margin-top: 2rem;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 500;
    color: #000000;
    margin: 0 0 1.5rem 0;
    letter-spacing: -0.25px;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #000000;
  font-size: 1rem;
  
  &.total {
    font-size: 1.5rem;
    font-weight: 600;
    color: #000000;
    border-top: 2px solid #e0e0e0;
    padding-top: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .label {
    font-weight: 400;
  }
  
  .value {
    font-weight: 500;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #000000, #333333);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.25px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #333333, #555555);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    font-size: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatusMessage = styled.div`
  background: ${props => props.type === 'error' ? '#fff5f5' : '#f0fff4'};
  color: ${props => props.type === 'error' ? '#c53030' : '#38a169'};
  border: 2px solid ${props => props.type === 'error' ? '#fed7d7' : '#c6f6d5'};
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .icon {
    font-size: 1.25rem;
  }
`;

const ErrorMessage = styled(StatusMessage).attrs({ type: 'error' })``;
const SuccessMessage = styled(StatusMessage).attrs({ type: 'success' })``;

const PendingOrderCard = styled.div`
  background: #ffffff;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #e0e0e0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const OrderId = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  letter-spacing: -0.25px;
`;

const OrderStatus = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#f8f9fa';
      case 'confirmed': return '#e3f2fd';
      case 'processing': return '#fff3e0';
      case 'completed': return '#e8f5e8';
      case 'cancelled': return '#ffebee';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#666666';
      case 'confirmed': return '#1976d2';
      case 'processing': return '#f57c00';
      case 'completed': return '#388e3c';
      case 'cancelled': return '#d32f2f';
      default: return '#666666';
    }
  }};
  border: 2px solid ${props => {
    switch (props.status) {
      case 'pending': return '#e5e5e5';
      case 'confirmed': return '#2196f3';
      case 'processing': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#e5e5e5';
    }
  }};
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  font-size: 1rem;
  color: #000000;
  line-height: 1.5;
  
  strong {
    color: #000000;
    font-weight: 600;
  }
`;

const ToggleButton = styled.button`
  background: #ffffff;
  border: 2px solid #f0f0f0;
  color: #000000;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: #000000;
    background: #fafafa;
    transform: translateY(-1px);
  }
`;

const CustomPage = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showPendingSection, setShowPendingSection] = useState(true);

  const [formData, setFormData] = useState({
    // Product details
    productName: '',
    size: '',
    color: '',
    quantity: 1,
    specialInstructions: '',
      // Customer info
    customerName: '',
    phone: '',
    
    // Shipping address
    province: 'Metro Manila', // Fixed to Metro Manila
    city: '',
    streetAddress: '',
    houseNumber: '',
    barangay: '',
    postalCode: ''
  });
  // Get user info on component mount
  useEffect(() => {
    console.log('🔄 CustomPage component mounted, checking for token...');
    const token = localStorage.getItem('token');
    console.log('   Token found:', token ? 'Yes' : 'No');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('   Token payload:', payload);
        setUser(payload);        setFormData(prev => ({
          ...prev,
          customerName: payload.username || ''
        }));
        console.log('✅ User state set from token');
      } catch (error) {
        console.error('❌ Error parsing token:', error);
      }
    } else {
      console.log('❌ No token found in localStorage');
    }
  }, []);  // Fetch pending custom orders by email
  const fetchPendingOrders = useCallback(async () => {
    setLoadingPending(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching pending orders by email...');
      console.log('   Token exists:', token ? 'Yes' : 'No');
      console.log('   User:', user);
      console.log('   User email:', user?.email);
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      console.log('📡 Making request to: http://localhost:5000/api/custom-orders/my-orders');
      console.log('   This will fetch orders for email:', user?.email);
      console.log('   Headers:', headers);
      
      const response = await fetch('http://localhost:5000/api/custom-orders/my-orders', {
        method: 'GET',
        headers
      });

      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Received data:', result);
        console.log('   Orders count:', result.count);
        console.log('   Orders data length:', result.data ? result.data.length : 0);
        
        // The API returns data in result.data, not result.customOrders
        setPendingOrders(result.data || []);
        console.log('✅ Pending orders updated in state');
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to fetch pending orders:', response.status, errorData);
        if (response.status === 401) {
          console.log('🔑 Authentication required - user might need to log in again');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching pending orders:', error);
    } finally {
      setLoadingPending(false);
    }
  }, [user]);  // Fetch pending orders when user is available
  useEffect(() => {
    console.log('🔄 useEffect triggered for pending orders');
    console.log('   User state:', user);
    console.log('   Will fetch orders:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('✅ User exists, calling fetchPendingOrders...');
      fetchPendingOrders();
    } else {
      console.log('❌ No user state, skipping fetchPendingOrders');
    }
  }, [user, fetchPendingOrders]);

  const handleProductSelect = (productType) => {
    setSelectedProduct(productType);
    setFormData(prev => ({
      ...prev,
      productName: productTypes[productType].name,
      color: '', // Reset color selection
      size: '' // Reset size selection
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (uploadedImages.length + files.length > 10) {
      setSubmitStatus({
        type: 'error',
        message: 'Maximum 10 images allowed. Please remove some images first.'
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setSubmitStatus({
          type: 'error',
          message: `File ${file.name} is too large. Maximum size is 10MB.`
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setSubmitStatus({
          type: 'error',
          message: `File ${file.name} is not a valid image.`
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Clear any previous error messages
    setSubmitStatus({ type: '', message: '' });
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!selectedProduct) {
      setSubmitStatus({ type: 'error', message: 'Please select a product type.' });
      return false;
    }

    if (!formData.productName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter a product name.' });
      return false;
    }

    if (!formData.size) {
      setSubmitStatus({ type: 'error', message: 'Please select a size.' });
      return false;
    }

    if (!formData.color) {
      setSubmitStatus({ type: 'error', message: 'Please select a color.' });
      return false;
    }

    if (uploadedImages.length === 0) {
      setSubmitStatus({ type: 'error', message: 'Please upload at least one design image.' });
      return false;
    }    if (!formData.customerName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your full name.' });
      return false;
    }

    if (!formData.phone.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your phone number.' });
      return false;
    }

    if (!formData.city) {
      setSubmitStatus({ type: 'error', message: 'Please select a city.' });
      return false;
    }

    if (!formData.streetAddress.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your street address.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const submitFormData = new FormData();      // Add form fields
      submitFormData.append('productType', selectedProduct);
      submitFormData.append('productName', formData.productName);
      submitFormData.append('size', formData.size);
      submitFormData.append('color', formData.color);
      submitFormData.append('quantity', formData.quantity);
      submitFormData.append('specialInstructions', formData.specialInstructions);      submitFormData.append('customerName', formData.customerName);
      submitFormData.append('customerEmail', user?.email || ''); // Use logged-in user's email
      submitFormData.append('customerPhone', formData.phone);
      submitFormData.append('province', formData.province);
      submitFormData.append('municipality', formData.city);
      submitFormData.append('streetNumber', formData.streetAddress);
      submitFormData.append('houseNumber', formData.houseNumber);
      submitFormData.append('barangay', formData.barangay);
      submitFormData.append('postalCode', formData.postalCode);// Add images
      uploadedImages.forEach((image, index) => {
        submitFormData.append('images', image.file);
      });

      const token = localStorage.getItem('token');
      const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch('http://localhost:5000/api/custom-orders', {
        method: 'POST',
        headers,
        body: submitFormData
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: `Custom order submitted successfully! Order ID: ${result.customOrderId}. You will receive a confirmation email shortly.`
        });
        
        // Reset form
        setSelectedProduct('');
        setUploadedImages([]);        setFormData({
          productName: '',
          size: '',
          color: '',
          quantity: 1,
          specialInstructions: '',
          customerName: user?.username || '',
          phone: '',
          province: 'Metro Manila',
          city: '',
          streetAddress: '',
          houseNumber: '',
          barangay: '',
          postalCode: ''        });// Refresh pending orders to show the new submission
        console.log('✅ Order submitted successfully, refreshing pending orders...');
        // Add a small delay to ensure database has been updated
        setTimeout(() => {
          fetchPendingOrders();
        }, 1000);
        
        // Auto-show the pending section after successful submission
        setShowPendingSection(true);

      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to submit custom order. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting custom order:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return productTypes[selectedProduct].price * formData.quantity;
  };
  return (
    <PageContainer>
      <Header>
        <h1>Custom Design Studio</h1>
        <p>Create your perfect custom clothing with our design studio. Upload your designs and we'll bring them to life!</p>
      </Header>

      {/* Pending Customized Products Section */}
      {user && (
        <StepContainer>          <StepHeader>
            <div style={{ 
              minWidth: '32px', 
              height: '32px', 
              background: 'transparent', 
              color: '#000000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>📋</div>
            <h2>Your Pending Customized Products</h2>
          </StepHeader>          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <ToggleButton onClick={() => setShowPendingSection(!showPendingSection)}>
              {showPendingSection ? 'Hide' : 'Show'} Pending Orders ({pendingOrders.length})
            </ToggleButton>
              {showPendingSection && (
              <ToggleButton onClick={fetchPendingOrders} disabled={loadingPending}>
                {loadingPending ? <Icon icon={faSpinner} spin /> : '🔄'} Refresh
              </ToggleButton>
            )}
          </div>

          {showPendingSection && (
            <div>
              {loadingPending ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Icon icon={faSpinner} spin size="3x" />
                  <p style={{ marginTop: '1rem', color: '#666666', fontSize: '0.875rem' }}>Loading your orders...</p>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>
                  <Icon icon={faTshirt} size="3x" />
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>No pending custom orders yet.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Submit your first custom design below!</p>
                </div>
              ) : (                <div>
                  {pendingOrders && pendingOrders.length > 0 ? pendingOrders
                    .filter(order => order && order.custom_order_id) // Filter out invalid orders
                    .map((order) => (
                    <PendingOrderCard key={order.custom_order_id}>
                      <OrderHeader>
                        <OrderId>Order #{order.custom_order_id}</OrderId>
                        <OrderStatus status={order.status}>{order.status}</OrderStatus>
                      </OrderHeader>
                      
                      <OrderDetails>
                        <DetailItem>
                          <strong>Product:</strong> {order.product_name || order.product_type}
                        </DetailItem>
                        <DetailItem>
                          <strong>Size:</strong> {order.size}
                        </DetailItem>
                        <DetailItem>
                          <strong>Color:</strong> {order.color}
                        </DetailItem>                        <DetailItem>
                          <strong>Quantity:</strong> {order.quantity}
                        </DetailItem>
                        {order.urgency && (
                          <DetailItem>
                            <strong>Urgency:</strong> {order.urgency.replace('_', ' ')}
                          </DetailItem>
                        )}                        <DetailItem>
                          <strong>Estimated Price:</strong> ₱{parseFloat(order.estimated_price)?.toLocaleString() || 'TBD'}
                        </DetailItem>{order.final_price && order.final_price > 0 && (
                          <DetailItem>
                            <strong>Final Price:</strong> ₱{parseFloat(order.final_price)?.toLocaleString() || 'TBD'}
                          </DetailItem>
                        )}
                        <DetailItem>
                          <strong>Submitted:</strong> {new Date(order.created_at).toLocaleDateString()}
                        </DetailItem>
                      </OrderDetails>
                      
                      {order.special_instructions && (
                        <DetailItem style={{ marginTop: '0.75rem' }}>
                          <strong>Special Instructions:</strong> {order.special_instructions}
                        </DetailItem>
                      )}
                      
                      {order.admin_notes && (
                        <DetailItem style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fafafa', borderRadius: '4px' }}>
                          <strong>Admin Notes:</strong> {order.admin_notes}
                        </DetailItem>
                      )}                    </PendingOrderCard>
                  )) : <div>No valid orders found</div>}
                </div>
              )}
            </div>
          )}
        </StepContainer>
      )}

      {submitStatus.message && (
        submitStatus.type === 'error' ? (
          <ErrorMessage>
            <Icon icon={faTimes} /> {submitStatus.message}
          </ErrorMessage>
        ) : (
          <SuccessMessage>
            <Icon icon={faCheck} /> {submitStatus.message}
          </SuccessMessage>
        )
      )}

      {/* Step 1: Product Selection */}
      <StepContainer>
        <StepHeader>
          <div className="step-number">1</div>
          <h2>Choose Your Product</h2>
        </StepHeader>
        <ProductGrid>
          {Object.entries(productTypes).map(([key, product]) => {
            const IconComponent = product.icon;
            return (
              <ProductCard
                key={key}
                selected={selectedProduct === key}
                onClick={() => handleProductSelect(key)}
              >
                <div className="icon">                  <IconComponent 
                    color={selectedProduct === key ? '#ffffff' : '#000000'} 
                    size={60} 
                  />
                </div>
                <h3>{product.name}</h3>
                <div className="price">₱{product.price?.toLocaleString() || 'TBD'}</div>
              </ProductCard>
            );
          })}
        </ProductGrid>
      </StepContainer>

      {/* Step 2: Design Upload */}
      <StepContainer>
        <StepHeader>
          <div className="step-number">2</div>
          <h2>Upload Your Design</h2>
        </StepHeader>
        <ImageUploadSection>
          <Icon icon={faCloudUploadAlt} size="3x" />
          <h3>Drop your design files here or click to browse</h3>
          <p>Upload up to 10 images (JPG, PNG, GIF). Maximum 10MB per file.</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="imageUpload"
          />
          <UploadButton as="label" htmlFor="imageUpload">
            <Icon icon={faImage} />
            Select Images
          </UploadButton>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
            {uploadedImages.length}/10 images uploaded
          </p>
        </ImageUploadSection>

        {uploadedImages.length > 0 && (
          <ImagePreviewGrid>
            {uploadedImages.map((image) => (
              <ImagePreview key={image.id}>
                <img src={image.preview} alt="Design preview" />
                <button className="remove-btn" onClick={() => removeImage(image.id)}>
                  <Icon icon={faTimes} />
                </button>
              </ImagePreview>
            ))}
          </ImagePreviewGrid>
        )}
      </StepContainer>

      {/* Step 3: Product Details */}
      <StepContainer>
        <StepHeader>
          <div className="step-number">3</div>
          <h2>Product Customization</h2>
        </StepHeader>
        <FormGrid>
          <FormGroup>
            <Label>
              <Icon icon={faTshirt} /> Product Name
            </Label>
            <Input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter custom product name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Icon icon={faRulerCombined} /> Size
            </Label>
            <Select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Size</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              <Icon icon={faPalette} /> Base Color
            </Label>
            <Select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Color</option>
              {selectedProduct && productTypes[selectedProduct].colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Quantity</Label>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max="100"
              required
            />
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Special Instructions (Optional)</Label>
            <TextArea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="Any special requirements or notes for your custom design..."
            />
          </FormGroup>
        </FormGrid>
      </StepContainer>

      {/* Step 4: Customer Information */}
      <StepContainer>
        <StepHeader>
          <div className="step-number">4</div>
          <h2>Customer Information</h2>
        </StepHeader>
        <FormGrid>
          <FormGroup>
            <Label>
              <Icon icon={faUser} /> Full Name
            </Label>
            <Input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </FormGroup>          <FormGroup>
            <Label>
              <Icon icon={faPhone} /> Phone Number
            </Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </FormGroup>
        </FormGrid>
      </StepContainer>

      {/* Step 5: Shipping Information */}
      <StepContainer>
        <StepHeader>
          <div className="step-number">5</div>
          <h2>Shipping Information</h2>
        </StepHeader>        <div style={{ 
          background: '#fafafa', 
          border: '1px solid #e5e5e5', 
          borderRadius: '4px', 
          padding: '1rem', 
          marginBottom: '2rem',
          color: '#000000',
          fontSize: '0.875rem'
        }}>
          <strong>📍 Delivery Notice:</strong> We currently deliver only within Metro Manila. Free delivery for all custom orders.
        </div>
        
        <FormGrid>
          <FormGroup>
            <Label>
              <Icon icon={faMapMarkerAlt} /> Province
            </Label>
            <Select
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              disabled
            >
              <option value="Metro Manila">Metro Manila</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>City/Municipality</Label>
            <Select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            >
              <option value="">Select City</option>
              {metroManilaCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Street Address / House Number</Label>
            <Input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="Enter complete street address and house/building number"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>House/Unit Number (Optional)</Label>
            <Input
              type="text"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleInputChange}
              placeholder="Unit/House number"
            />
          </FormGroup>

          <FormGroup>
            <Label>Barangay (Optional)</Label>
            <Input
              type="text"
              name="barangay"
              value={formData.barangay}
              onChange={handleInputChange}
              placeholder="Barangay"
            />
          </FormGroup>

          <FormGroup>
            <Label>Postal Code (Optional)</Label>
            <Input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="e.g., 1234"
              maxLength="4"
              pattern="[0-9]{4}"
            />
          </FormGroup>
        </FormGrid>
      </StepContainer>

      {/* Order Summary */}
      {selectedProduct && (
        <OrderSummary>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#000000', fontSize: '1rem', fontWeight: '400' }}>Order Summary</h3>
          <SummaryRow>
            <span>Product Type:</span>
            <span>{productTypes[selectedProduct].name}</span>
          </SummaryRow>
          {formData.productName && (
            <SummaryRow>
              <span>Product Name:</span>
              <span>{formData.productName}</span>
            </SummaryRow>
          )}
          {formData.size && (
            <SummaryRow>
              <span>Size:</span>
              <span>{formData.size}</span>
            </SummaryRow>
          )}
          {formData.color && (
            <SummaryRow>
              <span>Color:</span>
              <span>{formData.color}</span>
            </SummaryRow>
          )}
          <SummaryRow>
            <span>Quantity:</span>
            <span>{formData.quantity}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Unit Price:</span>
            <span>₱{productTypes[selectedProduct]?.price?.toLocaleString() || 'TBD'}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Design Images:</span>
            <span>{uploadedImages.length} uploaded</span>
          </SummaryRow>
          <SummaryRow>
            <span>Shipping:</span>
            <span>Free</span>
          </SummaryRow>
          <SummaryRow className="total">
            <span>Total Estimated Price:</span>
            <span>₱{calculateTotal()?.toLocaleString() || 'TBD'}</span>
          </SummaryRow>
        </OrderSummary>
      )}

      <SubmitButton 
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedProduct}
      >
        {isSubmitting ? (
          <>
            <Icon icon={faSpinner} spin />
            Submitting Order...
          </>
        ) : (
          <>
            <Icon icon={faShoppingCart} />
            Submit Custom Order
          </>
        )}
      </SubmitButton>
    </PageContainer>
  );
};

export default CustomPage;