import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxes, 
  faExclamationTriangle, 
  faSearch,
  faEdit,
  faPlus,
  faChartLine,
  faRefresh,
  faWarning,
  faEye,
  faSortAmountDown,
  faSortAmountUp
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

const StatCard = styled.div`
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
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.critical ? '#000000' : '#f5f5f5'};
  color: ${props => props.critical ? '#ffffff' : '#666666'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.critical ? '#000000' : '#333333'};
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
  background: ${props => props.primary ? '#000000' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#333333'};
  border: 1px solid ${props => props.primary ? '#000000' : '#e0e0e0'};
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
    background: ${props => props.primary ? '#333333' : '#f5f5f5'};
    border-color: ${props => props.primary ? '#333333' : '#cccccc'};
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
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('productname');
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);
  // Fetch products with stock information
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
        const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/inventory/overview-test', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
          setLastUpdated(new Date());
        } else {
          throw new Error(result.message || 'Failed to fetch products');
        }
      } else if (response.status === 401) {
        setError('You need to be logged in to view inventory data');
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const getTotalStock = (sizesString) => {
    const sizes = parseSizes(sizesString);
    return sizes.reduce((total, size) => total + (size.stock || 0), 0);
  };

  const getStockLevel = (currentStock, criticalLevel = 10) => {
    if (currentStock === 0) return 'critical';
    if (currentStock <= criticalLevel) return 'low';
    return 'normal';
  };

  // Filter and sort products
  const processedProducts = products
    .map(product => ({
      ...product,
      totalStock: getTotalStock(product.sizes),
      stockLevel: getStockLevel(getTotalStock(product.sizes))
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
    totalStock: products.reduce((sum, product) => sum + getTotalStock(product.sizes), 0),
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

  const handleRefresh = () => {
    fetchProducts();
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
            <ActionButton primary onClick={handleRefresh}>
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
              <span style={{ marginLeft: '16px', fontSize: '14px' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
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
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon>
                <FontAwesomeIcon icon={faWarning} />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.lowStockProducts}</StatValue>
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
                placeholder="Search products by name, ID, or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>

            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="critical">Critical Stock</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
            </FilterSelect>

            <ActionButton onClick={handleRefresh}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </ActionButton>

            <ActionButton primary>
              <FontAwesomeIcon icon={faPlus} />
              Add Product
            </ActionButton>
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
                  <TableHeader>Sizes & Stock</TableHeader>
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
                        <div style={{ fontSize: '12px' }}>
                          {parseSizes(product.sizes).map((size, index) => (
                            <div key={index} style={{ 
                              marginBottom: '4px', 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              padding: '2px 8px',
                              background: size.stock === 0 ? '#ffebee' : size.stock <= 5 ? '#fff3e0' : '#f5f5f5',
                              borderRadius: '4px',
                              color: size.stock === 0 ? '#d32f2f' : size.stock <= 5 ? '#f57c00' : '#333333'
                            }}>
                              <span>{size.size}:</span>
                              <span style={{ fontWeight: '600' }}>{size.stock}</span>
                            </div>
                          ))}
                          {parseSizes(product.sizes).length === 0 && (
                            <span style={{ color: '#666666' }}>No sizes defined</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <StockStatus level={product.stockLevel}>
                          {product.stockLevel === 'critical' && 'Critical'}
                          {product.stockLevel === 'low' && 'Low Stock'}
                          {product.stockLevel === 'normal' && 'In Stock'}
                        </StockStatus>
                      </TableCell>
                      
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <ActionButton 
                            style={{ padding: '8px 12px', fontSize: '12px' }}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </ActionButton>
                          <ActionButton 
                            style={{ padding: '8px 12px', fontSize: '12px' }}
                            title="Edit Product"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </ActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default InventoryPage;
