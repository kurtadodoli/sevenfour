import React, { useState } from 'react';
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
    });

    // Fetch User Logs Data
    const fetchUserLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/admin/user-logs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUserLogs(data);
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
    };

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

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
                                                    <td>${product.productprice}</td>
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
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: #ffffff;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
    font-size: 1.2rem;
    color: #888888;
    margin: 10px 0 0 0;
`;

const ReportsContainer = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
    }
`;

const SidePanel = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 30px;
    height: fit-content;
    border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #ffffff;
    font-weight: 600;
`;

const ReportNavigation = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ReportButton = styled.button`
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
    border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    color: #ffffff;
    padding: 15px 20px;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    
    &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }
`;

const ReportIcon = styled.span`
    font-size: 1.2rem;
`;

const ComingSoon = styled.span`
    background: #333333;
    color: #888888;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    margin-left: auto;
`;

const MainContent = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ReportSection = styled.div`
    width: 100%;
`;

const ReportHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
`;

const ReportTitle = styled.h2`
    font-size: 2rem;
    color: #ffffff;
    margin: 0;
`;

const GenerateButton = styled.button`
    background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
    color: #000000;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const DateRangeContainer = styled.div`
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
`;

const DateInput = styled.input`
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 10px 15px;
    border-radius: 6px;
    
    &:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.15);
    }
`;

const ReportDescription = styled.p`
    color: #888888;
    margin-bottom: 30px;
    font-size: 1.1rem;
`;

const TableContainer = styled.div`
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: rgba(255, 255, 255, 0.02);
`;

const TableHeader = styled.thead`
    background: rgba(255, 255, 255, 0.1);
    
    th {
        padding: 15px 20px;
        text-align: left;
        font-weight: 600;
        color: #ffffff;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    transition: background-color 0.2s ease;
    
    &:hover {
        background: rgba(255, 255, 255, 0.05);
    }
    
    td {
        padding: 15px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: #cccccc;
    }
`;

const RoleBadge = styled.span`
    background: ${props => props.$role === 'admin' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
`;

const StatusBadge = styled.span`
    background: ${props => {
        switch(props.$status) {
            case 'active': return '#4CAF50';
            case 'inactive': return '#FF9800';
            case 'archived': return '#757575';
            default: return '#2196F3';
        }
    }};
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
`;

const ComingSoonSection = styled.div`
    text-align: center;
    padding: 60px 20px;
`;

const ComingSoonIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 20px;
`;

const ComingSoonTitle = styled.h3`
    font-size: 2rem;
    color: #ffffff;
    margin-bottom: 15px;
`;

const ComingSoonText = styled.p`
    color: #888888;
    font-size: 1.1rem;
    margin-bottom: 30px;
`;

const FeatureList = styled.ul`
    list-style: none;
    padding: 0;
    max-width: 400px;
    margin: 0 auto;
    
    li {
        color: #cccccc;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        
        &:before {
            content: '•';
            color: #ffffff;
            margin-right: 10px;
        }
    }
`;

const UnauthorizedMessage = styled.div`
    text-align: center;
    padding: 100px 20px;
    
    h2 {
        color: #ffffff;
        margin-bottom: 15px;
    }
    
    p {
        color: #888888;
        font-size: 1.1rem;
    }
`;

export default DashboardPage;