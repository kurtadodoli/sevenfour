// src/components/Toast.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const ToastItem = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#343a40';
    }
  }};
  color: white;
  padding: 12px 20px;
  margin-bottom: 10px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: ${props => props.isVisible ? slideIn : slideOut} 0.3s ease-out;
  max-width: 350px;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

let toastId = 0;

export const Toast = ({ toasts, removeToast }) => {
  return (
    <ToastContainer>
      {toasts.map(toast => (
        <ToastItem key={toast.id} type={toast.type} isVisible={toast.isVisible}>
          <span>{toast.message}</span>
          <CloseButton onClick={() => removeToast(toast.id)}>
            ×
          </CloseButton>
        </ToastItem>
      ))}
    </ToastContainer>
  );
};

// Toast context and provider
const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    const newToast = { id, message, type, isVisible: true };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, isVisible: false } : toast
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

  const contextValue = {
    addToast,
    removeToast,
    toasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
