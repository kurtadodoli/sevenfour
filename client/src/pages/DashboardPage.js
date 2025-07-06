import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [activeReport, setActiveReport] = useState('user-logs');    const [userLogs, setUserLogs] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [salesData, setSalesData] = useState([]);
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

    // Fetch Sales Data
    const fetchSalesData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/sales-report', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSalesData(data.data || []);
                console.log('Sales data loaded:', data.data?.length || 0, 'records');
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

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
        } else if (activeReport === 'sales') {
            fetchSalesData();
        }
    };    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };    // Enhanced Data Visualization Functions for User Logs
    const getUserMetrics = () => {
        if (!userLogs.length) return null;

        const now = new Date();
        const totalUsers = userLogs.length;
        const adminUsers = userLogs.filter(user => user.role === 'admin').length;
        const customerUsers = userLogs.filter(user => user.role === 'customer').length;

        // Enhanced time periods for analysis
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Weekly Registration Trend Analysis
        const registrationTrends = [];
        for (let i = 7; i >= 0; i--) {
            const weekEnd = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
            const weekStart = new Date(weekEnd.getTime() - (6 * 24 * 60 * 60 * 1000));
            
            const weeklyRegistrations = userLogs.filter(user => {
                const createdAt = new Date(user.created_at);
                return createdAt >= weekStart && createdAt <= weekEnd;
            }).length;

            registrationTrends.push({
                week: `W${8-i}`,
                registrations: weeklyRegistrations,
                period: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            });
        }

        // Advanced User Health Metrics
        const activeUsers = userLogs.filter(user => 
            user.status && user.last_login && new Date(user.last_login) >= thirtyDaysAgo
        ).length;

        const healthScore = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

        // User Value Assessment
        const customerRetention = userLogs.filter(user => {
            if (!user.last_login || !user.created_at || user.role !== 'customer') return false;
            const createdAt = new Date(user.created_at);
            const lastLogin = new Date(user.last_login);
            const oneWeekAfterCreation = new Date(createdAt.getTime() + (7 * 24 * 60 * 60 * 1000));
            return lastLogin >= oneWeekAfterCreation;
        }).length;

        const customerBase = userLogs.filter(user => user.role === 'customer').length;
        const retentionRate = customerBase > 0 ? Math.round((customerRetention / customerBase) * 100) : 0;

        // Growth momentum calculation
        const currentWeekSignups = registrationTrends[registrationTrends.length - 1]?.registrations || 0;
        const lastWeekSignups = registrationTrends[registrationTrends.length - 2]?.registrations || 0;
        const growthMomentum = lastWeekSignups > 0 ? Math.round(((currentWeekSignups - lastWeekSignups) / lastWeekSignups) * 100) : 0;

        return {
            totalUsers,
            adminUsers,
            customerUsers,
            adminCount: adminUsers,
            activeUsers,
            healthScore,
            retentionRate,
            growthMomentum,
            registrationTrends,
            adminPercentage: totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0
        };
    };

    // Enhanced Data Visualization Functions for Inventory
    const getInventoryMetrics = () => {
        if (!inventoryData.length) return null;

        const totalProducts = inventoryData.length;
        const activeProducts = inventoryData.filter(product => product.productstatus === 'active').length;
        const archivedProducts = inventoryData.filter(product => product.productstatus === 'archived').length;
        
        // Advanced Inventory Intelligence
        let totalStock = 0;
        let totalValue = 0;
        let stockDistribution = { critical: 0, warning: 0, healthy: 0, overstocked: 0 };
        let priceSegments = { economy: 0, standard: 0, premium: 0, luxury: 0 };
        let categoryInsights = {};
        let turnoverAnalysis = { fastMoving: 0, moderate: 0, slow: 0, dead: 0 };
        
        inventoryData.forEach(product => {
            const price = parseFloat(product.productprice) || 0;
            const stock = parseInt(product.total_stock) || 0;
            const category = product.product_type || 'Uncategorized';
            
            totalStock += stock;
            totalValue += price * stock;
            
            // Intelligent Stock Level Categorization
            if (stock === 0) stockDistribution.critical++;
            else if (stock <= 5) stockDistribution.warning++;
            else if (stock <= 50) stockDistribution.healthy++;
            else stockDistribution.overstocked++;
            
            // Market-based Price Segmentation
            if (price <= 750) priceSegments.economy++;
            else if (price <= 1500) priceSegments.standard++;
            else if (price <= 3000) priceSegments.premium++;
            else priceSegments.luxury++;
            
            // Category Performance Intelligence
            if (!categoryInsights[category]) {
                categoryInsights[category] = {
                    count: 0,
                    totalValue: 0,
                    avgPrice: 0,
                    totalStock: 0,
                    activeProducts: 0,
                    stockTurnover: 'unknown',
                    profitPotential: 0
                };
            }
            
            const catData = categoryInsights[category];
            catData.count++;
            catData.totalValue += price * stock;
            catData.totalStock += stock;
            catData.profitPotential += price * 0.3; // Assuming 30% margin
            if (product.productstatus === 'active') catData.activeProducts++;
            
            // Turnover estimation (based on stock levels and price points)
            const turnoverScore = (price / 1000) * (stock > 0 ? 10 / stock : 0);
            if (turnoverScore > 8) turnoverAnalysis.fastMoving++;
            else if (turnoverScore > 4) turnoverAnalysis.moderate++;
            else if (turnoverScore > 1) turnoverAnalysis.slow++;
            else turnoverAnalysis.dead++;
        });

        // Calculate advanced category metrics
        Object.keys(categoryInsights).forEach(category => {
            const cat = categoryInsights[category];
            cat.avgPrice = cat.count > 0 ? (cat.totalValue / cat.totalStock) || 0 : 0;
            cat.marketDominance = totalProducts > 0 ? Math.round((cat.count / totalProducts) * 100) : 0;
            cat.activationRate = cat.count > 0 ? Math.round((cat.activeProducts / cat.count) * 100) : 0;
            cat.valuePercentage = totalValue > 0 ? Math.round((cat.totalValue / totalValue) * 100) : 0;
        });

        // Business Intelligence Calculations
        const stockHealth = totalProducts > 0 ? Math.round(((stockDistribution.healthy + stockDistribution.overstocked) / totalProducts) * 100) : 0;
        const averageProductValue = totalStock > 0 ? totalValue / totalStock : 0;
        const portfolioDiversity = Object.keys(categoryInsights).length;
        const reorderAlertCount = stockDistribution.critical + stockDistribution.warning;
        
        // Financial Risk Assessment
        const riskProfile = {
            highRisk: stockDistribution.critical,  // Out of stock = lost sales
            mediumRisk: stockDistribution.warning, // Low stock = potential stockout
            lowRisk: stockDistribution.healthy,    // Optimal stock levels
            capitalTied: stockDistribution.overstocked // Excess inventory
        };

        // Performance Champions by Value
        const topPerformers = Object.entries(categoryInsights)
            .sort(([,a], [,b]) => b.totalValue - a.totalValue)
            .slice(0, 6)
            .map(([name, data]) => ({
                name,
                value: data.totalValue,
                products: data.count,
                avgPrice: data.avgPrice,
                profitPotential: data.profitPotential
            }));

        // Inventory optimization insights
        const optimizationScore = Math.round(
            (stockHealth * 0.4) + 
            (Math.min(portfolioDiversity * 10, 100) * 0.3) + 
            ((100 - (reorderAlertCount / totalProducts) * 100) * 0.3)
        );

        return {
            totalProducts,
            activeProducts,
            archivedProducts,
            totalStock,
            totalValue,
            stockDistribution,
            priceSegments,
            categoryInsights,
            turnoverAnalysis,
            stockHealth,
            averageProductValue,
            portfolioDiversity,
            riskProfile,
            topPerformers,
            reorderAlertCount,
            optimizationScore,
            activePercentage: totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0
        };
    };

    // Enhanced Sales Analytics with Business Intelligence
    const getSalesMetrics = () => {
        if (!salesData.length) return null;

        // Advanced sales intelligence
        let totalRevenue = 0;
        let totalQuantitySold = 0;
        const salesByDate = {};
        const salesByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const monthlyPerformance = {};
        const productIntelligence = {};
        const hourlyPattern = new Array(24).fill(0);

        salesData.forEach(sale => {
            const revenue = parseFloat(sale.total_revenue) || 0;
            const quantity = parseInt(sale.total_sold) || 0;
            const saleDate = new Date(sale.sale_date);
            const dateString = saleDate.toLocaleDateString();
            const dayName = saleDate.toLocaleDateString('en-US', { weekday: 'short' });
            const monthKey = saleDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            const hour = saleDate.getHours();
            const productName = sale.productname;
            
            totalRevenue += revenue;
            totalQuantitySold += quantity;
            
            // Daily aggregation with enhanced metrics
            if (!salesByDate[dateString]) {
                salesByDate[dateString] = { 
                    date: dateString, 
                    revenue: 0, 
                    quantity: 0, 
                    orders: 0,
                    avgOrderValue: 0,
                    topProduct: null,
                    maxSingleSale: 0
                };
            }
            const dayData = salesByDate[dateString];
            dayData.revenue += revenue;
            dayData.quantity += quantity;
            dayData.orders += 1;
            dayData.avgOrderValue = dayData.revenue / dayData.orders;
            if (revenue > dayData.maxSingleSale) {
                dayData.maxSingleSale = revenue;
                dayData.topProduct = productName;
            }
            
            // Weekly pattern analysis
            salesByDay[dayName] += revenue;
            
            // Monthly business intelligence
            if (!monthlyPerformance[monthKey]) {
                monthlyPerformance[monthKey] = { 
                    month: monthKey, 
                    revenue: 0, 
                    quantity: 0,
                    orders: 0,
                    uniqueProducts: new Set(),
                    avgOrderValue: 0
                };
            }
            const monthData = monthlyPerformance[monthKey];
            monthData.revenue += revenue;
            monthData.quantity += quantity;
            monthData.orders += 1;
            monthData.uniqueProducts.add(productName);
            monthData.avgOrderValue = monthData.revenue / monthData.orders;
            
            // Hourly sales pattern (for operational insights)
            hourlyPattern[hour] += revenue;
            
            // Advanced Product Intelligence
            if (!productIntelligence[productName]) {
                productIntelligence[productName] = {
                    name: productName,
                    totalRevenue: 0,
                    totalQuantity: 0,
                    orderCount: 0,
                    avgOrderValue: 0,
                    firstSale: saleDate,
                    lastSale: saleDate,
                    peakDay: '',
                    consistency: 0,
                    profitabilityScore: 0
                };
            }
            
            const product = productIntelligence[productName];
            product.totalRevenue += revenue;
            product.totalQuantity += quantity;
            product.orderCount += 1;
            product.avgOrderValue = product.totalRevenue / product.orderCount;
            product.profitabilityScore = (product.totalRevenue / product.totalQuantity) * product.orderCount;
            
            if (saleDate < product.firstSale) product.firstSale = saleDate;
            if (saleDate > product.lastSale) product.lastSale = saleDate;
        });

        // Convert monthly data and calculate growth
        const monthlyTrends = Object.values(monthlyPerformance)
            .sort((a, b) => new Date(a.month + ' 1, 2024') - new Date(b.month + ' 1, 2024'))
            .slice(-6)
            .map(month => ({
                ...month,
                uniqueProducts: month.uniqueProducts.size
            }));

        // Calculate advanced metrics
        const recentMonth = monthlyTrends[monthlyTrends.length - 1];
        const previousMonth = monthlyTrends[monthlyTrends.length - 2];
        const monthlyGrowthRate = previousMonth ? 
            Math.round(((recentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100) : 0;

        // Sales velocity analysis (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSales = salesData.filter(sale => new Date(sale.sale_date) >= thirtyDaysAgo);
        const recentRevenue = recentSales.reduce((sum, sale) => sum + (parseFloat(sale.total_revenue) || 0), 0);
        const dailyVelocity = recentRevenue / 30;

        // Performance rankings
        const champions = Object.values(productIntelligence)
            .sort((a, b) => b.profitabilityScore - a.profitabilityScore)
            .slice(0, 8);

        // Peak performance insights
        const peakHour = hourlyPattern.indexOf(Math.max(...hourlyPattern));
        const bestDay = Object.entries(salesByDay)
            .sort(([,a], [,b]) => b - a)[0];

        // Market concentration analysis
        const top20Products = champions.slice(0, Math.ceil(champions.length * 0.2));
        const top20Revenue = top20Products.reduce((sum, product) => sum + product.totalRevenue, 0);
        const concentrationIndex = totalRevenue > 0 ? Math.round((top20Revenue / totalRevenue) * 100) : 0;

        // Sales consistency score
        const dailyTrends = Object.values(salesByDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-30);

        const avgDailyRevenue = dailyTrends.reduce((sum, day) => sum + day.revenue, 0) / dailyTrends.length;
        const revenueVariance = dailyTrends.reduce((sum, day) => sum + Math.pow(day.revenue - avgDailyRevenue, 2), 0) / dailyTrends.length;
        const consistencyScore = Math.max(0, 100 - Math.round((Math.sqrt(revenueVariance) / avgDailyRevenue) * 100));

        return {
            totalRevenue,
            totalQuantitySold,
            totalOrders: salesData.length,
            averageOrderValue: salesData.length > 0 ? totalRevenue / salesData.length : 0,
            champions,
            monthlyTrends,
            dailyTrends,
            dailyVelocity,
            monthlyGrowthRate,
            concentrationIndex,
            consistencyScore,
            peakOperationalHour: peakHour,
            bestPerformingDay: bestDay ? bestDay[0] : 'N/A',
            uniqueProducts: Object.keys(productIntelligence).length,
            recentRevenue
        };
    };

    const userMetrics = getUserMetrics();
    const inventoryMetrics = getInventoryMetrics();
    const salesMetrics = getSalesMetrics();    // Auto-load data when report type changes
    useEffect(() => {
        if (activeReport === 'user-logs') {
            fetchUserLogs();
        } else if (activeReport === 'inventory') {
            fetchInventoryData();
        } else if (activeReport === 'sales') {
            fetchSalesData();
        }
    }, [activeReport, fetchUserLogs, fetchInventoryData, fetchSalesData]);

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
                        
                        <ReportButton 
                            $active={activeReport === 'sales'}
                            onClick={() => setActiveReport('sales')}
                        >
                            <ReportIcon>📈</ReportIcon>
                            Sales Report
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
                                            <MetricValue>{userMetrics.healthScore}%</MetricValue>
                                            <MetricLabel>Platform Health Score</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{userMetrics.retentionRate}%</MetricValue>
                                            <MetricLabel>Customer Retention</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{userMetrics.growthMomentum > 0 ? '+' : ''}{userMetrics.growthMomentum}%</MetricValue>
                                            <MetricLabel>Weekly Growth</MetricLabel>
                                        </MetricCard>
                                    </MetricsGrid>

                                    {/* Charts Grid */}
                                    <ChartsGrid>
                                        {/* User Activity Levels */}
                                        <ChartCard>
                                            <ChartTitle>� User Activity Levels</ChartTitle>
                                            <CustomBarChart>
                                                <BarGroup>
                                                    <CustomBar height={Math.max(40, (userMetrics.activeUsers / userMetrics.totalUsers) * 120)} value={userMetrics.activeUsers || Math.floor(userMetrics.totalUsers * 0.65)} color="#28a745" />
                                                    <BarLabel>Active</BarLabel>
                                                </BarGroup>
                                                <BarGroup>
                                                    <CustomBar height={Math.max(40, ((userMetrics.totalUsers - (userMetrics.activeUsers || Math.floor(userMetrics.totalUsers * 0.65))) / userMetrics.totalUsers) * 120)} value={userMetrics.totalUsers - (userMetrics.activeUsers || Math.floor(userMetrics.totalUsers * 0.65))} color="#ffc107" />
                                                    <BarLabel>Inactive</BarLabel>
                                                </BarGroup>
                                            </CustomBarChart>
                                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                                                <div>🟢 Active: Users with recent activity | 🟡 Inactive: Users without recent activity</div>
                                            </div>
                                        </ChartCard>

                                        {/* User Roles Distribution */}
                                        <ChartCard>
                                            <ChartTitle>👥 User Roles Distribution</ChartTitle>
                                            <PieChartContainer adminPercentage={Math.round((userMetrics.adminCount / userMetrics.totalUsers) * 100)}>
                                                <PieChartCenter>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                        {userMetrics.totalUsers}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                        Total Users
                                                    </div>
                                                </PieChartCenter>
                                            </PieChartContainer>
                                            <ChartLegend>
                                                <LegendItem>
                                                    <LegendColor color="#dc3545" />
                                                    Admin ({userMetrics.adminCount || 1})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#28a745" />
                                                    Customer ({userMetrics.totalUsers - (userMetrics.adminCount || 1)})
                                                </LegendItem>
                                            </ChartLegend>
                                        </ChartCard>

                                        {/* Registration Growth Pattern */}
                                        <ChartCard style={{ gridColumn: '1 / -1' }}>
                                            <ChartTitle>📈 Registration Growth Pattern (8-Week Trend)</ChartTitle>
                                            <CustomBarChart>
                                                {userMetrics.registrationTrends.map((week, index) => {
                                                    const maxCount = Math.max(...userMetrics.registrationTrends.map(w => w.registrations));
                                                    const height = maxCount > 0 ? (week.registrations / maxCount) * 120 : 4;
                                                    const isCurrentWeek = index === userMetrics.registrationTrends.length - 1;
                                                    return (
                                                        <BarGroup key={index}>
                                                            <CustomBar height={height} value={week.registrations} color={isCurrentWeek ? '#dc3545' : '#000000'} />
                                                            <BarLabel>{week.week}</BarLabel>
                                                            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                                                                {week.period}
                                                            </div>
                                                        </BarGroup>
                                                    );
                                                })}
                                            </CustomBarChart>
                                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                                                Growth momentum: {userMetrics.growthMomentum > 0 ? '📈 Accelerating' : userMetrics.growthMomentum < 0 ? '📉 Declining' : '➡️ Stable'} ({userMetrics.growthMomentum > 0 ? '+' : ''}{userMetrics.growthMomentum}% vs last week)
                                            </div>
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
                                            <MetricValue>₱{inventoryMetrics.totalValue.toLocaleString()}</MetricValue>
                                            <MetricLabel>Inventory Value</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{inventoryMetrics.optimizationScore}%</MetricValue>
                                            <MetricLabel>Optimization Score</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{inventoryMetrics.reorderAlertCount}</MetricValue>
                                            <MetricLabel>Reorder Alerts</MetricLabel>
                                        </MetricCard>
                                    </MetricsGrid>

                                    {/* Charts Grid */}
                                    <ChartsGrid>
                                        {/* Stock Risk Assessment */}
                                        <ChartCard>
                                            <ChartTitle>📦 Stock Status</ChartTitle>
                                            <CustomBarChart>
                                                <BarGroup>
                                                    <CustomBar height={Math.max(20, (inventoryMetrics.stockDistribution.healthy / inventoryMetrics.totalProducts) * 120)} value={inventoryMetrics.stockDistribution.healthy} color="#28a745" />
                                                    <BarLabel>Optimal</BarLabel>
                                                </BarGroup>
                                                <BarGroup>
                                                    <CustomBar height={Math.max(20, (inventoryMetrics.stockDistribution.warning / inventoryMetrics.totalProducts) * 120)} value={inventoryMetrics.stockDistribution.warning} color="#ffc107" />
                                                    <BarLabel>Warning</BarLabel>
                                                </BarGroup>
                                                <BarGroup>
                                                    <CustomBar height={Math.max(20, (inventoryMetrics.stockDistribution.critical / inventoryMetrics.totalProducts) * 120)} value={inventoryMetrics.stockDistribution.critical} color="#dc3545" />
                                                    <BarLabel>Critical</BarLabel>
                                                </BarGroup>
                                                <BarGroup>
                                                    <CustomBar height={Math.max(20, (inventoryMetrics.stockDistribution.overstocked / inventoryMetrics.totalProducts) * 120)} value={inventoryMetrics.stockDistribution.overstocked} color="#6f42c1" />
                                                    <BarLabel>Excess</BarLabel>
                                                </BarGroup>
                                            </CustomBarChart>
                                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                                                <div>� Low: Adequate Stock | 🟡 Medium: Low Stock | 🔴 High: Out of Stock</div>
                                            </div>
                                        </ChartCard>

                                        {/* Price Segmentation */}
                                        <ChartCard>
                                            <ChartTitle>💰 Price Distribution</ChartTitle>
                                            <PieChartContainer adminPercentage={Math.round((inventoryMetrics.priceSegments.luxury / inventoryMetrics.totalProducts) * 100)}>
                                                <PieChartCenter>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                        ₱{Math.round(inventoryMetrics.averageProductValue)}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                        Avg Value
                                                    </div>
                                                </PieChartCenter>
                                            </PieChartContainer>
                                            <ChartLegend>
                                                <LegendItem>
                                                    <LegendColor color="#28a745" />
                                                    Economy ≤₱750 ({inventoryMetrics.priceSegments.economy})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#17a2b8" />
                                                    Standard ₱750-1.5K ({inventoryMetrics.priceSegments.standard})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#ffc107" />
                                                    Premium ₱1.5K-3K ({inventoryMetrics.priceSegments.premium})
                                                </LegendItem>
                                                <LegendItem>
                                                    <LegendColor color="#dc3545" />
                                                    Luxury ₱3K+ ({inventoryMetrics.priceSegments.luxury})
                                                </LegendItem>
                                            </ChartLegend>
                                        </ChartCard>

                                        {/* Top Value Categories */}
                                        <ChartCard style={{ gridColumn: '1 / -1' }}>
                                            <ChartTitle>📊 Product Categories</ChartTitle>
                                            <CustomBarChart>
                                                {inventoryMetrics.topPerformers.map((category, index) => {
                                                    const maxValue = Math.max(...inventoryMetrics.topPerformers.map(c => c.value));
                                                    const height = maxValue > 0 ? (category.value / maxValue) * 120 : 4;
                                                    return (
                                                        <BarGroup key={index}>
                                                            <CustomBar height={height} value={`₱${Math.round(category.value).toLocaleString()}`} />
                                                            <BarLabel>{category.name}</BarLabel>
                                                            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                                                                {category.products} items | Profit: ₱{Math.round(category.profitPotential).toLocaleString()}
                                                            </div>
                                                        </BarGroup>
                                                    );
                                                })}
                                            </CustomBarChart>
                                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                                                Categories ranked by inventory value and profit potential (estimated 30% margin)
                                            </div>
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

                    {/* Sales Report */}
                    {activeReport === 'sales' && (
                        <ReportSection>
                            <ReportHeader>
                                <ReportTitle>Sales Report</ReportTitle>
                                <GenerateButton onClick={generateReport} disabled={loading}>
                                    {loading ? 'Generating...' : 'Generate Report'}
                                </GenerateButton>
                            </ReportHeader>
                            
                            <ReportDescription>
                                Comprehensive sales analytics including product performance, revenue trends, and top-selling items.
                            </ReportDescription>

                            {/* Sales Visualization Section */}
                            {salesData.length > 0 && salesMetrics && (
                                <VisualizationSection>
                                    <SectionTitle>📈 Sales Analytics Dashboard</SectionTitle>
                                    
                                    {/* Key Metrics Cards */}
                                    <MetricsGrid>
                                        <MetricCard>
                                            <MetricValue>₱{salesMetrics.totalRevenue.toLocaleString()}</MetricValue>
                                            <MetricLabel>Total Revenue</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>₱{Math.round(salesMetrics.dailyVelocity).toLocaleString()}</MetricValue>
                                            <MetricLabel>Daily Sales Velocity</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{salesMetrics.monthlyGrowthRate > 0 ? '+' : ''}{salesMetrics.monthlyGrowthRate}%</MetricValue>
                                            <MetricLabel>Monthly Growth</MetricLabel>
                                        </MetricCard>
                                        <MetricCard>
                                            <MetricValue>{salesMetrics.consistencyScore}%</MetricValue>
                                            <MetricLabel>Sales Consistency</MetricLabel>
                                        </MetricCard>
                                    </MetricsGrid>

                                    {/* Charts Grid */}
                                    <ChartsGrid>
                                        {/* Operational Peak Hours */}
                                        <ChartCard>
                                            <ChartTitle>⏰ Peak Sales Hours</ChartTitle>
                                            <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>
                                                        {salesMetrics.peakOperationalHour}:00
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                                        Peak Sales Hour
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                                                        {salesMetrics.bestPerformingDay}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                        Best Day of Week
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                                                        {salesMetrics.concentrationIndex}%
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                        Revenue Concentration
                                                    </div>
                                                </div>
                                            </div>
                                        </ChartCard>

                                        {/* Business Intelligence Trends */}
                                        <ChartCard>
                                            <ChartTitle>📈 Monthly Sales Trends</ChartTitle>
                                            <div style={{ width: '100%', height: 200 }}>
                                                <ResponsiveContainer>
                                                    <LineChart data={salesMetrics.monthlyTrends}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="month" fontSize={12} />
                                                        <YAxis fontSize={12} />
                                                        <Tooltip 
                                                            formatter={(value, name) => [
                                                                name.includes('revenue') ? `₱${value.toLocaleString()}` : value.toLocaleString(),
                                                                name === 'revenue' ? 'Revenue' : name === 'avgOrderValue' ? 'Avg Order Value' : name === 'uniqueProducts' ? 'Product Variety' : name
                                                            ]}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="revenue" 
                                                            stroke="#000000" 
                                                            strokeWidth={3}
                                                            dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
                                                            name="revenue"
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="avgOrderValue" 
                                                            stroke="#dc3545" 
                                                            strokeWidth={2}
                                                            strokeDasharray="5 5"
                                                            dot={{ fill: '#dc3545', strokeWidth: 2, r: 3 }}
                                                            name="avgOrderValue"
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="uniqueProducts" 
                                                            stroke="#28a745" 
                                                            strokeWidth={2}
                                                            dot={{ fill: '#28a745', strokeWidth: 2, r: 3 }}
                                                            name="uniqueProducts"
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </ChartCard>

                                        {/* Performance Champions with Intelligence */}
                                        <ChartCard style={{ gridColumn: '1 / -1' }}>
                                            <ChartTitle>🏆 Top Selling Products</ChartTitle>
                                            <div style={{ width: '100%', height: 350 }}>
                                                <ResponsiveContainer>
                                                    <BarChart data={salesMetrics.champions.slice(0, 6)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis 
                                                            dataKey="name" 
                                                            angle={-45} 
                                                            textAnchor="end" 
                                                            height={100}
                                                            fontSize={11}
                                                        />
                                                        <YAxis yAxisId="left" fontSize={12} />
                                                        <YAxis yAxisId="right" orientation="right" fontSize={12} />
                                                        <Tooltip 
                                                            formatter={(value, name) => [
                                                                name.includes('Revenue') || name.includes('Score') ? `₱${value.toLocaleString()}` : value.toLocaleString(),
                                                                name
                                                            ]}
                                                        />
                                                        <Legend />
                                                        <Bar 
                                                            yAxisId="left" 
                                                            dataKey="totalQuantity" 
                                                            fill="#000000" 
                                                            name="Units Sold"
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                        <Bar 
                                                            yAxisId="right" 
                                                            dataKey="profitabilityScore" 
                                                            fill="#dc3545" 
                                                            name="Profitability Score"
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </ChartCard>

                                        {/* Smart Sales Intelligence Dashboard */}
                                        <ChartCard style={{ gridColumn: '1 / -1' }}>
                                            <ChartTitle>📊 Daily Sales Overview</ChartTitle>
                                            <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer>
                                                    <LineChart data={salesMetrics.dailyTrends}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis 
                                                            dataKey="date" 
                                                            fontSize={10}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={60}
                                                        />
                                                        <YAxis yAxisId="left" fontSize={12} />
                                                        <YAxis yAxisId="right" orientation="right" fontSize={12} />
                                                        <Tooltip 
                                                            formatter={(value, name) => [
                                                                name.includes('Revenue') || name.includes('Value') ? `₱${value.toLocaleString()}` : value.toLocaleString(),
                                                                name
                                                            ]}
                                                        />
                                                        <Legend />
                                                        <Bar 
                                                            yAxisId="left" 
                                                            dataKey="orders" 
                                                            fill="rgba(0,0,0,0.1)" 
                                                            name="Daily Orders"
                                                        />
                                                        <Line 
                                                            yAxisId="right" 
                                                            type="monotone" 
                                                            dataKey="revenue" 
                                                            stroke="#000000" 
                                                            strokeWidth={2}
                                                            name="Daily Revenue (₱)"
                                                            dot={false}
                                                        />
                                                        <Line 
                                                            yAxisId="right" 
                                                            type="monotone" 
                                                            dataKey="avgOrderValue" 
                                                            stroke="#dc3545" 
                                                            strokeWidth={2}
                                                            strokeDasharray="5 5"
                                                            name="Avg Order Value (₱)"
                                                            dot={false}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                <div>📊 Consistency Score: {salesMetrics.consistencyScore}%</div>
                                                <div>⚡ Daily Velocity: ₱{Math.round(salesMetrics.dailyVelocity).toLocaleString()}</div>
                                                <div>📈 Monthly Growth: {salesMetrics.monthlyGrowthRate > 0 ? '+' : ''}{salesMetrics.monthlyGrowthRate}%</div>
                                            </div>
                                        </ChartCard>
                                    </ChartsGrid>
                                </VisualizationSection>
                            )}

                            {salesData.length > 0 && (
                                <TableContainer>
                                    <Table>
                                        <TableHeader>
                                            <tr>
                                                <th>Product ID</th>
                                                <th>Product Name</th>
                                                <th>Sale Date</th>
                                                <th>Quantity Sold</th>
                                                <th>Revenue</th>
                                            </tr>
                                        </TableHeader>
                                        <TableBody>
                                            {salesData.slice(0, 50).map((sale, index) => (
                                                <TableRow key={`${sale.product_id}-${sale.sale_date}-${index}`}>
                                                    <td>{sale.product_id}</td>
                                                    <td>{sale.productname}</td>
                                                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                                                    <td>{sale.total_sold}</td>
                                                    <td>₱{parseFloat(sale.total_revenue).toLocaleString()}</td>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {salesData.length === 0 && !loading && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '3rem',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    maxWidth: '400px',
                                    margin: '2rem auto'
                                }}>
                                    <p style={{ color: '#666', fontSize: '16px' }}>No sales data available</p>
                                    <p style={{ color: '#999', fontSize: '14px' }}>Sales reports will appear here once orders are confirmed</p>
                                </div>
                            )}
                        </ReportSection>
                    )}
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

const CustomBarChart = styled.div`
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

const CustomBar = styled.div`
    width: 100%;
    background: ${props => props.color ? props.color : 'linear-gradient(135deg, #000000 0%, #333333 100%)'};
    border-radius: 6px 6px 0 0;
    height: ${props => props.height}px;
    min-height: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &:hover {
        background: ${props => props.color ? `${props.color}dd` : 'linear-gradient(135deg, #333333 0%, #555555 100%)'};
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