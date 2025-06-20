import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faEye, faSearch, faTimes, faFilter, faSort, faSliders } from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, #000000 0%, #333333 50%, #666666 100%);
    opacity: 0.05;
    z-index: 1;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  position: relative;
  z-index: 2;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 80px;
  position: relative;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #000000, #666666);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #555555;
  margin: 24px 0 0 0;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #666666;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 40px 0;
`;

// Enhanced Search Components
const SearchSection = styled.div`
  margin-bottom: 60px;
  position: relative;
`;

const SearchWithIconsContainer = styled.div`
  margin: 0 auto;
  margin-bottom: 40px;
  
  @media (min-width: 768px) {
    flex-wrap: nowrap;
    gap: 20px;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;
`;

const IconFiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterIcon = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 2px solid ${props => props.active ? '#333' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #333 0%, #555 100%)' : 
    'rgba(255, 255, 255, 0.95)'
  };
  color: ${props => props.active ? '#fff' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.active ? 
    '0 4px 20px rgba(0, 0, 0, 0.15)' : 
    '0 2px 10px rgba(0, 0, 0, 0.08)'
  };
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
    border-color: #333;
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    font-size: 16px;
  }
`;

const FilterBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 20px;
  min-width: 280px;
  z-index: 1000;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
  
  @media (max-width: 767px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: ${props => props.show ? 'translate(-50%, -50%)' : 'translate(-50%, -60%)'};
    width: 90vw;
    max-width: 350px;
  }
`;

const DropdownHeader = styled.h4`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #666;
  }
`;

const DropdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const DropdownCategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const DropdownCategoryButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.active ? '#333' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #333 0%, #555 100%)' : 
    'rgba(255, 255, 255, 0.8)'
  };
  color: ${props => props.active ? '#fff' : '#333'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(135deg, #333 0%, #555 100%)' : 
      'rgba(0, 0, 0, 0.05)'
    };
    border-color: #333;
  }
`;

const DropdownSortSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #333;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

const DropdownPriceInputs = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`;

const DropdownPriceInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #333;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

const DropdownStockOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const DropdownStockButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.active ? '#333' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #333 0%, #555 100%)' : 
    'rgba(255, 255, 255, 0.8)'
  };
  color: ${props => props.active ? '#fff' : '#333'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(135deg, #333 0%, #555 100%)' : 
      'rgba(0, 0, 0, 0.05)'
    };
    border-color: #333;
  }
`;



const SearchInput = styled.input`
  width: 100%;
  padding: 26px 30px 26px 68px;
  font-size: 1.15rem;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  font-weight: 400;
  letter-spacing: 0.3px;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 1);
  }
  
  &::placeholder {
    color: #aaa;
    font-weight: 300;
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    padding: 20px 24px 20px 56px;
    font-size: 1rem;
    
    &::placeholder {
      font-size: 0.95rem;
    }
  }
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 1.3rem;
  z-index: 3;
  transition: color 0.3s ease;
  
  ${SearchInput}:focus + & {
    color: #000;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.08);
  border: none;
  color: #666;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.visible ? 1 : 0};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  
  &:hover {
    color: #000;
    background: rgba(0, 0, 0, 0.12);
    transform: translateY(-50%) scale(1.1);
  }
`;


const SearchResults = styled.div`
  text-align: center;
  margin: 40px 0 20px 0;
  padding: 20px 32px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  color: #444;
  font-size: 1.05rem;
  font-weight: 500;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  letter-spacing: 0.3px;
`;



const ClearFiltersButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(220, 53, 69, 0.7));
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
  }
`;

const LoadingText = styled.div`
  font-size: 1.3rem;
  color: #666666;
  font-weight: 500;
  margin-bottom: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorWrapper = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 40px 0;
`;

const ErrorText = styled.h2`
  color: #000000;
  font-weight: 600;
  margin-bottom: 24px;
  font-size: 1.6rem;
`;

const RetryButton = styled.button`
  padding: 16px 40px;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 40px;
  margin-bottom: 80px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }
  
  &:hover {
    border-color: rgba(0, 0, 0, 0.2);
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%);
    pointer-events: none;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${ProductCard}:hover & {
    transform: scale(1.08);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  
  ${ProductCard}:hover & {
    opacity: 1;
  }
`;

const ViewButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  color: #000000;
  border: 2px solid transparent;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: #000000;
    color: #ffffff;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }
`;

const ImageBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%);
  color: #ffffff;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 3;
`;

const ProductInfo = styled.div`
  padding: 32px 24px;
  position: relative;
  z-index: 2;
`;

const ProductName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 12px 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
`;

const ProductDescription = styled.p`
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-weight: 400;
`;

const PriceSection = styled.div`
  margin-bottom: 20px;
`;

const Price = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const DetailItem = styled.div`
  font-size: 13px;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 8px;
  
  strong {
    color: #000000;
    font-weight: 600;
    min-width: 60px;
  }
  
  &::before {
    content: '•';
    color: #000000;
    font-weight: bold;
    font-size: 16px;
  }
`;

const StockStatus = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.inStock ? '#28a745' : '#dc3545'};
  margin-bottom: 24px;
  padding: 8px 16px;
  background: ${props => props.inStock ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  border-radius: 20px;
  text-align: center;
  border: 1px solid ${props => props.inStock ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'};
  
  &::before {
    content: '${props => props.inStock ? '✓' : '✕'}';
    margin-right: 8px;
    font-weight: bold;
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 18px 24px;
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
    : 'linear-gradient(135deg, #000000 0%, #333333 100%)'};
  color: ${props => props.disabled ? '#6c757d' : '#ffffff'};
  border: ${props => props.disabled ? '2px solid #dee2e6' : 'none'};
  font-size: 15px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    font-size: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 100px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 40px 0;
`;

const EmptyTitle = styled.h2`
  color: #000000;
  font-weight: 600;
  font-size: 2rem;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #000000 0%, #666666 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const EmptyText = styled.p`
  color: #666666;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'translateY(0)' : 'translateY(100px)'};
  
  &:hover {
    transform: ${props => props.visible ? 'translateY(-5px) scale(1.1)' : 'translateY(100px)'};
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  }  
  &:active {
    transform: ${props => props.visible ? 'translateY(-2px) scale(1.05)' : 'translateY(100px)'};
  }
`;

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFloatingButton, setShowFloatingButton] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'low-stock', 'out-of-stock'
    const [sortOrder, setSortOrder] = useState('default');
    
    // Icon dropdown states
    const [activeDropdown, setActiveDropdown] = useState(null); // 'categories', 'sort', 'price', 'stock'
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const { currentUser } = useAuth();
    
    // Inject CSS animations
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                0% {
                    opacity: 0;
                    transform: translateY(30px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            
            .product-card-enter {
                opacity: 0;
                transform: translateY(30px);
            }
            
            .product-card-enter-active {
                opacity: 1;
                transform: translateY(0);
                transition: all 0.6s ease-out;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Handle scroll for floating button
    React.useEffect(() => {
        const handleScroll = () => {
            setShowFloatingButton(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Categories for filtering - aligned with MaintenancePage product types
    const categories = [
        { value: 'all', label: 'All Products' },
        { value: 'bags', label: 'Bags' },
        { value: 'hats', label: 'Hats' },
        { value: 'hoodies', label: 'Hoodies' },
        { value: 'jackets', label: 'Jackets' },
        { value: 'jerseys', label: 'Jerseys' },
        { value: 'shorts', label: 'Shorts' },        { value: 'sweaters', label: 'Sweaters' },
        { value: 't-shirts', label: 'T-Shirts' }
    ];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Using the correct maintenance API endpoint that includes size-color variants
            const response = await fetch('http://localhost:3001/api/maintenance/products');
            
            if (response.ok) {
                const data = await response.json();
                console.log('Product data received:', data.length, 'items');
                
                // Process the data similar to MaintenancePage for consistency
                const processedProducts = data.map(product => {
                    console.log('Processing product:', product.productname, 'Type:', product.product_type, 'Raw sizes:', product.sizes, 'Raw color:', product.productcolor);
                    
                    // Create basic size-color variants from existing data
                    let sizeColorVariants = [];
                    
                    // Check if the sizes field contains sizeColorVariants structure
                    if (product.sizes) {
                        try {
                            const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                            
                            // Check if it's the new sizeColorVariants format (has size and colorStocks properties)
                            if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                                sizeColorVariants = parsedSizes;
                            }
                            // Otherwise it's the old format (array of objects with size and stock, or just strings)
                            else if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
                                // Parse colors from productcolor field
                                let colorsArray = [];
                                if (typeof product.productcolor === 'string' && product.productcolor.startsWith('[')) {
                                    colorsArray = JSON.parse(product.productcolor);
                                } else if (typeof product.productcolor === 'string' && product.productcolor.includes(',')) {
                                    colorsArray = product.productcolor.split(',').map(c => c.trim()).filter(c => c);
                                } else if (typeof product.productcolor === 'string') {
                                    colorsArray = [product.productcolor];
                                } else {
                                    colorsArray = ['Default'];
                                }
                                
                                // Convert old format to new format
                                sizeColorVariants = parsedSizes.map(sizeItem => {
                                    const sizeValue = typeof sizeItem === 'object' ? sizeItem.size : sizeItem;
                                    const stockValue = typeof sizeItem === 'object' ? sizeItem.stock : 0;
                                    
                                    return {
                                        size: sizeValue,
                                        colorStocks: colorsArray.map(color => ({
                                            color: color,
                                            stock: Math.floor(stockValue / colorsArray.length) || 0
                                        }))
                                    };
                                });
                            }
                        } catch (e) {
                            console.log('Error parsing sizes for product:', product.productname, e);
                        }
                    }
                    
                    // If no variants found, create default ones
                    if (!sizeColorVariants || sizeColorVariants.length === 0) {
                        const defaultColor = product.productcolor || 'Default';
                        sizeColorVariants = [
                            { size: 'S', colorStocks: [{ color: defaultColor, stock: 0 }] },
                            { size: 'M', colorStocks: [{ color: defaultColor, stock: 0 }] },
                            { size: 'L', colorStocks: [{ color: defaultColor, stock: 0 }] },
                            { size: 'XL', colorStocks: [{ color: defaultColor, stock: 0 }] }
                        ];
                    }
                      return {
                        ...product,
                        sizeColorVariants: sizeColorVariants,
                        // Ensure product_id is used as id for consistent navigation
                        id: product.product_id,
                        // Filter only active products for customers
                        status: product.productstatus || 'active'
                    };
                });
                
                console.log('Processed products:', processedProducts.length);
                console.log('Sample processed product:', processedProducts[0]);
                
                // Filter only active products for customers
                const activeProducts = processedProducts.filter(product => 
                    product.status === 'active' && product.productstatus !== 'archived'
                );
                
                console.log('Active products after filtering:', activeProducts.length);
                
                setProducts(activeProducts);
                setFilteredProducts(activeProducts);
            } else {
                setError('Failed to load products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    // Parse sizes data
    const parseSizes = (sizesData) => {
        try {
            if (typeof sizesData === 'string') {
                return JSON.parse(sizesData);
            }
            return Array.isArray(sizesData) ? sizesData : [];
        } catch (error) {
            return [];
        }
    };

    // Get total stock for a product
    const getTotalStock = React.useCallback((product) => {
        // Use total_stock if it exists
        if (product.total_stock !== undefined && product.total_stock !== null) {
            return product.total_stock;
        }
        
        // Use sizeColorVariants if available
        if (product.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            return variants.reduce((total, variant) => {
                return total + variant.colorStocks.reduce((subtotal, cs) => {
                    return subtotal + (cs.stock || 0);
                }, 0);
            }, 0);
        }
        
        // Fallback to old sizes structure
        const sizes = parseSizes(product.sizes);
        return sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }, []);

    // Filter products based on search term, category, price range, and stock status
    useEffect(() => {
        let filtered = products.filter(product => {
            // Basic search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                
                // Basic product properties search
                if (
                    product.productname?.toLowerCase().includes(searchLower) ||
                    product.productdescription?.toLowerCase().includes(searchLower) ||
                    product.product_type?.toLowerCase().includes(searchLower) ||
                    product.productcolor?.toLowerCase().includes(searchLower)
                ) {
                    // Continue to other filters
                } else {
                    // Advanced search in size-color variants
                    if (product.sizeColorVariants) {
                        const variants = parseSizeColorVariants(product.sizeColorVariants);
                        const matchesVariant = variants.some(variant => 
                            variant.size?.toLowerCase().includes(searchLower) ||
                            variant.colorStocks?.some(cs => 
                                cs.color?.toLowerCase().includes(searchLower)
                            )
                        );
                        
                        if (!matchesVariant) {
                            // Legacy search in sizes and colors
                            const sizes = parseSizes(product.sizes);
                            if (!sizes.some(size => size.size?.toLowerCase().includes(searchLower))) {
                                return false;
                            }
                        }
                    } else {
                        // Legacy search in sizes and colors
                        const sizes = parseSizes(product.sizes);
                        if (!sizes.some(size => size.size?.toLowerCase().includes(searchLower))) {
                            return false;
                        }
                    }
                }
            }
            
            // Category filter
            if (selectedCategory !== 'all' && product.product_type !== selectedCategory) {
                return false;
            }
            
            // Price filter
            const productPrice = parseFloat(product.productprice || 0);
            if (priceRange.min !== '' && productPrice < parseFloat(priceRange.min)) {
                return false;
            }
            if (priceRange.max !== '' && productPrice > parseFloat(priceRange.max)) {
                return false;
            }
            
            // Stock filter
            if (stockFilter !== 'all') {
                const totalStock = getTotalStock(product);
                switch (stockFilter) {
                    case 'in-stock':
                        return totalStock > 10;
                    case 'low-stock':
                        return totalStock > 0 && totalStock <= 10;
                    case 'out-of-stock':
                        return totalStock === 0;
                    default:
                        return true;
                }
            }
            
            return true;        });

        // Apply sorting
        if (sortOrder === 'price-asc') {
            filtered = filtered.sort((a, b) => parseFloat(a.productprice) - parseFloat(b.productprice));
        } else if (sortOrder === 'price-desc') {
            filtered = filtered.sort((a, b) => parseFloat(b.productprice) - parseFloat(a.productprice));
        } else if (sortOrder === 'name-asc') {
            filtered = filtered.sort((a, b) => a.productname.localeCompare(b.productname));
        } else if (sortOrder === 'name-desc') {
            filtered = filtered.sort((a, b) => b.productname.localeCompare(a.productname));
        } else if (sortOrder === 'stock-asc') {
            filtered = filtered.sort((a, b) => getTotalStock(a) - getTotalStock(b));
        } else if (sortOrder === 'stock-desc') {
            filtered = filtered.sort((a, b) => getTotalStock(b) - getTotalStock(a));
        }
        
        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory, priceRange, stockFilter, sortOrder, getTotalStock]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // Clear search    const clearSearch = () => {
        setSearchTerm('');
    };

    // Dropdown management functions
    const toggleDropdown = (dropdownType) => {
        setActiveDropdown(activeDropdown === dropdownType ? null : dropdownType);
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    const handleDropdownCategoryChange = (category) => {
        setSelectedCategory(category);
        closeDropdown();
    };

    const handleDropdownSortChange = (e) => {
        setSortOrder(e.target.value);
        closeDropdown();
    };

    const handleDropdownPriceChange = (field, value) => {
        setPriceRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDropdownStockChange = (filterType) => {
        setStockFilter(filterType);
        closeDropdown();
    };

    // Check if any filters are active
    const hasActiveFilters = () => {
        return selectedCategory !== 'all' || 
               priceRange.min || 
               priceRange.max || 
               stockFilter !== 'all' ||
               sortOrder !== 'default';    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.filter-dropdown-container')) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    // Parse size-color variants
    const parseSizeColorVariants = (variantsData) => {
        if (!variantsData) return [];
        try {
            return typeof variantsData === 'string' ? JSON.parse(variantsData) : variantsData;
        } catch {
            return [];
        }
    };

    const getAvailableSizes = (product) => {
        const variants = parseSizeColorVariants(product.sizeColorVariants);
        const sizes = parseSizes(product.sizes);
        
        if (variants && variants.length > 0) {
            return [...new Set(variants.map(v => v.size).filter(Boolean))];
        }
        return sizes || [];
    };    const getAvailableColors = (product) => {
        const variants = parseSizeColorVariants(product.sizeColorVariants);
        
        if (variants && variants.length > 0) {
            return [...new Set(variants.map(v => v.color).filter(Boolean))];
        }
        return [];
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setPriceRange({ min: '', max: '' });
        setStockFilter('all');
        setSortOrder('default');
        closeDropdown();
    };

    // Handle add to cart
    const handleAddToCart = async (e, product) => {
        e.stopPropagation(); // Prevent navigation to product details
        
        if (!currentUser) {
            toast.error('Please log in to add items to cart');
            navigate('/login');
            return;
        }

        const totalStock = getTotalStock(product);
        if (totalStock === 0) {
            toast.error('This product is out of stock');
            return;
        }

        try {
            // Add product with default size and color if available
            const defaultSize = getAvailableSizes(product)[0] || 'One Size';
            const defaultColor = getAvailableColors(product)[0] || 'Default';
            
            await addToCart(product.id, 1, defaultSize, defaultColor);
            toast.success(`${product.productname} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart');
        }
    };

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <PageContainer>
            <TopBar />
            <ContentWrapper>
                <Header>
                    <Title>Our Collection</Title>
                    <Subtitle>Discover our carefully curated selection of premium products crafted with exceptional quality and attention to detail</Subtitle>
                </Header>
                  {/* Search Section */}
                <SearchSection>                    <SearchWithIconsContainer>
                        <SearchInputContainer>
                            <SearchIcon icon={faSearch} />
                            <SearchInput
                                type="text"
                                placeholder="Search products by name, description, color, or size..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {searchTerm && (
                                <ClearButton visible={true} onClick={clearSearch}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </ClearButton>
                            )}
                        </SearchInputContainer>
                        
                        {/* Icon-Based Filter Bar */}
                        <IconFiltersContainer>
                            {/* Categories Filter Icon */}
                            <div className="filter-dropdown-container" style={{ position: 'relative' }}>
                                <FilterIcon
                                    active={selectedCategory !== 'all'}
                                    onClick={() => toggleDropdown('categories')}
                                    title="Product Categories"
                                >
                                    <FontAwesomeIcon icon={faFilter} />
                                    {selectedCategory !== 'all' && <FilterBadge>1</FilterBadge>}
                                </FilterIcon>
                                
                                {/* Categories Dropdown */}
                                <FilterDropdown show={activeDropdown === 'categories'}>
                                    <DropdownHeader>
                                        <FontAwesomeIcon icon={faFilter} />
                                        Product Categories
                                    </DropdownHeader>
                                    <DropdownCategoryGrid>
                                        {categories.map((category) => (
                                            <DropdownCategoryButton
                                                key={category.value}
                                                active={selectedCategory === category.value}
                                                onClick={() => handleDropdownCategoryChange(category.value)}
                                            >
                                                {category.label}
                                            </DropdownCategoryButton>
                                        ))}
                                    </DropdownCategoryGrid>
                                </FilterDropdown>
                            </div>
                            
                            {/* Sort Filter Icon */}
                            <div className="filter-dropdown-container" style={{ position: 'relative' }}>
                                <FilterIcon
                                    active={sortOrder !== 'default'}
                                    onClick={() => toggleDropdown('sort')}
                                    title="Sort Products"
                                >
                                    <FontAwesomeIcon icon={faSort} />
                                    {sortOrder !== 'default' && <FilterBadge>1</FilterBadge>}
                                </FilterIcon>
                                
                                {/* Sort Dropdown */}
                                <FilterDropdown show={activeDropdown === 'sort'}>
                                    <DropdownHeader>
                                        <FontAwesomeIcon icon={faSort} />
                                        Sort Products
                                    </DropdownHeader>
                                    <DropdownSortSelect value={sortOrder} onChange={handleDropdownSortChange}>
                                        <option value="default">Default Order</option>
                                        <option value="name-asc">Name: A to Z</option>
                                        <option value="name-desc">Name: Z to A</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="stock-desc">Stock: High to Low</option>
                                        <option value="stock-asc">Stock: Low to High</option>
                                    </DropdownSortSelect>
                                </FilterDropdown>
                            </div>
                            
                            {/* Advanced Filters Icon */}
                            <div className="filter-dropdown-container" style={{ position: 'relative' }}>
                                <FilterIcon
                                    active={priceRange.min || priceRange.max || stockFilter !== 'all'}
                                    onClick={() => toggleDropdown('advanced')}
                                    title="Advanced Filters"
                                >
                                    <FontAwesomeIcon icon={faSliders} />
                                    {(priceRange.min || priceRange.max || stockFilter !== 'all') && (
                                        <FilterBadge>
                                            {(priceRange.min || priceRange.max ? 1 : 0) + (stockFilter !== 'all' ? 1 : 0)}
                                        </FilterBadge>
                                    )}
                                </FilterIcon>
                                
                                {/* Advanced Filters Dropdown */}
                                <FilterDropdown show={activeDropdown === 'advanced'} style={{ minWidth: '320px' }}>
                                    <DropdownHeader>
                                        <FontAwesomeIcon icon={faSliders} />
                                        Advanced Filters
                                    </DropdownHeader>
                                    
                                    {/* Price Filter */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                                            Price Range
                                        </div>
                                        <DropdownPriceInputs>
                                            <DropdownPriceInput
                                                type="number"
                                                placeholder="Min price"
                                                value={priceRange.min}
                                                onChange={(e) => handleDropdownPriceChange('min', e.target.value)}
                                            />
                                            <span style={{ color: '#666', fontWeight: 'bold' }}>-</span>
                                            <DropdownPriceInput
                                                type="number"
                                                placeholder="Max price"
                                                value={priceRange.max}
                                                onChange={(e) => handleDropdownPriceChange('max', e.target.value)}
                                            />
                                        </DropdownPriceInputs>
                                    </div>
                                    
                                    {/* Stock Filter */}
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                                            Stock Status
                                        </div>
                                        <DropdownStockOptions>
                                            <DropdownStockButton
                                                active={stockFilter === 'all'}
                                                onClick={() => handleDropdownStockChange('all')}
                                            >
                                                All Items
                                            </DropdownStockButton>
                                            <DropdownStockButton
                                                active={stockFilter === 'in-stock'}
                                                onClick={() => handleDropdownStockChange('in-stock')}
                                            >
                                                In Stock (10+)
                                            </DropdownStockButton>
                                            <DropdownStockButton
                                                active={stockFilter === 'low-stock'}
                                                onClick={() => handleDropdownStockChange('low-stock')}
                                            >
                                                Low Stock (1-10)
                                            </DropdownStockButton>
                                            <DropdownStockButton
                                                active={stockFilter === 'out-of-stock'}
                                                onClick={() => handleDropdownStockChange('out-of-stock')}
                                            >
                                                Out of Stock
                                            </DropdownStockButton>
                                        </DropdownStockOptions>
                                    </div>
                                </FilterDropdown>
                            </div>
                        </IconFiltersContainer>
                    </SearchWithIconsContainer>
                    
                    {/* Dropdown Overlay for Mobile */}
                    <DropdownOverlay show={activeDropdown !== null} onClick={closeDropdown} />
                      {/* Search Results Info */}
                    {(searchTerm || hasActiveFilters()) && (
                        <SearchResults>
                            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                            {searchTerm && ` for "${searchTerm}"`}
                            {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
                            {(priceRange.min || priceRange.max) && ` within price range ${priceRange.min ? `₱${priceRange.min}` : '₱0'} - ${priceRange.max ? `₱${priceRange.max}` : '∞'}`}
                            {stockFilter !== 'all' && ` with ${stockFilter.replace('-', ' ')} status`}
                        </SearchResults>
                    )}
                      {/* Clear All Filters Button */}
                    {hasActiveFilters() && (
                        <ClearFiltersButton onClick={clearAllFilters}>
                            Clear All Filters
                        </ClearFiltersButton>                    )}
                </SearchSection>

                {loading && (
                    <LoadingWrapper>
                        <LoadingSpinner />
                        <LoadingText>Loading our amazing products...</LoadingText>
                    </LoadingWrapper>
                )}

                {error && (
                    <ErrorWrapper>
                        <ErrorText>{error}</ErrorText>
                        <RetryButton onClick={fetchProducts}>                            Try Again
                        </RetryButton>
                    </ErrorWrapper>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <ProductGrid>
                        {filteredProducts.map((product, index) => {
                            const totalStock = getTotalStock(product);
                            
                            return (
                                <ProductCard 
                                    key={product.id}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animation: 'fadeInUp 0.6s ease-out forwards'
                                    }}
                                    onClick={() => navigate(`/products/${product.id}`)}
                                >
                                    <ImageContainer>{product.productimage ? (
                                            <>
                                                <ProductImage 
                                                    src={`http://localhost:3001/uploads/${product.productimage}`} 
                                                    alt={product.productname}
                                                    onError={(e) => {
                                                        console.log('Image failed to load:', product.productimage);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <ImageOverlay>
                                                    <ViewButton onClick={() => navigate(`/product/${product.id}`)}>
                                                        <FontAwesomeIcon icon={faEye} /> View Details
                                                    </ViewButton>
                                                </ImageOverlay>
                                                {product.images && product.images.length > 1 && (
                                                    <ImageBadge>
                                                        +{product.images.length - 1} more
                                                    </ImageBadge>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                                color: '#6c757d',
                                                fontSize: '48px'
                                            }}>
                                                📷
                                            </div>
                                        )}
                                    </ImageContainer>
                                    
                                    <ProductInfo onClick={() => navigate(`/product/${product.id}`)}>
                                        <ProductName>{product.productname}</ProductName>
                                        
                                        <ProductDescription>
                                            {product.productdescription || 'Premium quality product with exceptional craftsmanship'}
                                        </ProductDescription>
                                        
                                        <PriceSection>
                                            <Price>₱{parseFloat(product.productprice || 0).toFixed(2)}</Price>
                                        </PriceSection>                                        <ProductDetails>
                                            {product.product_type && (
                                                <DetailItem>
                                                    <strong>Type:</strong> {product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1)}
                                                </DetailItem>
                                            )}
                                            
                                            {getAvailableSizes(product).length > 0 && (
                                                <DetailItem>
                                                    <strong>Sizes:</strong> {getAvailableSizes(product).join(', ')}
                                                </DetailItem>
                                            )}
                                            
                                            {getAvailableColors(product).length > 0 && (
                                                <DetailItem>
                                                    <strong>Colors:</strong> {getAvailableColors(product).join(', ')}
                                                </DetailItem>
                                            )}
                                        </ProductDetails>
                                        
                                        <StockStatus inStock={totalStock > 0}>
                                            {totalStock > 0 ? 
                                                `${totalStock} in stock` : 
                                                'Out of stock'
                                            }
                                        </StockStatus>

                                        <AddToCartButton
                                            onClick={(e) => handleAddToCart(e, product)}
                                            disabled={totalStock === 0 || cartLoading}
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} />
                                            {cartLoading ? 'Adding...' : 
                                             totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}                                        </AddToCartButton>
                                    </ProductInfo>
                                </ProductCard>
                            );
                        })}
                    </ProductGrid>
                )}

                {!loading && !error && products.length === 0 && (
                    <EmptyState>
                        <EmptyTitle>No products available</EmptyTitle>
                        <EmptyText>
                            Check back later for new products in our collection
                        </EmptyText>
                    </EmptyState>
                )}

                {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
                    <EmptyState>
                        <EmptyTitle>No products found</EmptyTitle>
                        <EmptyText>
                            {searchTerm ? 
                                `No products match "${searchTerm}". Try adjusting your search terms.` :
                                `No products found in ${categories.find(c => c.value === selectedCategory)?.label || 'this category'}.`
                            }                        </EmptyText>
                        <RetryButton onClick={clearAllFilters}>
                            Clear Filters
                        </RetryButton>
                    </EmptyState>
                )}
            </ContentWrapper>
            
            {/* Floating Back to Top Button */}
            <FloatingButton 
                visible={showFloatingButton}
                onClick={scrollToTop}
                title="Back to top"
            >
                ↑
            </FloatingButton>
        </PageContainer>
    );
};

export default ProductsPage;