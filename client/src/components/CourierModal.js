import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

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
  max-width: 500px;
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #000000;
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  background: #ffffff;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid ${props => props.$primary ? '#000000' : '#d0d0d0'};
  background: ${props => props.$primary ? '#000000' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : '#000000'};
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: ${props => props.$primary ? '#333333' : '#f8f9fa'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InputIcon = styled.div`
  position: relative;
  
  .icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666666;
    font-size: 0.9rem;
  }
  
  input {
    padding-left: 2.5rem;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const CourierModal = ({ isOpen, onClose, onSave, editingCourier = null }) => {
  const [formData, setFormData] = useState({
    name: editingCourier?.name || '',
    phone_number: editingCourier?.phone_number || '',
    email: editingCourier?.email || '',
    license_number: editingCourier?.license_number || '',
    vehicle_type: editingCourier?.vehicle_type || 'motorcycle',
    max_deliveries_per_day: editingCourier?.max_deliveries_per_day || 10,
    service_areas: editingCourier?.service_areas || '',
    notes: editingCourier?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when editingCourier changes
  useEffect(() => {
    console.log('📝 CourierModal useEffect - editingCourier changed:', editingCourier);
    setFormData({
      name: editingCourier?.name || '',
      phone_number: editingCourier?.phone_number || '',
      email: editingCourier?.email || '',
      license_number: editingCourier?.license_number || '',
      vehicle_type: editingCourier?.vehicle_type || 'motorcycle',
      max_deliveries_per_day: editingCourier?.max_deliveries_per_day || 10,
      service_areas: editingCourier?.service_areas || '',
      notes: editingCourier?.notes || ''
    });
    setErrors({});
    setIsSubmitting(false);
  }, [editingCourier]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^[+]?[0-9\-()s]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.max_deliveries_per_day && (isNaN(formData.max_deliveries_per_day) || formData.max_deliveries_per_day < 1)) {
      newErrors.max_deliveries_per_day = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving courier:', error);
      setErrors({ submit: 'Failed to save courier. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {editingCourier ? 'Edit Courier' : 'Add New Courier'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Courier Name *</Label>
            <InputIcon>
              <FontAwesomeIcon icon={faUser} className="icon" />
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter courier's full name"
                required
              />
            </InputIcon>
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Phone Number *</Label>
            <InputIcon>
              <FontAwesomeIcon icon={faPhone} className="icon" />
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+63 912 345 6789"
                required
              />
            </InputIcon>
            {errors.phone_number && <ErrorMessage>{errors.phone_number}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Email Address</Label>
            <InputIcon>
              <FontAwesomeIcon icon={faEnvelope} className="icon" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="courier@email.com"
              />
            </InputIcon>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>License Number</Label>
            <Input
              type="text"
              value={formData.license_number}
              onChange={(e) => handleInputChange('license_number', e.target.value)}
              placeholder="Driver's license number"
            />
          </FormGroup>

          <FormGroup>
            <Label>Vehicle Type</Label>
            <Select
              value={formData.vehicle_type}
              onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
            >
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Max Deliveries Per Day</Label>
            <Input
              type="number"
              value={formData.max_deliveries_per_day}
              onChange={(e) => handleInputChange('max_deliveries_per_day', parseInt(e.target.value) || 0)}
              min="1"
              max="50"
            />
            {errors.max_deliveries_per_day && <ErrorMessage>{errors.max_deliveries_per_day}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Service Areas</Label>
            <Textarea
              value={formData.service_areas}
              onChange={(e) => handleInputChange('service_areas', e.target.value)}
              placeholder="Areas or cities this courier can deliver to..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this courier..."
            />
          </FormGroup>

          {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

          <ButtonGroup>
            <Button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" $primary disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingCourier ? 'Update Courier' : 'Add Courier'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CourierModal;
