import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faCheck, 
  faTimes, 
  faFilter,
  faUser,
  faCalendar,
  faShirt,
  faPalette,
  faRulerCombined,
  faHashtag,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';
import api from '../utils/api';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 200;
  color: #000000;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666666;
  margin: 0;
  font-weight: 300;
`;

const FilterSection = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #333333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterSelect = styled.select`
  padding: 0.8rem 1rem;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  font-size: 0.9rem;
  min-width: 150px;
  cursor: pointer;
  color: #333333;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const DesignGrid = styled.div`
  display: grid;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DesignCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const DesignInfo = styled.div`
  flex: 1;
`;

const DesignName = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  color: #000000;
  margin: 0 0 0.5rem 0;
`;

const UserInfo = styled.div`
  font-size: 0.9rem;
  color: #666666;
  margin-bottom: 0.5rem;
  font-weight: 300;
`;

const StatusBadge = styled.span`
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background-color: #ffffff; color: #b8860b; border: 1px solid #b8860b;';
      case 'approved':
        return 'background-color: #000000; color: #ffffff; border: 1px solid #000000;';
      case 'rejected':
        return 'background-color: #ffffff; color: #dc3545; border: 1px solid #dc3545;';
      case 'in_progress':
        return 'background-color: #ffffff; color: #007bff; border: 1px solid #007bff;';
      case 'completed':
        return 'background-color: #000000; color: #ffffff; border: 1px solid #000000;';
      default:
        return 'background-color: #ffffff; color: #666666; border: 1px solid #e0e0e0;';
    }
  }}
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailsSection = styled.div``;

const DetailItem = styled.div`
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #000000;
  display: inline-block;
  width: 100px;
`;

const DetailValue = styled.span`
  color: #666666;
  font-weight: 300;
`;

const Description = styled.p`
  background-color: #fafafa;
  padding: 1.2rem;
  margin: 1.2rem 0;
  line-height: 1.6;
  color: #333333;
  font-size: 0.9rem;
  border: 1px solid #f0f0f0;
  font-weight: 300;
`;

const ImagesSection = styled.div``;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.2rem;
`;

const ImageThumbnail = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.8rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          background-color: #000000;
          color: #ffffff;
          border-color: #000000;
          &:hover { background-color: #333333; }
        `;
      case 'reject':
        return `
          background-color: #ffffff;
          color: #dc3545;
          border-color: #dc3545;
          &:hover { background-color: #dc3545; color: #ffffff; }
        `;
      case 'view':
        return `
          background-color: #ffffff;
          color: #000000;
          border-color: #000000;
          &:hover { background-color: #000000; color: #ffffff; }
        `;
      default:
        return `
          background-color: #ffffff;
          color: #666666;
          border-color: #e0e0e0;
          &:hover { background-color: #f5f5f5; }
        `;
    }
  }}
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 1.5rem;
  color: #666666;
  font-size: 1rem;
  font-weight: 300;
  max-width: 1200px;
  margin: 0 auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const EmptyTitle = styled.h3`
  color: #000000;
  font-weight: 400;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const EmptyText = styled.p`
  color: #666666;
  font-size: 1rem;
  font-weight: 300;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const PaginationButton = styled.button`
  padding: 0.8rem 1rem;
  background-color: ${props => props.active ? '#000000' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#000000'};
  border: 1px solid #000000;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 400;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#000000' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #e0e0e0;
    color: #999999;
    
    &:hover {
      background-color: #ffffff;
    }
  }
`;

// Modal for viewing design details
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  padding: 2.5rem;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: #000000;
  }
`;

const DesignApprovalPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Check if user is admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (currentUser.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);
  // Fetch designs
  const fetchDesigns = async (page = 1, status = filter) => {
    try {
      setLoading(true);
      const response = await api.get('/api/custom-designs/admin/all', {
        params: {
          status: status === 'all' ? undefined : status,
          page,
          limit: 10
        }
      });

      if (response.data.success) {
        setDesigns(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to fetch design requests');
    } finally {
      setLoading(false);
    }
  };

  const approveDesign = async (designId, finalPrice) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/custom-designs/admin/${designId}/approve`, {
        finalPrice: finalPrice || undefined
      });

      if (response.data.success) {
        toast.success('Design approved successfully!');
        fetchDesigns(pagination.page, filter);
        setShowModal(false);
        setSelectedDesign(null);
      }
    } catch (error) {
      console.error('Error approving design:', error);
      toast.error(error.response?.data?.message || 'Failed to approve design');
    } finally {
      setLoading(false);
    }
  };

  const rejectDesign = async (designId, remarks) => {
    if (!remarks || remarks.trim() === '') {
      toast.error('Please provide rejection remarks');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/api/custom-designs/admin/${designId}/reject`, {
        remarks: remarks.trim()
      });

      if (response.data.success) {
        toast.success('Design rejected successfully!');
        fetchDesigns(pagination.page, filter);
        setShowModal(false);
        setSelectedDesign(null);
      }
    } catch (error) {
      console.error('Error rejecting design:', error);
      toast.error(error.response?.data?.message || 'Failed to reject design');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchDesigns();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchDesigns(1, newFilter);
  };

  const handlePageChange = (newPage) => {
    fetchDesigns(newPage, filter);
  };

  const updateDesignStatus = async (designId, status, adminNotes = '', estimatedPrice = '', estimatedDays = '') => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/custom-designs/admin/${designId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            status,
            adminNotes,
            estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
            estimatedDays: estimatedDays ? parseInt(estimatedDays) : null
          })
        }
      );

      if (response.ok) {
        toast.success(`Design ${status} successfully`);
        fetchDesigns(pagination.page, filter);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${status} design`);
      }
    } catch (error) {
      console.error('Error updating design status:', error);
      toast.error(`Failed to ${status} design`);
    }
  };

  const handleViewDesign = (design) => {
    setSelectedDesign(design);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDesign(null);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <PageContainer>
      <Header>
        <Title>Design Approval Center</Title>
        <Subtitle>Review and approve custom design requests from customers</Subtitle>
      </Header>

      <FilterSection>
        <FilterGroup>
          <FilterLabel>
            <FontAwesomeIcon icon={faFilter} /> Filter by Status
          </FilterLabel>
          <FilterSelect value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="all">All Requests</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </FilterSelect>
        </FilterGroup>
      </FilterSection>

      {loading ? (
        <LoadingState>Loading design requests...</LoadingState>
      ) : designs.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No design requests found</EmptyTitle>
          <EmptyText>
            {filter === 'all' 
              ? 'No custom design requests have been submitted yet.'
              : `No ${filter} design requests found.`
            }
          </EmptyText>
        </EmptyState>
      ) : (
        <>
          <DesignGrid>
            {designs.map((design) => (
              <DesignCard key={design.design_id}>
                <CardHeader>
                  <DesignInfo>
                    <DesignName>{design.design_name}</DesignName>
                    <UserInfo>
                      <FontAwesomeIcon icon={faUser} /> {design.user_name || design.user_email}
                    </UserInfo>
                    <UserInfo>
                      <FontAwesomeIcon icon={faCalendar} /> {new Date(design.created_at).toLocaleDateString()}
                    </UserInfo>
                  </DesignInfo>
                  <StatusBadge status={design.status}>
                    {design.status.replace('_', ' ')}
                  </StatusBadge>
                </CardHeader>

                <CardContent>
                  <DetailsSection>
                    <DetailItem>
                      <DetailLabel>Category:</DetailLabel>
                      <DetailValue>{design.category}</DetailValue>
                    </DetailItem>
                    
                    {design.preferred_color && (
                      <DetailItem>
                        <DetailLabel>Color:</DetailLabel>
                        <DetailValue>{design.preferred_color}</DetailValue>
                      </DetailItem>
                    )}
                    
                    {design.size && (
                      <DetailItem>
                        <DetailLabel>Size:</DetailLabel>
                        <DetailValue>{design.size}</DetailValue>
                      </DetailItem>
                    )}
                    
                    {design.budget && (
                      <DetailItem>
                        <DetailLabel>Budget:</DetailLabel>
                        <DetailValue>{design.budget}</DetailValue>
                      </DetailItem>
                    )}
                    
                    <DetailItem>
                      <DetailLabel>Urgency:</DetailLabel>
                      <DetailValue>{design.urgency}</DetailValue>
                    </DetailItem>

                    <Description>
                      {design.description}
                    </Description>

                    {design.special_requests && (
                      <Description>
                        <strong>Special Requests:</strong><br />
                        {design.special_requests}
                      </Description>
                    )}
                  </DetailsSection>

                  <ImagesSection>
                    <h4>Design Images ({design.images.length})</h4>
                    <ImageGrid>
                      {design.images.slice(0, 6).map((image, index) => (
                        <ImageThumbnail
                          key={index}
                          src={`http://localhost:3001/api/custom-designs/images/${image}`}
                          alt={`Design ${index + 1}`}
                          onClick={() => handleViewDesign(design)}
                        />
                      ))}
                    </ImageGrid>
                    {design.images.length > 6 && (
                      <p style={{ fontSize: '14px', color: '#666' }}>
                        +{design.images.length - 6} more images
                      </p>
                    )}
                  </ImagesSection>
                </CardContent>

                <ActionButtons>
                  <ActionButton 
                    variant="view" 
                    onClick={() => handleViewDesign(design)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View Details
                  </ActionButton>
                  
                  {design.status === 'pending' && (
                    <>
                      <ActionButton 
                        variant="approve" 
                        onClick={() => updateDesignStatus(design.design_id, 'approved')}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Approve
                      </ActionButton>
                      <ActionButton 
                        variant="reject" 
                        onClick={() => updateDesignStatus(design.design_id, 'rejected')}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Reject
                      </ActionButton>
                    </>
                  )}
                </ActionButtons>
              </DesignCard>
            ))}
          </DesignGrid>

          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationButton 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </PaginationButton>
              
              {[...Array(pagination.totalPages)].map((_, index) => (
                <PaginationButton
                  key={index + 1}
                  active={pagination.page === index + 1}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </PaginationButton>
              ))}
              
              <PaginationButton 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}

      {/* Modal for viewing full design details */}
      {showModal && selectedDesign && (
        <Modal onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
            
            <h2>{selectedDesign.design_name}</h2>
            <p><strong>Customer:</strong> {selectedDesign.user_name || selectedDesign.user_email}</p>
            <p><strong>Status:</strong> {selectedDesign.status}</p>
            
            <h3>Design Images</h3>
            <ImageGrid>
              {selectedDesign.images.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:3001/api/custom-designs/images/${image}`}
                  alt={`Design ${index + 1}`}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              ))}
            </ImageGrid>
            
            <h3>Description</h3>
            <p>{selectedDesign.description}</p>
            
            {selectedDesign.special_requests && (
              <>
                <h3>Special Requests</h3>
                <p>{selectedDesign.special_requests}</p>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default DesignApprovalPage;
