import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [activeReport, setActiveReport] = useState('user-logs');
    const [userLogs, setUserLogs] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });    // Fetch User Logs Data
    const fetchUserLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/admin/user-logs-test', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUserLogs(data);
                console.log('User logs loaded:', data.length, 'users');
            }
        } catch (error) {
            console.error('Error fetching user logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Inventory Data
    const fetchInventoryData = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/admin/inventory-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dateRange)
            });
            if (response.ok) {
                const data = await response.json();
                setInventoryData(data);
            }
        } catch (error) {
            console.error('Error fetching inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate Reports
    const generateReport = () => {
        if (activeReport === 'user-logs') {
            fetchUserLogs();
        } else if (activeReport === 'inventory') {
            fetchInventoryData();
        }
    };    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    // Auto-load user logs when component mounts
    useEffect(() => {
        if (activeReport === 'user-logs') {
            fetchUserLogs();
        }
    }, [activeReport]);

    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <Container>
                <UnauthorizedMessage>
                    <h2>Unauthorized Access</h2>
                    <p>You need admin privileges to access this dashboard.</p>
                </UnauthorizedMessage>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>Dashboard</Title>
                <Subtitle>Administrative Reports & Analytics</Subtitle>
            </Header>

            <ReportsContainer>
                <SidePanel>
                    <SectionTitle>Reports</SectionTitle>
                    <ReportNavigation>
                        <ReportButton 
                            $active={activeReport === 'user-logs'}
                            onClick={() => setActiveReport('user-logs')}
                        >
                            <ReportIcon>📊</ReportIcon>
                            User Logs Report
                        </ReportButton>
                        
                        <ReportButton 
                            $active={activeReport === 'inventory'}
                            onClick={() => setActiveReport('inventory')}
                        >
                            <ReportIcon>📦</ReportIcon>
                            Inventory Report
                        </ReportButton>
                        
                        <ReportButton 
                            $active={activeReport === 'delivery'}
                            onClick={() => setActiveReport('delivery')}
                        >
                            <ReportIcon>🚚</ReportIcon>
                            Delivery Completion Report
                            <ComingSoon>Coming Soon</ComingSoon>
                        </ReportButton>
                        
                        <ReportButton 
                            $active={activeReport === 'sales'}
                            onClick={() => setActiveReport('sales')}
                        >
                            <ReportIcon>💰</ReportIcon>
                            Sales Report
                            <ComingSoon>Coming Soon</ComingSoon>
                        </ReportButton>
                    </ReportNavigation>
                </SidePanel>

                <MainContent>
                    {/* User Logs Report */}
                    {activeReport === 'user-logs' && (
                        <ReportSection>
                            <ReportHeader>
                                <ReportTitle>User Logs Report</ReportTitle>
                                <GenerateButton onClick={generateReport} disabled={loading}>
                                    {loading ? 'Generating...' : 'Generate Report'}
                                </GenerateButton>
                            </ReportHeader>
                            
                            <ReportDescription>
                                View comprehensive user activity logs including login times, account creation, and updates.
                            </ReportDescription>

                            {userLogs.length > 0 && (
                                <TableContainer>
                                    <Table>
                                        <TableHeader>
                                            <tr>
                                                <th>User ID</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Last Login</th>
                                                <th>Account Created</th>
                                                <th>Last Updated</th>
                                                <th>Status</th>
                                            </tr>
                                        </TableHeader>
                                        <TableBody>
                                            {userLogs.map(user => (
                                                <TableRow key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <RoleBadge $role={user.role}>
                                                            {user.role}
                                                        </RoleBadge>
                                                    </td>
                                                    <td>{formatDate(user.last_login)}</td>
                                                    <td>{formatDate(user.created_at)}</td>
                                                    <td>{formatDate(user.updated_at)}</td>
                                                    <td>
                                                        <StatusBadge $status={user.status ? 'active' : 'inactive'}>
                                                            {user.status ? 'active' : 'inactive'}
                                                        </StatusBadge>
                                                    </td>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </ReportSection>
                    )}

                    {/* Inventory Report */}
                    {activeReport === 'inventory' && (
                        <ReportSection>
                            <ReportHeader>
                                <ReportTitle>Inventory Report</ReportTitle>
                                <DateRangeContainer>
                                    <DateInput
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                        placeholder="Start Date"
                                    />
                                    <DateInput
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                        placeholder="End Date"
                                    />
                                    <GenerateButton onClick={generateReport} disabled={loading}>
                                        {loading ? 'Generating...' : 'Generate Report'}
                                    </GenerateButton>
                                </DateRangeContainer>
                            </ReportHeader>
                            
                            <ReportDescription>
                                Generate comprehensive inventory reports with product status and date range filtering.
                            </ReportDescription>

                            {inventoryData.length > 0 && (
                                <TableContainer>
                                    <Table>
                                        <TableHeader>
                                            <tr>
                                                <th>Product ID</th>
                                                <th>Product Name</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Status</th>
                                                <th>Created Date</th>
                                                <th>Last Updated</th>
                                                <th>Category</th>
                                            </tr>
                                        </TableHeader>
                                        <TableBody>
                                            {inventoryData.map(product => (
                                                <TableRow key={product.id}>
                                                    <td>{product.product_id}</td>
                                                    <td>{product.productname}</td>
                                                    <td>₱{product.productprice}</td>
                                                    <td>{product.total_stock || 0}</td>
                                                    <td>
                                                        <StatusBadge $status={product.productstatus}>
                                                            {product.productstatus}
                                                        </StatusBadge>
                                                    </td>
                                                    <td>{formatDate(product.created_at)}</td>
                                                    <td>{formatDate(product.updated_at)}</td>
                                                    <td>{product.productcolor || 'N/A'}</td>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </ReportSection>
                    )}

                    {/* Delivery Completion Report Template */}
                    {activeReport === 'delivery' && (
                        <ReportSection>
                            <ReportHeader>
                                <ReportTitle>Delivery Completion Report</ReportTitle>
                            </ReportHeader>
                            
                            <ComingSoonSection>
                                <ComingSoonIcon>🚧</ComingSoonIcon>
                                <ComingSoonTitle>Coming Soon</ComingSoonTitle>
                                <ComingSoonText>
                                    This report will provide comprehensive delivery completion analytics including:
                                </ComingSoonText>
                                <FeatureList>
                                    <li>Delivery success rates</li>
                                    <li>Average delivery times</li>
                                    <li>Delivery status tracking</li>
                                    <li>Geographic delivery analysis</li>
                                    <li>Performance metrics</li>
                                </FeatureList>
                            </ComingSoonSection>
                        </ReportSection>
                    )}

                    {/* Sales Report Template */}
                    {activeReport === 'sales' && (
                        <ReportSection>
                            <ReportHeader>
                                <ReportTitle>Sales Report</ReportTitle>
                            </ReportHeader>
                            
                            <ComingSoonSection>
                                <ComingSoonIcon>🚧</ComingSoonIcon>
                                <ComingSoonTitle>Coming Soon</ComingSoonTitle>
                                <ComingSoonText>
                                    This report will provide detailed sales analytics including:
                                </ComingSoonText>
                                <FeatureList>
                                    <li>Revenue analysis by time period</li>
                                    <li>Top-selling products</li>
                                    <li>Customer purchase patterns</li>
                                    <li>Profit margin calculations</li>
                                    <li>Sales performance trends</li>
                                </FeatureList>
                            </ComingSoonSection>
                        </ReportSection>
                    )}
                </MainContent>
            </ReportsContainer>
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    min-height: 100vh;
    background: #ffffff;
    color: #000000;
    padding: 1.5rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 3rem;
    padding: 2.5rem 0;
`;

const Title = styled.h1`
    font-size: 2.8rem;
    font-weight: 200;
    margin: 0 0 0.5rem 0;
    color: #000000;
    letter-spacing: -1px;
`;

const Subtitle = styled.p`
    font-size: 1.1rem;
    color: #666666;
    margin: 0;
    font-weight: 300;
`;

const ReportsContainer = styled.div`
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
`;

const SidePanel = styled.div`
    background: #ffffff;
    border: 1px solid #e0e0e0;
    padding: 2rem;
    height: fit-content;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h2`
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    color: #000000;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const ReportNavigation = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const ReportButton = styled.button`
    background: ${props => props.$active ? '#000000' : '#ffffff'};
    border: 1px solid ${props => props.$active ? '#000000' : '#e0e0e0'};
    color: ${props => props.$active ? '#ffffff' : '#666666'};
    padding: 1rem 1.2rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    font-weight: 400;
    
    &:hover {
        background: ${props => props.$active ? '#000000' : '#000000'};
        border-color: #000000;
        color: #ffffff;
    }
`;

const ReportIcon = styled.span`
    font-size: 1rem;
    width: 1.2rem;
    text-align: center;
`;

const ComingSoon = styled.span`
    background: #f5f5f5;
    color: #999999;
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
    margin-left: auto;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
`;

const MainContent = styled.div`
    background: #ffffff;
    border: 1px solid #e0e0e0;
    padding: 2.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const ReportSection = styled.div`
    width: 100%;
`;

const ReportHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f0f0f0;
`;

const ReportTitle = styled.h2`
    font-size: 1.8rem;
    color: #000000;
    margin: 0;
    font-weight: 400;
    letter-spacing: -0.3px;
`;

const GenerateButton = styled.button`
    background: #000000;
    color: #ffffff;
    border: none;
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    font-weight: 400;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    
    &:hover {
        background: #333333;
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const DateRangeContainer = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
`;

const DateInput = styled.input`
    background: #ffffff;
    border: 1px solid #e0e0e0;
    color: #333333;
    padding: 0.8rem 1rem;
    font-weight: 300;
    
    &:focus {
        outline: none;
        border-color: #000000;
    }
`;

const ReportDescription = styled.p`
    color: #666666;
    margin-bottom: 2rem;
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.6;
`;

const TableContainer = styled.div`
    overflow-x: auto;
    border: 1px solid #e0e0e0;
    background: #ffffff;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
`;

const TableHeader = styled.thead`
    background: #f8f8f8;
    
    th {
        padding: 1rem 1.25rem;
        text-align: left;
        font-weight: 500;
        color: #333333;
        border-bottom: 1px solid #e0e0e0;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    transition: background-color 0.2s ease;
    
    &:hover {
        background: #fafafa;
    }
    
    td {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #f0f0f0;
        color: #333333;
        font-weight: 300;
    }
    
    &:last-child td {
        border-bottom: none;
    }
`;

const RoleBadge = styled.span`
    background: ${props => props.$role === 'admin' ? '#000000' : '#666666'};
    color: #ffffff;
    padding: 0.3rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatusBadge = styled.span`
    background: ${props => {
        switch(props.$status) {
            case 'active': return '#000000';
            case 'inactive': return '#999999';
            case 'archived': return '#666666';
            default: return '#333333';
        }
    }};
    color: #ffffff;
    padding: 0.3rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ComingSoonSection = styled.div`
    text-align: center;
    padding: 4rem 1.5rem;
`;

const ComingSoonIcon = styled.div`
    font-size: 3rem;
    margin-bottom: 1.5rem;
    opacity: 0.6;
`;

const ComingSoonTitle = styled.h3`
    font-size: 1.5rem;
    color: #333333;
    margin-bottom: 1rem;
    font-weight: 400;
`;

const ComingSoonText = styled.p`
    color: #666666;
    font-size: 1rem;
    margin-bottom: 2rem;
    font-weight: 300;
    line-height: 1.6;
`;

const FeatureList = styled.ul`
    list-style: none;
    padding: 0;
    max-width: 400px;
    margin: 0 auto;
    
    li {
        color: #666666;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f0f0f0;
        font-weight: 300;
        
        &:before {
            content: '•';
            color: #000000;
            margin-right: 0.75rem;
            font-weight: 500;
        }
        
        &:last-child {
            border-bottom: none;
        }
    }
`;

const UnauthorizedMessage = styled.div`
    text-align: center;
    padding: 5rem 1.5rem;
    
    h2 {
        color: #000000;
        margin-bottom: 1rem;
        font-weight: 400;
        font-size: 1.5rem;
    }
    
    p {
        color: #666666;
        font-size: 1rem;
        font-weight: 300;
    }
`;

export default DashboardPage;