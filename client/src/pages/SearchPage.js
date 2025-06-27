import React, { useState, useEffect } from 'react';
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
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons';

// Styled Components - Clean and Modern Design
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
  font-weight: 400;
`;

const SearchContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &::placeholder {
    color: #6c757d;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0056b3, #004085);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TabsHeader = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1.5rem 2rem;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#007bff' : '#6c757d'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid ${props => props.$active ? '#007bff' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$active ? 'white' : '#e9ecef'};
    color: ${props => props.$active ? '#007bff' : '#495057'};
  }
`;

const Tab = ({ active, children, ...props }) => (
  <TabButton $active={active} {...props}>
    {children}
  </TabButton>
);

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1.2rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e9ecef;
  
  &:first-child {
    padding-left: 2rem;
  }
  
  &:last-child {
    padding-right: 2rem;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #495057;
  vertical-align: middle;
  
  &:first-child {
    padding-left: 2rem;
    font-weight: 500;
  }
  
  &:last-child {
    padding-right: 2rem;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    background: linear-gradient(135deg, #20c997, #17a2b8);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: #6c757d;
  
  h3 {
    margin-bottom: 1rem;
    color: #495057;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
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
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    color: #495057;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  word-break: break-word;
`;

const SearchPage = () => {
  // State management - All data comes from database only (no mock/sample data)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]); // Only real products from products table
  const [transactions, setTransactions] = useState([]); // Only real orders from orders table
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

      // Fetch products ONLY from the database products table - using basic endpoint
      let productsData = null;
      
      try {
        console.log('Attempting to fetch products from database (basic endpoint)...');
        const productsResponse = await fetch('http://localhost:5000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Products API response status:', productsResponse.status);
        
        if (productsResponse.ok) {
          productsData = await productsResponse.json();
          console.log('RAW products response from database:', productsData);
        } else {
          const errorText = await productsResponse.text();
          console.error('Products API failed:', productsResponse.status, errorText);
          throw new Error(`Database products API failed with status ${productsResponse.status}`);
        }
      } catch (fetchError) {
        console.error('Network error fetching products from database:', fetchError);
        throw new Error('Could not connect to database products API');
      }

      if (productsData) {
        // Extract products from database response - use the correct API structure
        let databaseProducts = [];
        
        if (productsData.success && Array.isArray(productsData.data)) {
          // Standard API response format: { success: true, data: [...] }
          databaseProducts = productsData.data;
        } else if (productsData.success && Array.isArray(productsData.products)) {
          // Alternative format: { success: true, products: [...] }
          databaseProducts = productsData.products;
        } else if (Array.isArray(productsData.products)) {
          // Alternative format: { products: [...] }
          databaseProducts = productsData.products;
        } else if (Array.isArray(productsData)) {
          // Direct array format
          databaseProducts = productsData;
        } else {
          console.error('Unexpected products data structure:', productsData);
          console.error('Available keys:', Object.keys(productsData || {}));
          databaseProducts = [];
        }
        
        console.log('FINAL database products being set:', databaseProducts);
        console.log('Number of database products:', databaseProducts.length);
        
        // Log first product to see its structure
        if (databaseProducts.length > 0) {
          console.log('First product structure:', databaseProducts[0]);
        }
        
        setProducts(databaseProducts);
      } else {
        console.error('No products data received from database');
        setProducts([]);
      }

      // Fetch confirmed orders from the database orders table - using test endpoint
      try {
        console.log('Fetching orders with token:', token ? 'Token present' : 'No token');
        
        // Use the confirmed-test endpoint which doesn't require admin access
        const ordersResponse = await fetch('http://localhost:5000/api/orders/confirmed-test', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Orders API response status:', ordersResponse.status);
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          console.log('Database orders data:', ordersData); // Debug log
          
          // Extract orders array from confirmed-test endpoint
          let allOrders = [];
          if (ordersData && Array.isArray(ordersData.data)) {
            allOrders = ordersData.data;
          } else if (ordersData && Array.isArray(ordersData.orders)) {
            allOrders = ordersData.orders;
          } else if (Array.isArray(ordersData)) {
            allOrders = ordersData;
          } else {
            console.warn('Orders data is not in expected array format:', ordersData);
            console.warn('Available keys:', Object.keys(ordersData || {}));
            allOrders = [];
          }
          
          console.log('Extracted orders array:', allOrders);
          console.log('Number of orders found:', allOrders.length);
          
          // Since this endpoint already returns confirmed orders, we don't need to filter again
          // But let's double-check the status just in case
          const confirmedOrders = allOrders.filter(order => 
            order && (
              order.status === 'confirmed' || 
              order.delivery_status === 'confirmed' ||
              order.status === 'completed' ||
              order.delivery_status === 'completed' ||
              !order.status // If no status is set, assume it's confirmed since it came from confirmed endpoint
            )
          );
          
          console.log('Confirmed orders found:', confirmedOrders.length);
          
          const databaseTransactions = confirmedOrders.map(order => ({
            id: order.id,
            customer_name: order.customer_name || order.customerName || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer',
            amount: order.total_amount || order.amount || 0,
            transaction_type: 'Transaction',
            status: order.status || order.delivery_status || 'confirmed',
            created_at: order.created_at || order.order_date,
            order_number: order.order_number,
            transaction_number: order.order_number || order.transaction_id,
            email: order.customer_email || order.user_email || order.email,
            phone: order.contact_phone || order.phone
          }));
          
          console.log('Setting confirmed transactions from database only:', databaseTransactions);
          setTransactions(databaseTransactions);
        } else {
          console.warn('Orders API failed with status:', ordersResponse.status);
          const errorText = await ordersResponse.text();
          console.warn('Orders API error response:', errorText);
          
          // Try the general test endpoint as fallback
          try {
            console.log('Trying general test endpoint as fallback...');
            const testResponse = await fetch('http://localhost:5000/api/orders/test-list', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (testResponse.ok) {
              const testData = await testResponse.json();
              console.log('Test endpoint data:', testData);
              
              let allOrders = [];
              if (testData && Array.isArray(testData.data)) {
                allOrders = testData.data;
              }
              
              const confirmedOrders = allOrders.filter(order => 
                order && (
                  order.status === 'confirmed' || 
                  order.delivery_status === 'confirmed' ||
                  order.status === 'completed' ||
                  order.delivery_status === 'completed'
                )
              );
              
              const databaseTransactions = confirmedOrders.map(order => ({
                id: order.id,
                customer_name: order.customer_name || order.customerName || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer',
                amount: order.total_amount || order.amount || 0,
                transaction_type: 'Transaction',
                status: order.status || order.delivery_status || 'confirmed',
                created_at: order.created_at || order.order_date,
                order_number: order.order_number,
                transaction_number: order.order_number || order.transaction_id,
                email: order.customer_email || order.user_email || order.email,
                phone: order.contact_phone || order.phone
              }));
              
              console.log('Setting transactions from test endpoint:', databaseTransactions);
              setTransactions(databaseTransactions);
            } else {
              console.warn('Test endpoint also failed with status:', testResponse.status);
              const testErrorText = await testResponse.text();
              console.warn('Test endpoint error response:', testErrorText);
              setTransactions([]); // No orders available
            }
          } catch (testError) {
            console.error('Test endpoint error:', testError);
            setTransactions([]); // No orders available
          }
        }
      } catch (ordersError) {
        console.error('Error fetching confirmed orders:', ordersError);
        setTransactions([]); // No orders available
        // Don't throw error for orders as it's less critical than products
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.message.includes('Authentication required')) {
        setError('Please log in to view products and orders.');
      } else if (err.message.includes('Could not connect to database')) {
        setError('Cannot connect to database. Please ensure the server is running and try again.');
      } else if (err.message.includes('Database products API failed')) {
        setError('Database products service is unavailable. Please check the backend server.');
      } else {
        setError(`Failed to fetch data: ${err.message}. Please refresh the page and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search query
  const filteredProducts = products.filter(product => 
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

  const filteredTransactions = transactions.filter(transaction => 
    !searchQuery || 
    (transaction.customer_name && transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (transaction.transaction_type && transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (transaction.order_number && transaction.order_number.toString().includes(searchQuery)) ||
    (transaction.status && transaction.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (transaction.id && transaction.id.toString().includes(searchQuery)) ||
    (transaction.email && transaction.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>🔍 Search Products & Transactions</Title>
          <Subtitle>Search and browse all products and transaction records</Subtitle>
        </Header>

        {/* Search Bar */}
        <SearchContainer>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, category, color, size, ID or transactions by customer, type..."
          />
          <SearchButton onClick={() => setSearchQuery('')}>
            <FontAwesomeIcon icon={faTimes} />
            Clear
          </SearchButton>
        </SearchContainer>

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
                  <p>Try adjusting your search criteria</p>
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
                    {filteredProducts.map((product, index) => (
                      <TableRow key={product.id || index}>
                        <TableCell>#{product.id || product.product_id || 'N/A'}</TableCell>
                        <TableCell>{product.productname || product.product_name || product.name || 'N/A'}</TableCell>
                        <TableCell>{product.category || product.product_type || 'N/A'}</TableCell>
                        <TableCell>{product.productcolor || product.product_color || product.color || 'N/A'}</TableCell>
                        <TableCell>{product.productsize || product.product_size || product.size || 'N/A'}</TableCell>
                        <TableCell>₱{parseFloat(product.price || product.product_price || 0).toFixed(2)}</TableCell>
                        <TableCell>{product.stock_quantity || product.total_stock || product.quantity || product.stock || 'N/A'}</TableCell>
                        <TableCell>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: (product.stock_quantity || product.total_stock || product.quantity || 0) > 0 ? '#d4edda' : '#f8d7da',
                            color: (product.stock_quantity || product.total_stock || product.quantity || 0) > 0 ? '#155724' : '#721c24'
                          }}>
                            {(product.stock_quantity || product.total_stock || product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ActionButton onClick={() => handleViewDetails(product)}>
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
                  <p>Try adjusting your search criteria</p>
                </EmptyState>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Transaction ID</TableHeaderCell>
                      <TableHeaderCell>Transaction Number</TableHeaderCell>
                      <TableHeaderCell>Customer</TableHeaderCell>
                      <TableHeaderCell>Amount</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <TableRow key={transaction.id || index}>
                        <TableCell>#{transaction.id}</TableCell>
                        <TableCell>{transaction.order_number || transaction.transaction_number || 'N/A'}</TableCell>
                        <TableCell>{transaction.customer_name || 'N/A'}</TableCell>
                        <TableCell>₱{parseFloat(transaction.amount || 0).toFixed(2)}</TableCell>
                        <TableCell>{transaction.transaction_type || 'Order'}</TableCell>
                        <TableCell>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            textTransform: 'capitalize',
                            backgroundColor: 
                              transaction.status === 'confirmed' || transaction.status === 'completed' ? '#d4edda' :
                              transaction.status === 'pending' ? '#fff3cd' :
                              transaction.status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                            color: 
                              transaction.status === 'confirmed' || transaction.status === 'completed' ? '#155724' :
                              transaction.status === 'pending' ? '#856404' :
                              transaction.status === 'cancelled' ? '#721c24' : '#6c757d'
                          }}>
                            {transaction.status || 'pending'}
                          </span>
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