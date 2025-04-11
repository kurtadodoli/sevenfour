// client/src/components/InventoryManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const InventoryContainer = styled.div`
  margin: 2rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const StockWarning = styled.span`
  color: ${props => props.lowStock ? '#f44336' : 'inherit'};
  font-weight: ${props => props.lowStock ? 'bold' : 'normal'};
`;

const ActionButton = styled.button`
  background-color: #000;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: #333;
  }
`;

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get('/api/inventory');
        setInventory(res.data);
      } catch (err) {
        setError('Failed to fetch inventory data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);

  const updateStock = async (productId, quantity) => {
    try {
      await axios.put(`/api/inventory/${productId}`, { quantity });
      
      // Update the local state
      setInventory(inventory.map(item => 
        item.product_id === productId 
          ? { ...item, quantity } 
          : item
      ));
    } catch (err) {
      setError('Failed to update stock');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <InventoryContainer>
      <h2>Inventory Management</h2>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Product ID</TableHeader>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Current Stock</TableHeader>
            <TableHeader>Critical Level</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <tbody>
          {inventory.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.product_id}</TableCell>
              <TableCell>{item.product_name}</TableCell>
              <TableCell>
                <StockWarning lowStock={item.quantity <= item.critical_level}>
                  {item.quantity}
                </StockWarning>
              </TableCell>
              <TableCell>{item.critical_level}</TableCell>
              <TableCell>
                <ActionButton onClick={() => updateStock(item.product_id, item.quantity + 10)}>
                  Add Stock (+10)
                </ActionButton>
                <ActionButton onClick={() => updateStock(item.product_id, Math.max(0, item.quantity - 10))}>
                  Remove Stock (-10)
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </InventoryContainer>
  );
};

export default InventoryManagement;