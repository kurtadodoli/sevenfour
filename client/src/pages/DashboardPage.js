import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';

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

const ReportsSection = styled.div`
  margin-top: 2rem;
`;

const ReportTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ReportCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const DashboardPage = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <DashboardContainer>Loading dashboard data...</DashboardContainer>;
  if (error) return <DashboardContainer>{error}</DashboardContainer>;
  if (!isAdmin) return <Navigate to="/" />;

  return (
    <DashboardContainer>
      <Header>
        <Title>Admin Dashboard</Title>
      </Header>
      
      <StatsGrid>
        <StatCard>
          <StatTitle>Total Products</StatTitle>
          <StatValue>{stats.totalProducts}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Total Orders</StatTitle>
          <StatValue>{stats.totalOrders}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Total Customers</StatTitle>
          <StatValue>{stats.totalCustomers}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Total Revenue</StatTitle>
          <StatValue>₱{stats.totalRevenue.toLocaleString()}</StatValue>
        </StatCard>
      </StatsGrid>
      
      <ReportsSection>
        <ReportTitle>Reports</ReportTitle>
        <ReportGrid>
          <ReportCard>
            <h3>Sales Report</h3>
            <p>View detailed sales analytics and trends</p>
            {/* Sales chart would go here */}
          </ReportCard>
          <ReportCard>
            <h3>Inventory Report</h3>
            <p>Check stock levels and inventory status</p>
            {/* Inventory chart would go here */}
          </ReportCard>
          <ReportCard>
            <h3>Delivery Completion Report</h3>
            <p>Track delivery performance and completion rates</p>
            {/* Delivery chart would go here */}
          </ReportCard>
          <ReportCard>
            <h3>User Logs</h3>
            <p>Monitor user activity and system access</p>
            {/* User logs table would go here */}
          </ReportCard>
        </ReportGrid>
      </ReportsSection>
    </DashboardContainer>
  );
};

export default DashboardPage;