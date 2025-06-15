import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPalette, 
  faEye, 
  faCheck, 
  faTimes, 
  faMessage, 
  faUser, 
  faCalendarAlt,
  faShirt,
  faFilter,
  faSearch,
  faClock,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

const CustomizationManagement = () => {
  const [designRequests, setDesignRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerPhone: '+1-555-0123',
        status: 'pending',
        submittedDate: '2025-06-10',
        garmentType: 'T-Shirt',
        baseColor: '#FF0000',
        designDescription: 'Custom logo design with company branding',
        designImage: '/api/placeholder/300/300',
        customMessage: 'I need this for our company event next month. Please make sure the logo is centered and bold.',
        estimatedPrice: 45.00,
        urgency: 'normal'
      },
      {
        id: 2,
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        customerPhone: '+1-555-0456',
        status: 'approved',
        submittedDate: '2025-06-08',
        garmentType: 'Hoodie',
        baseColor: '#000000',
        designDescription: 'Vintage band tour design with distressed effects',
        designImage: '/api/placeholder/300/300',
        customMessage: 'Looking for a vintage 80s rock band aesthetic. Can you add some distressed effects?',
        estimatedPrice: 75.00,
        urgency: 'high',
        adminResponse: 'Approved! Love the vintage concept. Production will start tomorrow.'
      },
      {
        id: 3,
        customerName: 'Mike Davis',
        customerEmail: 'mike.davis@email.com',
        customerPhone: '+1-555-0789',
        status: 'declined',
        submittedDate: '2025-06-05',
        garmentType: 'Tank Top',
        baseColor: '#FFFFFF',
        designDescription: 'Complex geometric pattern with multiple colors',
        designImage: '/api/placeholder/300/300',
        customMessage: 'I want something really unique and eye-catching for summer.',
        estimatedPrice: 55.00,
        urgency: 'low',
        adminResponse: 'Unfortunately, this design is too complex for our current printing capabilities. Would you consider a simplified version?'
      },
      {
        id: 4,
        customerName: 'Emily Wilson',
        customerEmail: 'emily.w@email.com',
        customerPhone: '+1-555-0321',
        status: 'in_review',
        submittedDate: '2025-06-12',
        garmentType: 'Sweatshirt',
        baseColor: '#0066CC',
        designDescription: 'Memorial design for a loved one',
        designImage: '/api/placeholder/300/300',
        customMessage: 'This is a special memorial piece for my grandmother. Quality is very important to me.',
        estimatedPrice: 65.00,
        urgency: 'normal'
      }
    ];

    setTimeout(() => {
      setDesignRequests(mockData);
      setFilteredRequests(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = designRequests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.garmentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [statusFilter, searchTerm, designRequests]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in_review': return '#2196F3';
      case 'approved': return '#4CAF50';
      case 'declined': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'in_review': return faEye;
      case 'approved': return faCheckCircle;
      case 'declined': return faTimesCircle;
      default: return faClock;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#FF5722';
      case 'normal': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (requestId, newStatus, message = '') => {
    setDesignRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus, adminResponse: message }
        : request
    ));
    setShowDetailModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <Header>
        <Title>
          <FontAwesomeIcon icon={faPalette} />
          Customization Requests
        </Title>
        <Stats>
          <StatCard>
            <StatNumber>{designRequests.filter(r => r.status === 'pending').length}</StatNumber>
            <StatLabel>Pending</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{designRequests.filter(r => r.status === 'in_review').length}</StatNumber>
            <StatLabel>In Review</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{designRequests.filter(r => r.status === 'approved').length}</StatNumber>
            <StatLabel>Approved</StatLabel>
          </StatCard>
        </Stats>
      </Header>

      <Controls>
        <SearchBar>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search by customer name, email, or garment type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
        <FilterSelect>
          <FontAwesomeIcon icon={faFilter} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </FilterSelect>
      </Controls>

      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading customization requests...</p>
        </LoadingContainer>
      ) : (
        <RequestsGrid>
          {filteredRequests.map((request) => (
            <RequestCard key={request.id}>
              <CardHeader>
                <CustomerInfo>
                  <CustomerName>{request.customerName}</CustomerName>
                  <CustomerEmail>{request.customerEmail}</CustomerEmail>
                </CustomerInfo>
                <StatusBadge status={request.status}>
                  <FontAwesomeIcon icon={getStatusIcon(request.status)} />
                  {request.status.replace('_', ' ').toUpperCase()}
                </StatusBadge>
              </CardHeader>

              <CardContent>
                <DesignPreview>
                  <PreviewImage src={request.designImage} alt="Design Preview" />
                  <DesignInfo>
                    <GarmentType>
                      <FontAwesomeIcon icon={faShirt} />
                      {request.garmentType}
                    </GarmentType>
                    <ColorSwatch color={request.baseColor} />
                  </DesignInfo>
                </DesignPreview>

                <RequestDetails>
                  <Description>{request.designDescription}</Description>
                  <RequestMeta>
                    <MetaItem>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(request.submittedDate)}
                    </MetaItem>
                    <MetaItem>
                      <FontAwesomeIcon icon={faUser} />
                      ${request.estimatedPrice}
                    </MetaItem>
                    <UrgencyBadge urgency={request.urgency}>
                      {request.urgency.toUpperCase()}
                    </UrgencyBadge>
                  </RequestMeta>
                </RequestDetails>
              </CardContent>

              <CardActions>
                <ActionButton primary onClick={() => handleViewDetails(request)}>
                  <FontAwesomeIcon icon={faEye} />
                  View Details
                </ActionButton>
              </CardActions>
            </RequestCard>
          ))}
        </RequestsGrid>
      )}

      {filteredRequests.length === 0 && !isLoading && (
        <EmptyState>
          <FontAwesomeIcon icon={faPalette} />
          <h3>No customization requests found</h3>
          <p>No requests match your current filters.</p>
        </EmptyState>
      )}

      {showDetailModal && selectedRequest && (
        <DetailModal 
          request={selectedRequest} 
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </Container>
  );
};

// Separate component for the detail modal
const DetailModal = ({ request, onClose, onUpdateStatus }) => {
  const [adminMessage, setAdminMessage] = useState(request.adminResponse || '');
  const [actionType, setActionType] = useState('');

  const handleAction = () => {
    if (actionType) {
      onUpdateStatus(request.id, actionType, adminMessage);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Customization Request Details</h2>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <CustomerSection>
            <h3>Customer Information</h3>
            <CustomerDetails>
              <div><strong>Name:</strong> {request.customerName}</div>
              <div><strong>Email:</strong> {request.customerEmail}</div>
              <div><strong>Phone:</strong> {request.customerPhone}</div>
              <div><strong>Submitted:</strong> {new Date(request.submittedDate).toLocaleDateString()}</div>
            </CustomerDetails>
          </CustomerSection>

          <DesignSection>
            <h3>Design Details</h3>
            <DesignDetails>
              <DesignImageLarge src={request.designImage} alt="Design Preview" />
              <DesignSpecs>
                <div><strong>Garment:</strong> {request.garmentType}</div>
                <div><strong>Base Color:</strong> <ColorSwatch color={request.baseColor} /> {request.baseColor}</div>
                <div><strong>Estimated Price:</strong> ${request.estimatedPrice}</div>
                <div><strong>Urgency:</strong> <UrgencyBadge urgency={request.urgency}>{request.urgency}</UrgencyBadge></div>
              </DesignSpecs>
            </DesignDetails>
            <div><strong>Description:</strong> {request.designDescription}</div>
          </DesignSection>

          <MessageSection>
            <h3>Customer Message</h3>
            <CustomerMessage>{request.customMessage}</CustomerMessage>
          </MessageSection>

          {request.adminResponse && (
            <ResponseSection>
              <h3>Admin Response</h3>
              <AdminResponse>{request.adminResponse}</AdminResponse>
            </ResponseSection>
          )}

          <ActionSection>
            <h3>Admin Actions</h3>
            <MessageInput>
              <label>Response Message:</label>
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Enter your response to the customer..."
                rows="4"
              />
            </MessageInput>
            
            <ActionButtons>
              <ActionButton 
                approve 
                onClick={() => setActionType('approved')}
                className={actionType === 'approved' ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faCheck} />
                Approve
              </ActionButton>
              <ActionButton 
                decline 
                onClick={() => setActionType('declined')}
                className={actionType === 'declined' ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faTimes} />
                Decline
              </ActionButton>
              <ActionButton 
                review 
                onClick={() => setActionType('in_review')}
                className={actionType === 'in_review' ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faEye} />
                Mark for Review
              </ActionButton>
            </ActionButtons>

            {actionType && (
              <SubmitButton onClick={handleAction}>
                <FontAwesomeIcon icon={faMessage} />
                Send Response
              </SubmitButton>
            )}
          </ActionSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #0a0a0a;
  min-height: 100vh;
  color: #ffffff;
  padding-top: 80px; /* Account for fixed TopBar */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #161616 100%);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ffffff;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  
  svg {
    color: #4a9eff;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    border-color: rgba(74, 158, 255, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #4a9eff;
  }
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #4a9eff;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBar = styled.div`
  flex: 1;
  position: relative;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #888888;
    font-size: 0.9rem;
  }
  
  input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    
    &::placeholder {
      color: #888888;
    }
    
    &:focus {
      outline: none;
      border-color: #4a9eff;
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

const FilterSelect = styled.div`
  position: relative;
  min-width: 180px;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #888888;
    pointer-events: none;
    font-size: 0.9rem;
  }
  
  select {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #4a9eff;
      background: rgba(255, 255, 255, 0.08);
    }
    
    option {
      background: #1a1a1a;
      color: #ffffff;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #888888;
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RequestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RequestCard = styled.div`
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    border-color: rgba(74, 158, 255, 0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.5rem 0;
`;

const CustomerInfo = styled.div``;

const CustomerName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const CustomerEmail = styled.div`
  color: #888888;
  font-size: 0.9rem;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => 
    props.status === 'pending' ? 'rgba(255, 165, 0, 0.15)' :
    props.status === 'in_review' ? 'rgba(74, 158, 255, 0.15)' :
    props.status === 'approved' ? 'rgba(40, 167, 69, 0.15)' :
    'rgba(220, 53, 69, 0.15)'};
  color: ${props => 
    props.status === 'pending' ? '#FFA500' :
    props.status === 'in_review' ? '#4a9eff' :
    props.status === 'approved' ? '#28a745' :
    '#dc3545'};
  border: 1px solid ${props => 
    props.status === 'pending' ? 'rgba(255, 165, 0, 0.3)' :
    props.status === 'in_review' ? 'rgba(74, 158, 255, 0.3)' :
    props.status === 'approved' ? 'rgba(40, 167, 69, 0.3)' :
    'rgba(220, 53, 69, 0.3)'};
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const DesignPreview = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PreviewImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DesignInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GarmentType = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a9eff;
  font-weight: 600;
  font-size: 0.9rem;
`;

const ColorSwatch = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
  margin-right: 0.5rem;
`;

const RequestDetails = styled.div``;

const Description = styled.p`
  color: #cccccc;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const RequestMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888888;
  font-size: 0.8rem;
  
  svg {
    color: #4a9eff;
  }
`;

const UrgencyBadge = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => 
    props.urgency === 'high' ? 'rgba(220, 53, 69, 0.15)' :
    props.urgency === 'normal' ? 'rgba(74, 158, 255, 0.15)' :
    'rgba(40, 167, 69, 0.15)'};
  color: ${props => 
    props.urgency === 'high' ? '#dc3545' :
    props.urgency === 'normal' ? '#4a9eff' :
    '#28a745'};
  border: 1px solid ${props => 
    props.urgency === 'high' ? 'rgba(220, 53, 69, 0.3)' :
    props.urgency === 'normal' ? 'rgba(74, 158, 255, 0.3)' :
    'rgba(40, 167, 69, 0.3)'};
`;

const CardActions = styled.div`
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.primary && `
    background: linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%);
    color: #ffffff;
    
    &:hover {
      background: linear-gradient(135deg, #5aa3ff 0%, #4a86e0 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
    }
  `}
  
  ${props => props.approve && `
    background: rgba(40, 167, 69, 0.15);
    color: #28a745;
    border: 1px solid rgba(40, 167, 69, 0.3);
    
    &:hover, &.active {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: #ffffff;
      border-color: #28a745;
    }
  `}
  
  ${props => props.decline && `
    background: rgba(220, 53, 69, 0.15);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.3);
    
    &:hover, &.active {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: #ffffff;
      border-color: #dc3545;
    }
  `}
  
  ${props => props.review && `
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
    border: 1px solid rgba(74, 158, 255, 0.3);
    
    &:hover, &.active {
      background: linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%);
      color: #ffffff;
      border-color: #4a9eff;
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #888888;
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #333333;
  }
  
  h3 {
    color: #cccccc;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  p {
    color: #888888;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  color: #ffffff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  border-radius: 12px 12px 0 0;
  
  h2 {
    margin: 0;
    color: #ffffff;
    font-weight: 600;
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cccccc;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const CustomerSection = styled.div`
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  h3 {
    color: #4a9eff;
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const CustomerDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  
  div {
    color: #cccccc;
    font-size: 0.9rem;
    
    strong {
      color: #ffffff;
      font-weight: 600;
    }
  }
`;

const DesignSection = styled.div`
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  h3 {
    color: #4a9eff;
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const DesignDetails = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DesignImageLarge = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DesignSpecs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  div {
    color: #cccccc;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    
    strong {
      color: #ffffff;
      min-width: 120px;
      font-weight: 600;
    }
  }
`;

const MessageSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color: #4a9eff;
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const CustomerMessage = styled.div`
  background: rgba(74, 158, 255, 0.1);
  padding: 1.25rem;
  border-radius: 8px;
  color: #cccccc;
  line-height: 1.6;
  border-left: 3px solid #4a9eff;
  font-size: 0.95rem;
`;

const ResponseSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color: #4a9eff;
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const AdminResponse = styled.div`
  background: rgba(40, 167, 69, 0.1);
  padding: 1.25rem;
  border-radius: 8px;
  color: #cccccc;
  line-height: 1.6;
  border-left: 3px solid #28a745;
  font-size: 0.95rem;
`;

const ActionSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  h3 {
    color: #4a9eff;
    margin-bottom: 1.5rem;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const MessageInput = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.75rem;
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  textarea {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    transition: all 0.2s ease;
    
    &::placeholder {
      color: #888888;
    }
    
    &:focus {
      outline: none;
      border-color: #4a9eff;
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #5aa3ff 0%, #4a86e0 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default CustomizationManagement;
