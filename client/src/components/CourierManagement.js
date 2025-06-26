import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faPlus, 
  faEdit, 
  faTrash, 
  faMotorcycle, 
  faPhone, 
  faEnvelope, 
  faCheckCircle,
  faTimesCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import CourierModal from './CourierModal';
import api from '../utils/api';

// Styled Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    color: #000000;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const AddButton = styled.button`
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #333333;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CourierGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CourierCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #ffffff;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #000000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CourierName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.5rem 0;
`;

const CourierInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666666;

  .icon {
    width: 16px;
    color: #999999;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#d4edda';
      case 'busy': return '#fff3cd';
      case 'offline': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#155724';
      case 'busy': return '#856404';
      case 'offline': return '#721c24';
      default: return '#495057';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? '#dc3545' : '#f8f9fa'};
  color: ${props => props.danger ? '#ffffff' : '#000000'};
  border: 1px solid ${props => props.danger ? '#dc3545' : '#d0d0d0'};
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.danger ? '#c82333' : '#e9ecef'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666666;
  
  .icon {
    font-size: 3rem;
    color: #cccccc;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.2rem;
    font-weight: 400;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666666;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
`;

const CourierManagement = ({ isOpen, onClose }) => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [editingCourier, setEditingCourier] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCouriers();
    }
  }, [isOpen]);

  const loadCouriers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/couriers');
      setCouriers(response.data);
    } catch (error) {
      console.error('Error loading couriers:', error);
      setError('Failed to load couriers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourier = () => {
    setEditingCourier(null);
    setShowCourierModal(true);
  };

  const handleEditCourier = (courier) => {
    setEditingCourier(courier);
    setShowCourierModal(true);
  };

  const handleSaveCourier = async (courierData) => {
    try {
      if (editingCourier) {
        // Update existing courier
        await api.put(`/couriers/${editingCourier.id}`, courierData);
      } else {
        // Create new courier
        await api.post('/couriers', courierData);
      }
      
      await loadCouriers();
      setShowCourierModal(false);
      setEditingCourier(null);
    } catch (error) {
      console.error('Error saving courier:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleDeleteCourier = async (courierId, courierName) => {
    if (!window.confirm(`Are you sure you want to delete courier "${courierName}"?`)) {
      return;
    }

    try {
      await api.delete(`/couriers/${courierId}`);
      await loadCouriers();
    } catch (error) {
      console.error('Error deleting courier:', error);
      if (error.response?.status === 400) {
        alert('Cannot delete courier with active deliveries.');
      } else {
        alert('Failed to delete courier. Please try again.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return faCheckCircle;
      case 'busy': return faClock;
      case 'offline': return faTimesCircle;
      default: return faTimesCircle;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Courier Management</ModalTitle>
            <CloseButton onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
          </ModalHeader>

          <ActionBar>
            <div>
              <strong>{couriers.length}</strong> courier{couriers.length !== 1 ? 's' : ''} registered
            </div>
            <AddButton onClick={handleAddCourier}>
              <FontAwesomeIcon icon={faPlus} />
              Add New Courier
            </AddButton>
          </ActionBar>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {loading ? (
            <LoadingMessage>Loading couriers...</LoadingMessage>
          ) : couriers.length === 0 ? (
            <EmptyState>
              <FontAwesomeIcon icon={faMotorcycle} className="icon" />
              <h3>No Couriers Yet</h3>
              <p>Add your first courier to start managing deliveries</p>
            </EmptyState>
          ) : (
            <CourierGrid>
              {couriers.map(courier => (
                <CourierCard key={courier.id}>
                  <CourierName>{courier.name}</CourierName>
                  
                  <CourierInfo>
                    <InfoItem>
                      <FontAwesomeIcon icon={faPhone} className="icon" />
                      {courier.phone_number}
                    </InfoItem>
                    
                    {courier.email && (
                      <InfoItem>
                        <FontAwesomeIcon icon={faEnvelope} className="icon" />
                        {courier.email}
                      </InfoItem>
                    )}
                    
                    <InfoItem>
                      <FontAwesomeIcon icon={faMotorcycle} className="icon" />
                      {courier.vehicle_type} • Max {courier.max_deliveries_per_day}/day
                    </InfoItem>
                    
                    <div style={{ marginTop: '0.5rem' }}>
                      <StatusBadge status={courier.status}>
                        <FontAwesomeIcon icon={getStatusIcon(courier.status)} />
                        {courier.status.charAt(0).toUpperCase() + courier.status.slice(1)}
                      </StatusBadge>
                    </div>
                  </CourierInfo>

                  <ActionButtons>
                    <ActionButton onClick={() => handleEditCourier(courier)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </ActionButton>
                    <ActionButton 
                      danger={true}
                      onClick={() => handleDeleteCourier(courier.id, courier.name)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </ActionButton>
                  </ActionButtons>
                </CourierCard>
              ))}
            </CourierGrid>
          )}
        </ModalContent>
      </Modal>

      <CourierModal
        isOpen={showCourierModal}
        onClose={() => {
          setShowCourierModal(false);
          setEditingCourier(null);
        }}
        onSave={handleSaveCourier}
        editingCourier={editingCourier}
      />
    </>
  );
};

export default CourierManagement;
