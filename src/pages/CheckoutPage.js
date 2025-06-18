// src/pages/CheckoutPage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faCreditCard, 
  faMapMarkerAlt,
  faArrowLeft,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 100px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const CheckoutContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }
  
  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const OrderSummary = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  height: fit-content;
  position: sticky;
  top: 120px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  &.total {
    font-size: 1.25rem;
    font-weight: 700;
    border-top: 2px solid #f0f0f0;
    padding-top: 1rem;
    margin-top: 1.5rem;
  }
`;

const PlaceOrderButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 1rem;
  
  .icon {
    color: #28a745;
  }
`;

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate order processing
    setTimeout(() => {
      alert('Order placed successfully! Redirecting to orders page...');
      clearCart();
      navigate('/orders');
      setLoading(false);
    }, 2000);
  };

  const goBack = () => {
    navigate('/cart');
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <PageContainer>
      <BackButton onClick={goBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to Cart
      </BackButton>

      <Header>
        <h1>Checkout</h1>
        <p>Complete your order securely</p>
      </Header>

      <CheckoutContainer>
        <div>
          <FormSection>
            <SectionTitle>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              Shipping Information
            </SectionTitle>
            <form onSubmit={handleSubmitOrder}>
              <FormGroup>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </form>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FontAwesomeIcon icon={faCreditCard} />
              Payment Information
            </SectionTitle>
            
            <FormGroup>
              <label>Name on Card</label>
              <input
                type="text"
                name="nameOnCard"
                value={formData.nameOnCard}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </FormGroup>
            </FormRow>

            <SecurityNote>
              <FontAwesomeIcon icon={faLock} className="icon" />
              Your payment information is encrypted and secure
            </SecurityNote>
          </FormSection>
        </div>

        <OrderSummary>
          <SectionTitle>Order Summary</SectionTitle>
          
          {cartItems.map((item) => (
            <SummaryItem key={item.id}>
              <span>{item.name} x {item.quantity}</span>
              <span>₱{(item.price * item.quantity).toFixed(2)}</span>
            </SummaryItem>
          ))}
          
          <SummaryItem>
            <span>Shipping</span>
            <span>Free</span>
          </SummaryItem>
          
          <SummaryItem>
            <span>Tax</span>
            <span>₱0.00</span>
          </SummaryItem>
          
          <SummaryItem className="total">
            <span>Total</span>
            <span>₱{cartTotal.toFixed(2)}</span>
          </SummaryItem>
          
          <PlaceOrderButton 
            onClick={handleSubmitOrder}
            disabled={loading}
          >
            <FontAwesomeIcon icon={loading ? faCheck : faLock} />
            {loading ? 'Processing...' : 'Place Order'}
          </PlaceOrderButton>
        </OrderSummary>
      </CheckoutContainer>
    </PageContainer>
  );
};

export default CheckoutPage;