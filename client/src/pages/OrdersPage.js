import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const OrdersPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    // Check if user is authenticated
    React.useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login', { 
                state: { 
                    message: 'Please login to view your orders',
                    returnUrl: '/orders'
                } 
            });
        }
    }, [auth.isAuthenticated, navigate]);

    // Show loading while checking auth status
    if (!auth.isAuthenticated) {
        return null; // Or a loading spinner
    }

    return (
        <Container>
            <Header>
                <Title>Orders</Title>
                <StatusFilter>
                    <FilterButton active>All</FilterButton>
                    <FilterButton>Pending</FilterButton>
                    <FilterButton>Shipped</FilterButton>
                    <FilterButton>Delivered</FilterButton>
                </StatusFilter>
            </Header>

            <OrdersTable>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#ORD-001</td>
                        <td>John Doe</td>
                        <td>2024-06-05</td>
                        <td><StatusBadge status="pending">Pending</StatusBadge></td>
                        <td>$129.99</td>
                        <td>
                            <ActionButton>View</ActionButton>
                        </td>
                    </tr>
                </tbody>
            </OrdersTable>
        </Container>
    );
};

const Container = styled.div`
    padding: 2rem;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const Title = styled.h1`
    color: #333;
`;

const StatusFilter = styled.div`
    display: flex;
    gap: 1rem;
`;

const FilterButton = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: ${props => props.active ? '#1a1a1a' : '#f5f5f5'};
    color: ${props => props.active ? 'white' : '#666'};
    cursor: pointer;
`;

const OrdersTable = styled.table`
    width: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-collapse: collapse;
    
    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
    }
    
    th {
        background: #f8f9fa;
        font-weight: 600;
    }
`;

const StatusBadge = styled.span`
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.875rem;
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
    border: none;
    border-radius: 4px;
    background: #1a1a1a;
    color: white;
    cursor: pointer;
`;

export default OrdersPage;