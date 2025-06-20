import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faBox, 
  faUsers, 
  faReceipt,
  faSortAlphaDown,
  faSortAlphaUp,
  faEye,
  faEdit,
  faUser,
  faShoppingCart,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  width: 100%;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
  background: #fafafa;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 200;
  color: #000;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  font-weight: 300;
`;

const SearchControls = styled.div`
  background: #fff;
  padding: 2.5rem;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.2rem 1.2rem 1.2rem 3.5rem;
  border: 1px solid #ddd;
  border-radius: 0;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s ease;
  font-weight: 300;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
  
  &::placeholder {
    color: #aaa;
    font-weight: 300;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.1rem;
`;

const FilterSelect = styled.select`
  padding: 1.2rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0;
  background: #fff;
  font-size: 1rem;
  min-width: 160px;
  color: #333;
  font-weight: 300;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const SortButton = styled.button`
  padding: 1.2rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 0;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  color: #333;
  font-weight: 300;
  font-size: 0.95rem;
  
  &:hover {
    background: #000;
    border-color: #000;
    color: #fff;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const FilterTab = styled.button`
  padding: 0.8rem 1.2rem;
  border: none;
  background: ${props => props.active ? '#000' : '#f5f5f5'};
  color: ${props => props.active ? '#fff' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${props => props.active ? '#000' : '#000'};
    color: #fff;
  }
`;

const ResultsContainer = styled.div`
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const ResultsHeader = styled.div`
  padding: 1.5rem 2rem;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultsCount = styled.div`
  font-weight: 400;
  color: #666;
  font-size: 0.95rem;
`;

const ResultsList = styled.div`
  padding: 0;
`;

const ResultItem = styled.div`
  padding: 2.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  background: #fff;
  
  &:hover {
    background: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 400;
  color: #000;
  font-size: 1.2rem;
  letter-spacing: -0.3px;
`;

const ItemType = styled.span`
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: #000;
  color: #fff;
`;

const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  
  strong {
    color: #333;
    font-weight: 500;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    opacity: 0.8;
  }
  
  span {
    color: #000;
    font-weight: 300;
    font-size: 1rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  padding: 0.8rem 1.2rem;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  color: #666;
  font-weight: 300;
  
  &:hover {
    background: #000;
    border-color: #000;
    color: #fff;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: #999;
  
  h3 {
    color: #666;
    font-weight: 300;
    margin: 1.5rem 0 0.5rem 0;
    font-size: 1.5rem;
  }
  
  p {
    color: #aaa;
    font-size: 1rem;
    font-weight: 300;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5rem 2rem;
  color: #999;
  
  .spinner {
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
    font-size: 2rem;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  span {
    font-weight: 300;
    font-size: 1rem;
  }
`;

const ErrorContainer = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  padding: 3rem 2rem;
  margin: 1rem 0;
  text-align: center;
  color: #666;
  
  h3 {
    margin: 1rem 0;
    color: #333;
    font-weight: 400;
  }
  
  p {
    margin-bottom: 2rem;
    font-weight: 300;
  }
`;

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Fetch data from API
  useEffect(() => {
    fetchAllData();
  }, []);
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    
    try {      // Fetch products from the enhanced maintenance API endpoint
      console.log('🔄 Fetching products from enhanced maintenance API...');
      const productsResponse = await fetch('http://localhost:3001/api/enhanced-maintenance/products', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (productsResponse.ok) {
        const productsArray = await productsResponse.json();
        console.log('📦 Products data received:', productsArray);
        
        const productsData = productsArray.map(product => ({
          id: `PROD-${product.id}`,
          type: 'product',
          name: product.productname,
          category: product.product_type || 'Clothing',
          price: `₱${parseFloat(product.productprice || 0).toFixed(2)}`,
          stock: product.total_stock || product.productquantity || 0,
          status: product.productstatus || 'active',
          description: product.productdescription || '',
          image: product.productimage || (product.images && product.images[0]) || '',
          images: product.images || [],
          lastUpdated: product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A',
          // Additional product details from your database
          colors: product.colors || [],
          sizes: product.sizes || [],
          sizeColorVariants: product.sizeColorVariants || []
        }));
        setProducts(productsData);
        console.log('✅ Products processed:', productsData.length);
      } else {
        console.error('❌ Failed to fetch products:', productsResponse.statusText);
        setProducts([]);
      }      // Fetch transactions - let's try to find the correct endpoint
      let transactionsData = []; // Define at the right scope
      try {
        console.log('🔄 Fetching transactions...');
        // Try different possible transaction endpoints
        
        // Try orders/transactions endpoint first
        try {
          const ordersResponse = await fetch('http://localhost:3001/api/orders', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (ordersResponse.ok) {
            const ordersArray = await ordersResponse.json();
            console.log('📦 Orders data received:', ordersArray);
            
            transactionsData = ordersArray.map(order => ({
              id: `TXN-${order.id}`,
              type: 'transaction',
              orderId: `ORD-${order.id}`,
              customerName: order.customer_name || `${order.firstname || ''} ${order.lastname || ''}`.trim() || 'Unknown Customer',
              customerId: order.customer_id || order.user_id,
              amount: `₱${parseFloat(order.total_amount || order.total || 0).toFixed(2)}`,
              status: order.status || 'pending',
              date: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A',
              items: order.items ? (Array.isArray(order.items) ? order.items.length : 1) : 1,
              paymentMethod: order.payment_method || 'N/A',
              details: order.notes || order.details || ''
            }));
          }
        } catch (orderError) {
          console.log('📋 Orders endpoint not available, trying transactions...');
          
          // Try direct transactions endpoint
          const transResponse = await fetch('http://localhost:3001/api/transactions', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (transResponse.ok) {
            const transArray = await transResponse.json();
            console.log('📦 Transactions data received:', transArray);
            
            // Handle nested response structure
            const transactions = transArray.transactions || transArray || [];
            transactionsData = transactions.map(transaction => ({
              id: `TXN-${transaction.id}`,
              type: 'transaction',
              orderId: `ORD-${transaction.order_id || transaction.id}`,
              customerName: transaction.customer_name || 'Unknown Customer',
              customerId: transaction.customer_id,
              amount: `₱${parseFloat(transaction.total_amount || transaction.amount || 0).toFixed(2)}`,
              status: transaction.status || 'pending',
              date: transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A',
              items: transaction.items_count || 1,
              paymentMethod: transaction.payment_method || 'N/A',
              details: transaction.transaction_details || ''
            }));
          }
        }
        
        setTransactions(transactionsData);
        console.log('✅ Transactions processed:', transactionsData.length);
        
      } catch (transactionError) {
        console.warn('⚠️ Could not fetch transactions:', transactionError);
        setTransactions([]);
      }

      // Fetch customers/users from the correct endpoint
      try {
        console.log('🔄 Fetching users...');
        const usersResponse = await fetch('http://localhost:3001/api/users', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });        if (usersResponse.ok) {
          const usersArray = await usersResponse.json();
          console.log('📦 Users data received:', usersArray);
          
          // Handle nested response structure
          const users = usersArray.users || usersArray || [];
          const customersData = users.map(user => ({
            id: `CUST-${user.id}`,
            type: 'customer',
            name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'Unknown',
            email: user.email || 'N/A',
            phone: user.phone || 'N/A',
            address: user.address || 'N/A',
            status: user.status || 'active',
            joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
            totalOrders: 0, // Will be updated below
            totalSpent: '₱0.00', // Will be updated below
            userId: user.id // Keep original ID for matching
          }));
          
          // Calculate customer transaction stats
          const customersWithStats = customersData.map(customer => {
            const customerTransactions = transactionsData.filter(
              t => t.customerId === customer.userId || t.customerId === `${customer.userId}`
            );
            const totalSpent = customerTransactions.reduce((sum, t) => {
              const amount = parseFloat(t.amount.replace('₱', '').replace(',', '')) || 0;
              return sum + amount;
            }, 0);
            
            return {
              ...customer,
              totalOrders: customerTransactions.length,
              totalSpent: `₱${totalSpent.toFixed(2)}`
            };
          });
          
          setCustomers(customersWithStats);
          console.log('✅ Customers processed:', customersWithStats.length);
        } else {
          console.error('❌ Failed to fetch users:', usersResponse.statusText);
          setCustomers([]);
        }
      } catch (customerError) {
        console.warn('⚠️ Could not fetch customers:', customerError);
        setCustomers([]);
      }} catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      
      // Set empty arrays as fallback
      setProducts([]);
      setTransactions([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Combine all data
  const allData = [...products, ...transactions, ...customers];
  // Filter and sort data
  const filteredData = allData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    
    // Enhanced search that includes more product fields
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchLower) ||
      item.id.toLowerCase().includes(searchLower) ||
      item.customerName?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.orderId?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.details?.toLowerCase().includes(searchLower) ||
      // Search in product colors
      (item.colors && Array.isArray(item.colors) && 
        item.colors.some(color => color.toLowerCase().includes(searchLower))) ||
      // Search in product sizes  
      (item.sizes && Array.isArray(item.sizes) && 
        item.sizes.some(size => size.size?.toLowerCase().includes(searchLower))) ||
      // Search in size-color variants
      (item.sizeColorVariants && Array.isArray(item.sizeColorVariants) && 
        item.sizeColorVariants.some(variant => 
          variant.size?.toLowerCase().includes(searchLower) ||
          (variant.colorStocks && variant.colorStocks.some(cs => 
            cs.color?.toLowerCase().includes(searchLower)
          ))
        )) ||
      // Search in product status
      item.status?.toLowerCase().includes(searchLower) ||
      // Search in transaction payment method
      item.paymentMethod?.toLowerCase().includes(searchLower);
    
    const matchesFilter = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const nameA = a.name || a.customerName || a.orderId || '';
    const nameB = b.name || b.customerName || b.orderId || '';
    
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  const renderResultItem = (item) => {
    switch (item.type) {
      case 'product':
        return (
          <ResultItem key={item.id}>
            <ItemHeader>
              <ItemTitle>
                <FontAwesomeIcon icon={faBox} />
                {item.name}
              </ItemTitle>
              <ItemType type={item.type}>Product</ItemType>
            </ItemHeader>            <ItemDetails>
              <DetailItem>
                <strong>Product ID</strong>
                <span>{item.id}</span>
              </DetailItem>
              <DetailItem>
                <strong>Category</strong>
                <span>{item.category}</span>
              </DetailItem>
              <DetailItem>
                <strong>Price</strong>
                <span>{item.price}</span>
              </DetailItem>
              <DetailItem>
                <strong>Stock</strong>
                <span>{item.stock} units</span>
              </DetailItem>
              <DetailItem>
                <strong>Status</strong>
                <span style={{ 
                  textTransform: 'capitalize',
                  color: item.status === 'active' ? '#28a745' : 
                         item.status === 'archived' ? '#ffc107' : '#6c757d'
                }}>
                  {item.status}
                </span>
              </DetailItem>
              <DetailItem>
                <strong>Last Updated</strong>
                <span>{item.lastUpdated}</span>
              </DetailItem>
              {/* Show available colors */}
              {item.sizeColorVariants && item.sizeColorVariants.length > 0 && (
                <DetailItem style={{ gridColumn: '1 / -1' }}>
                  <strong>Available Colors & Sizes</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {item.sizeColorVariants.map((variant, index) => (
                      <div key={index} style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        border: '1px solid #e9ecef'
                      }}>
                        <strong>{variant.size}:</strong> {
                          variant.colorStocks?.map(cs => 
                            `${cs.color} (${cs.stock})`
                          ).join(', ') || 'No colors'
                        }
                      </div>
                    ))}
                  </div>
                </DetailItem>
              )}
              {/* Show product image if available */}
              {item.image && (
                <DetailItem style={{ gridColumn: '1 / -1' }}>
                  <strong>Product Image</strong>
                  <img 
                    src={`http://localhost:3001/uploads/${item.image}`} 
                    alt={item.name}
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginTop: '0.5rem',
                      border: '1px solid #e9ecef'
                    }}
                  />
                </DetailItem>
              )}
            </ItemDetails>
            {item.description && (
              <ItemDetails style={{ marginTop: '1rem' }}>
                <DetailItem style={{ gridColumn: '1 / -1' }}>
                  <strong>Description</strong>
                  <span>{item.description}</span>
                </DetailItem>
              </ItemDetails>
            )}
            <ActionButtons>
              <ActionButton>
                <FontAwesomeIcon icon={faEye} />
                View Details
              </ActionButton>
              <ActionButton>
                <FontAwesomeIcon icon={faEdit} />
                Edit Product
              </ActionButton>
            </ActionButtons>
          </ResultItem>
        );
      
      case 'customer':
        return (
          <ResultItem key={item.id}>
            <ItemHeader>
              <ItemTitle>
                <FontAwesomeIcon icon={faUser} />
                {item.name}
              </ItemTitle>
              <ItemType type={item.type}>Customer</ItemType>
            </ItemHeader>            <ItemDetails>
              <DetailItem>
                <strong>Customer ID</strong>
                <span>{item.id}</span>
              </DetailItem>
              <DetailItem>
                <strong>Email</strong>
                <span>{item.email}</span>
              </DetailItem>
              <DetailItem>
                <strong>Phone</strong>
                <span>{item.phone}</span>
              </DetailItem>
              <DetailItem>
                <strong>Address</strong>
                <span>{item.address}</span>
              </DetailItem>
              <DetailItem>
                <strong>Status</strong>
                <span>{item.status}</span>
              </DetailItem>
              <DetailItem>
                <strong>Join Date</strong>
                <span>{item.joinDate}</span>
              </DetailItem>
            </ItemDetails>
            <ActionButtons>
              <ActionButton>
                <FontAwesomeIcon icon={faEye} />
                View Profile
              </ActionButton>
              <ActionButton>
                <FontAwesomeIcon icon={faShoppingCart} />
                View Orders
              </ActionButton>
            </ActionButtons>
          </ResultItem>
        );
      
      case 'transaction':
        return (
          <ResultItem key={item.id}>
            <ItemHeader>
              <ItemTitle>
                <FontAwesomeIcon icon={faReceipt} />
                {item.orderId}
              </ItemTitle>
              <ItemType type={item.type}>Transaction</ItemType>
            </ItemHeader>            <ItemDetails>
              <DetailItem>
                <strong>Transaction ID</strong>
                <span>{item.id}</span>
              </DetailItem>
              <DetailItem>
                <strong>Customer Name</strong>
                <span>{item.customerName}</span>
              </DetailItem>
              <DetailItem>
                <strong>Amount</strong>
                <span>{item.amount}</span>
              </DetailItem>
              <DetailItem>
                <strong>Status</strong>
                <span>{item.status}</span>
              </DetailItem>
              <DetailItem>
                <strong>Date</strong>
                <span>{item.date}</span>
              </DetailItem>
              <DetailItem>
                <strong>Items Count</strong>
                <span>{item.items}</span>
              </DetailItem>
            </ItemDetails>
            {(item.paymentMethod !== 'N/A' || item.details) && (
              <ItemDetails style={{ marginTop: '1rem' }}>
                {item.paymentMethod !== 'N/A' && (
                  <DetailItem>
                    <strong>Payment Method</strong>
                    <span>{item.paymentMethod}</span>
                  </DetailItem>
                )}
                {item.details && (
                  <DetailItem style={{ gridColumn: '1 / -1' }}>
                    <strong>Transaction Details</strong>
                    <span>{item.details}</span>
                  </DetailItem>
                )}
              </ItemDetails>
            )}
            <ActionButtons>
              <ActionButton>
                <FontAwesomeIcon icon={faEye} />
                View Transaction
              </ActionButton>
              <ActionButton>
                <FontAwesomeIcon icon={faReceipt} />
                View Receipt
              </ActionButton>
            </ActionButtons>
          </ResultItem>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '1rem' }} />
            Search
          </Title>
          <Subtitle>Search products, transactions, and customers</Subtitle>
        </Header>        <LoadingContainer>
          <FontAwesomeIcon icon={faSpinner} className="spinner" />
          <span>Loading data...</span>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '1rem' }} />
            Search
          </Title>
          <Subtitle>Search products, transactions, and customers</Subtitle>
        </Header>
        <ErrorContainer>
          <FontAwesomeIcon icon={faExclamationTriangle} size="2x" style={{ marginBottom: '1rem' }} />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <ActionButton onClick={fetchAllData} style={{ marginTop: '1rem' }}>
            Retry
          </ActionButton>
        </ErrorContainer>
      </Container>
    );
  }
  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '1rem' }} />
            Search
          </Title>
          <Subtitle>Search products, transactions, and customers by ID, name, or details</Subtitle>
        </Header>

      <SearchControls>
        <SearchRow>
          <SearchInputContainer>
            <SearchIcon>
              <FontAwesomeIcon icon={faSearch} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search by name, ID, email, colors, sizes, categories, or any detail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputContainer>
          
          <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="customer">Customers</option>
            <option value="transaction">Transactions</option>
          </FilterSelect>
          
          <SortButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortAlphaDown : faSortAlphaUp} />
            Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </SortButton>
        </SearchRow>

        <FilterTabs>
          <FilterTab active={filterType === 'all'} onClick={() => setFilterType('all')}>
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '0.5rem' }} />
            All ({allData.length})
          </FilterTab>
          <FilterTab active={filterType === 'product'} onClick={() => setFilterType('product')}>
            <FontAwesomeIcon icon={faBox} style={{ marginRight: '0.5rem' }} />
            Products ({products.length})
          </FilterTab>
          <FilterTab active={filterType === 'customer'} onClick={() => setFilterType('customer')}>
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: '0.5rem' }} />
            Customers ({customers.length})
          </FilterTab>
          <FilterTab active={filterType === 'transaction'} onClick={() => setFilterType('transaction')}>
            <FontAwesomeIcon icon={faReceipt} style={{ marginRight: '0.5rem' }} />
            Transactions ({transactions.length})
          </FilterTab>
        </FilterTabs>
      </SearchControls>

      <ResultsContainer>
        <ResultsHeader>
          <ResultsCount>
            {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} found
          </ResultsCount>
        </ResultsHeader>
        
        <ResultsList>
          {filteredData.length > 0 ? (
            filteredData.map(renderResultItem)
          ) : (
            <NoResults>
              <FontAwesomeIcon icon={faSearch} size="3x" style={{ marginBottom: '1rem', color: '#cccccc' }} />
              <h3>No results found</h3>
              <p>Try adjusting your search terms or filters</p>
            </NoResults>
          )}        </ResultsList>
      </ResultsContainer>
    </Container>
    </PageWrapper>
  );
};

export default SearchPage;
