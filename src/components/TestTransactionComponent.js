import React from 'react';

const TestTransactionComponent = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'red',
      color: 'white',
      padding: '10px',
      zIndex: 9999,
      border: '2px solid yellow'
    }}>
      🔥 TRANSACTION TEST COMPONENT 🔥
    </div>
  );
};

export default TestTransactionComponent;
