import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBox, 
  faEye, 
  faTimes,
  faSpinner,
  faExclamationTriangle,
  faCreditCard,
  faShoppingBag,
  faTh,
  faList
} from '@fortawesome/free-solid-svg-icons';

// Modern Minimalist Styled Components - Black & White Theme
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #000000;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 300;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  padding: 4rem 0 3rem 0;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 100;
  margin: 0 0 1rem 0;
  color: #000000;
  letter-spacing: -0.03em;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666666;
  margin: 0;
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const SearchBarContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.25rem 1.5rem 1.25rem 3.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 300;
  background: #ffffff;
  color: #000000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #999999;
    font-weight: 300;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666666;
  font-size: 1.1rem;
  pointer-events: none;
`;

const FilterControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ClearButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  color: #666666;
  font-size: 0.9rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #000000;
    color: #ffffff;
    border-color: #000000;
  }
`;
const TabsContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TabsHeader = styled.div`
  display: flex;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1.5rem 2rem;
  border: none;
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? '#000000' : '#666666'};
  font-size: 1rem;
  font-weight: ${props => props.$active ? '500' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid ${props => props.$active ? '#000000' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$active ? '#ffffff' : '#f0f0f0'};
    color: ${props => props.$active ? '#000000' : '#333333'};
  }
`;

const Tab = ({ active, children, ...props }) => (
  <TabButton $active={active} {...props}>
    {children}
  </TabButton>
);

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 2rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
`;

const ResultsCount = styled.div`
  font-size: 1rem;
  color: #666666;
  font-weight: 300;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$active ? '#000000' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#666666'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#333333' : '#f8f8f8'};
  }
`;

const TableContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHeader = styled.thead`
  background: #f8f8f8;
  border-bottom: 2px solid #e0e0e0;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1.2rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #333333;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e0e0e0;
  
  &:first-child {
    padding-left: 2rem;
  }
  
  &:last-child {
    padding-right: 2rem;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #333333;
  vertical-align: middle;
  font-weight: 300;
  
  &:first-child {
    padding-left: 2rem;
    font-weight: 400;
  }
  
  &:last-child {
    padding-right: 2rem;
  }
`;

const ActionButton = styled.button`
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    background: #333333;
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  background: #ffffff;
  flex-direction: column;
  gap: 1rem;
  color: #666666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #ffffff;
  color: #666666;
  
  h3 {
    margin-bottom: 1rem;
    color: #333333;
    font-weight: 400;
    font-size: 1.5rem;
  }
  
  p {
    font-weight: 300;
    line-height: 1.6;
  }
`;

const ErrorMessage = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
    color: #000000;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  font-size: 0.9rem;
  color: #000000;
  font-weight: 400;
  word-break: break-word;
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${props => {
    switch (props.status) {
      case 'confirmed':
      case 'completed':
        return '#000000';
      case 'pending':
        return '#f0f0f0';
      case 'cancelled':
        return '#f5f5f5';
      default:
        return '#e0e0e0';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'confirmed':
      case 'completed':
        return '#ffffff';
      case 'pending':
        return '#666666';
      case 'cancelled':
        return '#999999';
      default:
        return '#333333';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'confirmed':
      case 'completed':
        return '#000000';
      case 'pending':
        return '#cccccc';
      case 'cancelled':
        return '#cccccc';
      default:
        return '#e0e0e0';
    }
  }};
`;

const StockBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.$inStock ? '#000000' : '#f5f5f5'};
  color: ${props => props.$inStock ? '#ffffff' : '#999999'};
  border: 1px solid ${props => props.$inStock ? '#000000' : '#cccccc'};
`;

const SearchPage = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch products from database
      try {
        console.log('Fetching products from database...');
        const productsResponse = await fetch('http://localhost:5000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          
          let databaseProducts = [];
          if (productsData.success && Array.isArray(productsData.data)) {
            databaseProducts = productsData.data;
          } else if (productsData.success && Array.isArray(productsData.products)) {
            databaseProducts = productsData.products;
          } else if (Array.isArray(productsData.products)) {
            databaseProducts = productsData.products;
          } else if (Array.isArray(productsData)) {
            databaseProducts = productsData;
          }
          
          setProducts(databaseProducts);
          console.log(`Loaded ${databaseProducts.length} products`);
        } else {
          throw new Error(`Products API failed with status ${productsResponse.status}`);
        }
      } catch (fetchError) {
        console.error('Error fetching products:', fetchError);
        setProducts([]);
      }

      // Fetch transactions from database - Updated to include all confirmed orders
      try {
        console.log('Fetching all confirmed transactions from database...');
        
        // Try multiple endpoints to get comprehensive transaction data
        let allTransactions = [];
        
        // 1. Try to get confirmed orders
        try {
          const confirmedResponse = await fetch('http://localhost:5000/api/orders/confirmed', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (confirmedResponse.ok) {
            const confirmedData = await confirmedResponse.json();
            let confirmedOrders = [];
            
            if (confirmedData && Array.isArray(confirmedData.data)) {
              confirmedOrders = confirmedData.data;
            } else if (confirmedData && Array.isArray(confirmedData.orders)) {
              confirmedOrders = confirmedData.orders;
            } else if (Array.isArray(confirmedData)) {
              confirmedOrders = confirmedData;
            }
            
            console.log(`Found ${confirmedOrders.length} confirmed orders`);
            allTransactions = [...allTransactions, ...confirmedOrders];
          }
        } catch (confirmedError) {
          console.warn('Confirmed orders endpoint failed:', confirmedError);
        }
        
        // 2. Try to get all transactions
        try {
          const transactionsResponse = await fetch('http://localhost:5000/api/orders/transactions/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (transactionsResponse.ok) {
            const transactionsData = await transactionsResponse.json();
            let allOrderTransactions = [];
            
            if (transactionsData && Array.isArray(transactionsData.data)) {
              allOrderTransactions = transactionsData.data;
            } else if (transactionsData && Array.isArray(transactionsData.transactions)) {
              allOrderTransactions = transactionsData.transactions;
            } else if (Array.isArray(transactionsData)) {
              allOrderTransactions = transactionsData;
            }
            
            console.log(`Found ${allOrderTransactions.length} order transactions`);
            allTransactions = [...allTransactions, ...allOrderTransactions];
          }
        } catch (transactionsError) {
          console.warn('Transactions endpoint failed:', transactionsError);
        }
        
        // 3. Fallback to existing confirmed-test endpoint
        if (allTransactions.length === 0) {
          const ordersResponse = await fetch('http://localhost:5000/api/orders/confirmed-test', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            
            if (ordersData && Array.isArray(ordersData.data)) {
              allTransactions = ordersData.data;
            } else if (ordersData && Array.isArray(ordersData.orders)) {
              allTransactions = ordersData.orders;
            } else if (Array.isArray(ordersData)) {
              allTransactions = ordersData;
            }
            console.log(`Found ${allTransactions.length} transactions from confirmed-test`);
          }
        }
        
        // 4. Final fallback to test-list endpoint
        if (allTransactions.length === 0) {
          const testResponse = await fetch('http://localhost:5000/api/orders/test-list', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            let allOrders = testData && Array.isArray(testData.data) ? testData.data : [];
            allTransactions = allOrders;
            console.log(`Found ${allTransactions.length} transactions from test-list`);
          }
        }
        
        // Remove duplicates based on order_number or id
        const uniqueTransactions = allTransactions.reduce((unique, transaction) => {
          const identifier = transaction.order_number || transaction.id;
          if (!unique.some(t => (t.order_number || t.id) === identifier)) {
            unique.push(transaction);
          }
          return unique;
        }, []);
        
        // Filter to include all relevant orders (confirmed, completed, delivered, shipped, processing)
        const relevantOrders = uniqueTransactions.filter(order => 
          order && (
            order.status === 'confirmed' || 
            order.status === 'completed' ||
            order.status === 'delivered' ||
            order.status === 'shipped' ||
            order.status === 'processing' ||
            order.delivery_status === 'confirmed' ||
            order.delivery_status === 'completed' ||
            order.delivery_status === 'delivered' ||
            order.delivery_status === 'shipped' ||
            order.delivery_status === 'processing' ||
            order.payment_status === 'verified' ||
            order.payment_status === 'paid' ||
            !order.status // Include orders without status as they might be valid
          )
        );
        
        const databaseTransactions = relevantOrders.map(order => ({
          id: order.id,
          customer_name: order.customer_name || order.customerName || 
                        `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer',
          amount: parseFloat(order.total_amount || order.amount || 0),
          transaction_type: 'Order Transaction',
          status: order.status || order.delivery_status || order.payment_status || 'confirmed',
          created_at: order.created_at || order.order_date,
          order_number: order.order_number,
          transaction_number: order.order_number || order.transaction_id,
          email: order.customer_email || order.user_email || order.email,
          phone: order.contact_phone || order.phone,
          payment_method: order.payment_method || 'gcash',
          payment_status: order.payment_status || 'verified',
          delivery_status: order.delivery_status,
          shipping_address: order.shipping_address,
          invoice_id: order.invoice_id,
          transaction_id: order.transaction_id
        }));
        
        setTransactions(databaseTransactions);
        console.log(`✅ Successfully loaded ${databaseTransactions.length} transactions from all confirmed orders`);
      } catch (ordersError) {
        console.error('Error fetching transactions:', ordersError);
        setTransactions([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.message.includes('Authentication required')) {
        setError('Please log in to view products and orders.');
      } else {
        setError(`Failed to fetch data: ${err.message}. Please refresh the page and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search query
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      !searchQuery || 
      (product.productname && product.productname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.product_name && product.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.product_type && product.product_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.productcolor && product.productcolor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.product_color && product.product_color.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.color && product.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.productsize && product.productsize.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.product_size && product.product_size.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.size && product.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.id && product.id.toString().includes(searchQuery)) ||
      (product.product_id && product.product_id.toString().includes(searchQuery))
    );
  }, [products, searchQuery]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => 
      !searchQuery || 
      (transaction.customer_name && transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.transaction_type && transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.order_number && transaction.order_number.toString().includes(searchQuery)) ||
      (transaction.status && transaction.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.id && transaction.id.toString().includes(searchQuery)) ||
      (transaction.transaction_id && transaction.transaction_id && transaction.transaction_id.toString().includes(searchQuery)) ||
      (transaction.email && transaction.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.phone && transaction.phone.toString().includes(searchQuery)) ||
      (transaction.payment_method && transaction.payment_method.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.payment_status && transaction.payment_status.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.delivery_status && transaction.delivery_status.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.shipping_address && transaction.shipping_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.invoice_id && transaction.invoice_id.toString().includes(searchQuery))
    );
  }, [transactions, searchQuery]);

  // Handle view details
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>Search</Title>
          <Subtitle>
            Discover products and transactions with our advanced search system
          </Subtitle>
        </Header>

        {/* Search Section */}
        <SearchSection>
          <SearchBarContainer>
            <SearchIcon>
              <FontAwesomeIcon icon={faSearch} />
            </SearchIcon>
            <SearchInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, category, color, size... or orders by customer, order number, payment method, status..."
            />
          </SearchBarContainer>
          
          <FilterControls>
            {searchQuery && (
              <ClearButton onClick={clearSearch}>
                <FontAwesomeIcon icon={faTimes} />
                Clear Search
              </ClearButton>
            )}
          </FilterControls>
        </SearchSection>

        {error && (
          <ErrorMessage>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </ErrorMessage>
        )}

        {/* Tabs */}
        <TabsContainer>
          <TabsHeader>
            <Tab 
              active={activeTab === 'products'} 
              onClick={() => setActiveTab('products')}
            >
              <FontAwesomeIcon icon={faBox} />
              Products ({filteredProducts.length})
            </Tab>
            <Tab 
              active={activeTab === 'transactions'} 
              onClick={() => setActiveTab('transactions')}
            >
              <FontAwesomeIcon icon={faShoppingBag} />
              Transactions ({filteredTransactions.length})
            </Tab>
          </TabsHeader>

          {/* Results Header */}
          <ResultsHeader>
            <ResultsCount>
              {activeTab === 'products' 
                ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`
                : `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''} found`
              }
            </ResultsCount>
          </ResultsHeader>

          {/* Products Table */}
          {activeTab === 'products' && (
            <TableContainer>
              {loading ? (
                <LoadingContainer>
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                  <div>Loading products...</div>
                </LoadingContainer>
              ) : filteredProducts.length === 0 ? (
                <EmptyState>
                  <h3>No products found</h3>
                  <p>Try adjusting your search criteria or clear the search to see all products</p>
                </EmptyState>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Product ID</TableHeaderCell>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Category</TableHeaderCell>
                      <TableHeaderCell>Color</TableHeaderCell>
                      <TableHeaderCell>Size</TableHeaderCell>
                      <TableHeaderCell>Price</TableHeaderCell>
                      <TableHeaderCell>Stock</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {filteredProducts.map((product, index) => {
                      const stock = product.stock_quantity || product.total_stock || product.quantity || product.stock || 0;
                      const isInStock = stock > 0;
                      
                      return (
                        <TableRow key={product.id || index}>
                          <TableCell>ID: {product.product_id || product.id || 'N/A'}</TableCell>
                          <TableCell>{product.productname || product.product_name || product.name || 'N/A'}</TableCell>
                          <TableCell>{product.category || product.product_type || 'N/A'}</TableCell>
                          <TableCell>{product.productcolor || product.product_color || product.color || 'N/A'}</TableCell>
                          <TableCell>{product.productsize || product.product_size || product.size || 'N/A'}</TableCell>
                          <TableCell>₱{parseFloat(product.price || product.product_price || 0).toFixed(2)}</TableCell>
                          <TableCell>{stock}</TableCell>
                          <TableCell>
                            <StockBadge $inStock={isInStock}>
                              {isInStock ? 'In Stock' : 'Out of Stock'}
                            </StockBadge>
                          </TableCell>
                          <TableCell>
                            <ActionButton onClick={() => handleViewDetails(product)}>
                              <FontAwesomeIcon icon={faEye} />
                              View
                            </ActionButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </TableContainer>
          )}

          {/* Transactions Table */}
          {activeTab === 'transactions' && (
            <TableContainer>
              {loading ? (
                <LoadingContainer>
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                  <div>Loading transactions...</div>
                </LoadingContainer>
              ) : filteredTransactions.length === 0 ? (
                <EmptyState>
                  <h3>No transactions found</h3>
                  <p>Try adjusting your search criteria or clear the search to see all transactions</p>
                </EmptyState>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Order ID</TableHeaderCell>
                      <TableHeaderCell>Order Number</TableHeaderCell>
                      <TableHeaderCell>Customer</TableHeaderCell>
                      <TableHeaderCell>Amount</TableHeaderCell>
                      <TableHeaderCell>Payment Method</TableHeaderCell>
                      <TableHeaderCell>Payment Status</TableHeaderCell>
                      <TableHeaderCell>Order Status</TableHeaderCell>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <TableRow key={transaction.id || transaction.transaction_id || index}>
                        <TableCell>{transaction.id || 'N/A'}</TableCell>
                        <TableCell>{transaction.order_number || transaction.transaction_number || 'N/A'}</TableCell>
                        <TableCell>
                          <div>{transaction.customer_name || 'N/A'}</div>
                          {transaction.email && (
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                              {transaction.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>₱{parseFloat(transaction.amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FontAwesomeIcon icon={faCreditCard} style={{ color: '#666' }} />
                            {transaction.payment_method || 'GCash'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={transaction.payment_status}>
                            {transaction.payment_status || 'verified'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={transaction.status}>
                            {transaction.status || 'confirmed'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>
                          <ActionButton onClick={() => handleViewDetails(transaction)}>
                            <FontAwesomeIcon icon={faEye} />
                            View
                          </ActionButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableContainer>
          )}
        </TabsContainer>
      </ContentWrapper>

      {/* Details Modal */}
      {showModal && selectedItem && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FontAwesomeIcon icon={activeTab === 'products' ? faBox : faCreditCard} />
                {activeTab === 'products' ? 'Product Details' : 'Transaction Details'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseButton>
            </ModalHeader>

            <DetailGrid>
              {Object.entries(selectedItem).map(([key, value]) => {
                if (value === null || value === undefined || value === '') return null;
                
                return (
                  <DetailItem key={key}>
                    <DetailLabel>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</DetailLabel>
                    <DetailValue>
                      {key.includes('date') || key.includes('_at') ? formatDate(value) :
                       key.includes('amount') || key.includes('price') ? `₱${parseFloat(value || 0).toFixed(2)}` :
                       value.toString()}
                    </DetailValue>
                  </DetailItem>
                );
              })}
            </DetailGrid>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default SearchPage;