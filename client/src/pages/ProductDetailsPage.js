import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faShoppingCart, 
  faMinus, 
  faPlus,
  faChevronLeft,
  faChevronRight,
  faHeart,
  faTruck,
  faShield,
  faExchangeAlt,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';
import { useCart } from '../context/CartContext';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(200, 200, 200, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  padding: 20px;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #000;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 40px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainImageContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const ProductImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  display: block;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translateY(-50%) scale(1.1);
  }
  
  ${props => props.direction === 'left' ? 'left: 16px;' : 'right: 16px;'}
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

const Thumbnail = styled.img.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#000000' : 'rgba(255, 255, 255, 0.5)'};
  transition: all 0.3s ease;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: #000000;
    transform: scale(1.05);
  }
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 500px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const ProductName = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const Description = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #000000;
    margin: 0 0 12px 0;
  }
  
  p {
    color: #666666;
    line-height: 1.6;
    margin: 0;
    font-size: 16px;
  }
`;

const Specifications = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 32px;
  
  h3 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #000000;
    margin: 0 0 20px 0;
  }
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 12px 0;
`;

const SpecLabel = styled.span`
  font-weight: 500;
  color: #000000;
  min-width: 120px;
`;

const SpecValue = styled.span`
  color: #666666;
  text-align: right;
  
  &.stock-available {
    color: #27ae60;
    font-weight: 500;
  }
  
  &.stock-unavailable {
    color: #e74c3c;
    font-weight: 500;
  }
`;

const SizeOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SizeButton = styled.button`
  padding: 12px 16px;
  border: 1px solid ${props => props.selected ? '#000000' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.selected ? '#000000' : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(10px);
  color: ${props => props.selected ? '#ffffff' : '#000000'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 60px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    border-color: #000000;
    background: ${props => props.selected ? '#000000' : 'rgba(255, 255, 255, 1)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  small {
    display: block;
    font-size: 12px;
    opacity: 0.7;
    margin-top: 2px;
  }
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const ColorButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color || '#ffffff'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  ${props => props.selected && `
    &::after {
      content: '';
      position: absolute;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2px solid #000000;
      left: -5px;
      top: -5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
  `}
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ColorName = styled.small`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  white-space: nowrap;
`;

const PurchaseSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const QuantityLabel = styled.span`
  font-weight: 500;
  color: #000000;
  min-width: 80px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000000;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  padding: 0 16px;
  font-weight: 500;
  color: #000000;
  min-width: 40px;
  text-align: center;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: #ffffff;
  border: none;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #333333 0%, #555555 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    background: rgba(0, 0, 0, 0.1);
    color: #999999;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    &.loading {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const WishlistButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #666666;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    border-color: #000000;
    color: #000000;
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const OutOfStock = styled.div`
  background: rgba(255, 245, 245, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(254, 215, 215, 0.5);
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(197, 48, 48, 0.1);
`;

const InfoCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
`;

const InfoCard = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-5px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  }
  
  .icon {
    color: #666666;
    margin-bottom: 8px;
  }
  
  .title {
    font-weight: 500;
    color: #000000;
    margin-bottom: 4px;
    font-size: 14px;
  }
  
  .description {
    color: #666666;
    font-size: 12px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 18px;
  color: #666666;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin: 40px 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #000000;
    margin-bottom: 16px;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 24px;
  background: ${props => props.type === 'success' ? 
    'rgba(212, 237, 218, 0.95)' : 'rgba(248, 215, 218, 0.95)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.type === 'success' ? 
    'rgba(195, 230, 203, 0.5)' : 'rgba(245, 198, 203, 0.5)'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart: addToCartContext } = useCart();    const [product, setProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [notification, setNotification] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            
            // Use the maintenance API endpoint that includes all enhanced fields and structure
            const response = await fetch(`http://localhost:3001/api/maintenance/products`);
            
            if (response.ok) {
                const products = await response.json();
                
                // Look for the product by both ID and product_id for compatibility
                const foundProduct = products.find(p => 
                    p.id === parseInt(id) || p.product_id === parseInt(id)
                );
                
                if (foundProduct) {                    // Process the product to ensure sizeColorVariants are properly handled
                    if (foundProduct.sizeColorVariants && typeof foundProduct.sizeColorVariants === 'string') {
                        try {
                            foundProduct.sizeColorVariants = JSON.parse(foundProduct.sizeColorVariants);
                        } catch (e) {
                            console.warn('Failed to parse sizeColorVariants:', e);
                        }
                    }
                    
                    setProduct(foundProduct);
                    
                    // Fetch product images using the maintenance API endpoint
                    const imagesResponse = await fetch(`http://localhost:3001/api/maintenance/products/${foundProduct.product_id || foundProduct.id}/images`);
                    if (imagesResponse.ok) {
                        const images = await imagesResponse.json();
                        setProductImages(images);
                    }
                      // Initialize with first available size and color if any
                    const availableSizes = getAvailableSizes(foundProduct);
                    if (availableSizes.length > 0) {
                        setSelectedSize(availableSizes[0].size);
                        
                        const colors = getAvailableColors(foundProduct, availableSizes[0].size);
                        if (colors.length > 0 && colors[0] !== 'Not specified') {
                            setSelectedColor(colors[0]);
                        }
                    } else {
                        // If no sizes available, check for any colors available for the product
                        const allColors = getProductColors(foundProduct);
                        if (allColors.length > 0 && allColors[0] !== 'Not specified') {
                            setSelectedColor(allColors[0]);
                        }
                    }
                } else {
                    setError('Product not found');
                }
            } else {
                setError('Failed to load product');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    // Note: We're using functions defined after this callback,
    // but they don't depend on any changing state, so it's safe to omit them
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    
    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Parse sizes data
    const parseSizes = (sizesData) => {
        try {
            if (typeof sizesData === 'string') {
                return JSON.parse(sizesData);
            }
            return sizesData || [];
        } catch (error) {
            return [];
        }
    };

    // Parse size-color variants
    const parseSizeColorVariants = (variantsData) => {
        try {
            if (typeof variantsData === 'string') {
                return JSON.parse(variantsData);
            }
            return variantsData || [];
        } catch (error) {
            return [];
        }
    };    // Get available sizes from the enhanced structure (matches MaintenancePage.js logic)
    const getAvailableSizes = (product) => {
        // First check if sizes field contains sizeColorVariants structure
        if (product?.sizes) {
            try {
                const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                
                // Check if it's the new sizeColorVariants format (has size and colorStocks properties)
                if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                    return parsedSizes
                        .filter(variant => variant.colorStocks.some(cs => cs.stock > 0))
                        .map(variant => ({ 
                            size: variant.size, 
                            stock: variant.colorStocks.reduce((total, cs) => total + (cs.stock || 0), 0)
                        }));
                }
                // Otherwise it's the old format (array of objects with size and stock)
                else if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
                    return parsedSizes.filter(size => size.stock > 0);
                }
            } catch (e) {
                console.log('Error parsing sizes field:', e);
            }
        }
        
        // Check if the product has the sizeColorVariants field separately
        if (product?.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            return variants
                .filter(variant => variant.colorStocks.some(cs => cs.stock > 0))
                .map(variant => ({ 
                    size: variant.size, 
                    stock: variant.colorStocks.reduce((total, cs) => total + (cs.stock || 0), 0)
                }));
        }
        
        return [];
    };    // Get available colors for a product or for a specific size (matches MaintenancePage.js logic)
    const getAvailableColors = (product, size = null) => {
        if (!product) return [];
        
        // First check if sizes field contains sizeColorVariants structure
        if (product.sizes) {
            try {
                const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                
                // Check if it's the new sizeColorVariants format
                if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                    // If a size is specified, get colors just for that size
                    if (size) {
                        const sizeVariant = parsedSizes.find(variant => variant.size === size);
                        if (sizeVariant) {
                            return sizeVariant.colorStocks
                                .filter(cs => cs.stock > 0)
                                .map(cs => cs.color);
                        }
                        return [];
                    }
                    
                    // Otherwise get all unique colors across all variants that have stock
                    const colors = new Set();
                    parsedSizes.forEach(variant => {
                        variant.colorStocks.forEach(cs => {
                            if (cs.stock > 0 && cs.color && cs.color.trim() !== '') {
                                colors.add(cs.color.trim());
                            }
                        });
                    });
                    return Array.from(colors);
                }
            } catch (e) {
                console.log('Error parsing sizes field for colors:', e);
            }
        }
        
        // Then check sizeColorVariants field
        if (product.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            
            // If a size is specified, get colors just for that size
            if (size) {
                const sizeVariant = variants.find(variant => variant.size === size);
                if (sizeVariant) {
                    return sizeVariant.colorStocks
                        .filter(cs => cs.stock > 0)
                        .map(cs => cs.color);
                }
                return [];
            }
            
            // Otherwise get all unique colors across all variants that have stock
            const colors = new Set();
            variants.forEach(variant => {
                variant.colorStocks.forEach(cs => {
                    if (cs.stock > 0 && cs.color && cs.color.trim() !== '') {
                        colors.add(cs.color.trim());
                    }
                });
            });
            return Array.from(colors);
        }
        
        // Fallback: use the main getProductColors function for all colors
        return getProductColors(product);
    };// Extract all unique colors from sizeColorVariants for display (matches MaintenancePage.js logic exactly)
    const getProductColors = (product) => {
        try {
            // First, check if sizes field contains sizeColorVariants structure
            if (product.sizes) {
                try {
                    const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                    
                    // Check if it's the new sizeColorVariants format (has size and colorStocks properties)
                    if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                        const allColors = [];
                        parsedSizes.forEach(sizeVariant => {
                            if (sizeVariant.colorStocks && Array.isArray(sizeVariant.colorStocks)) {
                                sizeVariant.colorStocks.forEach(colorStock => {
                                    if (colorStock.color && colorStock.color.trim() !== '' && !allColors.includes(colorStock.color.trim())) {
                                        allColors.push(colorStock.color.trim());
                                    }
                                });
                            }
                        });
                        
                        if (allColors.length > 0) {
                            return allColors;
                        }
                    }
                } catch (e) {
                    console.log('Error parsing sizes field:', e);
                }
            }
            
            // Then try sizeColorVariants field (if it exists)
            if (product.sizeColorVariants && Array.isArray(product.sizeColorVariants)) {
                const allColors = [];
                product.sizeColorVariants.forEach(sizeVariant => {
                    if (sizeVariant.colorStocks && Array.isArray(sizeVariant.colorStocks)) {
                        sizeVariant.colorStocks.forEach(colorStock => {
                            if (colorStock.color && colorStock.color.trim() !== '' && !allColors.includes(colorStock.color.trim())) {
                                allColors.push(colorStock.color.trim());
                            }
                        });
                    }
                });
                
                if (allColors.length > 0) {
                    return allColors;
                }
            }
            
            // Fallback to legacy colors field
            if (product.colors) {
                try {
                    const colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
                    if (Array.isArray(colors) && colors.length > 0) {
                        const validColors = colors.filter(color => color && color.trim() !== '');
                        if (validColors.length > 0) {
                            return validColors;
                        }
                    }
                } catch (e) {
                    console.log('Error parsing colors field:', e);
                }
            }
            
            // Fallback to single productcolor
            if (product.productcolor && product.productcolor.trim() !== '') {
                // Handle comma-separated colors in productcolor field
                if (product.productcolor.includes(',')) {
                    return product.productcolor.split(',').map(c => c.trim()).filter(c => c);
                }
                return [product.productcolor.trim()];
            }
            
            return ['Not specified'];
        } catch (error) {
            console.error('Error parsing product colors:', error);
            // Fallback handling
            if (product.productcolor && product.productcolor.trim() !== '') {
                return [product.productcolor.trim()];
            }
            return ['Not specified'];
        }
    };

    // Get all unique colors available for the product (for display purposes) - alias for consistency
    const getAllProductColors = (product) => {
        return getProductColors(product);
    };    // Get total stock for a product (matches MaintenancePage.js logic)
    const getTotalStock = (product) => {
        if (!product) return 0;
        
        // Use total_available_stock for customer-facing display (most relevant)
        if (product.total_available_stock !== undefined && product.total_available_stock !== null) {
            return product.total_available_stock;
        }
        
        // Use total_stock if available stock is not set
        if (product.total_stock !== undefined && product.total_stock !== null) {
            return product.total_stock;
        }
        
        // First check if sizes field contains sizeColorVariants structure
        if (product.sizes) {
            try {
                const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                
                // Check if it's the new sizeColorVariants format
                if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                    return parsedSizes.reduce((total, variant) => {
                        return total + variant.colorStocks.reduce((subtotal, cs) => {
                            return subtotal + (cs.stock || 0);
                        }, 0);
                    }, 0);
                }
                // Otherwise it's the old format
                else if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
                    return parsedSizes.reduce((total, size) => total + (size.stock || 0), 0);
                }
            } catch (e) {
                console.log('Error parsing sizes field for total stock:', e);
            }
        }
        
        // Then check sizeColorVariants field
        if (product.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            return variants.reduce((total, variant) => {
                return total + variant.colorStocks.reduce((subtotal, cs) => {
                    return subtotal + (cs.stock || 0);
                }, 0);
            }, 0);
        }
        
        // Fallback to productquantity
        return product.productquantity || 0;
    };

    // Get stock for selected size and color    // Get stock for selected size and color (matches MaintenancePage.js logic)
    const getStockForSizeAndColor = (size, color) => {
        if (!product) return 0;
        
        // First check if sizes field contains sizeColorVariants structure
        if (product.sizes) {
            try {
                const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                
                // Check if it's the new sizeColorVariants format
                if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                    const sizeVariant = parsedSizes.find(v => v.size === size);
                    
                    if (sizeVariant) {
                        if (color) {
                            // Return stock for specific color
                            const colorStock = sizeVariant.colorStocks.find(cs => cs.color === color);
                            return colorStock ? colorStock.stock : 0;
                        } else {
                            // Return total stock for all colors in this size
                            return sizeVariant.colorStocks.reduce((total, cs) => total + (cs.stock || 0), 0);
                        }
                    }
                }
            } catch (e) {
                console.log('Error parsing sizes field for stock:', e);
            }
        }
        
        // Then check sizeColorVariants field
        if (product.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            const sizeVariant = variants.find(v => v.size === size);
            
            if (sizeVariant) {
                if (color) {
                    // Return stock for specific color
                    const colorStock = sizeVariant.colorStocks.find(cs => cs.color === color);
                    return colorStock ? colorStock.stock : 0;
                } else {
                    // Return total stock for all colors in this size
                    return sizeVariant.colorStocks.reduce((total, cs) => total + (cs.stock || 0), 0);
                }
            }
        }
        
        // Fallback to old structure
        return getStockForSize(size);
    };

    const addToCart = async () => {
        // Validate required fields
        if (availableSizes.length > 0 && !selectedSize) {
            showNotification('Please select a size first', 'error');
            return;
        }
        
        // Also validate color if colors are available for the selected size
        if (selectedSize && availableColors.length > 0 && !selectedColor) {
            showNotification('Please select a color', 'error');
            return;
        }

        try {
            setAddingToCart(true);
            console.log('Adding to cart:', {
                productId: product.product_id || product.id,
                color: selectedColor || product.productcolor || '',
                size: selectedSize || '',
                quantity: quantity
            });
            
            // Use the CartContext addToCart function with the selected color
            const result = await addToCartContext(
                product.product_id || product.id, 
                selectedColor || product.productcolor || '', 
                selectedSize || '', 
                quantity
            );

            console.log('Add to cart result:', result);

            if (result.success) {
                showNotification(`${product.productname} added to cart!`, 'success');
                // Reset quantity and size selection after successful add
                setQuantity(1);
                if (availableSizes.length > 0) {
                    setSelectedSize('');
                }
            } else {
                showNotification(result.message || 'Failed to add item to cart', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add item to cart', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    // Helper function to show notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 4000); // Hide after 4 seconds
    };

    // Legacy function to get stock for a specific size
    const getStockForSize = (size) => {
        if (!product) return 0;
        const sizes = parseSizes(product?.sizes);
        const sizeData = sizes.find(s => s.size === size);
        return sizeData ? sizeData.stock : 0;
    };
    
    // Convert color name to CSS color value
    const getColorValue = (colorName) => {
        const colorMap = {
            'black': '#000000',
            'white': '#ffffff',
            'red': '#ff0000',
            'blue': '#0000ff',
            'green': '#008000',
            'yellow': '#ffff00',
            'pink': '#ffc0cb',
            'purple': '#800080',
            'orange': '#ffa500',
            'brown': '#a52a2a',
            'gray': '#808080',
            'grey': '#808080',
            'navy': '#000080',
            'beige': '#f5f5dc',
            'maroon': '#800000',
            'olive': '#808000',
            'lime': '#00ff00',
            'aqua': '#00ffff',
            'teal': '#008080',
            'silver': '#c0c0c0',
            'gold': '#ffd700'
        };
        
        const lowerName = colorName.toLowerCase();
        return colorMap[lowerName] || lowerName;
    };

    if (loading) {
        return (
            <PageContainer>
                <TopBar />
                <ContentWrapper>
                    <LoadingContainer>Loading product details...</LoadingContainer>
                </ContentWrapper>
            </PageContainer>
        );
    }

    if (error || !product) {
        return (
            <PageContainer>
                <TopBar />
                <ContentWrapper>
                    <ErrorContainer>
                        <h2>{error}</h2>
                        <BackButton onClick={() => navigate('/products')}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Back to Products
                        </BackButton>
                    </ErrorContainer>
                </ContentWrapper>
            </PageContainer>
        );
    }    const totalStock = getTotalStock(product);
    const availableSizes = getAvailableSizes(product);
    const availableColors = getAvailableColors(product, selectedSize);
    const maxQuantity = selectedSize ? getStockForSizeAndColor(selectedSize, selectedColor) : totalStock;

    return (
        <PageContainer>
            <TopBar />
            {notification && (
                <NotificationContainer type={notification.type}>
                    <FontAwesomeIcon 
                        icon={notification.type === 'success' ? faCheck : faExclamationTriangle} 
                    />
                    {notification.message}
                </NotificationContainer>
            )}
            <ContentWrapper>
                <BackButton onClick={() => navigate('/products')}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Products
                </BackButton>
                
                <ProductContainer>
                    {/* Image Section */}
                    <ImageSection>
                        {productImages.length > 0 ? (
                            <>
                                <MainImageContainer>
                                    <ProductImage
                                        src={`http://localhost:3001/uploads/${productImages[currentImageIndex]?.image_filename}`}
                                        alt={product.productname}
                                    />
                                    
                                    {productImages.length > 1 && (
                                        <>
                                            <NavButton 
                                                direction="left"
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev > 0 ? prev - 1 : productImages.length - 1
                                                )}
                                            >
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </NavButton>
                                            <NavButton 
                                                direction="right"
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev < productImages.length - 1 ? prev + 1 : 0
                                                )}
                                            >
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </NavButton>
                                        </>
                                    )}
                                </MainImageContainer>
                                
                                {productImages.length > 1 && (
                                    <ThumbnailContainer>
                                        {productImages.map((image, index) => (
                                            <Thumbnail
                                                key={image.image_id}
                                                src={`http://localhost:3001/uploads/${image.image_filename}`}
                                                alt={`${product.productname} ${index + 1}`}
                                                active={index === currentImageIndex}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </ThumbnailContainer>
                                )}
                            </>
                        ) : product.productimage ? (
                            <MainImageContainer>
                                <ProductImage
                                    src={`http://localhost:3001/uploads/${product.productimage}`}
                                    alt={product.productname}
                                />
                            </MainImageContainer>
                        ) : (
                            <NoImagePlaceholder>
                                No Image Available
                            </NoImagePlaceholder>
                        )}
                    </ImageSection>

                    {/* Details Section */}
                    <DetailsSection>
                        <ProductName>{product.productname}</ProductName>
                        
                        <Price>₱{parseFloat(product.productprice || 0).toFixed(2)}</Price>
                        
                        <Description>
                            <h3>Description</h3>
                            <p>{product.productdescription || 'No description available'}</p>
                        </Description>
                          <Specifications>
                            <h3>Product Details</h3>
                              {/* Product Type */}
                            {product.product_type && (
                                <SpecItem>
                                    <SpecLabel>Category:</SpecLabel>
                                    <SpecValue style={{ textTransform: 'capitalize' }}>
                                        {product.product_type.replace('-', ' ')}
                                    </SpecValue>
                                </SpecItem>
                            )}
                            
                            {/* Product ID */}
                            <SpecItem>
                                <SpecLabel>Product ID:</SpecLabel>
                                <SpecValue>
                                    #{product.product_id || product.id}
                                </SpecValue>
                            </SpecItem>                              {/* Available Colors Display - Enhanced */}
                            {(() => {
                                const allColors = getAllProductColors(product);
                                return allColors.length > 0 && allColors[0] !== 'Not specified' ? (
                                    <SpecItem>
                                        <SpecLabel>Available Colors:</SpecLabel>
                                        <SpecValue style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                            {allColors.map((color, index) => (
                                                <span key={`${color}-${index}`} style={{ 
                                                    padding: '4px 10px', 
                                                    background: 'rgba(0, 0, 0, 0.08)', 
                                                    borderRadius: '16px', 
                                                    fontSize: '12px',
                                                    textTransform: 'capitalize',
                                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                                    fontWeight: '500'
                                                }}>
                                                    {color}
                                                </span>
                                            ))}
                                        </SpecValue>
                                    </SpecItem>
                                ) : null;
                            })()}
                              {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <SpecItem>
                                    <SpecLabel>Size:</SpecLabel>
                                    <SizeOptions>
                                        {availableSizes.map((sizeData) => {
                                            // Get stock for this specific size and currently selected color
                                            const stockForSelectedColor = selectedColor ? 
                                                getStockForSizeAndColor(sizeData.size, selectedColor) :
                                                sizeData.stock; // Show total if no color selected
                                            
                                            return (
                                                <SizeButton
                                                    key={sizeData.size}
                                                    selected={selectedSize === sizeData.size}
                                                    onClick={() => {
                                                        setSelectedSize(sizeData.size);
                                                        // Reset color when size changes
                                                        const colorsForSize = getAvailableColors(product, sizeData.size);
                                                        if (colorsForSize.length > 0) {
                                                            setSelectedColor(colorsForSize[0]);
                                                        } else {
                                                            setSelectedColor('');
                                                        }
                                                    }}
                                                    title={selectedColor ? 
                                                        `${sizeData.size} - ${selectedColor}: ${stockForSelectedColor} available` :
                                                        `${sizeData.size}: Total ${sizeData.stock} available`
                                                    }
                                                >
                                                    {sizeData.size}
                                                    <small>({stockForSelectedColor} available)</small>
                                                </SizeButton>
                                            );
                                        })}
                                    </SizeOptions>
                                </SpecItem>
                            )}{/* Color Selection - Enhanced for size-color variants */}
                            {(() => {
                                const availableColors = selectedSize ? getAvailableColors(product, selectedSize) : getAllProductColors(product);
                                return availableColors.length > 0 && availableColors[0] !== 'Not specified' ? (
                                    <SpecItem>
                                        <SpecLabel>Color:</SpecLabel>
                                        <ColorOptions>
                                            {availableColors.map((color, index) => (
                                                <ColorButton
                                                    key={`${color}-${index}`}
                                                    color={getColorValue(color.toLowerCase())}
                                                    selected={selectedColor === color}
                                                    onClick={() => setSelectedColor(color)}
                                                    title={color}
                                                >
                                                    <ColorName>{color}</ColorName>
                                                </ColorButton>
                                            ))}
                                        </ColorOptions>
                                    </SpecItem>
                                ) : null;
                            })()}
                            
                            {/* Product Status */}
                            <SpecItem>
                                <SpecLabel>Status:</SpecLabel>
                                <SpecValue className={product.status === 'active' ? 'stock-available' : 'stock-unavailable'}>
                                    {product.status === 'archived' ? 'Archived' : 'Active'}
                                </SpecValue>
                            </SpecItem>
                            
                            <SpecItem>
                                <SpecLabel>Availability:</SpecLabel>
                                <SpecValue className={totalStock > 0 ? 'stock-available' : 'stock-unavailable'}>
                                    {totalStock > 0 ? 
                                        `${totalStock} items in stock` : 
                                        'Out of stock'
                                    }
                                </SpecValue>
                            </SpecItem>
                        </Specifications>
                        
                        {totalStock > 0 ? (
                            <PurchaseSection>
                                <QuantitySection>
                                    <QuantityLabel>Quantity:</QuantityLabel>
                                    <QuantityControls>
                                        <QuantityButton 
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <FontAwesomeIcon icon={faMinus} />
                                        </QuantityButton>
                                        <QuantityDisplay>{quantity}</QuantityDisplay>
                                        <QuantityButton 
                                            onClick={() => setQuantity(prev => Math.min(maxQuantity, prev + 1))}
                                            disabled={quantity >= maxQuantity}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </QuantityButton>
                                    </QuantityControls>
                                </QuantitySection>
                                  <ActionButtons>                                    <AddToCartButton 
                                        onClick={addToCart}
                                        disabled={addingToCart || totalStock === 0}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faShoppingCart}
                                            className={addingToCart ? 'loading' : ''}
                                        />
                                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                                    </AddToCartButton>
                                    <WishlistButton>
                                        <FontAwesomeIcon icon={faHeart} />
                                    </WishlistButton>
                                </ActionButtons>
                            </PurchaseSection>
                        ) : (
                            <OutOfStock>
                                This product is currently out of stock
                            </OutOfStock>
                        )}

                        <InfoCards>                            <InfoCard>
                                <div className="icon">
                                    <FontAwesomeIcon icon={faTruck} size="lg" />
                                </div>
                                <div className="title">Cash on Delivery</div>
                                <div className="description">Pay when you receive</div>
                            </InfoCard>
                            <InfoCard>
                                <div className="icon">
                                    <FontAwesomeIcon icon={faShield} size="lg" />
                                </div>
                                <div className="title">Secure Payment</div>
                                <div className="description">100% secure payment</div>
                            </InfoCard>
                            <InfoCard>
                                <div className="icon">
                                    <FontAwesomeIcon icon={faExchangeAlt} size="lg" />
                                </div>
                                <div className="title">Easy Returns</div>
                                <div className="description">30-day return policy</div>
                            </InfoCard>
                        </InfoCards>
                    </DetailsSection>
                </ProductContainer>
            </ContentWrapper>
        </PageContainer>
    );
};

export default ProductDetailsPage;
