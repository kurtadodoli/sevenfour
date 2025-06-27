import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useStock } from '../context/StockContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxes, 
  faExclamationTriangle, 
  faSearch,
  faChartLine,
  faRefresh,
  faWarning,
  faEye,
  faSortAmountDown,
  faSortAmountUp,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';

// Modern Minimalist Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 40px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666666;
  margin: 0;
  font-weight: 400;
`;

// Stats Cards
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['critical', 'lowStock'].includes(prop),
})`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #cccccc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  ${props => props.critical && `
    border-color: #000000;
    background: #fafafa;
  `}
  
  ${props => props.lowStock && `
    border-color: #f57c00;
    background: #fffdf7;
  `}
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['critical', 'lowStock'].includes(prop),
})`
  width: 48px;
  height: 48px;
  background: ${props => 
    props.critical ? '#000000' : 
    props.lowStock ? '#f57c00' : 
    '#f5f5f5'
  };
  color: ${props => 
    props.critical || props.lowStock ? '#ffffff' : '#666666'
  };
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const StatValue = styled.div.withConfig({
  shouldForwardProp: (prop) => !['critical', 'lowStock'].includes(prop),
})`
  font-size: 28px;
  font-weight: 700;
  color: ${props => 
    props.critical ? '#000000' : 
    props.lowStock ? '#f57c00' : 
    '#333333'
  };
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CriticalBadge = styled.div`
  background: #000000;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LowStockBadge = styled.div`
  background: #f57c00;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Controls Section
const ControlsSection = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
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
  padding: 12px 16px 12px 44px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
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

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666666;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  min-width: 140px;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const ActionButton = styled.button`
  padding: 12px 20px;
  background: ${props => props.$primary ? '#000000' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : '#333333'};
  border: 1px solid ${props => props.$primary ? '#000000' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$primary ? '#333333' : '#f5f5f5'};
    border-color: ${props => props.$primary ? '#333333' : '#cccccc'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Table Section
const TableContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #fafafa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #333333;
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.div`
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666666;
  font-weight: 600;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
`;

const ProductCode = styled.div`
  font-size: 12px;
  color: #666666;
  text-transform: uppercase;
`;

const StockLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StockNumber = styled.div`
  font-weight: 600;
  color: ${props => {
    if (props.level === 'critical') return '#d32f2f';
    if (props.level === 'low') return '#f57c00';
    return '#388e3c';
  }};
`;

const StockStatus = styled.div`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  background: ${props => {
    if (props.level === 'critical') return '#ffebee';
    if (props.level === 'low') return '#fff3e0';
    return '#e8f5e8';
  }};
  color: ${props => {
    if (props.level === 'critical') return '#d32f2f';
    if (props.level === 'low') return '#f57c00';
    return '#388e3c';
  }};
  border: 1px solid ${props => {
    if (props.level === 'critical') return '#ffcdd2';
    if (props.level === 'low') return '#ffe0b2';
    return '#c8e6c9';
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #666666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  
  h3 {
    color: #000000;
    margin-bottom: 8px;
  }
  
  p {
    color: #666666;
    margin-bottom: 24px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  
  h3 {
    color: #000000;
    margin-bottom: 8px;
  }
  
  p {
    color: #666666;
  }
`;

// Modal Components
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
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    color: #000000;
  }
`;

const ModalBody = styled.div`
  padding: 0 24px 24px;
`;

const ProductDetailsInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #000000;
`;

const StockSection = styled.div`
  margin-top: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 20px 0;
`;

const StockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const SizeStockCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  
  ${props => props.stock === 0 && `
    border-color: #dc3545;
    background: #fff5f5;
  `}
  
  ${props => props.stock > 0 && props.stock <= 5 && `
    border-color: #f57c00;
    background: #fffdf7;
  `}
  
  ${props => props.stock > 5 && `
    border-color: #28a745;
    background: #f8fff8;
  `}
`;

const SizeLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
`;

const StockAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => 
    props.stock === 0 ? '#dc3545' :
    props.stock <= 5 ? '#f57c00' : 
    '#28a745'
  };
  margin-bottom: 4px;
`;

const StockLabel = styled.div`
  font-size: 12px;
  color: #666666;
  font-weight: 500;
`;

const InventoryPage = () => {
  const { lastUpdate, fetchStockData } = useStock();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('productname');
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Fetch products with detailed size/color information from maintenance API (same as MaintenancePage)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching products from maintenance API (authoritative source)...');
      
      // Use only the maintenance API for consistent data
      const response = await fetch('http://localhost:5000/api/maintenance/products', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const products = await response.json();
        console.log('✅ Received products from maintenance API:', products.length);        // Process products using the same logic as MaintenancePage.js for accuracy
        const processedProducts = products
          .filter(product => product.status === 'active' || product.productstatus === 'active')
          .map(product => {
            console.log('Processing product:', product.productname, 'Raw sizes:', product.sizes);
            
            let totalStock = 0;
            let sizesData = [];
            let sizeColorVariants = [];
            
            // Use the EXACT same processing logic as MaintenancePage.js
            if (product.sizes) {
              try {
                const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                
                // Check if it's the new sizeColorVariants format (has size and colorStocks properties)
                if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                  sizeColorVariants = parsedSizes;
                  console.log('Found sizeColorVariants for', product.productname, ':', sizeColorVariants);
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
                  parsedSizes.forEach(sizeItem => {
                    const sizeName = typeof sizeItem === 'object' && sizeItem.size ? sizeItem.size : String(sizeItem);
                    const stock = typeof sizeItem === 'object' && sizeItem.stock ? sizeItem.stock : 0;
                    
                    const colorStocks = colorsArray.map(color => ({
                      color: color,
                      stock: Math.floor(stock / colorsArray.length)
                    }));
                    
                    sizeColorVariants.push({
                      size: sizeName,
                      colorStocks: colorStocks
                    });
                  });
                }
              } catch (e) {
                console.log('Error parsing sizes for', product.productname, e);
              }
            }
            
            // Final fallback: create a default variant
            if (!sizeColorVariants || sizeColorVariants.length === 0) {
              sizeColorVariants = [{
                size: 'One Size', 
                colorStocks: [{
                  color: product.productcolor || 'Default',
                  stock: product.total_stock || product.productquantity || 0
                }]
              }];
            }
            
            // Calculate total stock and create sizes data for display (EXACT same logic as MaintenancePage)
            sizeColorVariants.forEach(variant => {
              let sizeStock = 0;
              const colors = [];
              
              if (variant.colorStocks) {
                variant.colorStocks.forEach(colorStock => {
                  const stockAmount = colorStock.stock || 0;
                  sizeStock += stockAmount;
                  colors.push({
                    color: colorStock.color,
                    stock: stockAmount,
                    available: stockAmount, // Use same value for now
                    reserved: 0, // Default to 0
                    level: stockAmount === 0 ? 'critical' : stockAmount <= 5 ? 'low' : 'normal'
                  });
                });
              }
              
              totalStock += sizeStock;
              sizesData.push({
                size: variant.size,
                stock: sizeStock,
                colors: colors
              });
            });
            
            console.log('Processed stock for', product.productname, '- Total:', totalStock, 'Sizes:', sizesData);
            
            // Determine stock level based on total stock
            let stockLevel = 'normal';
            if (totalStock === 0) {
              stockLevel = 'critical';
            } else if (totalStock <= 10) {
              stockLevel = 'low';
            }
            
            return {
              product_id: product.product_id || product.id,
              productname: product.productname,
              productcolor: product.productcolor,
              productprice: product.productprice,
              product_type: product.product_type,
              status: product.status || product.productstatus,
              totalStock: totalStock,
              stockLevel: stockLevel,
              sizes: JSON.stringify(sizesData), // For compatibility
              sizesData: sizesData, // New detailed data with accurate stock numbers
              sizeColorVariants: sizeColorVariants,
              rawProduct: product
            };
          });
          
        console.log('✅ Processed products for inventory with accurate stock:', processedProducts.length);
        setProducts(processedProducts);
        setLastUpdated(new Date());
      } else {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
            
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load inventory data from maintenance API');
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for stock updates from other parts of the app (like order cancellations)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'stock_updated') {
        console.log('📦 Stock updated in another tab/component, refreshing inventory...');
        fetchProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchProducts]);

  // Auto-refresh when stock context updates or periodically
  useEffect(() => {
    if (lastUpdate) {
      console.log('📦 StockContext updated, refreshing inventory data...');
      fetchProducts();
    }
  }, [lastUpdate, fetchProducts]);

  // Add periodic refresh to catch stock changes from order operations
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Only refresh if page is visible and not currently loading
      if (document.visibilityState === 'visible' && !loading) {
        console.log('🔄 Periodic stock refresh (catching order changes)...');
        fetchProducts();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchProducts, loading]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Parse sizes and calculate total stock
  const parseSizes = (sizesString) => {
    if (!sizesString) return [];
    try {
      return JSON.parse(sizesString);
    } catch {
      return [];
    }
  };
  const getTotalStock = (product) => {
    // Use the new total_available_stock field if available
    if (typeof product.total_available_stock === 'number') {
      return product.total_available_stock;
    }
    
    // Fallback to parsing sizes JSON for compatibility
    if (product.sizes) {
      try {
        const sizes = JSON.parse(product.sizes);
        return sizes.reduce((total, size) => total + (size.stock || 0), 0);
      } catch (error) {
        console.error('Error parsing sizes for product:', product.product_id, error);
        return 0;
      }
    }
    
    return product.totalStock || 0;
  };
  
  const getStockLevel = (product) => {
    // Use the new stock_status field if available
    if (product.stock_status) {
      switch (product.stock_status) {
        case 'out_of_stock':
        case 'critical_stock':
          return 'critical';
        case 'low_stock':
          return 'low';
        case 'in_stock':
        default:
          return 'normal';
      }
    }
    
    // Fallback to old calculation
    const currentStock = getTotalStock(product);
    if (currentStock === 0) return 'critical';
    if (currentStock <= 10) return 'critical';
    if (currentStock <= 25) return 'low';
    return 'normal';
  };
  // Filter and sort products
  const processedProducts = products
    .map(product => ({
      ...product,
      totalStock: getTotalStock(product),
      stockLevel: getStockLevel(product)
    }))
    .filter(product => {
      const matchesSearch = 
        product.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_id?.toString().includes(searchTerm) ||
        product.productcolor?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'critical') return matchesSearch && product.stockLevel === 'critical';
      if (filterStatus === 'low') return matchesSearch && product.stockLevel === 'low';
      if (filterStatus === 'normal') return matchesSearch && product.stockLevel === 'normal';
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'stock':
          aValue = a.totalStock;
          bValue = b.totalStock;
          break;
        case 'productname':
          aValue = a.productname?.toLowerCase() || '';
          bValue = b.productname?.toLowerCase() || '';
          break;
        case 'productprice':
          aValue = parseFloat(a.productprice) || 0;
          bValue = parseFloat(b.productprice) || 0;
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, product) => sum + getTotalStock(product), 0),
    criticalProducts: processedProducts.filter(p => p.stockLevel === 'critical').length,
    lowStockProducts: processedProducts.filter(p => p.stockLevel === 'low').length
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchStockData()
      ]);
      console.log('📦 Inventory and stock data refreshed');
      
      // Show a brief success indicator
      const refreshBtn = document.querySelector('button[title="Refresh Stock"]');
      if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-check"></i> Updated!';
        refreshBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
          refreshBtn.innerHTML = originalText;
          refreshBtn.style.backgroundColor = '';
        }, 2000);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setShowProductModal(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <TopBar />
        <ContentWrapper>
          <LoadingContainer>
            <FontAwesomeIcon icon={faRefresh} spin style={{ marginRight: '12px' }} />
            Loading inventory data...
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <TopBar />
        <ContentWrapper>
          <ErrorContainer>
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" style={{ marginBottom: '16px', color: '#666666' }} />
            <h3>Failed to Load Inventory</h3>
            <p>{error}</p>
            <ActionButton $primary onClick={handleRefresh}>
              <FontAwesomeIcon icon={faRefresh} />
              Try Again
            </ActionButton>
          </ErrorContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TopBar />
      <ContentWrapper>
        <Header>
          <Title>Inventory Management</Title>
          <Subtitle>
            Monitor product stock levels and manage inventory across all items
            {lastUpdated && (
              <span style={{ marginLeft: '16px', fontSize: '14px', color: '#28a745' }}>
                ✅ Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </Subtitle>
        </Header>

        {/* Statistics Cards */}
        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatIcon>
                <FontAwesomeIcon icon={faBoxes} />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.totalProducts}</StatValue>
            <StatLabel>Total Products</StatLabel>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon>
                <FontAwesomeIcon icon={faChartLine} />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.totalStock.toLocaleString()}</StatValue>
            <StatLabel>Total Stock Units</StatLabel>
          </StatCard>

          <StatCard critical={stats.criticalProducts > 0}>
            <StatHeader>
              <StatIcon critical={stats.criticalProducts > 0}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </StatIcon>
              {stats.criticalProducts > 0 && (
                <CriticalBadge>Alert</CriticalBadge>
              )}
            </StatHeader>
            <StatValue critical={stats.criticalProducts > 0}>{stats.criticalProducts}</StatValue>
            <StatLabel>Critical Stock</StatLabel>
          </StatCard>          <StatCard lowStock={stats.lowStockProducts > 0}>
            <StatHeader>
              <StatIcon lowStock={stats.lowStockProducts > 0}>
                <FontAwesomeIcon icon={faWarning} />
              </StatIcon>
              {stats.lowStockProducts > 0 && (
                <LowStockBadge>Warning</LowStockBadge>
              )}
            </StatHeader>
            <StatValue lowStock={stats.lowStockProducts > 0}>{stats.lowStockProducts}</StatValue>
            <StatLabel>Low Stock Items</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Controls */}
        <ControlsSection>
          <ControlsGrid>
            <SearchContainer>
              <SearchIcon>
                <FontAwesomeIcon icon={faSearch} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            <ActionButton 
              onClick={handleRefresh} 
              title="Refresh Stock"
              style={{ 
                backgroundColor: '#28a745', 
                borderColor: '#28a745',
                color: 'white',
                fontWeight: '600'
              }}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh Stock
            </ActionButton>
            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="critical">Critical Stock</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
            </FilterSelect>
          </ControlsGrid>
        </ControlsSection>

        {/* Inventory Table */}
        <TableContainer>
          <TableWrapper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader onClick={() => handleSort('productname')}>
                    Product
                    {sortField === 'productname' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        style={{ marginLeft: '8px', fontSize: '12px' }}
                      />
                    )}
                  </TableHeader>
                  <TableHeader onClick={() => handleSort('productcolor')}>
                    Color
                    {sortField === 'productcolor' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        style={{ marginLeft: '8px', fontSize: '12px' }}
                      />
                    )}
                  </TableHeader>
                  <TableHeader onClick={() => handleSort('stock')}>
                    Stock Level
                    {sortField === 'stock' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        style={{ marginLeft: '8px', fontSize: '12px' }}
                      />
                    )}
                  </TableHeader>
                  <TableHeader onClick={() => handleSort('productprice')}>
                    Price
                    {sortField === 'productprice' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        style={{ marginLeft: '8px', fontSize: '12px' }}
                      />
                    )}
                  </TableHeader>
                  <TableHeader>Sizes & Colors</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {processedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="7">
                      <EmptyState>
                        <FontAwesomeIcon icon={faBoxes} size="3x" style={{ marginBottom: '16px', color: '#cccccc' }} />
                        <h3>No Products Found</h3>
                        <p>
                          {searchTerm || filterStatus !== 'all' 
                            ? 'Try adjusting your search or filter criteria.' 
                            : 'No products available in inventory.'
                          }
                        </p>
                      </EmptyState>
                    </TableCell>
                  </TableRow>
                ) : (
                  processedProducts.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <ProductInfo>
                          <ProductImage>
                            {product.productname?.charAt(0)?.toUpperCase() || 'P'}
                          </ProductImage>
                          <ProductDetails>
                            <ProductName>{product.productname || 'Unnamed Product'}</ProductName>
                            <ProductCode>ID: {product.product_id}</ProductCode>
                          </ProductDetails>
                        </ProductInfo>
                      </TableCell>
                      
                      <TableCell>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {product.sizesData && product.sizesData.length > 0 ? (
                            // Get unique colors from all size variants
                            [...new Set(product.sizesData.flatMap(sizeData => 
                              sizeData.colors ? sizeData.colors.map(c => c.color) : []
                            ))].map((color, index) => (
                              <div key={index} style={{ 
                                padding: '4px 8px', 
                                background: '#f5f5f5', 
                                borderRadius: '4px', 
                                display: 'inline-block',
                                fontSize: '12px',
                                fontWeight: '500',
                                border: '1px solid #e0e0e0'
                              }}>
                                {color}
                              </div>
                            ))
                          ) : (
                            <div style={{ 
                              padding: '4px 8px', 
                              background: '#f5f5f5', 
                              borderRadius: '4px', 
                              display: 'inline-block',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {product.productcolor || 'No Color'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <StockLevel>
                          <StockNumber level={product.stockLevel}>
                            {product.totalStock}
                          </StockNumber>
                          <span style={{ color: '#666666', fontSize: '12px' }}>units</span>
                        </StockLevel>
                      </TableCell>
                      
                      <TableCell>
                        <strong>₱{parseFloat(product.productprice || 0).toLocaleString()}</strong>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontSize: '12px', maxWidth: '200px' }}>
                          {product.sizesData && product.sizesData.length > 0 ? (
                            // Show all color/size combinations with accurate stock numbers
                            product.sizesData.flatMap(sizeData => 
                              sizeData.colors ? sizeData.colors.map(colorData => ({
                                ...colorData,
                                size: sizeData.size
                              })) : []
                            ).map((variant, index) => (
                              <div key={index} style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 8px',
                                marginBottom: '3px',
                                background: '#f8f9fa',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0',
                                fontSize: '11px',
                                fontWeight: '500',
                                color: '#333'
                              }}>
                                <span>{variant.color} Size {variant.size}</span>
                                <span style={{ 
                                  fontWeight: '600',
                                  color: variant.stock === 0 ? '#d32f2f' : variant.stock <= 5 ? '#f57c00' : '#2e7d32',
                                  backgroundColor: variant.stock === 0 ? '#ffebee' : variant.stock <= 5 ? '#fff3e0' : '#f1f8e9',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  fontSize: '10px'
                                }}>
                                  {variant.stock} units
                                </span>
                              </div>
                            ))
                          ) : (
                            // Fallback to old display
                            parseSizes(product.sizes).map((size, index) => (
                              <div key={index} style={{ 
                                marginBottom: '4px', 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 8px',
                                background: size.stock === 0 ? '#ffebee' : size.stock <= 5 ? '#fff3e0' : '#f5f5f5',
                                borderRadius: '6px',
                                border: `1px solid ${size.stock === 0 ? '#ffcdd2' : size.stock <= 5 ? '#ffe0b2' : '#e0e0e0'}`,
                                color: size.stock === 0 ? '#d32f2f' : size.stock <= 5 ? '#f57c00' : '#333333'
                              }}>
                                <span style={{ fontWeight: '500' }}>{size.size}:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontWeight: '600' }}>{size.stock}</span>
                                  {size.stock === 0 && (
                                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '10px', color: '#d32f2f' }} />
                                  )}
                                  {size.stock > 0 && size.stock <= 5 && (
                                    <FontAwesomeIcon icon={faWarning} style={{ fontSize: '10px', color: '#f57c00' }} />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                          {(!product.sizesData || product.sizesData.length === 0) && 
                           parseSizes(product.sizes).length === 0 && (
                            <span style={{ color: '#666666' }}>No sizes defined</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {product.sizesData && product.sizesData.length > 0 ? (
                            // Show status for each color/size combination
                            product.sizesData.flatMap(sizeData => 
                              sizeData.colors ? sizeData.colors.map(colorData => ({
                                ...colorData,
                                size: sizeData.size
                              })) : []
                            ).map((variant, index) => (
                              <StockStatus key={index} level={variant.level}>
                                <FontAwesomeIcon 
                                  icon={
                                    variant.level === 'critical' ? faExclamationTriangle :
                                    variant.level === 'low' ? faWarning :
                                    faChartLine
                                  } 
                                />
                                {variant.level === 'critical' && (
                                  variant.stock === 0 ? 'Out of Stock' : 'Critical Stock'
                                )}
                                {variant.level === 'low' && 'Low Stock'}
                                {variant.level === 'normal' && 'In Stock'}
                              </StockStatus>
                            ))
                          ) : (
                            <StockStatus level={product.stockLevel}>
                              <FontAwesomeIcon 
                                icon={
                                  product.stockLevel === 'critical' ? faExclamationTriangle :
                                  product.stockLevel === 'low' ? faWarning :
                                  faChartLine
                                } 
                              />
                              {product.stockLevel === 'critical' && (
                                product.totalStock === 0 ? 'Out of Stock' : 'Critical Stock'
                              )}
                              {product.stockLevel === 'low' && 'Low Stock'}
                              {product.stockLevel === 'normal' && 'In Stock'}
                            </StockStatus>
                          )}
                        </div>
                      </TableCell>
                        <TableCell>
                        <ActionButton 
                          style={{ padding: '8px 12px', fontSize: '12px' }}
                          title="View Product Details & Stock"
                          onClick={() => handleOpenModal(product)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableContainer>

        {/* Product Details Modal */}
        {showProductModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Product Details</ModalTitle>                <CloseButton onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faXmark} />
                </CloseButton>
              </ModalHeader>
              
              <ModalBody>                {selectedProduct && (
                  <div>
                    <ProductDetailsInfo>
                      <InfoCard>
                        <InfoLabel>Product Name</InfoLabel>
                        <InfoValue>{selectedProduct.productname}</InfoValue>
                      </InfoCard>
                      
                      <InfoCard>
                        <InfoLabel>Product ID</InfoLabel>
                        <InfoValue>{selectedProduct.product_id}</InfoValue>
                      </InfoCard>
                      
                      <InfoCard>
                        <InfoLabel>Color</InfoLabel>
                        <InfoValue>{selectedProduct.productcolor || 'N/A'}</InfoValue>
                      </InfoCard>
                      
                      <InfoCard>
                        <InfoLabel>Price</InfoLabel>
                        <InfoValue>₱{parseFloat(selectedProduct.productprice).toLocaleString()}</InfoValue>
                      </InfoCard>
                    </ProductDetailsInfo>                    <StockSection>
                      <SectionTitle>Stock Status by Color & Size</SectionTitle>
                      <StockGrid>
                        {selectedProduct.sizesData && selectedProduct.sizesData.length > 0 ? (
                          // Flatten all color/size combinations and display each one as individual cards
                          selectedProduct.sizesData.flatMap(sizeData => 
                            sizeData.colors ? sizeData.colors.map(colorData => ({
                              ...colorData,
                              size: sizeData.size,
                              displayName: `${colorData.color} Size ${sizeData.size}`
                            })) : []
                          ).map((variant, index) => (
                            <SizeStockCard key={index} stock={variant.stock}>
                              <SizeLabel>{variant.displayName}</SizeLabel>
                              <StockAmount stock={variant.stock}>{variant.stock}</StockAmount>
                              <StockLabel>
                                {variant.stock === 0 && 'Out of Stock'}
                                {variant.stock > 0 && variant.stock <= 5 && 'Low Stock'}
                                {variant.stock > 5 && 'In Stock'}
                              </StockLabel>
                              {variant.reserved > 0 && (
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#666', 
                                  marginTop: '4px',
                                  fontStyle: 'italic'
                                }}>
                                  {variant.reserved} reserved
                                </div>
                              )}
                            </SizeStockCard>
                          ))
                        ) : (
                          // Fallback to old display
                          parseSizes(selectedProduct.sizes).map((size, index) => (
                            <SizeStockCard key={index} stock={size.stock}>
                              <SizeLabel>{size.size}</SizeLabel>
                              <StockAmount stock={size.stock}>{size.stock}</StockAmount>
                              <StockLabel>
                                {size.stock === 0 && 'Out of Stock'}
                                {size.stock > 0 && size.stock <= 5 && 'Low Stock'}
                                {size.stock > 5 && 'In Stock'}
                              </StockLabel>
                            </SizeStockCard>
                          ))
                        )}
                        {(!selectedProduct.sizesData || selectedProduct.sizesData.length === 0) && 
                         parseSizes(selectedProduct.sizes).length === 0 && (
                          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
                            No size information available
                          </div>
                        )}
                      </StockGrid>
                      
                      <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                          TOTAL STOCK
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>
                          {selectedProduct.totalStock} units
                        </div>
                      </div>
                    </StockSection>
                  </div>
                )}
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default InventoryPage;
