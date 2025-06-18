import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faReceipt, 
  faCheck, 
  faTimes, 
  faEye, 
  faSearch,
  faFilter,
  faInfoCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 80px 24px 40px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666666;
  margin: 0;
  font-weight: 400;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: ${props => props.color || '#1a1a1a'};
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }
`;

const ControlsSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
    background: white;
  }
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
  }
`;

const RefreshButton = styled.button`
  padding: 12px 20px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #333;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TransactionsTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 120px 150px 200px 120px 140px 100px 120px 200px;
  gap: 16px;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 120px 150px 200px 120px 140px 100px 120px 200px;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
`;

const CustomerInfo = styled.div`
  .name {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .email {
    color: #666;
    font-size: 12px;
  }
`;

const OrderDetails = styled.div`
  .amount {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .address {
    color: #666;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return `
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'approved':
        return `
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'rejected':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'completed':
        return `
          background: #cce5ff;
          color: #004085;
          border: 1px solid #b3d7ff;
        `;
      default:
        return `
          background: #e2e3e5;
          color: #6c757d;
          border: 1px solid #d3d3d4;
        `;
    }
  }}
`;

const DateInfo = styled.div`
  color: #666;
  font-size: 12px;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          background: #28a745;
          color: white;
          &:hover:not(:disabled) {
            background: #218838;
          }
        `;
      case 'reject':
        return `
          background: #dc3545;
          color: white;
          &:hover:not(:disabled) {
            background: #c82333;
          }
        `;
      case 'view':
        return `
          background: #007bff;
          color: white;
          &:hover:not(:disabled) {
            background: #0056b3;
          }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover:not(:disabled) {
            background: #545b62;
          }
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  .icon {
    font-size: 48px;
    color: #ddd;
    margin-bottom: 16px;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: #999;
  }
  
  p {
    margin: 0;
    font-size: 14px;
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
  background: white;
  border-radius: 12px;
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
  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'pending').length,
      approved: data.filter(t => t.status === 'approved').length,
      rejected: data.filter(t => t.status === 'rejected').length,
      totalAmount: data.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
    };
    setStats(stats);
  };

  // Approve transaction
  const approveTransaction = async (transactionId) => {
    try {
      const response = await api.put(`/admin/transactions/${transactionId}/approve`);
      if (response.data.success) {
        toast.success('Transaction approved successfully');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    }
  };

  // Reject transaction
  const rejectTransaction = async (transactionId) => {
    try {
      const response = await api.put(`/admin/transactions/${transactionId}/reject`);
      if (response.data.success) {
        toast.success('Transaction rejected successfully');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    }
  };

  // View transaction details
  const viewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
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
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faReceipt} />
            Transaction Management
          </Title>
          <Subtitle>
            Approve or reject customer orders and manage transaction status
          </Subtitle>
        </Header>

        {/* Statistics */}
        <StatsContainer>
          <StatCard color="#1a1a1a">
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
          </StatCard>
          <StatCard color="#f59e0b">
            <h3>{stats.pending}</h3>
            <p>Pending Approval</p>
          </StatCard>
          <StatCard color="#10b981">
            <h3>{stats.approved}</h3>
            <p>Approved Orders</p>
          </StatCard>
          <StatCard color="#ef4444">
            <h3>{stats.rejected}</h3>
            <p>Rejected Orders</p>
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
            </SearchContainer>
            
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </FilterSelect>
            
            <RefreshButton onClick={fetchTransactions} disabled={loading}>
              <FontAwesomeIcon icon={faFilter} />
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
              <FontAwesomeIcon icon={faInfoCircle} size="2x" color="#ddd" />
              <p>Loading transactions...</p>
            </LoadingContainer>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState>
              <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />
              <h3>No transactions found</h3>
              <p>No transactions match your current filters.</p>
            </EmptyState>
          ) : (
            filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <OrderNumber>
                  {transaction.order_number}
                </OrderNumber>
                
                <DateInfo>
                  {formatDate(transaction.order_date)}
                </DateInfo>
                
                <CustomerInfo>
                  <div className="name">{transaction.customer_name || 'N/A'}</div>
                  <div className="email">{transaction.customer_email || 'N/A'}</div>
                </CustomerInfo>
                
                <OrderDetails>
                  <div className="amount">{formatCurrency(transaction.total_amount)}</div>
                </OrderDetails>
                
                <div>{transaction.payment_method || 'COD'}</div>
                
                <StatusBadge status={transaction.status}>
                  {transaction.status}
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
                  
                  {transaction.status === 'pending' && (
                    <>
                      <ActionButton
                        variant="approve"
                        onClick={() => approveTransaction(transaction.id)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </ActionButton>
                      
                      <ActionButton
                        variant="reject"
                        onClick={() => rejectTransaction(transaction.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </ActionButton>
                    </>
                  )}
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
                  <p><strong>Status:</strong> <StatusBadge status={selectedTransaction.status}>{selectedTransaction.status}</StatusBadge></p>
                  <p><strong>Total Amount:</strong> {formatCurrency(selectedTransaction.total_amount)}</p>
                  <p><strong>Payment Method:</strong> {selectedTransaction.payment_method || 'Cash on Delivery'}</p>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedTransaction.customer_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedTransaction.customer_email || 'N/A'}</p>
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
              </ModalContent>
            </Modal>
          </ModalOverlay>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default TransactionPage;
