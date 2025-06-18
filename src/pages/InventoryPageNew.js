import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxes, 
  faExclamationTriangle, 
  faCheckCircle, 
  faTimesCircle,
  faSearch,
  faBell,
  faEdit,
  faPlus,
  faChartLine
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#667eea'};
  position: relative;
  
  ${props => props.critical && `
    animation: pulse 2s infinite;
    border-left-color: #ff4444;
    
    @keyframes pulse {
      0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
      50% { box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3); }
      100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
    }
  `}
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || '#333'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AlertBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ControlsPanel = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
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
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  background: ${props => props.primary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.primary ? 'white' : '#666'};
  border: 1px solid ${props => props.primary ? 'transparent' : '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const InventoryTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #e0e0e0;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
`;

const StockBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.level === 'critical') return '#ffebee';
    if (props.level === 'low') return '#fff3e0';
    if (props.level === 'normal') return '#e8f5e8';
    return '#f5f5f5';
  }};
  color: ${props => {
    if (props.level === 'critical') return '#d32f2f';
    if (props.level === 'low') return '#f57c00';
    if (props.level === 'normal') return '#388e3c';
    return '#666';
  }};
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SidebarTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.level === 'critical' ? '#ffebee' : '#fff3e0'};
  border-radius: 6px;
  margin-bottom: 0.75rem;
  color: ${props => props.level === 'critical' ? '#d32f2f' : '#f57c00'};
  font-size: 0.9rem;
`;

const NotificationSettings = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Sample inventory data
  const inventory = [
    {
      id: 'PROD-001',
      name: 'Classic White T-Shirt',
      category: 'T-Shirts',
      currentStock: 5,
      minStock: 10,
      maxStock: 100,
      price: '₱999.00',
      supplier: 'Local Supplier A',
      lastRestocked: '2024-06-10',
      image: 'https://via.placeholder.com/50x50?text=TS'
    },
    {
      id: 'PROD-002',
      name: 'Black Hoodie',
      category: 'Hoodies',
      currentStock: 8,
      minStock: 5,
      maxStock: 50,
      price: '₱1,799.00',
      supplier: 'Local Supplier B',
      lastRestocked: '2024-06-08',
      image: 'https://via.placeholder.com/50x50?text=HD'
    },
    {
      id: 'PROD-003',
      name: 'Denim Jacket',
      category: 'Jackets',
      currentStock: 0,
      minStock: 3,
      maxStock: 25,
      price: '₱2,499.00',
      supplier: 'Premium Supplier',
      lastRestocked: '2024-05-28',
      image: 'https://via.placeholder.com/50x50?text=JK'
    },
    {
      id: 'PROD-004',
      name: 'Summer Shorts',
      category: 'Shorts',
      currentStock: 25,
      minStock: 15,
      maxStock: 75,
      price: '₱1,299.00',
      supplier: 'Local Supplier A',
      lastRestocked: '2024-06-12',
      image: 'https://via.placeholder.com/50x50?text=SH'
    }
  ];

  const getStockLevel = (current, min) => {
    if (current === 0) return 'critical';
    if (current <= min) return 'low';
    return 'normal';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stockLevel = getStockLevel(item.currentStock, item.minStock);
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'critical' && stockLevel === 'critical') ||
      (filterStatus === 'low' && stockLevel === 'low') ||
      (filterStatus === 'normal' && stockLevel === 'normal');
    
    return matchesSearch && matchesFilter;
  });

  const criticalItems = inventory.filter(item => getStockLevel(item.currentStock, item.minStock) === 'critical');
  const lowStockItems = inventory.filter(item => getStockLevel(item.currentStock, item.minStock) === 'low');
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * parseFloat(item.price.replace('₱', '').replace(',', ''))), 0);

  return (
    <Container>
      <Header>
        <Title>
          <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '1rem' }} />
          Inventory Management
        </Title>
        <Subtitle>Monitor product stocks and manage critical level updates</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard color="#2196f3">
          <StatNumber color="#2196f3">{inventory.length}</StatNumber>
          <StatLabel>Total Products</StatLabel>
        </StatCard>
        <StatCard color="#ff9800">
          <StatNumber color="#ff9800">{lowStockItems.length}</StatNumber>
          <StatLabel>Low Stock Items</StatLabel>
        </StatCard>
        <StatCard color="#f44336" critical={criticalItems.length > 0}>
          {criticalItems.length > 0 && <AlertBadge>!</AlertBadge>}
          <StatNumber color="#f44336">{criticalItems.length}</StatNumber>
          <StatLabel>Critical Stock</StatLabel>
        </StatCard>
        <StatCard color="#4caf50">
          <StatNumber color="#4caf50">₱{totalValue.toLocaleString()}</StatNumber>
          <StatLabel>Inventory Value</StatLabel>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <MainContent>
          <ControlsPanel>
            <SearchBar>
              <SearchIcon>
                <FontAwesomeIcon icon={faSearch} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search products by name, ID, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>
            
            <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Stock Levels</option>
              <option value="critical">Critical Stock</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
            </FilterSelect>
            
            <ActionButton primary>
              <FontAwesomeIcon icon={faPlus} />
              Add Product
            </ActionButton>
          </ControlsPanel>

          <InventoryTable>
            <Table>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Current Stock</Th>
                  <Th>Min Stock</Th>
                  <Th>Status</Th>
                  <Th>Last Restocked</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const stockLevel = getStockLevel(item.currentStock, item.minStock);
                  return (
                    <tr key={item.id}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <ProductImage src={item.image} alt={item.name} />
                          <div>
                            <div style={{ fontWeight: '600' }}>{item.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{item.id}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>{item.category}</Td>
                      <Td>
                        <div style={{ fontWeight: '600' }}>{item.currentStock}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Max: {item.maxStock}</div>
                      </Td>
                      <Td>{item.minStock}</Td>
                      <Td>
                        <StockBadge level={stockLevel}>
                          {stockLevel === 'critical' && <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '0.25rem' }} />}
                          {stockLevel === 'low' && <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '0.25rem' }} />}
                          {stockLevel === 'normal' && <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '0.25rem' }} />}
                          {stockLevel}
                        </StockBadge>
                      </Td>
                      <Td>{item.lastRestocked}</Td>
                      <Td>
                        <ActionButton style={{ marginRight: '0.5rem' }}>
                          <FontAwesomeIcon icon={faEdit} />
                        </ActionButton>
                        <ActionButton>
                          <FontAwesomeIcon icon={faPlus} />
                        </ActionButton>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </InventoryTable>
        </MainContent>

        <Sidebar>
          <SidebarCard>
            <SidebarTitle>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              Stock Alerts
            </SidebarTitle>
            
            {criticalItems.map(item => (
              <AlertItem key={item.id} level="critical">
                <FontAwesomeIcon icon={faTimesCircle} />
                <span><strong>{item.name}</strong> is out of stock!</span>
              </AlertItem>
            ))}
            
            {lowStockItems.map(item => (
              <AlertItem key={item.id} level="low">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span><strong>{item.name}</strong> is low in stock ({item.currentStock} left)</span>
              </AlertItem>
            ))}

            {criticalItems.length === 0 && lowStockItems.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ marginBottom: '0.5rem', color: '#4caf50' }} />
                <div>All products are well stocked!</div>
              </div>
            )}
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>
              <FontAwesomeIcon icon={faBell} />
              Notification Settings
            </SidebarTitle>
            
            <NotificationSettings>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Email alerts for critical stock</span>
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Daily inventory reports</span>
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" />
                  <span>Weekly stock forecasting</span>
                </label>
              </div>
              
              <ActionButton style={{ width: '100%', marginTop: '1rem' }}>
                <FontAwesomeIcon icon={faBell} />
                Update Settings
              </ActionButton>
            </NotificationSettings>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>
              <FontAwesomeIcon icon={faChartLine} />
              Quick Stats
            </SidebarTitle>
            
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Avg. Restock Time:</strong> 5-7 days
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Top Category:</strong> T-Shirts
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Fast Moving:</strong> 8 products
              </div>
              <div>
                <strong>Slow Moving:</strong> 2 products
              </div>
            </div>
          </SidebarCard>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
};

export default InventoryPage;
