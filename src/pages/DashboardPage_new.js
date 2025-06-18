import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { Navigate } from 'react-router-dom';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #000000;
  min-height: 100vh;
  color: #ffffff;
  padding-top: 100px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const DashboardHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DashboardSubtitle = styled.p`
  font-size: 1.1rem;
  color: #888888;
  margin: 0;
`;

const ReportsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ReportCard = styled.div`
  background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%);
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
    border-color: #555555;
  }
`;

const ReportCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ReportCardTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
`;

const ReportIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.bg || 'linear-gradient(135deg, #4a9eff 0%, #00d2ff 100%)'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const DateInput = styled.input`
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
  }
  
  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #4a9eff 0%, #00d2ff 100%);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
  }
  
  &:disabled {
    background: #333333;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #333333;
  border-top: 2px solid #4a9eff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 2rem auto;
`;

const ReportTable = styled.div`
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 1rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr 1fr 1fr'};
  background: #2a2a2a;
  padding: 1rem;
  font-weight: 600;
  color: #cccccc;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr 1fr 1fr'};
  padding: 1rem;
  border-bottom: 1px solid #333333;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #222222;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  color: #ffffff;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  &.status {
    span {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .active { background: #28a745; color: white; }
    .inactive { background: #6c757d; color: white; }
    .archived { background: #fd7e14; color: white; }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666666;
  
  div {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;

const ErrorMessage = styled.div`
  background: #dc3545;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
  font-size: 0.9rem;
`;

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [userLogs, setUserLogs] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [userLogsLoading, setUserLogsLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [userLogsError, setUserLogsError] = useState('');
  const [inventoryError, setInventoryError] = useState('');
  
  // Date filters
  const [userLogsDateRange, setUserLogsDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const [inventoryDateRange, setInventoryDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }

  // Fetch User Logs Report
  const fetchUserLogsReport = async () => {
    setUserLogsLoading(true);
    setUserLogsError('');
    
    try {
      const params = {};
      if (userLogsDateRange.startDate) params.startDate = userLogsDateRange.startDate;
      if (userLogsDateRange.endDate) params.endDate = userLogsDateRange.endDate;
      
      const response = await axios.get('http://localhost:3001/api/reports/user-logs', { params });
      setUserLogs(response.data);
    } catch (error) {
      console.error('Error fetching user logs:', error);
      setUserLogsError('Failed to fetch user logs report');
    } finally {
      setUserLogsLoading(false);
    }
  };

  // Fetch Inventory Report
  const fetchInventoryReport = async () => {
    setInventoryLoading(true);
    setInventoryError('');
    
    try {
      const params = {};
      if (inventoryDateRange.startDate) params.startDate = inventoryDateRange.startDate;
      if (inventoryDateRange.endDate) params.endDate = inventoryDateRange.endDate;
      
      const response = await axios.get('http://localhost:3001/api/reports/inventory', { params });
      setInventoryData(response.data);
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      setInventoryError('Failed to fetch inventory report');
    } finally {
      setInventoryLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUserLogsReport();
    fetchInventoryReport();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Admin Dashboard</DashboardTitle>
        <DashboardSubtitle>Reports and Analytics</DashboardSubtitle>
      </DashboardHeader>

      <ReportsSection>
        {/* User Logs Report */}
        <ReportCard>
          <ReportCardHeader>
            <ReportCardTitle>User Logs Report</ReportCardTitle>
            <ReportIcon bg="linear-gradient(135deg, #28a745 0%, #20c997 100%)">
              👤
            </ReportIcon>
          </ReportCardHeader>
          
          <FilterSection>
            <FilterRow>
              <DateInput
                type="date"
                value={userLogsDateRange.startDate}
                onChange={(e) => setUserLogsDateRange(prev => ({...prev, startDate: e.target.value}))}
                placeholder="Start Date"
              />
              <DateInput
                type="date"
                value={userLogsDateRange.endDate}
                onChange={(e) => setUserLogsDateRange(prev => ({...prev, endDate: e.target.value}))}
                placeholder="End Date"
              />
              <ActionButton 
                onClick={fetchUserLogsReport}
                disabled={userLogsLoading}
              >
                {userLogsLoading ? 'Loading...' : 'Generate Report'}
              </ActionButton>
            </FilterRow>
          </FilterSection>

          {userLogsError && <ErrorMessage>{userLogsError}</ErrorMessage>}
          
          {userLogsLoading ? (
            <LoadingSpinner />
          ) : userLogs.length > 0 ? (
            <ReportTable>
              <TableHeader columns="2fr 1.5fr 1.5fr 1.5fr">
                <div>User</div>
                <div>Last Login</div>
                <div>Created</div>
                <div>Updated</div>
              </TableHeader>
              {userLogs.map((user, index) => (
                <TableRow key={index} columns="2fr 1.5fr 1.5fr 1.5fr">
                  <TableCell>
                    <div>
                      <div style={{fontWeight: '600'}}>{user.first_name} {user.last_name}</div>
                      <div style={{fontSize: '0.8rem', color: '#888', marginTop: '2px'}}>{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.last_login)}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.updated_at)}</TableCell>
                </TableRow>
              ))}
            </ReportTable>
          ) : (
            <EmptyState>
              <div>📊</div>
              <p>No user logs found for the selected date range</p>
            </EmptyState>
          )}
        </ReportCard>

        {/* Inventory Report */}
        <ReportCard>
          <ReportCardHeader>
            <ReportCardTitle>Inventory Report</ReportCardTitle>
            <ReportIcon bg="linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)">
              📦
            </ReportIcon>
          </ReportCardHeader>
          
          <FilterSection>
            <FilterRow>
              <DateInput
                type="date"
                value={inventoryDateRange.startDate}
                onChange={(e) => setInventoryDateRange(prev => ({...prev, startDate: e.target.value}))}
                placeholder="Start Date"
              />
              <DateInput
                type="date"
                value={inventoryDateRange.endDate}
                onChange={(e) => setInventoryDateRange(prev => ({...prev, endDate: e.target.value}))}
                placeholder="End Date"
              />
              <ActionButton 
                onClick={fetchInventoryReport}
                disabled={inventoryLoading}
              >
                {inventoryLoading ? 'Loading...' : 'Generate Report'}
              </ActionButton>
            </FilterRow>
          </FilterSection>

          {inventoryError && <ErrorMessage>{inventoryError}</ErrorMessage>}
          
          {inventoryLoading ? (
            <LoadingSpinner />
          ) : inventoryData.length > 0 ? (
            <ReportTable>
              <TableHeader columns="2fr 1fr 1fr 1fr">
                <div>Product</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Status</div>
              </TableHeader>
              {inventoryData.map((product, index) => (
                <TableRow key={index} columns="2fr 1fr 1fr 1fr">
                  <TableCell>
                    <div>
                      <div style={{fontWeight: '600'}}>{product.productname}</div>
                      <div style={{fontSize: '0.8rem', color: '#888', marginTop: '2px'}}>
                        Created: {formatDate(product.created_at)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${product.productprice}</TableCell>
                  <TableCell>{product.total_stock || 0}</TableCell>
                  <TableCell className="status">
                    <span className={product.productstatus}>
                      {product.productstatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </ReportTable>
          ) : (
            <EmptyState>
              <div>📦</div>
              <p>No inventory data found for the selected date range</p>
            </EmptyState>
          )}
        </ReportCard>
      </ReportsSection>
    </DashboardContainer>
  );
};

export default DashboardPage;
