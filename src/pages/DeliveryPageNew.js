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
  faBox,
  faRoute,
  faUser,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';

// Styled Components
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
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666666;
  margin: 16px 0 0 0;
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  padding: 32px 24px;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #000000;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: #000000;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 16px;
`;

const StatNumber = styled.div`
  font-size: 2.2rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
  line-height: 1;
`;

const StatLabel = styled.div`
  color: #666666;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const MainSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const DeliveryTracker = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  padding: 32px;
`;

const TrackerHeader = styled.div`
  margin-bottom: 32px;
`;

const TrackerTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: #000000;
  margin: 0 0 16px 0;
`;

const SearchSection = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: 1px solid #e0e0e0;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #000000;
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
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  color: ${props => props.active ? '#000000' : '#666666'};
  border-bottom: 2px solid ${props => props.active ? '#000000' : 'transparent'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #000000;
  }
`;

const DeliveryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DeliveryItem = styled.div`
  padding: 20px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #000000;
    background-color: #fafafa;
  }
`;

const DeliveryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const OrderId = styled.div`
  font-weight: 600;
  color: #000000;
  font-size: 16px;
`;

const DeliveryStatus = styled.span`
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      case 'in_transit':
        return 'background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      case 'delivered':
        return 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'delayed':
        return 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      default:
        return 'background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6;';
    }
  }}
`;

const DeliveryDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

const DetailItem = styled.div`
  font-size: 14px;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 8px;
  
  strong {
    color: #000000;
    font-weight: 500;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const InfoCard = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  padding: 24px;
`;

const InfoCardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  color: #000000;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoListItem = styled.li`
  padding: 8px 0;
  font-size: 14px;
  color: #666666;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  strong {
    color: #000000;
    font-weight: 500;
  }
`;

const ActionButton = styled.button`
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  width: 100%;
  
  &:hover {
    background-color: #333333;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyTitle = styled.h3`
  color: #000000;
  font-weight: 400;
  font-size: 1.4rem;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #666666;
  font-size: 1rem;
  margin-bottom: 24px;
`;

const DeliveryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample delivery data
  const deliveries = [
    {
      id: 'ORD-001',
      customer: 'John Smith',
      address: '123 Main St, Metro Manila',
      phone: '+63 912 345 6789',
      scheduledDate: '2024-06-18',
      scheduledTime: '10:00 AM - 12:00 PM',
      status: 'pending',
      items: 2,
      priority: 'normal',
      driver: 'Miguel Santos'
    },
    {
      id: 'ORD-002',
      customer: 'Maria Garcia',
      address: '456 Oak Ave, Quezon City',
      phone: '+63 917 234 5678',
      scheduledDate: '2024-06-18',
      scheduledTime: '2:00 PM - 4:00 PM',
      status: 'in_transit',
      items: 1,
      priority: 'urgent',
      driver: 'Carlos Rodriguez'
    },
    {
      id: 'ORD-003',
      customer: 'Robert Johnson',
      address: '789 Pine Rd, Makati',
      phone: '+63 905 876 5432',
      scheduledDate: '2024-06-17',
      scheduledTime: '9:00 AM - 11:00 AM',
      status: 'delivered',
      items: 3,
      priority: 'normal',
      driver: 'Elena Cruz'
    },
    {
      id: 'ORD-004',
      customer: 'Lisa Chen',
      address: '321 Elm St, Taguig',
      phone: '+63 920 123 4567',
      scheduledDate: '2024-06-17',
      scheduledTime: '3:00 PM - 5:00 PM',
      status: 'delayed',
      items: 1,
      priority: 'urgent',
      driver: 'Jose Martinez'
    }
  ];

  const stats = [
    {
      icon: faClock,
      number: deliveries.filter(d => d.status === 'pending').length,
      label: 'Pending Deliveries',
      color: '#f39c12'
    },
    {
      icon: faTruck,
      number: deliveries.filter(d => d.status === 'in_transit').length,
      label: 'In Transit',
      color: '#3498db'
    },
    {
      icon: faCheckCircle,
      number: deliveries.filter(d => d.status === 'delivered').length,
      label: 'Delivered Today',
      color: '#27ae60'
    },
    {
      icon: faExclamationTriangle,
      number: deliveries.filter(d => d.status === 'delayed').length,
      label: 'Delayed',
      color: '#e74c3c'
    }
  ];

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && delivery.status === activeTab;
  });

  return (
    <PageContainer>
      <TopBar />
      <ContentWrapper>
        <Header>
          <Title>Delivery Management</Title>
          <Subtitle>
            Track and manage all delivery operations with real-time status updates
          </Subtitle>
        </Header>

        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard key={index}>
              <StatIcon>
                <FontAwesomeIcon icon={stat.icon} />
              </StatIcon>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

        <MainSection>
          <DeliveryTracker>
            <TrackerHeader>
              <TrackerTitle>Delivery Tracker</TrackerTitle>
              
              <SearchSection>
                <SearchIcon>
                  <FontAwesomeIcon icon={faSearch} />
                </SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Search by order ID, customer name, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchSection>

              <TabContainer>
                <Tab 
                  active={activeTab === 'all'} 
                  onClick={() => setActiveTab('all')}
                >
                  All Deliveries
                </Tab>
                <Tab 
                  active={activeTab === 'pending'} 
                  onClick={() => setActiveTab('pending')}
                >
                  Pending
                </Tab>
                <Tab 
                  active={activeTab === 'in_transit'} 
                  onClick={() => setActiveTab('in_transit')}
                >
                  In Transit
                </Tab>
                <Tab 
                  active={activeTab === 'delivered'} 
                  onClick={() => setActiveTab('delivered')}
                >
                  Delivered
                </Tab>
                <Tab 
                  active={activeTab === 'delayed'} 
                  onClick={() => setActiveTab('delayed')}
                >
                  Delayed
                </Tab>
              </TabContainer>
            </TrackerHeader>

            {filteredDeliveries.length === 0 ? (
              <EmptyState>
                <EmptyTitle>No deliveries found</EmptyTitle>
                <EmptyText>
                  {searchTerm 
                    ? `No deliveries match your search for "${searchTerm}"`
                    : `No ${activeTab === 'all' ? '' : activeTab} deliveries at this time.`
                  }
                </EmptyText>
              </EmptyState>
            ) : (
              <DeliveryList>
                {filteredDeliveries.map((delivery) => (
                  <DeliveryItem key={delivery.id}>
                    <DeliveryHeader>
                      <OrderId>Order {delivery.id}</OrderId>
                      <DeliveryStatus status={delivery.status}>
                        {delivery.status.replace('_', ' ')}
                      </DeliveryStatus>
                    </DeliveryHeader>
                    
                    <DeliveryDetails>
                      <DetailItem>
                        <FontAwesomeIcon icon={faUser} />
                        <strong>Customer:</strong> {delivery.customer}
                      </DetailItem>
                      <DetailItem>
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <strong>Address:</strong> {delivery.address}
                      </DetailItem>
                      <DetailItem>
                        <FontAwesomeIcon icon={faPhone} />
                        <strong>Phone:</strong> {delivery.phone}
                      </DetailItem>
                      <DetailItem>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <strong>Scheduled:</strong> {delivery.scheduledDate} at {delivery.scheduledTime}
                      </DetailItem>
                      <DetailItem>
                        <FontAwesomeIcon icon={faBox} />
                        <strong>Items:</strong> {delivery.items} item{delivery.items > 1 ? 's' : ''}
                      </DetailItem>
                      <DetailItem>
                        <FontAwesomeIcon icon={faTruck} />
                        <strong>Driver:</strong> {delivery.driver}
                      </DetailItem>
                    </DeliveryDetails>
                  </DeliveryItem>
                ))}
              </DeliveryList>
            )}
          </DeliveryTracker>

          <Sidebar>
            <InfoCard>
              <InfoCardTitle>
                <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
                Quick Actions
              </InfoCardTitle>
              <ActionButton style={{ marginBottom: '12px' }}>
                Schedule New Delivery
              </ActionButton>
              <ActionButton>
                Generate Report
              </ActionButton>
            </InfoCard>

            <InfoCard>
              <InfoCardTitle>
                <FontAwesomeIcon icon={faRoute} style={{ marginRight: '8px' }} />
                Delivery Guidelines
              </InfoCardTitle>
              <InfoList>
                <InfoListItem>
                  <strong>Standard Hours:</strong> 9:00 AM - 6:00 PM
                </InfoListItem>
                <InfoListItem>
                  <strong>Express Delivery:</strong> 2-4 hours
                </InfoListItem>
                <InfoListItem>
                  <strong>Standard Delivery:</strong> 1-2 business days
                </InfoListItem>
                <InfoListItem>
                  <strong>Coverage Area:</strong> Metro Manila
                </InfoListItem>
                <InfoListItem>
                  <strong>Contact Support:</strong> +63 2 123 4567
                </InfoListItem>
              </InfoList>
            </InfoCard>

            <InfoCard>
              <InfoCardTitle>
                <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
                Recent Alerts
              </InfoCardTitle>
              <InfoList>
                <InfoListItem style={{ color: '#e74c3c' }}>
                  <strong>Delayed:</strong> Order ORD-004 - Traffic on EDSA
                </InfoListItem>
                <InfoListItem style={{ color: '#f39c12' }}>
                  <strong>Weather Alert:</strong> Heavy rain in Quezon City
                </InfoListItem>
                <InfoListItem style={{ color: '#27ae60' }}>
                  <strong>Completed:</strong> 12 deliveries today
                </InfoListItem>
              </InfoList>
            </InfoCard>
          </Sidebar>
        </MainSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default DeliveryPage;
