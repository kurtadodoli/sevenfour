import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import StockStatusWidget from '../components/StockStatusWidget';

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [activeReport, setActiveReport] = useState('user-logs');    const [userLogs, setUserLogs] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });// Fetch User Logs Data
    const fetchUserLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/user-logs-test', {
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
            console.error('Error fetching user logs:', error);        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Inventory Data
    const fetchInventoryData = useCallback(async () => {
        setLoading(true);
        try {
            // First try the existing inventory report endpoint
            let response = await fetch('http://localhost:5000/api/admin/inventory-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dateRange)
            });
            
            // If that fails, try the products endpoint instead
            if (!response.ok) {
                console.log('Inventory report endpoint not available, using products endpoint');
                response = await fetch('http://localhost:5000/api/maintenance/products', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            
            if (response.ok) {
                const data = await response.json();
                setInventoryData(data);
                console.log('Inventory data loaded:', data.length, 'products');
            }
        } catch (error) {            console.error('Error fetching inventory data:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    // Delete User Function
    const deleteUser = async (userId, userEmail) => {
        // Prevent deletion of the current admin user
        if (currentUser && currentUser.id === userId) {
            alert('You cannot delete your own account.');
            return;
        }

        // Confirmation dialog
        const confirmDelete = window.confirm(
            `Are you sure you want to permanently delete the user "${userEmail}"?\n\nThis action cannot be undone and will remove all user data from the database.`
        );

        if (!confirmDelete) {
            return;
        }

        setDeletingUserId(userId);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Remove the deleted user from the state
                setUserLogs(prevLogs => prevLogs.filter(user => user.id !== userId));
                alert('User account deleted successfully.');
            } else {
                const errorData = await response.json();
                alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Network error occurred while deleting user.');
        } finally {
            setDeletingUserId(null);
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
    };    // Data Visualization Functions for User Logs
    const getUserMetrics = () => {
        if (!userLogs.length) return null;

        const totalUsers = userLogs.length;
        const adminUsers = userLogs.filter(user => user.role === 'admin').length;
        const customerUsers = userLogs.filter(user => user.role === 'customer').length;
        const activeUsers = userLogs.filter(user => user.status).length;
        const inactiveUsers = userLogs.filter(user => !user.status).length;

        // Calculate registration trends (last 7 days)
        const now = new Date();
        const registrationTrends = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const registrationsOnDay = userLogs.filter(user => {
                const createdAt = new Date(user.created_at);
                return createdAt >= dayStart && createdAt <= dayEnd;
            }).length;

            registrationTrends.push({
                date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
                count: registrationsOnDay
            });
        }

        // Calculate recent activity (users with recent logins - last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentlyActiveUsers = userLogs.filter(user => {
            if (!user.last_login) return false;
            return new Date(user.last_login) >= thirtyDaysAgo;
        }).length;

        return {
            totalUsers,
            adminUsers,
            customerUsers,
            activeUsers,
            inactiveUsers,
            recentlyActiveUsers,
            registrationTrends,
            adminPercentage: totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0,
            activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
        };
    };

    // Data Visualization Functions for Inventory
    const getInventoryMetrics = () => {
        if (!inventoryData.length) return null;

        const totalProducts = inventoryData.length;
        const activeProducts = inventoryData.filter(product => product.productstatus === 'active').length;
        const archivedProducts = inventoryData.filter(product => product.productstatus === 'archived').length;
        
        // Calculate total stock and variants
        let totalStock = 0;
        let lowStockProducts = 0;
        let outOfStockProducts = 0;
        let totalVariants = 0;
        
        inventoryData.forEach(product => {
            // Calculate stock from variants if available
            if (product.variants && Array.isArray(product.variants)) {
                const productStock = product.variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);
                totalStock += productStock;
                totalVariants += product.variants.length;
                
                if (productStock === 0) outOfStockProducts++;
                else if (productStock <= 10) lowStockProducts++;
            } else {
                // Fallback to total_stock field
                const productStock = parseInt(product.total_stock) || 0;
                totalStock += productStock;
                
                if (productStock === 0) outOfStockProducts++;
                else if (productStock <= 10) lowStockProducts++;
            }
        });

        // Product type distribution
        const typeDistribution = {};
        inventoryData.forEach(product => {
            const type = product.product_type || 'Unknown';
            typeDistribution[type] = (typeDistribution[type] || 0) + 1;
        });

        // Top product types
        const topProductTypes = Object.entries(typeDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));

        // Stock level distribution
        const stockLevels = {
            healthy: totalProducts - lowStockProducts - outOfStockProducts,
            low: lowStockProducts,
            outOfStock: outOfStockProducts
        };

        // Calculate average price
        const totalValue = inventoryData.reduce((sum, product) => {
            return sum + (parseFloat(product.productprice) || 0);
        }, 0);
        const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

        return {
            totalProducts,
            activeProducts,
            archivedProducts,
            totalStock,
            totalVariants,
            lowStockProducts,
            outOfStockProducts,
            averagePrice,
            typeDistribution,
            topProductTypes,
            stockLevels,
            activePercentage: totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0,
            lowStockPercentage: totalProducts > 0 ? Math.round((lowStockProducts / totalProducts) * 100) : 0
        };
    };

    const userMetrics = getUserMetrics();
    const inventoryMetrics = getInventoryMetrics();    // Auto-load data when report type changes
    useEffect(() => {
        if (activeReport === 'user-logs') {
            fetchUserLogs();
        } else if (activeReport === 'inventory') {
            fetchInventoryData();
        }
    }, [activeReport, fetchUserLogs, fetchInventoryData]);

    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <PageWrapper>
                <Container>
                    <UnauthorizedMessage>
                        <h2>Unauthorized Access</h2>
                        <p>You need admin privileges to access this dashboard.</p>
                    </UnauthorizedMessage>
                </Container>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <Container>
            <Header>
                <Title>Dashboard</Title>
                <Subtitle>Administrative Reports & Analytics</Subtitle>
                <StockStatusWidget />
            </Header>

            <ReportsContainer>                <SidePanel>
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
                            Inventory Report                        </ReportButton>
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

                            {/* Data Visualization Section */}
                            {userLogs.length > 0 && userMetrics && (
                                <VisualizationSection>
                                    <SectionTitle>📊 User Analytics Dashboard</SectionTitle>
                                    
                                    {/* Key Metrics Cards */}
                                    <MetricsGrid>
                                        <MetricCard>
                                            <MetricValue>{userMetrics.totalUsers}</MetricValue>
                                            <MetricLabel>Total Users</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{userMetrics.activeUsers}</MetricValue>
                                            <MetricLabel>Active Users</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{userMetrics.recentlyActiveUsers}</MetricValue>
                                            <MetricLabel>Recently Active (30d)</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{userMetrics.adminUsers}</MetricValue>
                                            <MetricLabel>Admin Users</MetricLabel>
                                        </MetricCard>
                                    </MetricsGrid>

                                    {/* Charts Grid */}
                                    <ChartsGrid>
                                        {/* Role Distribution Pie Chart */}
                                        <ChartCard>
                                            <ChartTitle>👥 User Roles Distribution</ChartTitle>
                                            <PieChartContainer adminPercentage={userMetrics.adminPercentage}>
                                                <PieChartCenter>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                        {userMetrics.totalUsers}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                        Total Users
                                                    </div>
                                                </PieChartCenter>
                                            </PieChartContainer>
                                            <ChartLegend>
                                                <LegendItem>
                                                    <LegendColor color="#dc3545" />
                                                    Admin ({userMetrics.adminUsers})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#28a745" />
                                                    Customer ({userMetrics.customerUsers})
                                                </LegendItem>
                                            </ChartLegend>
                                        </ChartCard>

                                        {/* Activity Status Chart */}
                                        <ChartCard>
                                            <ChartTitle>🔄 User Activity Status</ChartTitle>
                                            <PieChartContainer adminPercentage={100 - userMetrics.activePercentage}>
                                                <PieChartCenter>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                                        {userMetrics.activePercentage}%
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                        Active
                                                    </div>
                                                </PieChartCenter>
                                            </PieChartContainer>
                                            <ChartLegend>
                                                <LegendItem>
                                                    <LegendColor color="#28a745" />
                                                    Active ({userMetrics.activeUsers})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#dc3545" />
                                                    Inactive ({userMetrics.inactiveUsers})
                                                </LegendItem>
                                            </ChartLegend>
                                        </ChartCard>

                                        {/* Registration Trends Bar Chart */}
                                        <ChartCard style={{ gridColumn: '1 / -1' }}>
                                            <ChartTitle>📈 User Registration Trends (Last 7 Days)</ChartTitle>
                                            <BarChart>
                                                {userMetrics.registrationTrends.map((day, index) => {
                                                    const maxCount = Math.max(...userMetrics.registrationTrends.map(d => d.count));
                                                    const height = maxCount > 0 ? (day.count / maxCount) * 120 : 4;
                                                    return (
                                                        <BarGroup key={index}>
                                                            <Bar height={height} value={day.count} />
                                                            <BarLabel>{day.date}</BarLabel>
                                                        </BarGroup>
                                                    );
                                                })}
                                            </BarChart>
                                        </ChartCard>
                                    </ChartsGrid>
                                </VisualizationSection>
                            )}

                            {userLogs.length > 0 && (
                                <TableContainer>                                    <Table>
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
                                                <th>Actions</th>
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
                                                    <td>
                                                        <DeleteButton
                                                            onClick={() => deleteUser(user.id, user.email)}
                                                            disabled={deletingUserId === user.id || (currentUser && currentUser.id === user.id)}
                                                            title={currentUser && currentUser.id === user.id ? "Cannot delete your own account" : "Permanently delete this user"}
                                                        >
                                                            {deletingUserId === user.id ? 'Deleting...' : '🗑️ Delete'}
                                                        </DeleteButton>
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

                            {/* Data Visualization Section */}
                            {inventoryData.length > 0 && inventoryMetrics && (
                                <VisualizationSection>
                                    <SectionTitle>📦 Inventory Analytics Dashboard</SectionTitle>
                                    
                                    {/* Key Metrics Cards */}
                                    <MetricsGrid>
                                        <MetricCard>
                                            <MetricValue>{inventoryMetrics.totalProducts}</MetricValue>
                                            <MetricLabel>Total Products</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{inventoryMetrics.activeProducts}</MetricValue>
                                            <MetricLabel>Active Products</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{inventoryMetrics.outOfStockProducts}</MetricValue>
                                            <MetricLabel>Out of Stock</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{inventoryMetrics.archivedProducts}</MetricValue>
                                            <MetricLabel>Archived Products</MetricLabel>
                                        </MetricCard>
                                    </MetricsGrid>

                                    {/* Charts Grid */}
                                    <ChartsGrid>
                                        {/* Stock Level Distribution Pie Chart */}
                                        <ChartCard>
                                            <ChartTitle>📊 Stock Level Distribution</ChartTitle>
                                            <PieChartContainer adminPercentage={inventoryMetrics.lowStockPercentage}>
                                                <PieChartCenter>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                        {inventoryMetrics.totalProducts}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                        Total Products
                                                    </div>
                                                </PieChartCenter>
                                            </PieChartContainer>
                                            <ChartLegend>
                                                <LegendItem>
                                                    <LegendColor color="#28a745" />
                                                    Healthy Stock ({inventoryMetrics.totalProducts - inventoryMetrics.lowStockProducts - inventoryMetrics.outOfStockProducts})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#ffc107" />
                                                    Low Stock ({inventoryMetrics.lowStockProducts})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#dc3545" />
                                                    Out of Stock ({inventoryMetrics.outOfStockProducts})
                                                </LegendItem>
                                            </ChartLegend>
                                        </ChartCard>

                                        {/* Product Type Distribution Chart */}
                                        <ChartCard>
                                            <ChartTitle>📂 Product Type Distribution</ChartTitle>
                                            <BarChart>
                                                {inventoryMetrics.topProductTypes.map((type, index) => {
                                                    const maxCount = Math.max(...inventoryMetrics.topProductTypes.map(t => t.count));
                                                    const height = maxCount > 0 ? (type.count / maxCount) * 120 : 4;
                                                    return (
                                                        <BarGroup key={index}>
                                                            <Bar height={height} value={type.count} />
                                                            <BarLabel>{type.type}</BarLabel>
                                                        </BarGroup>
                                                    );
                                                })}
                                            </BarChart>
                                        </ChartCard>
                                    </ChartsGrid>
                                </VisualizationSection>
                            )}

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
                        </ReportSection>                    )}
                </MainContent>
            </ReportsContainer>
        </Container>
        </PageWrapper>
    );
};

// Styled Components
const PageWrapper = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f8f9fa 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const Container = styled.div`
    width: 100%;
    max-width: 1800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem 0;
    width: 100%;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    font-weight: 100;
    margin: 0 0 0.75rem 0;
    color: #000000;
    letter-spacing: -2px;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
        letter-spacing: -1px;
    }
`;

const Subtitle = styled.p`
    font-size: 1.2rem;
    color: #666666;
    margin: 0;
    font-weight: 300;
    letter-spacing: 0.5px;
    opacity: 0.8;
`;

const ReportsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    align-items: center;

    @media (max-width: 768px) {
        gap: 1.5rem;
    }
`;

const SidePanel = styled.div`
    background: #ffffff;
    border: none;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    width: 100%;
    max-width: 1000px;
    
    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem;
    margin-bottom: 2rem;
    color: #000000;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-align: center;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -0.5rem;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 2px;
        background: linear-gradient(135deg, #000000, #333333);
        border-radius: 1px;
    }
`;

const ReportNavigation = styled.div`
    display: flex;
    flex-direction: row;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    
    @media (max-width: 600px) {
        flex-direction: column;
        gap: 0.75rem;
    }
`;

const ReportButton = styled.button`
    background: ${props => props.$active 
        ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' 
        : '#ffffff'
    };
    border: ${props => props.$active ? 'none' : '2px solid #f0f0f0'};
    color: ${props => props.$active ? '#ffffff' : '#666666'};
    padding: 1rem 1.5rem;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    position: relative;
    font-weight: 500;
    border-radius: 12px;
    font-size: 0.9rem;
    overflow: hidden;
    min-width: 180px;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
    }
    
    &:hover {
        background: ${props => props.$active 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' 
            : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
        };
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border-color: #000000;
        
        &::before {
            left: 100%;
        }
    }
    
    &:active {
        transform: translateY(0);
    }
    
    @media (max-width: 600px) {
        min-width: auto;
        width: 100%;
        text-align: left;
        justify-content: flex-start;
    }
`;

const ReportIcon = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
    font-size: 1.2rem;
    width: 1.5rem;
    text-align: center;
    filter: ${props => props.active ? 'none' : 'grayscale(0.3)'};
    transition: filter 0.3s ease;
`;

const MainContent = styled.div`
    background: #ffffff;
    border: none;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    min-height: 600px;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
        padding: 2rem;
        border-radius: 16px;
        max-width: 100%;
    }
`;

const ReportSection = styled.div`
    width: 100%;
    animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const ReportHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #f8f9fa;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 60px;
        height: 2px;
        background: linear-gradient(135deg, #000000, #333333);
        border-radius: 1px;
    }
`;

const ReportTitle = styled.h2`
    font-size: 2.2rem;
    color: #000000;
    margin: 0;
    font-weight: 300;
    letter-spacing: -0.5px;
    position: relative;
`;

const GenerateButton = styled.button`
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: #ffffff;
    border: none;
    padding: 1rem 2rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.95rem;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
    }
    
    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        
        &::before {
            left: 100%;
        }
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
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
    border: 2px solid #f0f0f0;
    color: #333333;
    padding: 0.9rem 1.2rem;
    font-weight: 400;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.95rem;
    
    &:focus {
        outline: none;
        border-color: #000000;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
    }
`;

const ReportDescription = styled.p`
    color: #666666;
    margin-bottom: 3rem;
    font-size: 1.1rem;
    font-weight: 300;
    line-height: 1.7;
    text-align: center;
    opacity: 0.9;
`;

const TableContainer = styled.div`
    overflow-x: auto;
    border: none;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-top: 2rem;
    width: 100%;
    
    /* Ensure table scrolls horizontally on smaller screens */
    @media (max-width: 1600px) {
        overflow-x: scroll;
        -webkit-overflow-scrolling: touch;
    }
    
    /* Add scrollbar styling for better UX */
    &::-webkit-scrollbar {
        height: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
`;

const Table = styled.table`
    width: 100%;
    min-width: 1200px; /* Increased minimum width for more columns */
    border-collapse: collapse;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
`;

const TableHeader = styled.thead`
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    
    th {
        padding: 1.5rem 2.5rem;
        text-align: left;
        font-weight: 600;
        color: #000000;
        border-bottom: none;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        min-width: 150px; /* Increased minimum column width */
        white-space: nowrap; /* Prevent text wrapping in headers */
        
        &:first-child {
            border-top-left-radius: 16px;
            min-width: 100px;
        }
        
        &:last-child {
            border-top-right-radius: 16px;
            min-width: 120px;
        }
        
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
        }
    }
`;

const TableBody = styled.tbody`
    tr:last-child td:first-child {
        border-bottom-left-radius: 16px;
    }
    
    tr:last-child td:last-child {
        border-bottom-right-radius: 16px;
    }
`;

const TableRow = styled.tr`
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
        background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    td {
        padding: 1.5rem 2.5rem;
        border-bottom: 1px solid #f8f9fa;
        color: #333333;
        font-weight: 400;
        font-size: 0.95rem;
        vertical-align: middle;
        min-width: 150px; /* Increased minimum column width */
        
        &:first-child {
            min-width: 100px;
        }
        
        &:last-child {
            min-width: 120px;
        }
    }
    
    &:last-child td {
        border-bottom: none;
    }
`;

const RoleBadge = styled.span`
    background: ${props => props.$role === 'admin' 
        ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' 
        : 'linear-gradient(135deg, #666666 0%, #808080 100%)'
    };
    color: #ffffff;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 20px;
    display: inline-block;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const StatusBadge = styled.span`
    background: ${props => {
        switch(props.$status) {
            case 'active': return 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)';
            case 'inactive': return 'linear-gradient(135deg, #999999 0%, #b3b3b3 100%)';
            case 'archived': return 'linear-gradient(135deg, #666666 0%, #808080 100%)';
            default: return 'linear-gradient(135deg, #333333 0%, #4d4d4d 100%)';
        }
    }};
    color: #ffffff;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 20px;
    display: inline-block;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const DeleteButton = styled.button`
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: #ffffff;
    border: none;
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
    }
    
    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #c82333 0%, #a71d2a 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
        
        &::before {
            left: 100%;
        }
    }
    
    &:disabled {
        background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    }
`;

const UnauthorizedMessage = styled.div`
    text-align: center;
    padding: 6rem 2rem;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    max-width: 500px;
    margin: 0 auto;
    
    h2 {
        color: #000000;
        margin-bottom: 1.5rem;
        font-weight: 300;
        font-size: 2rem;
        letter-spacing: -0.5px;
    }
    
    p {
        color: #666666;
        font-size: 1.1rem;
        font-weight: 300;
        line-height: 1.6;
    }
`;

// Data Visualization Styled Components
const VisualizationSection = styled.div`
    background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
    border: none;
    border-radius: 20px;
    padding: 3rem;
    margin-bottom: 3rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(135deg, #000000 0%, #333333 100%);
        border-radius: 20px 20px 0 0;
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
`;

const MetricCard = styled.div`
    background: #ffffff;
    border: none;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(135deg, #000000 0%, #333333 100%);
    }
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }
`;

const MetricValue = styled.div`
    font-size: 2.5rem;
    font-weight: 700;
    color: #000000;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const MetricLabel = styled.div`
    font-size: 0.95rem;
    color: #666666;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
`;

const ChartCard = styled.div`
    background: #ffffff;
    border: none;
    border-radius: 16px;
    padding: 2rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(135deg, #000000 0%, #333333 100%);
    }
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }
`;

const ChartTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: #000000;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    letter-spacing: 0.5px;
`;

const PieChartContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'adminPercentage',
})`
    position: relative;
    width: 180px;
    height: 180px;
    margin: 0 auto 1.5rem auto;
    border-radius: 50%;
    background: conic-gradient(
        ${props => props.adminPercentage ? `
            #dc3545 0deg ${props.adminPercentage * 3.6}deg,
            #28a745 ${props.adminPercentage * 3.6}deg 360deg
        ` : '#28a745 0deg 360deg'}
    );
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    &::before {
        content: '';
        position: absolute;
        width: 120px;
        height: 120px;
        background: white;
        border-radius: 50%;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
    }
`;

const PieChartCenter = styled.div`
    position: relative;
    z-index: 1;
    text-align: center;
    font-weight: 600;
    color: #333;
`;

const ChartLegend = styled.div`
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: #666666;
    font-weight: 500;
`;

const LegendColor = styled.div`
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background-color: ${props => props.color};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const BarChart = styled.div`
    display: flex;
    align-items: end;
    gap: 0.75rem;
    height: 160px;
    padding: 1.5rem 0;
    justify-content: space-around;
    background: linear-gradient(to top, #f8f9fa 0%, transparent 100%);
    border-radius: 12px;
    margin-top: 1rem;
`;

const BarGroup = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    max-width: 70px;
`;

const Bar = styled.div`
    width: 100%;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    border-radius: 6px 6px 0 0;
    height: ${props => props.height}px;
    min-height: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &:hover {
        background: linear-gradient(135deg, #333333 0%, #555555 100%);
        transform: scaleY(1.05) scaleX(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    &::after {
        content: '${props => props.value}';
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        font-weight: 700;
        color: #000;
        opacity: 0;
        transition: opacity 0.3s ease;
        background: rgba(255, 255, 255, 0.9);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:hover::after {
        opacity: 1;
    }
`;

const BarLabel = styled.div`
    font-size: 0.8rem;
    color: #666;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
`;

export default DashboardPage;