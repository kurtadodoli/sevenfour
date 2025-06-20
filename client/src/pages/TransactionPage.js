import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faReceipt, 
  faTimes, 
  faEye, 
  faSearch,
  faRefresh,
  faInfoCircle,
  faExclamationTriangle,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 80px 24px 40px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 300;
  color: #000000;
  margin: 0 0 12px 0;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666666;
  margin: 0;
  font-weight: 300;
  max-width: 500px;
  margin: 0 auto;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1px;
  margin-bottom: 40px;
  background: #f5f5f5;
  border-radius: 2px;
  overflow: hidden;
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fafafa;
  }
  
  h3 {
    font-size: 32px;
    font-weight: 200;
    margin: 0 0 8px 0;
    color: ${props => props.color || '#000000'};
    line-height: 1;
  }
  
  p {
    color: #999999;
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
  }
`;

const ControlsSection = styled.div`
  background: #ffffff;
  padding: 24px;
  border: 1px solid #f0f0f0;
  margin-bottom: 1px;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 14px;
  background: #ffffff;
  font-weight: 300;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 1px #000000;
  }
  
  &::placeholder {
    color: #cccccc;
    font-weight: 300;
  }
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #cccccc;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 14px;
  background: #ffffff;
  cursor: pointer;
  font-weight: 300;
  min-width: 140px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 1px #000000;
  }
`;

const RefreshButton = styled.button`
  padding: 14px 20px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #333333;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TransactionsTable = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 140px 180px 220px 140px 120px 120px 140px 180px;
  gap: 24px;
  padding: 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
  font-size: 12px;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 120px 160px 180px 120px 100px 100px 120px 160px;
    gap: 16px;
    padding: 20px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 140px 180px 220px 140px 120px 120px 140px 180px;
  gap: 24px;
  padding: 24px;
  border-bottom: 1px solid #f8f8f8;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 120px 160px 180px 120px 100px 100px 120px 160px;
    gap: 16px;
    padding: 20px;
  }
`;

const OrderNumber = styled.div`
  font-weight: 500;
  color: #000000;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', monospace;
`;

const CustomerInfo = styled.div`
  .name {
    font-weight: 500;
    color: #000000;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .email {
    color: #999999;
    font-size: 12px;
    font-weight: 300;
  }
`;

const OrderDetails = styled.div`
  .amount {
    font-weight: 500;
    color: #000000;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .address {
    color: #999999;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    font-weight: 300;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 0;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid;
  
  ${props => {
    switch (props.status?.toLowerCase()) {
      case 'pending':
        return `
          background: #ffffff;
          color: #f39c12;
          border-color: #f39c12;
        `;
      case 'confirmed':
      case 'approved':
        return `
          background: #ffffff;
          color: #27ae60;
          border-color: #27ae60;
        `;
      case 'cancelled':
      case 'rejected':
        return `
          background: #ffffff;
          color: #e74c3c;
          border-color: #e74c3c;
        `;
      case 'completed':
        return `
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        `;
      default:
        return `
          background: #ffffff;
          color: #999999;
          border-color: #cccccc;
        `;
    }
  }}
`;

const DateInfo = styled.div`
  color: #999999;
  font-size: 12px;
  font-weight: 300;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid;
  border-radius: 0;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: #ffffff;
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          color: #27ae60;
          border-color: #27ae60;
          &:hover:not(:disabled) {
            background: #27ae60;
            color: #ffffff;
          }
        `;
      case 'reject':
        return `
          color: #e74c3c;
          border-color: #e74c3c;
          &:hover:not(:disabled) {
            background: #e74c3c;
            color: #ffffff;
          }
        `;
      case 'view':
        return `
          color: #000000;
          border-color: #000000;
          &:hover:not(:disabled) {
            background: #000000;
            color: #ffffff;
          }
        `;
      default:
        return `
          color: #999999;
          border-color: #cccccc;
          &:hover:not(:disabled) {
            background: #999999;
            color: #ffffff;
          }
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #999999;
  font-weight: 300;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #999999;
  
  .icon {
    font-size: 48px;
    color: #e0e0e0;
    margin-bottom: 24px;
  }
  
  h3 {
    margin: 0 0 12px 0;
    color: #cccccc;
    font-weight: 300;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    font-weight: 300;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #ffffff;
  border-radius: 0;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 20px;
    font-weight: 600;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #1a1a1a;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  margin-bottom: 1px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px 24px;
  background: ${props => props.active ? '#000000' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#666666'};
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#000000' : '#f5f5f5'};
  }
`;

const CancellationRequestCard = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  margin-bottom: 1px;
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fafafa;
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const RequestInfo = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #000000;
  }
  
  .meta {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    
    .item {
      font-size: 14px;
      color: #666666;
      
      strong {
        color: #000000;
      }
    }
  }
`;



const ReasonBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #000000;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #666666;
    line-height: 1.5;
  }
`;

const RequestActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const AdminNotesTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const ProcessingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ProcessingModalContent = styled.div`
  background: #ffffff;
  border-radius: 4px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #000000;
  }
  
  .form-group {
    margin-bottom: 16px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #000000;
    }
  }
  
  .actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }
`;

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });
  
  // Cancellation requests state
  const [activeTab, setActiveTab] = useState('orders');
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showProcessingModal, setShowProcessingModal] = useState(false);// Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching confirmed orders...');
      
      // Use the same endpoint logic as OrderPage.js
      const endpoint = '/orders/me-with-items'; // Get user's orders with items
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        console.log('✅ Orders fetched successfully:', response.data);
        const ordersData = response.data.data || [];        // Filter for only confirmed orders and map the data structure
        const confirmedOrders = ordersData
          .filter(order => order.status === 'confirmed')
          .map(order => {
            // Create full customer name from user data and order invoice data
            const fullName = [order.first_name, order.last_name].filter(Boolean).join(' ') || 
                           order.customer_name || 
                           'Unknown Customer';
            
            return {
              // Map order data to transaction-like structure
              id: order.id,
              order_number: order.order_number,
              transaction_id: order.transaction_id,
              customer_name: fullName,
              customer_email: order.user_email || order.customer_email,
              user_email: order.user_email,
              first_name: order.first_name,
              last_name: order.last_name,
              amount: order.total_amount,
              total_amount: order.total_amount,
              invoice_total: order.invoice_total,
              payment_method: order.payment_method || 'Cash on Delivery',
              order_status: order.status,
              transaction_status: order.transaction_status || order.status,
              status: order.status,
              order_date: order.order_date,
              created_at: order.created_at,
              updated_at: order.updated_at,
              shipping_address: order.shipping_address,
              contact_phone: order.contact_phone,
              notes: order.notes,
              items: order.items || []
            };
          });
        
        console.log(`Found ${confirmedOrders.length} confirmed orders out of ${ordersData.length} total orders`);
        setTransactions(confirmedOrders);
        calculateStats(confirmedOrders);
      } else {
        console.error('❌ Failed to fetch orders:', response.data);
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('❌ Error fetching confirmed orders:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error details:', error.response?.data?.message || error.message);
      toast.error('Failed to fetch confirmed orders');
    } finally {
      setLoading(false);
    }
  }, []);  // Calculate statistics
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'pending').length,
      approved: data.filter(t => t.status === 'confirmed').length,
      rejected: data.filter(t => t.status === 'cancelled').length,
      totalAmount: data.reduce((sum, t) => sum + parseFloat(t.total_amount || t.amount || 0), 0)
    };
    setStats(stats);  };

  // View transaction details
  const viewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const transactionStatus = transaction.status || 'pending';
    const matchesStatus = statusFilter === 'all' || transactionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toFixed(2)}`;
  };
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Fetch cancellation requests
  const fetchCancellationRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      console.log('🔄 Fetching cancellation requests...');
      
      const response = await api.get('/orders/cancellation-requests');
      
      if (response.data.success) {
        console.log('✅ Cancellation requests fetched:', response.data);
        setCancellationRequests(response.data.data || []);
      } else {
        console.error('❌ Failed to fetch cancellation requests:', response.data);
        toast.error('Failed to fetch cancellation requests');
      }
    } catch (error) {
      console.error('❌ Error fetching cancellation requests:', error);
      toast.error('Failed to fetch cancellation requests');
    } finally {
      setRequestsLoading(false);
    }
  }, []);
  
  // Process cancellation request
  const processCancellationRequest = async (requestId, action) => {
    try {
      console.log(`🔄 ${action === 'approve' ? 'Approving' : 'Denying'} cancellation request ${requestId}...`);
      
      const response = await api.put(`/orders/cancellation-requests/${requestId}`, {
        action,
        adminNotes: adminNotes.trim() || undefined
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowProcessingModal(false);
        setProcessingRequest(null);
        setAdminNotes('');
        // Refresh both lists
        fetchCancellationRequests();
        fetchTransactions();
      } else {
        toast.error(response.data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error(`❌ Error processing cancellation request:`, error);
      toast.error('Failed to process cancellation request');
    }
  };
  
  // Open processing modal
  const openProcessingModal = (request, action) => {
    setProcessingRequest({ ...request, action });
    setAdminNotes('');
    setShowProcessingModal(true);
  };
  
  // Close processing modal
  const closeProcessingModal = () => {
    setShowProcessingModal(false);
    setProcessingRequest(null);
    setAdminNotes('');
  };
  
  useEffect(() => {
    fetchTransactions();
    if (activeTab === 'cancellations') {
      fetchCancellationRequests();
    }
  }, [fetchTransactions, fetchCancellationRequests, activeTab]);
  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faReceipt} />
            Admin Dashboard
          </Title>
          <Subtitle>
            Manage confirmed orders and cancellation requests
          </Subtitle>
        </Header>
        
        {/* Tabs */}
        <TabsContainer>
          <Tab 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
          >
            Confirmed Orders
          </Tab>          <Tab 
            active={activeTab === 'cancellations'} 
            onClick={() => setActiveTab('cancellations')}
          >
            Cancellation Requests
          </Tab>
        </TabsContainer>
        
        {activeTab === 'orders' && (
          <>
            {/* Statistics */}
            <StatsContainer>
              <StatCard color="#000000">
                <h3>{stats.total}</h3>
                <p>Total Confirmed</p>
              </StatCard>
              <StatCard color="#27ae60">
                <h3>{stats.approved}</h3>
                <p>Confirmed Orders</p>
              </StatCard>
              <StatCard color="#000000">
                <h3>{formatCurrency(stats.totalAmount)}</h3>
                <p>Total Revenue</p>
              </StatCard>
              <StatCard color="#3498db">
                <h3>{stats.total > 0 ? (stats.totalAmount / stats.total).toFixed(0) : 0}</h3>
                <p>Avg Order Value</p>
              </StatCard>
            </StatsContainer>

            {/* Controls */}
            <ControlsSection>
          <ControlsGrid>
            <SearchContainer>
              <SearchIcon icon={faSearch} />
              <SearchInput
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Confirmed Orders</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </FilterSelect>
              <RefreshButton onClick={fetchTransactions} disabled={loading}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </RefreshButton>
          </ControlsGrid>
        </ControlsSection>

        {/* Transactions Table */}
        <TransactionsTable>
          <TableHeader>
            <div>Order #</div>
            <div>Date</div>
            <div>Customer</div>
            <div>Amount</div>
            <div>Payment</div>
            <div>Status</div>
            <div>Created</div>
            <div>Actions</div>
          </TableHeader>
          
          {loading ? (
            <LoadingContainer>
              <FontAwesomeIcon icon={faInfoCircle} size="2x" color="#ddd" />              <p>Loading confirmed orders...</p>
            </LoadingContainer>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState>
              <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />
              <h3>No confirmed orders found</h3>
              <p>No confirmed orders match your current filters.</p>
            </EmptyState>
          ) : (            filteredTransactions.map((transaction) => (
              <TableRow key={transaction.transaction_id || transaction.id}>
                <OrderNumber>
                  {transaction.order_number}
                </OrderNumber>
                
                <DateInfo>
                  {formatDate(transaction.order_date)}
                </DateInfo>
                
                <CustomerInfo>
                  <div className="name">{transaction.customer_name || transaction.first_name + ' ' + transaction.last_name || 'N/A'}</div>
                  <div className="email">{transaction.customer_email || transaction.user_email || 'N/A'}</div>
                </CustomerInfo>
                
                <OrderDetails>
                  <div className="amount">{formatCurrency(transaction.amount || transaction.total_amount || transaction.invoice_total)}</div>
                </OrderDetails>
                
                <div>{transaction.payment_method || 'COD'}</div>
                
                <StatusBadge status={transaction.transaction_status || transaction.order_status}>
                  {transaction.transaction_status || transaction.order_status}
                </StatusBadge>
                
                <DateInfo>
                  {formatDate(transaction.created_at)}
                </DateInfo>
                  <ActionsContainer>
                  <ActionButton
                    variant="view"
                    onClick={() => viewTransaction(transaction)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </ActionButton>
                </ActionsContainer>
              </TableRow>
            ))
          )}
        </TransactionsTable>

        {/* Transaction Details Modal */}
        {showModal && selectedTransaction && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Transaction Details</h2>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>
                <ModalContent>
                <div style={{ marginBottom: '24px' }}>
                  <h3>Order Information</h3>
                  <p><strong>Order Number:</strong> {selectedTransaction.order_number}</p>
                  <p><strong>Transaction ID:</strong> {selectedTransaction.transaction_id}</p>
                  <p><strong>Order Status:</strong> <StatusBadge status={selectedTransaction.order_status}>{selectedTransaction.order_status}</StatusBadge></p>
                  <p><strong>Transaction Status:</strong> <StatusBadge status={selectedTransaction.transaction_status}>{selectedTransaction.transaction_status}</StatusBadge></p>
                  <p><strong>Total Amount:</strong> {formatCurrency(selectedTransaction.amount || selectedTransaction.total_amount || selectedTransaction.invoice_total)}</p>
                  <p><strong>Payment Method:</strong> {selectedTransaction.payment_method || 'Cash on Delivery'}</p>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedTransaction.customer_name || (selectedTransaction.first_name + ' ' + selectedTransaction.last_name) || selectedTransaction.username || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedTransaction.customer_email || selectedTransaction.user_email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedTransaction.contact_phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedTransaction.shipping_address || 'N/A'}</p>
                </div>
                
                {selectedTransaction.notes && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3>Order Notes</h3>
                    <p>{selectedTransaction.notes}</p>
                  </div>
                )}
                
                <div>
                  <h3>Dates</h3>
                  <p><strong>Order Date:</strong> {formatDate(selectedTransaction.order_date)}</p>
                  <p><strong>Created:</strong> {formatDate(selectedTransaction.created_at)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(selectedTransaction.updated_at)}</p>
                </div>
              </ModalContent>            </Modal>
          </ModalOverlay>
        )}
          </>
        )}
        
        {activeTab === 'cancellations' && (
          <>
            {/* Cancellation Requests Header */}
            <ControlsSection>
              <ControlsGrid>
                <SearchContainer>
                  <SearchIcon icon={faSearch} />
                  <SearchInput
                    type="text"
                    placeholder="Search by order number or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                <FilterSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </FilterSelect>
                <RefreshButton onClick={fetchCancellationRequests} disabled={requestsLoading}>
                  <FontAwesomeIcon icon={faRefresh} />
                  Refresh
                </RefreshButton>
              </ControlsGrid>
            </ControlsSection>
            
            {/* Cancellation Requests List */}
            {requestsLoading ? (
              <LoadingContainer>
                <FontAwesomeIcon icon={faInfoCircle} size="2x" color="#ddd" />
                <p>Loading cancellation requests...</p>
              </LoadingContainer>
            ) : cancellationRequests.length === 0 ? (
              <EmptyState>
                <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />
                <h3>No cancellation requests found</h3>
                <p>No cancellation requests match your current filters.</p>
              </EmptyState>
            ) : (
              cancellationRequests
                .filter(request => {
                  const matchesSearch = request.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       request.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       request.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((request) => (
                  <CancellationRequestCard key={request.id}>
                    <RequestHeader>
                      <RequestInfo>
                        <h3>Order #{request.order_number}</h3>
                        <div className="meta">
                          <div className="item">
                            <strong>Customer:</strong> {request.customer_first_name} {request.customer_last_name}
                          </div>
                          <div className="item">
                            <strong>Email:</strong> {request.customer_email}
                          </div>
                          <div className="item">
                            <strong>Amount:</strong> {formatCurrency(request.order_total)}
                          </div>
                          <div className="item">
                            <strong>Submitted:</strong> {formatDate(request.created_at)}
                          </div>
                        </div>
                      </RequestInfo>
                      <StatusBadge status={request.status}>
                        {request.status}
                      </StatusBadge>
                    </RequestHeader>
                    
                    <ReasonBox>
                      <h4>Cancellation Reason</h4>
                      <p>{request.reason}</p>
                    </ReasonBox>
                    
                    {request.admin_notes && (
                      <ReasonBox>
                        <h4>Admin Notes</h4>
                        <p>{request.admin_notes}</p>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                          Processed by: {request.admin_first_name} {request.admin_last_name} on {formatDate(request.processed_at)}
                        </div>
                      </ReasonBox>
                    )}
                    
                    {request.status === 'pending' && (
                      <RequestActions>
                        <ActionButton
                          variant="approve"
                          onClick={() => openProcessingModal(request, 'approve')}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                          Approve
                        </ActionButton>
                        <ActionButton
                          variant="reject"
                          onClick={() => openProcessingModal(request, 'deny')}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                          Deny
                        </ActionButton>
                      </RequestActions>
                    )}
                  </CancellationRequestCard>
                ))
            )}
          </>
        )}
        
        {/* Processing Modal */}
        {showProcessingModal && processingRequest && (
          <ProcessingModal>
            <ProcessingModalContent>
              <h3>
                {processingRequest.action === 'approve' ? 'Approve' : 'Deny'} Cancellation Request
              </h3>
              <p>
                <strong>Order:</strong> #{processingRequest.order_number}<br />
                <strong>Customer:</strong> {processingRequest.customer_first_name} {processingRequest.customer_last_name}<br />
                <strong>Reason:</strong> {processingRequest.reason}
              </p>
              
              <div className="form-group">
                <label>Admin Notes (Optional)</label>
                <AdminNotesTextarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                />
              </div>
              
              <div className="actions">
                <ActionButton onClick={closeProcessingModal}>
                  Cancel
                </ActionButton>
                <ActionButton
                  variant={processingRequest.action === 'approve' ? 'approve' : 'reject'}
                  onClick={() => processCancellationRequest(processingRequest.id, processingRequest.action)}
                >
                  {processingRequest.action === 'approve' ? 'Approve Request' : 'Deny Request'}
                </ActionButton>
              </div>
            </ProcessingModalContent>
          </ProcessingModal>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default TransactionPage;
