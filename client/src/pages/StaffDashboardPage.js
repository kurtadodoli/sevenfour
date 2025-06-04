import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';
import axios from 'axios';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.p`
  font-size: 2rem;
  font-weight: 600;
`;

const AlertsSection = styled.div`
  margin-top: 2rem;
`;

const AlertTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Alert = styled.div`
  background-color: ${props => props.urgent ? '#fff3cd' : '#d1e7dd'};
  color: ${props => props.urgent ? '#856404' : '#155724'};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.urgent ? '#ffc107' : '#28a745'};
`;

const OrdersSection = styled.div`
  margin-top: 2rem;
`;

const OrdersTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  background-color: ${props => {
    switch (props.status) {
      case 'processing':
        return '#e2f0fd';
      case 'shipped':
        return '#d1e7dd';
      case 'delivered':
        return '#d4edda';
      case 'cancelled':
        return '#f8d7da';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'processing':
        return '#0275d8';
      case 'shipped':
        return '#28a745';
      case 'delivered':
        return '#155724';
      case 'cancelled':
        return '#721c24';
      default:
        return '#212529';
    }
  }};
`;

const Button = styled.button`
  background-color: ${props => props.type === 'ship' ? '#28a745' : 
    props.type === 'cancel' ? '#dc3545' : '#17a2b8'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const StaffDashboardPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch staff dashboard data from backend
    const fetchStaffData = async () => {
      try {
        // Mock data for demonstration
        setLowStockItems([
          { id: '1', name: 'Basic White T-Shirt', stock: 5, threshold: 10 },
          { id: '2', name: 'Black Hoodie', stock: 3, threshold: 15 },
          { id: '3', name: 'Graphic T-Shirt', stock: 2, threshold: 10 }
        ]);
        
        setOrders([
          {
            id: 'ORD-1001',
            customer: 'John Doe',
            date: '2023-05-01',
            items: 3,
            total: 2500,
            status: 'processing'
          },
          {
            id: 'ORD-1002',
            customer: 'Jane Smith',
            date: '2023-05-01',
            items: 1,
            total: 950,
            status: 'processing'
          },
          {
            id: 'ORD-1003',
            customer: 'Bob Johnson',
            date: '2023-04-30',
            items: 2,
            total: 1800,
            status: 'shipped'
          },
          {
            id: 'ORD-1004',
            customer: 'Sarah Williams',
            date: '2023-04-29',
            items: 5,
            total: 4250,
            status: 'delivered'
          },
          {
            id: 'ORD-1005',
            customer: 'Michael Brown',
            date: '2023-04-28',
            items: 1,
            total: 850,
            status: 'cancelled'
          }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // In a real app, make API call to update order status
      // await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state for demonstration
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  if (loading) {
    return <DashboardContainer>Loading staff dashboard...</DashboardContainer>;
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Staff Dashboard</Title>
      </Header>
      
      <AlertsSection>
        <AlertTitle>Inventory Alerts</AlertTitle>
        {lowStockItems.length > 0 ? (
          lowStockItems.map(item => (
            <Alert key={item.id} urgent={item.stock < 5}>
              <strong>{item.name}</strong> is running low on stock! Current level: {item.stock} (Threshold: {item.threshold})
            </Alert>
          ))
        ) : (
          <p>No low stock alerts at this time.</p>
        )}
      </AlertsSection>
      
      <OrdersSection>
        <OrdersTitle>Recent Orders</OrdersTitle>
        <Table>
          <thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <Td>{order.id}</Td>
                <Td>{order.customer}</Td>
                <Td>{order.date}</Td>
                <Td>{order.items}</Td>
                <Td>₱{order.total.toLocaleString()}</Td>
                <Td>
                  <StatusBadge status={order.status}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </StatusBadge>
                </Td>
                <Td>
                  {order.status === 'processing' && (
                    <Button 
                      type="ship" 
                      onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                    >
                      Mark Shipped
                    </Button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <Button 
                      type="deliver" 
                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                  
                  {(order.status === 'processing' || order.status === 'shipped') && (
                    <Button 
                      type="cancel" 
                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  {(order.status === 'delivered' || order.status === 'cancelled') && (
                    <Button disabled>Completed</Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </OrdersSection>
    </DashboardContainer>
  );
};

export default StaffDashboardPage;