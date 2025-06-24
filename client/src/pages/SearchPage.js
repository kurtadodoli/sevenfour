import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faCalendarAlt, 
  faBox, 
  faShoppingCart, 
  faPalette, 
  faCheckCircle, 
  faTimesCircle, 
  faEye, 
  faTimes,
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faList,
  faTable,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';

// Styled Components - Modern Minimalist Design
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  padding: 2rem 0;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #000000;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666666;
  margin: 0;
  font-weight: 400;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0 1rem;
  }
`;

const SearchContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 0 0.5rem 3rem 0.5rem;
  }
`;

const SearchForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #000000;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  padding: 0.8rem 1rem;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 0.9rem;
  background: #ffffff;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #000000;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
  
  &:hover {
    border-color: #999999;
  }
`;

const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #000000;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
  
  &:hover {
    border-color: #999999;
  }
  
  &::placeholder {
    color: #999999;
  }
  
  &:disabled {
    background-color: #f8f8f8;
    opacity: 0.7;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const SearchButton = styled.button`
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  min-width: 120px;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover:not(:disabled) {
    background: #333333;
  }
  
  &:active {
    background: #000000;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  background: #ffffff;
  color: #000000;
  border: 1px solid #d0d0d0;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #f8f8f8;
    border-color: #999999;
  }
  
  &:active {
    background: #e8e8e8;
  }
`;

const ResultsContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 0 0.5rem;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e5e5;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const ResultsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.5px;
`;

const ResultsCount = styled.span`
  color: #666666;
  font-size: 0.9rem;
  font-weight: 400;
  background: #f8f8f8;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
`;

const ResultsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Table Styles for Products and Transactions
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 700px;
`;

const TableHeader = styled.thead`
  background: #f8f8f8;
  border-bottom: 2px solid #e5e5e5;
`;

const TableHeaderRow = styled.tr`
  &:hover {
    background: #f0f0f0;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem 0.8rem;
  text-align: left;
  font-weight: 500;
  color: #000000;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-right: 1px solid #e5e5e5;
  
  &:last-child {
    border-right: none;
  }
  
  &:first-child {
    padding-left: 1.5rem;
  }
  
  &:last-child {
    padding-right: 1.5rem;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e5e5;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem 0.8rem;
  color: #333333;
  border-right: 1px solid #e5e5e5;
  vertical-align: top;
  line-height: 1.4;
  
  &:last-child {
    border-right: none;
  }
  
  &:first-child {
    padding-left: 1.5rem;
    font-weight: 500;
    color: #000000;
  }
  
  &:last-child {
    padding-right: 1.5rem;
  }
`;

const TableActionButton = styled.button`
  background: #ffffff;
  color: #000000;
  border: 1px solid #d0d0d0;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    background: #000000;
    color: #ffffff;
    border-color: #000000;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.3rem;
  background: #f8f8f8;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  width: fit-content;
`;

const ViewToggleButton = styled.button`
  background: ${props => props.active ? '#000000' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#666666'};
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    background: ${props => props.active ? '#000000' : '#e5e5e5'};
    color: ${props => props.active ? '#ffffff' : '#000000'};
  }
`;

const ResultItem = styled.div`
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  background: #ffffff;
  
  &:hover {
    border-color: #000000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const ResultTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  line-height: 1.4;
`;

const CategoryBadge = styled.span`
  background: ${props => 
    props.category === 'products' ? '#000000' :
    props.category === 'orders' ? '#333333' :
    props.category === 'custom_orders' ? '#555555' :
    props.category === 'completed_orders' ? '#777777' :
    props.category === 'cancelled_orders' ? '#999999' :
    props.category === 'custom_designs' ? '#222222' :
    '#666666'
  };
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const ResultDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 4px;
`;

const DetailItem = styled.div`
  font-size: 0.85rem;
  color: #333333;
  line-height: 1.5;
  
  strong {
    color: #000000;
    font-weight: 500;
  }
`;

const ViewButton = styled.button`
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #000000;
    color: #ffffff;
  }
  
  &:active {
    background: #333333;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 4rem;
  font-size: 1rem;
  color: #666666;
  gap: 1rem;
  text-align: center;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666666;
  font-size: 1rem;
  line-height: 1.6;
  
  &::before {
    content: '🔍';
    display: block;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const ErrorMessage = styled.div`
  background: #f8f8f8;
  border: 1px solid #e5e5e5;
  color: #333333;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 1rem;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin: auto;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 95%;
    margin: 1rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e5e5;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  letter-spacing: -0.5px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666666;
  padding: 0.5rem;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
    color: #000000;
  }
`;

const ModalBody = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333333;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const DetailCard = styled.div`
  background: #f8f8f8;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  color: #333333;
  font-size: 0.9rem;
  word-break: break-word;
  line-height: 1.5;
  
  &:empty::after {
    content: 'N/A';
    color: #999999;
    font-style: italic;
  }
`;

const SearchPage = () => {
  // State management
  const [searchCategory, setSearchCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Search categories configuration
  const categories = [
    { value: 'products', label: 'Products', icon: faBox, description: 'Search by product name' },
    { value: 'transactions', label: 'Transactions', icon: faCreditCard, description: 'Search transaction history' },
    { value: 'orders', label: 'Regular Orders', icon: faShoppingCart, description: 'Search by order ID or date range' },
    { value: 'custom_orders', label: 'Custom Orders', icon: faPalette, description: 'Search by order ID or date range' },
    { value: 'completed_orders', label: 'Completed Orders', icon: faCheckCircle, description: 'Search completed deliveries' },
    { value: 'cancelled_orders', label: 'Cancelled Orders', icon: faTimesCircle, description: 'Search cancelled orders' },
    { value: 'custom_designs', label: 'Custom Designs', icon: faPalette, description: 'Search design requests' }
  ];

  // Check if current category supports table view
  const supportsTableView = () => {
    return ['products', 'transactions'].includes(searchCategory);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryConfig = categories.find(cat => cat.value === category);
    return categoryConfig ? categoryConfig.icon : faInfoCircle;
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchCategory) {
      setError('Please select a search category');
      return;
    }

    if (!searchQuery && !dateFrom && !dateTo) {
      setError('Please provide search criteria (text or date range)');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const searchParams = new URLSearchParams();
      searchParams.append('category', searchCategory);
      if (searchQuery) searchParams.append('query', searchQuery);
      if (dateFrom) searchParams.append('dateFrom', dateFrom);
      if (dateTo) searchParams.append('dateTo', dateTo);

      const response = await fetch(`http://localhost:3001/api/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (item) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/search/details/${item.category}/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch details: ${response.statusText}`);
      }

      const data = await response.json();
      setSelectedItem(data);
      setShowModal(true);
    } catch (err) {
      console.error('Details error:', err);
      setError(err.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchCategory('');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setResults([]);
    setError('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get search placeholder text
  const getSearchPlaceholder = () => {
    switch (searchCategory) {
      case 'products':
        return 'Enter product name...';
      case 'orders':
      case 'custom_orders':
      case 'completed_orders':
      case 'cancelled_orders':
        return 'Enter order ID...';
      case 'custom_designs':
        return 'Enter design name or customer...';
      default:
        return 'Enter search term...';
    }
  };
  // Check if date range is relevant for category
  const isDateRangeRelevant = () => {
    return ['orders', 'custom_orders', 'completed_orders', 'cancelled_orders', 'custom_designs', 'transactions'].includes(searchCategory);
  };

  // Render Products Table
  const renderProductsTable = () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHeaderCell>Product ID</TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Color</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>Stock</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {results.map((item, index) => (
            <TableRow key={`${item.category}-${item.id}-${index}`}>
              <TableCell>#{item.id}</TableCell>
              <TableCell>{item.name || item.title || 'N/A'}</TableCell>
              <TableCell>{item.product_type || 'N/A'}</TableCell>
              <TableCell>{item.productcolor || 'N/A'}</TableCell>
              <TableCell>₱{parseFloat(item.price || 0).toFixed(2)}</TableCell>
              <TableCell>{item.stock_quantity || 'N/A'}</TableCell>
              <TableCell>
                <TableActionButton onClick={() => handleViewDetails(item)}>
                  <FontAwesomeIcon icon={faEye} />
                  View
                </TableActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render Transactions Table
  const renderTransactionsTable = () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHeaderCell>Transaction ID</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {results.map((item, index) => (
            <TableRow key={`${item.category}-${item.id}-${index}`}>
              <TableCell>#{item.id}</TableCell>
              <TableCell>{item.customer_name || 'N/A'}</TableCell>
              <TableCell>₱{parseFloat(item.amount || 0).toFixed(2)}</TableCell>
              <TableCell>{item.transaction_type || 'N/A'}</TableCell>
              <TableCell>{item.status || 'N/A'}</TableCell>
              <TableCell>{formatDate(item.created_at)}</TableCell>
              <TableCell>
                <TableActionButton onClick={() => handleViewDetails(item)}>
                  <FontAwesomeIcon icon={faEye} />
                  View
                </TableActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>🔍 Universal Search</Title>
          <Subtitle>Search across all products, orders, deliveries, and designs with advanced filtering capabilities</Subtitle>
        </Header>

        <SearchContainer>
          <SearchForm>
            <FormRow>
              <FormGroup>
                <Label>
                  <FontAwesomeIcon icon={faFilter} /> Search Category
                </Label>
                <Select 
                  value={searchCategory} 
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>
                  <FontAwesomeIcon icon={faSearch} /> Search Term
                </Label>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getSearchPlaceholder()}
                  disabled={!searchCategory}
                />
              </FormGroup>
            </FormRow>

            {isDateRangeRelevant() && (
              <FormRow>
                <FormGroup>
                  <Label>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Date From
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Date To
                  </Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </FormGroup>
              </FormRow>
            )}

            <ButtonGroup>
              <SearchButton onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Searching...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} />
                    Search
                  </>
                )}
              </SearchButton>
              <ClearButton onClick={handleClear}>
                🗑️ Clear
              </ClearButton>
            </ButtonGroup>
          </SearchForm>

          {error && (
            <ErrorMessage>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span style={{ marginLeft: '0.75rem' }}>{error}</span>
            </ErrorMessage>
          )}
        </SearchContainer>        {(results.length > 0 || loading) && (
          <ResultsContainer>
            <ResultsHeader>
              <ResultsTitle>
                <FontAwesomeIcon icon={faSearch} />
                Search Results
              </ResultsTitle>
              {!loading && <ResultsCount>{results.length} result{results.length !== 1 ? 's' : ''} found</ResultsCount>}
            </ResultsHeader>

            {supportsTableView() && results.length > 0 && !loading && (
              <ViewToggle>
                <ViewToggleButton 
                  active={viewMode === 'cards'} 
                  onClick={() => setViewMode('cards')}
                >
                  <FontAwesomeIcon icon={faList} />
                  Cards
                </ViewToggleButton>
                <ViewToggleButton 
                  active={viewMode === 'table'} 
                  onClick={() => setViewMode('table')}
                >
                  <FontAwesomeIcon icon={faTable} />
                  Table
                </ViewToggleButton>
              </ViewToggle>
            )}

            {loading ? (
              <LoadingSpinner>
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <div>Searching through database...</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Please wait while we find your results</div>
              </LoadingSpinner>
            ) : results.length === 0 ? (
              <NoResults>
                <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No results found</div>
                <div>Try adjusting your search criteria or selecting a different category</div>
              </NoResults>
            ) : (
              <>
                {/* Table View for Products and Transactions */}
                {supportsTableView() && viewMode === 'table' ? (
                  <>
                    {searchCategory === 'products' && renderProductsTable()}
                    {searchCategory === 'transactions' && renderTransactionsTable()}
                  </>
                ) : (
                  /* Card View for all categories */
                  <ResultsList>
                    {results.map((item, index) => (
                      <ResultItem key={`${item.category}-${item.id}-${index}`}>
                        <ResultHeader>
                          <ResultTitle>
                            <FontAwesomeIcon icon={getCategoryIcon(item.category)} />
                            {item.title || item.name || item.order_number || `${item.category} #${item.id}`}
                          </ResultTitle>
                          <CategoryBadge category={item.category}>
                            {categories.find(cat => cat.value === item.category)?.label || item.category}
                          </CategoryBadge>
                        </ResultHeader>

                        <ResultDetails>
                          {item.category === 'products' && (
                            <>
                              <DetailItem><strong>Product ID:</strong> {item.id}</DetailItem>
                              <DetailItem><strong>Type:</strong> {item.product_type || 'N/A'}</DetailItem>
                              <DetailItem><strong>Color:</strong> {item.productcolor || 'N/A'}</DetailItem>
                              <DetailItem><strong>Price:</strong> ₱{parseFloat(item.price || 0).toFixed(2)}</DetailItem>
                            </>
                          )}

                          {item.category === 'transactions' && (
                            <>
                              <DetailItem><strong>Transaction ID:</strong> {item.id}</DetailItem>
                              <DetailItem><strong>Customer:</strong> {item.customer_name || 'N/A'}</DetailItem>
                              <DetailItem><strong>Amount:</strong> ₱{parseFloat(item.amount || 0).toFixed(2)}</DetailItem>
                              <DetailItem><strong>Type:</strong> {item.transaction_type || 'N/A'}</DetailItem>
                              <DetailItem><strong>Status:</strong> {item.status || 'N/A'}</DetailItem>
                              <DetailItem><strong>Date:</strong> {formatDate(item.created_at)}</DetailItem>
                            </>
                          )}

                          {['orders', 'custom_orders', 'completed_orders', 'cancelled_orders'].includes(item.category) && (
                            <>
                              <DetailItem><strong>Order ID:</strong> {item.order_number || item.id}</DetailItem>
                              <DetailItem><strong>Customer:</strong> {item.customer_name || item.customerName || 'N/A'}</DetailItem>
                              <DetailItem><strong>Amount:</strong> ₱{parseFloat(item.total_amount || 0).toFixed(2)}</DetailItem>
                              <DetailItem><strong>Date:</strong> {formatDate(item.created_at || item.order_date)}</DetailItem>
                              <DetailItem><strong>Status:</strong> {item.status || item.delivery_status || 'N/A'}</DetailItem>
                            </>
                          )}

                          {item.category === 'custom_designs' && (
                            <>
                              <DetailItem><strong>Design ID:</strong> {item.id}</DetailItem>
                              <DetailItem><strong>Customer:</strong> {item.customer_name || 'N/A'}</DetailItem>
                              <DetailItem><strong>Product Type:</strong> {item.product_type || 'N/A'}</DetailItem>
                              <DetailItem><strong>Status:</strong> {item.status || 'N/A'}</DetailItem>
                              <DetailItem><strong>Created:</strong> {formatDate(item.created_at)}</DetailItem>
                            </>
                          )}
                        </ResultDetails>

                        <ViewButton onClick={() => handleViewDetails(item)}>
                          <FontAwesomeIcon icon={faEye} />
                          View Complete Details
                        </ViewButton>
                      </ResultItem>
                    ))}
                  </ResultsList>
                )}
              </>
            )}
          </ResultsContainer>
        )}
      </ContentWrapper>

      {/* Details Modal */}
      {showModal && selectedItem && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FontAwesomeIcon icon={getCategoryIcon(selectedItem.category)} style={{ marginRight: '0.5rem' }} />
                {selectedItem.title || selectedItem.name || selectedItem.order_number || 'Details'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailGrid>
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (key === 'category' || key === 'id' || value === null || value === undefined) return null;
                  
                  return (
                    <DetailCard key={key}>
                      <DetailLabel>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</DetailLabel>
                      <DetailValue>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : 
                         key.includes('date') || key.includes('_at') ? formatDate(value) :
                         key.includes('amount') || key.includes('price') ? `₱${parseFloat(value || 0).toFixed(2)}` :
                         value.toString()}
                      </DetailValue>
                    </DetailCard>
                  );
                })}
              </DetailGrid>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default SearchPage;