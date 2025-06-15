import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    // Check if user is authenticated
    useEffect(() => {
        if (!loading && !currentUser) {
            navigate('/login', { 
                state: { 
                    message: 'Please login to view your orders',
                    returnUrl: '/orders'
                } 
            });
        }
    }, [currentUser, loading, navigate]);

    // Sample orders data - replace with actual API call later
    useEffect(() => {
        if (currentUser) {
            // TODO: Replace with actual API call to fetch user's orders
            const sampleOrders = [
                {
                    id: 'ORD-001',
                    customerName: `${currentUser.first_name} ${currentUser.last_name}`,
                    date: '2024-06-05',
                    status: 'pending',
                    total: 129.99
                },
                {
                    id: 'ORD-002',
                    customerName: `${currentUser.first_name} ${currentUser.last_name}`,
                    date: '2024-06-03',
                    status: 'shipped',
                    total: 89.50
                },
                {
                    id: 'ORD-003',
                    customerName: `${currentUser.first_name} ${currentUser.last_name}`,
                    date: '2024-06-01',
                    status: 'delivered',
                    total: 199.99
                }
            ];
            setOrders(sampleOrders);
        }
    }, [currentUser]);

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    const filteredOrders = orders.filter(order => {
        if (activeFilter === 'all') return true;
        return order.status === activeFilter;
    });

    // Show loading while checking auth status
    if (loading) {
        return (
            <Container>
                <LoadingMessage>Loading...</LoadingMessage>
            </Container>
        );
    }

    // If not authenticated after loading, don't render anything (will redirect)
    if (!currentUser) {
        return null;
    }

    return (
        <Container>
            <Header>
                <Title>Your Orders</Title>
                <UserWelcome>Welcome, {currentUser.first_name}!</UserWelcome>
            </Header>
            
            <StatusFilter>
                <FilterButton 
                    active={activeFilter === 'all'} 
                    onClick={() => handleFilterChange('all')}
                >
                    All Orders ({orders.length})
                </FilterButton>
                <FilterButton 
                    active={activeFilter === 'pending'} 
                    onClick={() => handleFilterChange('pending')}
                >
                    Pending ({orders.filter(o => o.status === 'pending').length})
                </FilterButton>
                <FilterButton 
                    active={activeFilter === 'shipped'} 
                    onClick={() => handleFilterChange('shipped')}
                >
                    Shipped ({orders.filter(o => o.status === 'shipped').length})
                </FilterButton>
                <FilterButton 
                    active={activeFilter === 'delivered'} 
                    onClick={() => handleFilterChange('delivered')}
                >
                    Delivered ({orders.filter(o => o.status === 'delivered').length})
                </FilterButton>
            </StatusFilter>

            {filteredOrders.length === 0 ? (
                <NoOrdersMessage>
                    {activeFilter === 'all' 
                        ? "You don't have any orders yet. Start shopping!" 
                        : `No ${activeFilter} orders found.`
                    }
                </NoOrdersMessage>
            ) : (
                <OrdersTable>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{new Date(order.date).toLocaleDateString()}</td>
                                <td><StatusBadge status={order.status}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</StatusBadge></td>
                                <td>${order.total.toFixed(2)}</td>
                                <td>
                                    <ActionButton onClick={() => alert(`View details for order ${order.id}`)}>
                                        View Details
                                    </ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </OrdersTable>
            )}
        </Container>
    );
};

const Container = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    min-height: calc(100vh - 200px);
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 3rem;
    color: #666;
    font-size: 1.1rem;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const Title = styled.h1`
    color: #333;
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
`;

const UserWelcome = styled.div`
    color: #666;
    font-size: 1rem;
    font-weight: 500;
`;

const StatusFilter = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
        gap: 0.5rem;
    }
`;

const FilterButton = styled.button`
    padding: 0.75rem 1.5rem;
    border: 2px solid ${props => props.active ? '#1a1a1a' : '#e0e0e0'};
    border-radius: 8px;
    background: ${props => props.active ? '#1a1a1a' : 'white'};
    color: ${props => props.active ? 'white' : '#666'};
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
        border-color: #1a1a1a;
        background: ${props => props.active ? '#1a1a1a' : '#f8f9fa'};
    }
    
    @media (max-width: 768px) {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
`;

const NoOrdersMessage = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
    font-size: 1.1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid #f0f0f0;
`;

const OrdersTable = styled.table`
    width: 100%;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-collapse: collapse;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    
    th, td {
        padding: 1.25rem;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
    }
    
    th {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    tr:last-child td {
        border-bottom: none;
    }
    
    tr:hover {
        background: #f8f9fa;
    }
    
    @media (max-width: 768px) {
        font-size: 0.9rem;
        
        th, td {
            padding: 1rem 0.75rem;
        }
        
        th:nth-child(2), td:nth-child(2) {
            display: none;
        }
    }
`;

const StatusBadge = styled.span`
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => {
        switch(props.status) {
            case 'pending': return '#fff3cd';
            case 'shipped': return '#cfe2ff';
            case 'delivered': return '#d1e7dd';
            default: return '#f8f9fa';
        }
    }};
    color: ${props => {
        switch(props.status) {
            case 'pending': return '#856404';
            case 'shipped': return '#0c63e4';
            case 'delivered': return '#0f5132';
            default: return '#666';
        }
    }};
`;

const ActionButton = styled.button`
    padding: 0.5rem 1rem;
    border: 2px solid #1a1a1a;
    border-radius: 6px;
    background: white;
    color: #1a1a1a;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
        background: #1a1a1a;
        color: white;
    }
`;

export default OrdersPage;