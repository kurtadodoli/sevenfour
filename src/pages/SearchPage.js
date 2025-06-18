import React, { useState } from 'react';
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
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 200px);
  background: #f8f9fa;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 16px;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const SearchControls = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SortButton = styled.button`
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f5f5;
    border-color: #667eea;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#667eea' : '#ddd'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    border-color: #667eea;
    background: ${props => props.active ? '#667eea' : '#f5f5f5'};
  }
`;

const ResultsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ResultsHeader = styled.div`
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultsCount = styled.div`
  font-weight: 600;
  color: #333;
`;

const ResultsList = styled.div`
  padding: 1rem;
`;

const ResultItem = styled.div`
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #333;
`;

const ItemType = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.type) {
      case 'product': return '#e3f2fd';
      case 'customer': return '#e8f5e8';
      case 'transaction': return '#fff3e0';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'product': return '#1976d2';
      case 'customer': return '#388e3c';
      case 'transaction': return '#f57c00';
      default: return '#666';
    }
  }};
`;

const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f5f5;
    border-color: #667eea;
    color: #667eea;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Sample data
  const allData = [
    // Products
    {
      id: 'PROD-001',
      type: 'product',
      name: 'Classic White T-Shirt',
      category: 'T-Shirts',
      price: '₱999.00',
      stock: 25,
      status: 'active',
      lastUpdated: '2024-06-15'
    },
    {
      id: 'PROD-002',
      type: 'product',
      name: 'Black Hoodie',
      category: 'Hoodies',
      price: '₱1,799.00',
      stock: 8,
      status: 'low-stock',
      lastUpdated: '2024-06-14'
    },
    {
      id: 'PROD-003',
      type: 'product',
      name: 'Denim Jacket',
      category: 'Jackets',
      price: '₱2,499.00',
      stock: 0,
      status: 'out-of-stock',
      lastUpdated: '2024-06-13'
    },
    // Customers
    {
      id: 'CUST-001',
      type: 'customer',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+63 912 345 6789',
      totalOrders: 5,
      totalSpent: '₱8,500.00',
      lastOrder: '2024-06-10'
    },
    {
      id: 'CUST-002',
      type: 'customer',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+63 923 456 7890',
      totalOrders: 3,
      totalSpent: '₱4,200.00',
      lastOrder: '2024-06-08'
    },
    // Transactions
    {
      id: 'TXN-001',
      type: 'transaction',
      orderId: 'ORD-001',
      customerName: 'John Smith',
      amount: '₱2,499.00',
      status: 'completed',
      date: '2024-06-10',
      items: 2
    },
    {
      id: 'TXN-002',
      type: 'transaction',
      orderId: 'ORD-002',
      customerName: 'Maria Garcia',
      amount: '₱1,799.00',
      status: 'pending',
      date: '2024-06-12',
      items: 1
    }
  ];

  const filteredData = allData.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            </ItemHeader>
            <ItemDetails>
              <DetailItem>
                <strong>ID:</strong> {item.id}
              </DetailItem>
              <DetailItem>
                <strong>Category:</strong> {item.category}
              </DetailItem>
              <DetailItem>
                <strong>Price:</strong> {item.price}
              </DetailItem>
              <DetailItem>
                <strong>Stock:</strong> {item.stock} units
              </DetailItem>
              <DetailItem>
                <strong>Status:</strong> {item.status}
              </DetailItem>
              <DetailItem>
                <strong>Updated:</strong> {item.lastUpdated}
              </DetailItem>
            </ItemDetails>
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
            </ItemHeader>
            <ItemDetails>
              <DetailItem>
                <strong>ID:</strong> {item.id}
              </DetailItem>
              <DetailItem>
                <strong>Email:</strong> {item.email}
              </DetailItem>
              <DetailItem>
                <strong>Phone:</strong> {item.phone}
              </DetailItem>
              <DetailItem>
                <strong>Total Orders:</strong> {item.totalOrders}
              </DetailItem>
              <DetailItem>
                <strong>Total Spent:</strong> {item.totalSpent}
              </DetailItem>
              <DetailItem>
                <strong>Last Order:</strong> {item.lastOrder}
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
            </ItemHeader>
            <ItemDetails>
              <DetailItem>
                <strong>Transaction ID:</strong> {item.id}
              </DetailItem>
              <DetailItem>
                <strong>Customer:</strong> {item.customerName}
              </DetailItem>
              <DetailItem>
                <strong>Amount:</strong> {item.amount}
              </DetailItem>
              <DetailItem>
                <strong>Status:</strong> {item.status}
              </DetailItem>
              <DetailItem>
                <strong>Date:</strong> {item.date}
              </DetailItem>
              <DetailItem>
                <strong>Items:</strong> {item.items}
              </DetailItem>
            </ItemDetails>
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

  return (
    <Container>
      <Header>
        <Title>
          <FontAwesomeIcon icon={faSearch} style={{ marginRight: '1rem' }} />
          Advanced Search
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
              placeholder="Search by ID, name, email, or any detail..."
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
            Products ({allData.filter(item => item.type === 'product').length})
          </FilterTab>
          <FilterTab active={filterType === 'customer'} onClick={() => setFilterType('customer')}>
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: '0.5rem' }} />
            Customers ({allData.filter(item => item.type === 'customer').length})
          </FilterTab>
          <FilterTab active={filterType === 'transaction'} onClick={() => setFilterType('transaction')}>
            <FontAwesomeIcon icon={faReceipt} style={{ marginRight: '0.5rem' }} />
            Transactions ({allData.filter(item => item.type === 'transaction').length})
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
              <FontAwesomeIcon icon={faSearch} size="3x" style={{ marginBottom: '1rem', color: '#ccc' }} />
              <h3>No results found</h3>
              <p>Try adjusting your search terms or filters</p>
            </NoResults>
          )}
        </ResultsList>
      </ResultsContainer>
    </Container>
  );
};

export default SearchPage;
