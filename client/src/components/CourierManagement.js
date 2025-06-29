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

  .icon {
    color: #000000 !important;
  }
`;

const DeliveryCount = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.count > 0 ? '#fff3cd' : '#d4edda'};
  color: ${props => props.count > 0 ? '#856404' : '#155724'};
  border: 1px solid ${props => props.count > 0 ? '#ffeaa7' : '#c3e6cb'};
  margin-top: 0.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'danger',
})`
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
  const [activeDeliveries, setActiveDeliveries] = useState({}); // Track active deliveries per courier

  useEffect(() => {
    if (isOpen) {
      loadCouriers();
      loadActiveDeliveries();
    }
  }, [isOpen]);

  const loadActiveDeliveries = async () => {
    console.log('🔍 loadActiveDeliveries called - starting detection...');
    try {
      // Try multiple endpoints to get active delivery data
      let deliveryCounts = {};
      
      // Method 1: Check original delivery schedules (what backend deletion checks)
      console.log('📊 Method 1: Checking /delivery/schedules...');
      try {
        // Use direct fetch since this endpoint is not under /api
        const schedulesResponse = await fetch('http://localhost:5000/delivery/schedules');
        const rawData = await schedulesResponse.json();
        console.log('📊 Raw schedules response:', rawData);
        
        const schedules = Array.isArray(rawData) ? rawData : rawData.schedules || [];
        
        console.log(`📊 Parsed schedules: ${schedules.length} items`);
        console.log('📊 Original delivery schedules:', schedules);
        
        schedules.forEach(schedule => {
          // Include all active delivery statuses to match backend logic
          const activeStatuses = ['pending', 'scheduled', 'in_transit', 'delayed'];
          const status = schedule.delivery_status || schedule.status;
          
          console.log(`📦 Processing schedule ${schedule.id}: Courier ${schedule.courier_id}, Status: ${status}`);
          
          if (schedule.courier_id && status && activeStatuses.includes(status.toLowerCase())) {
            deliveryCounts[schedule.courier_id] = (deliveryCounts[schedule.courier_id] || 0) + 1;
            console.log(`  ✅ ACTIVE delivery for courier ${schedule.courier_id}: ${status} (Schedule ID: ${schedule.id})`);
          }
        });
        
        console.log('📊 After Method 1, deliveryCounts:', deliveryCounts);
      } catch (scheduleError) {
        console.log('⚠️ Could not fetch delivery schedules:', scheduleError);
      }
      
      // Method 2: Check enhanced delivery orders
      console.log('📊 Method 2: Checking /delivery-enhanced/orders...');
      try {
        const ordersResponse = await api.get('/delivery-enhanced/orders');
        console.log('📊 Enhanced orders response:', ordersResponse.data);
        
        if (ordersResponse.data.success && ordersResponse.data.data) {
          const orders = ordersResponse.data.data;
          console.log(`📊 Enhanced orders: ${orders.length} items`);
          
          orders.forEach(order => {
            // Include all active delivery statuses: pending, scheduled, in_transit, delayed
            const activeStatuses = ['pending', 'scheduled', 'in_transit', 'delayed'];
            const status = order.delivery_status || order.status;
            
            console.log(`📦 Processing order ${order.order_id || order.id}: Courier ${order.courier_id}, Status: ${status}`);
            
            if (order.courier_id && status && activeStatuses.includes(status.toLowerCase())) {
              deliveryCounts[order.courier_id] = (deliveryCounts[order.courier_id] || 0) + 1;
              console.log(`  ✅ ACTIVE order for courier ${order.courier_id}: ${status} (Order ID: ${order.order_id || order.id})`);
            }
          });
        }
        
        console.log('📊 After Method 2, deliveryCounts:', deliveryCounts);
      } catch (ordersError) {
        console.log('⚠️ Could not fetch enhanced orders:', ordersError);
      }
      
      console.log('📊 Final active delivery counts before setState:', deliveryCounts);
      setActiveDeliveries(deliveryCounts);
      console.log('📊 setActiveDeliveries called with:', deliveryCounts);
    } catch (error) {
      console.error('❌ Error loading active deliveries:', error);
      // Don't show error for this, it's not critical
    }
  };

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
    console.log('➕ handleAddCourier called - clearing editingCourier');
    setEditingCourier(null);
    setShowCourierModal(true);
  };

  const handleEditCourier = (courier) => {
    console.log('🔧 handleEditCourier called with:', courier);
    setEditingCourier(courier);
    setShowCourierModal(true);
  };

  const updateCourierStatus = async (courierId, updates) => {
    try {
      await api.put(`/couriers/${courierId}`, updates);
      await loadCouriers();
      await loadActiveDeliveries();
    } catch (error) {
      console.error('Error updating courier status:', error);
      throw error;
    }
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
    console.log(`🗑️ Attempting to delete courier ${courierId} (${courierName})`);
    
    // Refresh active deliveries before deletion attempt
    console.log('🔄 Refreshing active deliveries before deletion...');
    await loadActiveDeliveries();
    
    // Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`📊 Current active deliveries state:`, activeDeliveries);
    
    const activeCount = activeDeliveries[courierId] || 0;
    console.log(`📦 Active deliveries for courier ${courierId}: ${activeCount}`);
    
    // Enhanced confirmation with active delivery info
    const confirmMessage = activeCount > 0 
      ? `⚠️ Cannot Delete Courier\n\n` +
        `Courier "${courierName}" has ${activeCount} active delivery(ies).\n\n` +
        `You must first:\n` +
        `• Complete all active deliveries, OR\n` +
        `• Reassign deliveries to another courier\n\n` +
        `Would you like to set this courier to "offline" status instead?\n` +
        `(This prevents new assignments while keeping delivery history)`
      : `Are you sure you want to delete courier "${courierName}"?\n\n` +
        `This action cannot be undone.`;

    if (activeCount > 0) {
      // Courier has active deliveries - offer offline option
      const result = window.confirm(confirmMessage);
      if (result) {
        try {
          await updateCourierStatus(courierId, { status: 'offline' });
          alert(`Courier "${courierName}" has been set to offline status.`);
          await loadActiveDeliveries(); // Refresh delivery counts
        } catch (offlineError) {
          console.error('Error setting courier offline:', offlineError);
          alert('Failed to update courier status. Please try again.');
        }
      }
      return;
    }

    // No active deliveries detected - proceed with deletion, but handle API rejection gracefully
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log(`🗑️ Proceeding with deletion of courier ${courierId}`);
      await api.delete(`/couriers/${courierId}`);
      await loadCouriers();
      await loadActiveDeliveries(); // Refresh delivery counts
      alert(`Courier "${courierName}" has been successfully deleted.`);
    } catch (error) {
      console.error('Error deleting courier:', error);
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Cannot delete courier with active deliveries.';
        
        // The API detected active deliveries that our frontend missed - offer solutions
        const offerOffline = window.confirm(
          `❌ Deletion Failed\n\n` +
          `Server reports: ${errorMessage}\n\n` +
          `It appears this courier has active deliveries that weren't detected by the interface.\n\n` +
          `Solutions:\n` +
          `1. Refresh the page and check delivery schedules\n` +
          `2. Complete or reassign active deliveries\n` +
          `3. Set courier to "offline" status instead\n\n` +
          `Would you like to set this courier to "offline" status now?\n` +
          `(This prevents new assignments while keeping delivery history)`
        );
        
        if (offerOffline) {
          try {
            await updateCourierStatus(courierId, { status: 'offline' });
            alert(`Courier "${courierName}" has been set to offline status.`);
            await loadActiveDeliveries(); // Refresh delivery counts
          } catch (offlineError) {
            console.error('Error setting courier offline:', offlineError);
            alert('Failed to update courier status. Please try again or refresh the page.');
          }
        }
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
              {Object.keys(activeDeliveries).length > 0 && (
                <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                  • {Object.values(activeDeliveries).reduce((sum, count) => sum + count, 0)} active deliveries
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <AddButton 
                onClick={async () => {
                  await loadCouriers();
                  await loadActiveDeliveries();
                }}
                style={{ background: '#f8f9fa', color: '#000000', border: '1px solid #d0d0d0' }}
              >
                <FontAwesomeIcon icon={faEdit} />
                Refresh Data
              </AddButton>
              <AddButton onClick={handleAddCourier}>
                <FontAwesomeIcon icon={faPlus} />
                Add New Courier
              </AddButton>
            </div>
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
                    
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      <StatusBadge status={courier.status}>
                        <FontAwesomeIcon icon={getStatusIcon(courier.status)} className="icon" />
                        {courier.status.charAt(0).toUpperCase() + courier.status.slice(1)}
                      </StatusBadge>
                      
                      <DeliveryCount count={activeDeliveries[courier.id] || 0}>
                        📦 {activeDeliveries[courier.id] || 0} active delivery(ies)
                      </DeliveryCount>
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
