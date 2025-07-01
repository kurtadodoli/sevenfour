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
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';
import { useCart } from '../context/CartContext';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: #ffffff;
  position: relative;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 40px 40px;
  
  @media (max-width: 768px) {
    padding: 80px 20px 40px;
  }
`;

const BackButton = styled.button`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #666666;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 40px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  
  &:hover {
    background: #f8f9fa;
    color: #000000;
    border-color: #d0d0d0;
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 60px;
  }
  
  @media (max-width: 768px) {
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
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  
  &:hover {
    border-color: #e0e0e0;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 600px;
  object-fit: cover;
  display: block;
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: #333333;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: #ffffff;
    color: #000000;
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }
  
  ${props => props.direction === 'left' ? 'left: 20px;' : 'right: 20px;'}
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
  border: 2px solid ${props => props.active ? '#000000' : '#f0f0f0'};
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: #ffffff;
  
  &:hover {
    border-color: ${props => props.active ? '#000000' : '#d0d0d0'};
  }
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 600px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 0;
  
  @media (max-width: 1024px) {
    gap: 32px;
  }
`;

const ProductName = styled.h1`
  font-size: 2.8rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const Price = styled.div`
  font-size: 2.4rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #000000;
    margin: 0 0 16px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    color: #666666;
    line-height: 1.7;
    margin: 0;
    font-size: 16px;
  }
`;

const Specifications = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 40px;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #000000;
    margin: 0 0 24px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0;
`;

const SpecLabel = styled.span`
  font-weight: 500;
  color: #666666;
  min-width: 140px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SpecValue = styled.span`
  color: #000000;
  text-align: right;
  font-weight: 500;
  flex: 1;
  
  &.stock-available {
    color: #059669;
    font-weight: 600;
  }
  
  &.stock-unavailable {
    color: #dc2626;
    font-weight: 600;
  }
`;

const SizeOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`;

const SizeButton = styled.button`
  padding: 16px 20px;
  border: 2px solid ${props => props.selected ? '#000000' : '#e0e0e0'};
  background: ${props => props.selected ? '#000000' : '#ffffff'};
  color: ${props => props.selected ? '#ffffff' : '#000000'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-align: center;
  min-width: 80px;
  
  &:hover {
    border-color: #000000;
    background: ${props => props.selected ? '#000000' : '#f8f9fa'};
  }
  
  small {
    display: block;
    font-size: 11px;
    opacity: 0.8;
    margin-top: 4px;
    font-weight: 400;
  }
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const ColorButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${props => props.color || '#ffffff'};
  border: 3px solid ${props => props.selected ? '#000000' : '#e0e0e0'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: #000000;
    transform: scale(1.05);
  }
`;

const ColorName = styled.small`
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  white-space: nowrap;
  color: #666666;
  font-weight: 500;
`;

const PurchaseSection = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const QuantityLabel = styled.span`
  font-weight: 600;
  color: #000000;
  min-width: 80px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 48px;
  height: 48px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #f8f9fa;
    color: #000000;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  padding: 0 20px;
  font-weight: 600;
  color: #000000;
  min-width: 60px;
  text-align: center;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 18px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: 8px;
  min-height: 56px;
  
  &:hover:not(:disabled) {
    background: #333333;
  }
  
  &:disabled {
    background: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
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
  background: #ffffff;
  border: 2px solid #e0e0e0;
  color: #666666;
  padding: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  min-height: 56px;
  min-width: 56px;
  
  &:hover {
    border-color: #000000;
    color: #000000;
    background: #f8f9fa;
  }
`;

const OutOfStock = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 18px;
  color: #666666;
  background: #ffffff;
  border-radius: 12px;
  margin: 40px 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  
  h2 {
    color: #000000;
    margin-bottom: 16px;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 24px;
  background: ${props => props.type === 'success' ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.type === 'success' ? '#bbf7d0' : '#fecaca'};
  color: ${props => props.type === 'success' ? '#166534' : '#dc2626'};
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
  font-weight: 500;
  
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
            const response = await fetch(`http://localhost:5000/api/maintenance/products`);
            
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
                    const imagesResponse = await fetch(`http://localhost:5000/api/maintenance/products/${foundProduct.product_id || foundProduct.id}/images`);
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

    // Listen for stock updates from order cancellations and other stock changes
    useEffect(() => {
        const handleStockUpdate = (event) => {
            // Only refresh if this is the product being viewed
            if (event.detail && event.detail.productIds && event.detail.productIds.includes(parseInt(id))) {
                console.log('📦 Stock update detected for current product in ProductDetailsPage, refreshing...', event.detail);
                fetchProduct();
            }
        };

        const handleStorageChange = (e) => {
            if (e.key === 'stock_updated') {
                console.log('📦 Stock updated via localStorage, refreshing product details...');
                fetchProduct();
            }
        };

        // Listen for custom stock update events (from cancellation approvals, etc.)
        window.addEventListener('stockUpdated', handleStockUpdate);
        // Listen for cross-tab stock updates
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('stockUpdated', handleStockUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [fetchProduct, id]);

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
            
            // Ensure we have a valid color selection
            const finalColor = selectedColor && selectedColor.trim() !== '' 
                ? selectedColor 
                : (availableColors.length > 0 ? availableColors[0] : product.productcolor || '');
            
            console.log('Adding to cart:', {
                productId: product.product_id || product.id,
                color: finalColor,
                size: selectedSize || '',
                quantity: quantity,
                debug: {
                    selectedColor,
                    availableColors,
                    productColor: product.productcolor,
                    finalColor
                }
            });
            
            // Use the CartContext addToCart function with the selected color
            const result = await addToCartContext(
                product.product_id || product.id, 
                finalColor,
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
                                        src={`http://localhost:5000/uploads/${productImages[currentImageIndex]?.image_filename}`}
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
                                                src={`http://localhost:5000/uploads/${image.image_filename}`}
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
                                    src={`http://localhost:5000/uploads/${product.productimage}`}
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
                                        <SpecLabel>Colors:</SpecLabel>
                                        <SpecValue style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            {allColors.map((color, index) => (
                                                <span key={`${color}-${index}`} style={{ 
                                                    padding: '6px 12px', 
                                                    background: '#f8f9fa', 
                                                    borderRadius: '20px', 
                                                    fontSize: '12px',
                                                    textTransform: 'capitalize',
                                                    border: '1px solid #e0e0e0',
                                                    fontWeight: '500',
                                                    color: '#666666'
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
                                                        // Preserve selected color if it's available for the new size
                                                        const colorsForSize = getAvailableColors(product, sizeData.size);
                                                        if (colorsForSize.length > 0) {
                                                            // Check if the currently selected color is available for this size
                                                            if (selectedColor && colorsForSize.includes(selectedColor)) {
                                                                // Keep the selected color if it's available
                                                                // Don't change selectedColor
                                                            } else {
                                                                // Only change to first available color if current selection isn't available
                                                                setSelectedColor(colorsForSize[0]);
                                                            }
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
                    </DetailsSection>
                </ProductContainer>
            </ContentWrapper>
        </PageContainer>
    );
};

export default ProductDetailsPage;
