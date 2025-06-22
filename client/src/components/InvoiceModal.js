import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faDownload,
  faEye 
} from '@fortawesome/free-solid-svg-icons';
import Invoice from './Invoice';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const ModalTitle = styled.h2`
  color: #1a1a1a;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #1a1a1a;
  background: ${props => props.primary ? '#1a1a1a' : 'white'};
  color: ${props => props.primary ? 'white' : '#1a1a1a'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.primary ? '#333' : '#f5f5f5'};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #1a1a1a;
  }
`;

const ModalContent = styled.div`
  max-height: calc(90vh - 80px);
  overflow-y: auto;
  padding: 0;
`;

const PrintStyles = styled.div`
  @media print {
    .modal-header {
      display: none !important;
    }
    
    .modal-overlay {
      position: static !important;
      background: none !important;
      padding: 0 !important;
    }
    
    .modal-container {
      box-shadow: none !important;
      max-width: none !important;
      max-height: none !important;
    }
    
    .modal-content {
      max-height: none !important;
      overflow: visible !important;
    }
  }
`;

const InvoiceModal = ({ 
  isOpen, 
  onClose, 
  order, 
  orderItems = []
}) => {
  if (!isOpen) return null;  const handleDownloadPDF = async () => {
    try {
      const invoiceId = order?.invoice_id || order?.id;
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      // Make authenticated request to get PDF
      const response = await fetch(`http://localhost:3001/api/orders/invoice/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download PDF:', response.statusText);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <PrintStyles>
      <ModalOverlay className="modal-overlay" onClick={handleOverlayClick}>
        <ModalContainer className="modal-container">
          <ModalHeader className="modal-header">
            <ModalTitle>
              <FontAwesomeIcon icon={faEye} />
              Invoice #{order?.invoice_id || order?.id}
            </ModalTitle>
              <ModalActions>              <ActionButton onClick={handleDownloadPDF}>
                <FontAwesomeIcon icon={faDownload} />
                PDF
              </ActionButton>
              
              <CloseButton onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseButton>
            </ModalActions>
          </ModalHeader>
          
          <ModalContent className="modal-content">
            <Invoice order={order} orderItems={orderItems} />
          </ModalContent>
        </ModalContainer>
      </ModalOverlay>
    </PrintStyles>
  );
};

export default InvoiceModal;
