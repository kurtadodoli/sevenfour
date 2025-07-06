import React from 'react';

const TestComponent = () => {
  return (
    <div>
      <div>Content</div>
      
      {/* Transaction Details Modal */}
      {true && (
        <div>
          <div>
            <div>
              <h3>Transaction Details</h3>
            </div>
            <div>
              <p>Order Number: Test</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestComponent;
