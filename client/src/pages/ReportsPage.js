import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ReportCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ReportTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: 0.9rem;
    color: #666;
  }
`;

const ReportContent = styled.div`
  min-height: 300px;
`;

const FilterBar = styled.div`
  display: flex;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  flex: 1;
  min-width: 150px;
`;

const DateRangePicker = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 2;
  
  input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
`;

const DownloadButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  
  &:hover {
    background-color: #218838;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Mock chart component (in a real app, you would use a chart library like recharts)
const Chart = styled.div`
  width: 100%;
  height: 250px;
  background-color: #f9f9f9;
  border: 1px dashed #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  
  &::after {
    content: 'Chart visualization would be rendered here';
    color: #666;
  }
`;

const ReportsPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const [reportType, setReportType] = useState('sales');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    sales: [],
    inventory: [],
    users: [],
    delivery: []
  });
  const [loading, setLoading] = useState(true);

  // Generate today's date and 30 days ago date for default date range
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);
  
  // Fetch report data on component mount and when filters change
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // In a real application, you would fetch reports from your API
        // const res = await axios.get(`/api/reports/${reportType}?timeFrame=${timeFrame}&startDate=${startDate}&endDate=${endDate}`);
        // setReportData({...reportData, [reportType]: res.data.data});
        
        // Mock data for demonstration
        const mockSalesData = [
          { date: '2023-04-01', total: 12500, orders: 15 },
          { date: '2023-04-02', total: 9800, orders: 12 },
          { date: '2023-04-03', total: 15200, orders: 18 },
          { date: '2023-04-04', total: 11000, orders: 14 },
          { date: '2023-04-05', total: 18500, orders: 22 }
        ];
        
        const mockInventoryData = [
          { product: 'Black T-Shirt', stock: 45, sold: 120, restock: 'Needed' },
          { product: 'White Hoodie', stock: 78, sold: 35, restock: 'OK' },
          { product: 'Gray Shorts', stock: 12, sold: 28, restock: 'Urgent' },
          { product: 'Red Cap', stock: 56, sold: 18, restock: 'OK' },
          { product: 'Blue Socks', stock: 8, sold: 45, restock: 'Urgent' }
        ];
        
        const mockUserData = [
          { date: '2023-04-01', signups: 8, active: 45 },
          { date: '2023-04-02', signups: 5, active: 42 },
          { date: '2023-04-03', signups: 12, active: 53 },
          { date: '2023-04-04', signups: 7, active: 58 },
          { date: '2023-04-05', signups: 10, active: 65 }
        ];
        
        const mockDeliveryData = [
          { date: '2023-04-01', completed: 12, pending: 3, cancelled: 0 },
          { date: '2023-04-02', completed: 10, pending: 2, cancelled: 1 },
          { date: '2023-04-03', completed: 15, pending: 5, cancelled: 0 },
          { date: '2023-04-04', completed: 8, pending: 8, cancelled: 2 },
          { date: '2023-04-05', completed: 16, pending: 4, cancelled: 1 }
        ];
        
        setReportData({
          sales: mockSalesData,
          inventory: mockInventoryData,
          users: mockUserData,
          delivery: mockDeliveryData
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchReportData();
    }
  }, [reportType, timeFrame, startDate, endDate]);

  // Handle downloading reports
  const handleDownloadReport = () => {
    alert('In a real application, this would download the report as CSV or PDF');
  };

  if (loading && (!startDate || !endDate)) {
    return <PageContainer>Loading reports...</PageContainer>;
  }

  return (
    <PageContainer>
      <Header>
        <Title>Reports & Analytics</Title>
        <Subtitle>View detailed reports and analytics for your store</Subtitle>
      </Header>
      
      <FilterBar>
        <FilterSelect 
          value={reportType} 
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="sales">Sales Report</option>
          <option value="inventory">Inventory Report</option>
          <option value="users">User Activity Report</option>
          <option value="delivery">Delivery Completion Report</option>
        </FilterSelect>
        
        <FilterSelect 
          value={timeFrame} 
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom Range</option>
        </FilterSelect>
        
        <DateRangePicker>
          <span>From:</span>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>To:</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DateRangePicker>
      </FilterBar>
      
      <ReportGrid>
        {/* Sales Report */}
        {reportType === 'sales' && (
          <>
            <ReportCard>
              <ReportTitle>
                Revenue Over Time
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                <ReportTable>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Orders</Th>
                      <Th>Revenue</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.sales.map((item, index) => (
                      <tr key={index}>
                        <Td>{item.date}</Td>
                        <Td>{item.orders}</Td>
                        <Td>₱{item.total.toLocaleString()}</Td>
                      </tr>
                    ))}
                  </tbody>
                </ReportTable>
                <DownloadButton onClick={handleDownloadReport}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </DownloadButton>
              </ReportContent>
            </ReportCard>
            
            <ReportCard>
              <ReportTitle>
                Top Selling Products
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                {/* Additional content would go here */}
              </ReportContent>
            </ReportCard>
          </>
        )}
        
        {/* Inventory Report */}
        {reportType === 'inventory' && (
          <>
            <ReportCard>
              <ReportTitle>
                Current Stock Levels
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                <ReportTable>
                  <thead>
                    <tr>
                      <Th>Product</Th>
                      <Th>Current Stock</Th>
                      <Th>Units Sold</Th>
                      <Th>Restock Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.inventory.map((item, index) => (
                      <tr key={index}>
                        <Td>{item.product}</Td>
                        <Td>{item.stock}</Td>
                        <Td>{item.sold}</Td>
                        <Td 
                          style={{ 
                            color: item.restock === 'Urgent' ? '#dc3545' : 
                                  item.restock === 'Needed' ? '#ffc107' : 
                                  '#28a745' 
                          }}
                        >
                          {item.restock}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </ReportTable>
                <DownloadButton onClick={handleDownloadReport}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </DownloadButton>
              </ReportContent>
            </ReportCard>
            
            <ReportCard>
              <ReportTitle>
                Stock Movement Trends
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                {/* Additional content would go here */}
              </ReportContent>
            </ReportCard>
          </>
        )}
        
        {/* User Activity Report */}
        {reportType === 'users' && (
          <>
            <ReportCard>
              <ReportTitle>
                User Signups & Activity
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                <ReportTable>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>New Signups</Th>
                      <Th>Active Users</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.users.map((item, index) => (
                      <tr key={index}>
                        <Td>{item.date}</Td>
                        <Td>{item.signups}</Td>
                        <Td>{item.active}</Td>
                      </tr>
                    ))}
                  </tbody>
                </ReportTable>
                <DownloadButton onClick={handleDownloadReport}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </DownloadButton>
              </ReportContent>
            </ReportCard>
            
            <ReportCard>
              <ReportTitle>
                User Access Logs
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                {/* Additional content would go here */}
              </ReportContent>
            </ReportCard>
          </>
        )}
        
        {/* Delivery Completion Report */}
        {reportType === 'delivery' && (
          <>
            <ReportCard>
              <ReportTitle>
                Delivery Status Overview
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                <ReportTable>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Completed</Th>
                      <Th>Pending</Th>
                      <Th>Cancelled</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.delivery.map((item, index) => (
                      <tr key={index}>
                        <Td>{item.date}</Td>
                        <Td>{item.completed}</Td>
                        <Td>{item.pending}</Td>
                        <Td>{item.cancelled}</Td>
                      </tr>
                    ))}
                  </tbody>
                </ReportTable>
                <DownloadButton onClick={handleDownloadReport}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </DownloadButton>
              </ReportContent>
            </ReportCard>
            
            <ReportCard>
              <ReportTitle>
                Delivery Performance Metrics
                <span>Last updated: Today</span>
              </ReportTitle>
              <ReportContent>
                <Chart />
                {/* Additional content would go here */}
              </ReportContent>
            </ReportCard>
          </>
        )}
      </ReportGrid>
    </PageContainer>
  );
};

export default ReportsPage;