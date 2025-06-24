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
  faPhone,
  faTimes,
  faReceipt,
  faShoppingBag,
  faCreditCard
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

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  padding: 8px;
  font-size: 18px;
  transition: color 0.3s ease;
  
  &:hover {
    color: #000000;
  }
`;

const ModalBody = styled.div`
  padding: 32px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const DetailSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border: 1px solid #f0f0f0;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  color: #000000;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #666666;
  font-size: 14px;
  font-weight: 500;
  min-width: 120px;
`;

const DetailValue = styled.span`
  color: #000000;
  font-size: 14px;
  text-align: right;
  flex: 1;
`;

const OrderItemsSection = styled.div`
  margin-top: 24px;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  margin-bottom: 12px;
  background: #ffffff;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #000000;
  margin-bottom: 4px;
`;

const ItemDetails = styled.div`
  font-size: 12px;
  color: #666666;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #000000;
  text-align: right;
  min-width: 80px;
`;

const TotalSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border: 1px solid #e9ecef;
  margin-top: 24px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  
  &:last-child {
    border-top: 2px solid #000000;
    margin-top: 12px;
    padding-top: 12px;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background-color: #fff3cd; color: #856404;';
      case 'in_transit':
        return 'background-color: #d1ecf1; color: #0c5460;';
      case 'delivered':
        return 'background-color: #d4edda; color: #155724;';
      case 'delayed':
        return 'background-color: #f8d7da; color: #721c24;';
      default:
        return 'background-color: #f8f9fa; color: #6c757d;';
    }
  }}
`;

// Calendar Modal Components
const CalendarModalContent = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  margin: 20px;
`;

const CalendarDay = styled.div`
  background: #ffffff;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #f0f0f0;
  position: relative;
  cursor: ${props => props.hasOrders ? 'pointer' : 'default'};
  
  &:hover {
    background: ${props => props.hasOrders ? '#f8f9fa' : '#ffffff'};
  }
`;

const DayNumber = styled.div`
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
  font-size: 14px;
`;

const CalendarOrderDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 2px 0;
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return '#f39c12';
      case 'in_transit': return '#3498db';
      case 'delivered': return '#27ae60';
      case 'delayed': return '#e74c3c';
      default: return '#6c757d';
    }
  }};
`;

const CalendarOrderItem = styled.div`
  font-size: 10px;
  color: #666666;
  padding: 2px 4px;
  margin: 1px 0;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  margin: 20px 20px 0 20px;
`;

const CalendarHeaderDay = styled.div`
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #000000;
  font-size: 14px;
`;

// Simple Order Details Modal for Calendar
const SimpleOrderModal = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`;

const SimpleOrderHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SimpleOrderTitle = styled.h3`
  margin: 0;
  color: #000000;
  font-size: 1.3rem;
  font-weight: 500;
`;

const SimpleOrderBody = styled.div`
  padding: 24px;
`;

const QuickDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuickDetailLabel = styled.span`
  color: #666666;
  font-weight: 500;
`;

const QuickDetailValue = styled.span`
  color: #000000;
  font-weight: 400;
`;

const OrderSummary = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin: 16px 0;
`;

const SummaryTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #000000;
  font-size: 1.1rem;
`;

const ItemSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
`;

const TotalAmount = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.1rem;
  color: #000000;
  padding-top: 12px;
  border-top: 2px solid #000000;
  margin-top: 12px;
`;

const DeliveryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendarOrder, setSelectedCalendarOrder] = useState(null);
  
  // Sample delivery data with detailed order information
  const deliveries = [
    {
      id: 'ORD-001',
      customer: 'John Smith',
      address: '123 Main St, Metro Manila',
      phone: '+63 912 345 6789',
      email: 'john.smith@email.com',
      scheduledDate: '2024-06-18',
      scheduledTime: '10:00 AM - 12:00 PM',
      status: 'pending',
      items: 2,
      priority: 'normal',
      driver: 'Miguel Santos',
      orderDate: '2024-06-15',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      orderItems: [
        {
          name: 'Seven Four Classic T-Shirt',
          size: 'Large',
          color: 'Black',
          quantity: 2,
          price: 899.00
        },
        {
          name: 'Seven Four Hoodie',
          size: 'Medium',
          color: 'White',
          quantity: 1,
          price: 1599.00
        }
      ],
      subtotal: 3397.00,
      shipping: 150.00,
      tax: 339.70,
      total: 3886.70
    },
    {
      id: 'ORD-002',
      customer: 'Maria Garcia',
      address: '456 Oak Ave, Quezon City',
      phone: '+63 917 234 5678',
      email: 'maria.garcia@email.com',
      scheduledDate: '2024-06-18',
      scheduledTime: '2:00 PM - 4:00 PM',
      status: 'in_transit',
      items: 1,
      priority: 'urgent',
      driver: 'Carlos Rodriguez',
      orderDate: '2024-06-16',
      paymentMethod: 'GCash',
      paymentStatus: 'Paid',
      orderItems: [
        {
          name: 'Seven Four Sports Jersey',
          size: 'Small',
          color: 'Blue',
          quantity: 1,
          price: 1299.00
        }
      ],
      subtotal: 1299.00,
      shipping: 120.00,
      tax: 129.90,
      total: 1548.90
    },
    {
      id: 'ORD-003',
      customer: 'Robert Johnson',
      address: '789 Pine Rd, Makati',
      phone: '+63 905 876 5432',
      email: 'robert.johnson@email.com',
      scheduledDate: '2024-06-17',
      scheduledTime: '9:00 AM - 11:00 AM',
      status: 'delivered',
      items: 3,
      priority: 'normal',
      driver: 'Elena Cruz',
      orderDate: '2024-06-14',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Paid',
      orderItems: [
        {
          name: 'Seven Four Basic Tee',
          size: 'Medium',
          color: 'Gray',
          quantity: 2,
          price: 599.00
        },
        {
          name: 'Seven Four Polo Shirt',
          size: 'Large',
          color: 'Navy',
          quantity: 1,
          price: 999.00
        }
      ],
      subtotal: 2197.00,
      shipping: 100.00,
      tax: 219.70,
      total: 2516.70
    },
    {
      id: 'ORD-004',
      customer: 'Lisa Chen',
      address: '321 Elm St, Taguig',
      phone: '+63 920 123 4567',
      email: 'lisa.chen@email.com',
      scheduledDate: '2024-06-17',
      scheduledTime: '3:00 PM - 5:00 PM',
      status: 'delayed',
      items: 1,
      priority: 'urgent',
      driver: 'Jose Martinez',
      orderDate: '2024-06-16',
      paymentMethod: 'PayMaya',
      paymentStatus: 'Paid',
      orderItems: [
        {
          name: 'Seven Four Premium Jacket',
          size: 'Small',
          color: 'Black',
          quantity: 1,
          price: 2499.00
        }
      ],
      subtotal: 2499.00,
      shipping: 200.00,
      tax: 249.90,
      total: 2948.90
    }
  ];
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  // Calendar-specific handlers
  const handleCalendarOrderClick = (order) => {
    setSelectedCalendarOrder(order);
    setShowCalendarModal(true);
  };

  const closeCalendarModal = () => {
    setShowCalendarModal(false);
    setSelectedCalendarOrder(null);
  };

  const openFullCalendar = () => {
    setShowCalendarModal(true);
  };

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
            ) : (              <DeliveryList>
                {filteredDeliveries.map((delivery) => (
                  <DeliveryItem key={delivery.id} onClick={() => handleOrderClick(delivery)}>
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

          <Sidebar>            <InfoCard>
              <InfoCardTitle>
                <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
                Quick Actions
              </InfoCardTitle>
              <ActionButton style={{ marginBottom: '12px' }} onClick={openFullCalendar}>
                View Full Calendar
              </ActionButton>
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
            </InfoCard>          </Sidebar>
        </MainSection>        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <FontAwesomeIcon icon={faReceipt} />
                  Order Details - {selectedOrder.id}
                </ModalTitle>
                <CloseButton onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>
              
              <ModalBody>
                <SectionGrid>
                  {/* Customer Information */}
                  <DetailSection>
                    <SectionTitle>
                      <FontAwesomeIcon icon={faUser} />
                      Customer Information
                    </SectionTitle>
                    <DetailRow>
                      <DetailLabel>Name:</DetailLabel>
                      <DetailValue>{selectedOrder.customer}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Email:</DetailLabel>
                      <DetailValue>{selectedOrder.email}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Phone:</DetailLabel>
                      <DetailValue>{selectedOrder.phone}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Address:</DetailLabel>
                      <DetailValue>{selectedOrder.address}</DetailValue>
                    </DetailRow>
                  </DetailSection>

                  {/* Order Information */}
                  <DetailSection>
                    <SectionTitle>
                      <FontAwesomeIcon icon={faShoppingBag} />
                      Order Information
                    </SectionTitle>
                    <DetailRow>
                      <DetailLabel>Order ID:</DetailLabel>
                      <DetailValue>{selectedOrder.id}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Order Date:</DetailLabel>
                      <DetailValue>{selectedOrder.orderDate}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Status:</DetailLabel>
                      <DetailValue>
                        <StatusBadge status={selectedOrder.status}>
                          {selectedOrder.status.replace('_', ' ')}
                        </StatusBadge>
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Priority:</DetailLabel>
                      <DetailValue style={{ textTransform: 'capitalize' }}>
                        {selectedOrder.priority}
                      </DetailValue>
                    </DetailRow>
                  </DetailSection>
                </SectionGrid>

                {/* Order Items */}
                <OrderItemsSection>
                  <SectionTitle>
                    <FontAwesomeIcon icon={faBox} />
                    Order Items
                  </SectionTitle>
                  {selectedOrder.orderItems.map((item, index) => (
                    <OrderItem key={index}>
                      <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemDetails>
                          Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                        </ItemDetails>
                      </ItemInfo>
                      <ItemPrice>₱{item.price.toFixed(2)}</ItemPrice>
                    </OrderItem>
                  ))}
                </OrderItemsSection>

                {/* Transaction Details */}
                <TotalSection>
                  <SectionTitle>
                    <FontAwesomeIcon icon={faCreditCard} />
                    Transaction Details
                  </SectionTitle>
                  <TotalRow>
                    <span>Subtotal:</span>
                    <span>₱{selectedOrder.subtotal.toFixed(2)}</span>
                  </TotalRow>
                  <TotalRow>
                    <span>Shipping:</span>
                    <span>₱{selectedOrder.shipping.toFixed(2)}</span>
                  </TotalRow>
                  <TotalRow>
                    <span>Tax:</span>
                    <span>₱{selectedOrder.tax.toFixed(2)}</span>
                  </TotalRow>
                  <TotalRow>
                    <span>Total:</span>
                    <span>₱{selectedOrder.total.toFixed(2)}</span>
                  </TotalRow>
                  
                  <DetailRow style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                    <DetailLabel>Payment Method:</DetailLabel>
                    <DetailValue>{selectedOrder.paymentMethod}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Payment Status:</DetailLabel>
                    <DetailValue>
                      <StatusBadge status={selectedOrder.paymentStatus === 'Paid' ? 'delivered' : 'pending'}>
                        {selectedOrder.paymentStatus}
                      </StatusBadge>
                    </DetailValue>
                  </DetailRow>
                </TotalSection>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Calendar Modal */}
        {showCalendarModal && !selectedCalendarOrder && (
          <ModalOverlay onClick={closeCalendarModal}>
            <CalendarModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Delivery Calendar - June 2024
                </ModalTitle>
                <CloseButton onClick={closeCalendarModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>
              
              <CalendarHeader>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <CalendarHeaderDay key={day}>{day}</CalendarHeaderDay>
                ))}
              </CalendarHeader>
              
              <CalendarGrid>
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNumber = i + 1;
                  const dayOrders = deliveries.filter(order => {
                    const orderDay = parseInt(order.scheduledDate.split('-')[2]);
                    return orderDay === dayNumber;
                  });
                  
                  return (
                    <CalendarDay key={i} hasOrders={dayOrders.length > 0}>
                      <DayNumber>{dayNumber}</DayNumber>
                      {dayOrders.map((order, index) => (
                        <div key={index}>
                          <CalendarOrderDot status={order.status} />
                          <CalendarOrderItem onClick={() => handleCalendarOrderClick(order)}>
                            {order.id}
                          </CalendarOrderItem>
                        </div>
                      ))}
                    </CalendarDay>
                  );
                })}
              </CalendarGrid>
            </CalendarModalContent>
          </ModalOverlay>
        )}

        {/* Simple Order Details Modal for Calendar */}
        {showCalendarModal && selectedCalendarOrder && (
          <ModalOverlay onClick={closeCalendarModal}>
            <SimpleOrderModal onClick={(e) => e.stopPropagation()}>
              <SimpleOrderHeader>
                <SimpleOrderTitle>Order {selectedCalendarOrder.id}</SimpleOrderTitle>
                <CloseButton onClick={() => setSelectedCalendarOrder(null)}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </SimpleOrderHeader>
              
              <SimpleOrderBody>
                {/* Customer Details */}
                <QuickDetailRow>
                  <QuickDetailLabel>Customer:</QuickDetailLabel>
                  <QuickDetailValue>{selectedCalendarOrder.customer}</QuickDetailValue>
                </QuickDetailRow>
                <QuickDetailRow>
                  <QuickDetailLabel>Email:</QuickDetailLabel>
                  <QuickDetailValue>{selectedCalendarOrder.email}</QuickDetailValue>
                </QuickDetailRow>
                <QuickDetailRow>
                  <QuickDetailLabel>Phone:</QuickDetailLabel>
                  <QuickDetailValue>{selectedCalendarOrder.phone}</QuickDetailValue>
                </QuickDetailRow>
                <QuickDetailRow>
                  <QuickDetailLabel>Address:</QuickDetailLabel>
                  <QuickDetailValue>{selectedCalendarOrder.address}</QuickDetailValue>
                </QuickDetailRow>
                <QuickDetailRow>
                  <QuickDetailLabel>Order Date:</QuickDetailLabel>
                  <QuickDetailValue>{selectedCalendarOrder.orderDate}</QuickDetailValue>
                </QuickDetailRow>
                <QuickDetailRow>
                  <QuickDetailLabel>Status:</QuickDetailLabel>
                  <QuickDetailValue>
                    <StatusBadge status={selectedCalendarOrder.status}>
                      {selectedCalendarOrder.status.replace('_', ' ')}
                    </StatusBadge>
                  </QuickDetailValue>
                </QuickDetailRow>

                {/* Order Summary */}
                <OrderSummary>
                  <SummaryTitle>Order Items</SummaryTitle>
                  {selectedCalendarOrder.orderItems.map((item, index) => (
                    <ItemSummary key={index}>
                      <span>{item.name} - {item.size} ({item.color}) x{item.quantity}</span>
                      <span>₱{item.price.toFixed(2)}</span>
                    </ItemSummary>
                  ))}
                  
                  <TotalAmount>
                    <span>Total Amount:</span>
                    <span>₱{selectedCalendarOrder.total.toFixed(2)}</span>
                  </TotalAmount>
                </OrderSummary>

                {/* Payment Info */}
                <QuickDetailRow>
                  <QuickDetailLabel>Payment Method:</QuickDetailLabel>
                  <QuickDetailValue>{selectedCalendarOrder.paymentMethod}</QuickDetailValue>
                </QuickDetailRow>
                <QuickDetailRow>
                  <QuickDetailLabel>Payment Status:</QuickDetailLabel>
                  <QuickDetailValue>
                    <StatusBadge status={selectedCalendarOrder.paymentStatus === 'Paid' ? 'delivered' : 'pending'}>
                      {selectedCalendarOrder.paymentStatus}
                    </StatusBadge>
                  </QuickDetailValue>
                </QuickDetailRow>
              </SimpleOrderBody>
            </SimpleOrderModal>
          </ModalOverlay>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default DeliveryPage;
