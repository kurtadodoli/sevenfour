import React from 'react';
import styled from 'styled-components';

const InventoryPage = () => {
    return (
        <Container>
            <Header>
                <Title>Inventory Management</Title>
                <Button>Add New Item</Button>
            </Header>
            
            <StatsGrid>
                <StatCard>
                    <h3>Total Items</h3>
                    <span>1,234</span>
                </StatCard>
                <StatCard>
                    <h3>Low Stock</h3>
                    <span>15</span>
                </StatCard>
                <StatCard>
                    <h3>Out of Stock</h3>
                    <span>3</span>
                </StatCard>
            </StatsGrid>

            <Table>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Stock Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>SFC001</td>
                        <td>Classic T-Shirt</td>
                        <td>T-Shirts</td>
                        <td>45</td>
                        <td><Status type="inStock">In Stock</Status></td>
                        <td>
                            <ActionButton>Edit</ActionButton>
                            <ActionButton warning>Delete</ActionButton>
                        </td>
                    </tr>
                </tbody>
            </Table>
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
    font-size: 2rem;
    color: #333;
`;

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        opacity: 0.9;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    h3 {
        color: #666;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }
    
    span {
        font-size: 2rem;
        font-weight: bold;
        color: #333;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
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

const Status = styled.span`
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.875rem;
    background: ${props => props.type === 'inStock' ? '#dcf5e3' : '#ffe5e5'};
    color: ${props => props.type === 'inStock' ? '#28a745' : '#dc3545'};
`;

const ActionButton = styled.button`
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    border: none;
    border-radius: 4px;
    background: ${props => props.warning ? '#dc3545' : '#1a1a1a'};
    color: white;
    cursor: pointer;
    
    &:hover {
        opacity: 0.9;
    }
`;

export default InventoryPage;