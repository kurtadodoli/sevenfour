import React from 'react';
import styled from 'styled-components';

const MaintenanceContainer = styled.div`
  padding: 2rem;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

const MaintenanceHeader = styled.div`
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const MaintenanceTitle = styled.h1`
  margin: 0;
  color: #333;
  font-size: 24px;
`;

const MaintenanceContent = styled.div`
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MaintenanceButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #357abd;
  }
`;

const MaintenancePage = () => {
  return (
    <MaintenanceContainer>
      <MaintenanceHeader>
        <MaintenanceTitle>Product Maintenance</MaintenanceTitle>
      </MaintenanceHeader>
      
      <MaintenanceContent>
        <MaintenanceButton>Add New Product</MaintenanceButton>
        
        <div style={{ marginTop: '2rem' }}>
          <h2>Products List</h2>
          <p>You can manage your products here. Add, edit, or remove products as needed.</p>
          
          {/* Products table */}
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #eee' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #eee' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #eee' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #eee' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #eee' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Sample Product</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>$29.99</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>T-Shirts</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Active</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                  <MaintenanceButton style={{ marginRight: '0.5rem' }}>Edit</MaintenanceButton>
                  <MaintenanceButton style={{ backgroundColor: '#dc3545' }}>Delete</MaintenanceButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </MaintenanceContent>
    </MaintenanceContainer>
  );
};

export default MaintenancePage;
