import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faClock,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faSearch,
  faBox
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

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  
  &:hover {
    background: ${props => props.active ? '#667eea' : '#f5f5f5'};
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  position: relative;
`;

const SearchInput = styled.input`
  flex: 1;
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

const DeliveryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DeliveryItem = styled.div`
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DeliveryHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderId = styled.div`
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'scheduled': return '#e3f2fd';
      case 'in-transit': return '#fff3e0';
      case 'delivered': return '#e8f5e8';
      case 'delayed': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'scheduled': return '#1976d2';
      case 'in-transit': return '#f57c00';
      case 'delivered': return '#388e3c';
      case 'delayed': return '#d32f2f';
      default: return '#666';
    }
  }};
`;

const DeliveryDetails = styled.div`
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
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.type === 'warning' ? '#fff3cd' : '#d4edda'};
  border-radius: 6px;
  margin-bottom: 0.75rem;
  color: ${props => props.type === 'warning' ? '#856404' : '#155724'};
  font-size: 0.9rem;
`;

const ScheduleButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const DeliveryPage = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample delivery data
  const deliveries = [
    {
      id: 'ORD-001',
      customer: 'John Smith',
      address: '123 Main St, Metro Manila',
      scheduledDate: '2024-06-18',
      scheduledTime: '10:00 AM - 12:00 PM',
      status: 'scheduled',
      items: 2,
      priority: 'normal'
    },
    {
      id: 'ORD-002',
      customer: 'Maria Garcia',
      address: '456 Oak Ave, Quezon City',
      scheduledDate: '2024-06-18',
      scheduledTime: '2:00 PM - 4:00 PM',
      status: 'in-transit',
      items: 1,
      priority: 'urgent'
    },
    {
      id: 'ORD-003',
      customer: 'Robert Johnson',
      address: '789 Pine Rd, Makati',
      scheduledDate: '2024-06-17',
      scheduledTime: '9:00 AM - 11:00 AM',
      status: 'delivered',
      items: 3,
      priority: 'normal'
    },
    {
      id: 'ORD-004',
      customer: 'Lisa Chen',
      address: '321 Elm St, Taguig',
      scheduledDate: '2024-06-17',
      scheduledTime: '3:00 PM - 5:00 PM',
      status: 'delayed',
      items: 1,
      priority: 'urgent'
    }
  ];

  const stats = {
    scheduled: deliveries.filter(d => d.status === 'scheduled').length,
    inTransit: deliveries.filter(d => d.status === 'in-transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    delayed: deliveries.filter(d => d.status === 'delayed').length
  };

  const filteredDeliveries = deliveries.filter(delivery => 
    delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>
          <FontAwesomeIcon icon={faTruck} style={{ marginRight: '1rem' }} />
          Delivery Management
        </Title>
        <Subtitle>Delivery Scheduling, Monitoring & Calendar Management</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard color="#2196f3">
          <StatNumber color="#2196f3">{stats.scheduled}</StatNumber>
          <StatLabel>Scheduled Today</StatLabel>
        </StatCard>
        <StatCard color="#ff9800">
          <StatNumber color="#ff9800">{stats.inTransit}</StatNumber>
          <StatLabel>In Transit</StatLabel>
        </StatCard>
        <StatCard color="#4caf50">
          <StatNumber color="#4caf50">{stats.delivered}</StatNumber>
          <StatLabel>Delivered</StatLabel>
        </StatCard>
        <StatCard color="#f44336">
          <StatNumber color="#f44336">{stats.delayed}</StatNumber>
          <StatLabel>Delayed</StatLabel>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <MainContent>
          <TabContainer>
            <Tab active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '0.5rem' }} />
              Delivery Schedule
            </Tab>
            <Tab active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')}>
              <FontAwesomeIcon icon={faTruck} style={{ marginRight: '0.5rem' }} />
              Live Monitoring
            </Tab>
            <Tab active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '0.5rem' }} />
              Calendar View
            </Tab>
          </TabContainer>

          <TabContent>
            {activeTab === 'schedule' && (
              <>
                <SearchBar>
                  <SearchIcon>
                    <FontAwesomeIcon icon={faSearch} />
                  </SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="Search by order ID, customer, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchBar>

                <DeliveryList>
                  {filteredDeliveries.map(delivery => (
                    <DeliveryItem key={delivery.id}>
                      <DeliveryHeader>
                        <OrderId>Order {delivery.id}</OrderId>
                        <StatusBadge status={delivery.status}>{delivery.status}</StatusBadge>
                      </DeliveryHeader>
                      
                      <DeliveryDetails>
                        <DetailItem>
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <div>
                            <strong>{delivery.customer}</strong><br />
                            {delivery.address}
                          </div>
                        </DetailItem>
                        <DetailItem>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <div>
                            <strong>{delivery.scheduledDate}</strong><br />
                            {delivery.scheduledTime}
                          </div>
                        </DetailItem>
                        <DetailItem>
                          <FontAwesomeIcon icon={faBox} />
                          <div>
                            <strong>{delivery.items} items</strong><br />
                            Priority: {delivery.priority}
                          </div>
                        </DetailItem>
                      </DeliveryDetails>
                    </DeliveryItem>
                  ))}
                </DeliveryList>
              </>
            )}

            {activeTab === 'monitor' && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <FontAwesomeIcon icon={faTruck} size="3x" style={{ marginBottom: '1rem' }} />
                <h3>Live Delivery Monitoring</h3>
                <p>Real-time tracking and monitoring system coming soon...</p>
                <p>Features will include:</p>
                <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '1rem auto' }}>
                  <li>GPS tracking of delivery vehicles</li>
                  <li>Real-time status updates</li>
                  <li>Delivery route optimization</li>
                  <li>Customer notifications</li>
                </ul>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <FontAwesomeIcon icon={faCalendarAlt} size="3x" style={{ marginBottom: '1rem' }} />
                <h3>Calendar Monitoring</h3>
                <p>Interactive delivery calendar coming soon...</p>
                <p>Features will include:</p>
                <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '1rem auto' }}>
                  <li>Monthly delivery overview</li>
                  <li>Schedule conflict detection</li>
                  <li>Capacity planning</li>
                  <li>Holiday and event scheduling</li>
                </ul>
              </div>
            )}
          </TabContent>
        </MainContent>

        <Sidebar>
          <SidebarCard>
            <SidebarTitle>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '0.5rem' }} />
              Delivery Alerts
            </SidebarTitle>
            
            <AlertItem type="warning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>Order ORD-004 is delayed due to traffic</span>
            </AlertItem>
            
            <AlertItem type="success">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>3 deliveries completed successfully today</span>
            </AlertItem>
            
            <AlertItem type="info">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>New delivery requests require scheduling</span>
            </AlertItem>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Quick Actions</SidebarTitle>
            <ScheduleButton style={{ marginBottom: '0.75rem' }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '0.5rem' }} />
              Schedule New Delivery
            </ScheduleButton>
            <ScheduleButton style={{ marginBottom: '0.75rem' }}>
              <FontAwesomeIcon icon={faTruck} style={{ marginRight: '0.5rem' }} />
              Update Delivery Status
            </ScheduleButton>
            <ScheduleButton>
              <FontAwesomeIcon icon={faClock} style={{ marginRight: '0.5rem' }} />
              Delay Delivery Update
            </ScheduleButton>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Today's Summary</SidebarTitle>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Delivery Time Window:</strong> 8:00 AM - 6:00 PM
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Active Drivers:</strong> 5 drivers
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Coverage Areas:</strong> Metro Manila, Quezon City, Makati, Taguig
              </div>
              <div>
                <strong>Weather:</strong> Partly cloudy, light traffic
              </div>
            </div>
          </SidebarCard>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
};

export default DeliveryPage;
