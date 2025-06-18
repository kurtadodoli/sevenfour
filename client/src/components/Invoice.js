import React from 'react';
import styled from 'styled-components';
import sfcLogo from '../assets/images/sfc-logo.png';

const InvoiceContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: 'Arial', sans-serif;
  
  @media print {
    box-shadow: none;
    margin: 0;
    max-width: none;
    padding: 20px;
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #1a1a1a;
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Logo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

const CompanyDetails = styled.div`
  h1 {
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }
  
  p {
    color: #666;
    margin: 2px 0;
    font-size: 14px;
    line-height: 1.4;
  }
`;

const InvoiceInfo = styled.div`
  text-align: right;
  
  h2 {
    color: #1a1a1a;
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
  }
  
  p {
    color: #666;
    margin: 4px 0;
    font-size: 14px;
  }
  
  .invoice-number {
    color: #1a1a1a;
    font-weight: 600;
    font-size: 16px;
  }
`;

const CustomerSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
`;

const AddressBlock = styled.div`
  h3 {
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  p {
    color: #666;
    margin: 6px 0;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .highlight {
    color: #1a1a1a;
    font-weight: 600;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  
  th {
    background: #f8f9fa;
    color: #1a1a1a;
    font-weight: 600;
    padding: 15px 12px;
    text-align: left;
    border: 1px solid #e0e0e0;
    font-size: 14px;
    letter-spacing: 0.3px;
  }
  
  td {
    padding: 15px 12px;
    border: 1px solid #e0e0e0;
    color: #666;
    font-size: 14px;
    vertical-align: top;
  }
  
  tr:nth-child(even) {
    background: #fafbfc;
  }
  
  .item-name {
    color: #1a1a1a;
    font-weight: 600;
  }
  
  .item-description {
    color: #888;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .qty {
    text-align: center;
    font-weight: 600;
  }
  
  .price, .total {
    text-align: right;
    font-weight: 600;
    color: #1a1a1a;
  }
`;

const TotalsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
`;

const TotalsTable = styled.div`
  min-width: 300px;
  
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
    
    &.subtotal {
      font-size: 14px;
      color: #666;
    }
    
    &.shipping {
      font-size: 14px;
      color: #666;
    }
    
    &.grand-total {
      padding: 15px 0;
      border-bottom: 2px solid #1a1a1a;
      border-top: 2px solid #1a1a1a;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      background: #f8f9fa;
      padding-left: 15px;
      padding-right: 15px;
      margin-top: 10px;
    }
  }
`;

const PaymentInfo = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 30px;
  border-left: 4px solid #1a1a1a;
  
  h3 {
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
  
  p {
    color: #666;
    margin: 6px 0;
    font-size: 14px;
  }
  
  .payment-method {
    color: #1a1a1a;
    font-weight: 600;
    background: white;
    padding: 8px 12px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 8px;
  }
`;

const Footer = styled.div`
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
  color: #888;
  font-size: 12px;
  
  p {
    margin: 6px 0;
  }
  
  .thank-you {
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
  }
`;

const StatusBadge = styled.span`
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Invoice = ({ order, orderItems = [] }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toFixed(2)}`;
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const shippingFee = 100; // Default shipping fee
  const subtotal = calculateSubtotal();
  const total = subtotal + shippingFee;

  return (
    <InvoiceContainer>
      <InvoiceHeader>
        <CompanyInfo>
          <Logo src={sfcLogo} alt="Seven Four Clothing" />
          <CompanyDetails>
            <h1>Seven Four Clothing</h1>
            <p>Premium Urban Fashion</p>
            <p>📧 info@sevenfourclothing.com</p>
            <p>📞 +63 XXX XXX XXXX</p>
            <p>📍 Philippines</p>
          </CompanyDetails>
        </CompanyInfo>
        
        <InvoiceInfo>
          <h2>INVOICE</h2>
          <p className="invoice-number">#{order?.invoice_id || order?.id}</p>
          <p>Date: {formatDate(order?.created_at || new Date())}</p>
          <p>Due Date: {formatDate(order?.created_at || new Date())}</p>
          <StatusBadge status={order?.status || 'pending'}>
            {order?.status || 'Pending'}
          </StatusBadge>
        </InvoiceInfo>
      </InvoiceHeader>      <CustomerSection>
        <AddressBlock>
          <h3>Bill To:</h3>
          <p className="highlight">{order?.customer_name || (order?.user?.first_name && order?.user?.last_name ? `${order.user.first_name} ${order.user.last_name}` : 'Customer Name')}</p>
          <p>{order?.customer_email || order?.user?.email || 'customer@email.com'}</p>
          <p>{order?.contact_phone || 'Phone Number'}</p>
        </AddressBlock>
        
        <AddressBlock>
          <h3>Ship To:</h3>
          <p className="highlight">{order?.customer_name || (order?.user?.first_name && order?.user?.last_name ? `${order.user.first_name} ${order.user.last_name}` : 'Customer Name')}</p>
          <p>{order?.shipping_address || 'Shipping Address'}</p>
          {order?.notes && (
            <p style={{ fontStyle: 'italic', marginTop: '10px' }}>
              <strong>Notes:</strong> {order.notes}
            </p>
          )}
        </AddressBlock>
      </CustomerSection>

      <ItemsTable>
        <thead>
          <tr>
            <th style={{ width: '50%' }}>Item Description</th>
            <th style={{ width: '15%' }}>Qty</th>
            <th style={{ width: '17.5%' }}>Unit Price</th>
            <th style={{ width: '17.5%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="item-name">{item.productname || item.name}</div>
                {item.productcolor && (
                  <div className="item-description">Color: {item.productcolor}</div>
                )}
                {item.selectedSize && (
                  <div className="item-description">Size: {item.selectedSize}</div>
                )}
              </td>
              <td className="qty">{item.quantity}</td>
              <td className="price">{formatCurrency(item.price)}</td>
              <td className="total">{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </ItemsTable>

      <TotalsSection>
        <TotalsTable>
          <div className="total-row subtotal">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="total-row shipping">
            <span>Shipping Fee:</span>
            <span>{formatCurrency(shippingFee)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total Amount:</span>
            <span>{formatCurrency(order?.total_amount || total)}</span>
          </div>
        </TotalsTable>
      </TotalsSection>

      <PaymentInfo>
        <h3>Payment Information</h3>
        <p><strong>Payment Method:</strong></p>
        <div className="payment-method">
          {order?.payment_method || 'Cash on Delivery (COD)'}
        </div>
        <p style={{ marginTop: '12px' }}>
          <strong>Transaction Status:</strong> {order?.transaction_status || 'Pending'}
        </p>
      </PaymentInfo>

      <Footer>
        <p className="thank-you">Thank you for your business!</p>
        <p>This invoice was generated on {formatDate(new Date())}</p>
        <p>Seven Four Clothing - Premium Urban Fashion</p>
        <p>For any inquiries, please contact us at info@sevenfourclothing.com</p>
      </Footer>
    </InvoiceContainer>
  );
};

export default Invoice;
