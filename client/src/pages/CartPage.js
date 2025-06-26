// src/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faMinus, 
  faPlus, 
  faShoppingCart, 
  faArrowLeft,
  faHeart,
  faTruck,
  faShield
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components - OrdersPage Style
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .icon {
    color: #1a1a1a;
    padding: 0.5rem;
    border-radius: 50%;
    font-size: 1.8rem;
    border: 3px solid rgba(26, 26, 26, 0.2);
    background: rgba(26, 26, 26, 0.05);
  }
`;

const BackButton = styled(Link)`
  padding: 0.5rem 1rem;
  border: 2px solid #1a1a1a;
  border-radius: 6px;
  background: white;
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #1a1a1a;
    color: white;
  }
`;

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 3rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 400px;
    gap: 2rem;
  }
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CartItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 2rem;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
`;

const ItemImage = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  background: #2d2d2d;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ItemName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.3;
`;

const ItemVariants = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  span {
    background: #f8f9fa;
    color: #333;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid #e0e0e0;
  }
`;

const ItemPrice = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  background: #2d2d2d;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  button {
    width: 40px;
    height: 40px;
    border: none;
    background: linear-gradient(135deg, #4a9eff 0%, #2196f3 100%);
    color: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
      }
    }
  }
  
  span {
    min-width: 50px;
    text-align: center;
    font-weight: 700;
    font-size: 1.1rem;
    color: #ffffff;
  }
`;

const RemoveButton = styled.button`
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    }
  }
`;

const ClearAllButton = styled.button`
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    }
  }
`;

const CartSummary = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: fit-content;
  position: sticky;
  top: 120px;
`;

const SummaryTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 2rem 0;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #4a9eff 0%, #2196f3 100%);
    border-radius: 2px;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &.total {
    font-size: 1.4rem;
    font-weight: 800;
    color: #4caf50;
    border-top: 2px solid #4a9eff;
    border-bottom: none;
    padding-top: 1.5rem;
    margin-top: 2rem;
  }
  
  span:first-child {
    font-weight: 600;
    color: #b0b0b0;
  }
  
  span:last-child {
    font-weight: 700;
    color: #ffffff;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #4a9eff 0%, #2196f3 100%);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s ease;
  margin-top: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 158, 255, 0.5);
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    
    &::before {
      left: 100%;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
    }
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 5rem 3rem;
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .icon {
    font-size: 6rem;
    color: #4a9eff;
    margin-bottom: 2rem;
    animation: ${pulse} 2s infinite;
    border: 4px solid rgba(74, 158, 255, 0.3);
    border-radius: 50%;
    padding: 1.5rem;
    background: rgba(74, 158, 255, 0.1);
  }
  
  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 1rem;
  }
  
  p {
    color: #b0b0b0;
    margin-bottom: 3rem;
    font-size: 1.1rem;
  }
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #4a9eff 0%, #2196f3 100%);
  color: white;
  text-decoration: none;
  padding: 1.25rem 2.5rem;
  border-radius: 8px;
  font-weight: 700;
  transition: all 0.4s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 158, 255, 0.4);
    color: white;
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  &::after {
    content: '';
    width: 50px;
    height: 50px;
    border: 5px solid rgba(74, 158, 255, 0.1);
    border-top: 5px solid #4a9eff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  
  .feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #b0b0b0;
    
    .icon {
      color: #4caf50;
    }
  }
`;

const CartPage = () => {
  const { cartItems, cartCount, cartTotal, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const handleQuantityChange = async (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
    
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };
  const handleRemoveItem = async (itemId, itemName) => {
    if (window.confirm(`Remove "${itemName}" from your cart?`)) {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      
      try {
        await removeFromCart(itemId);
        toast.success(`"${itemName}" removed from cart`);
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item from cart');
      }
      
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm(`Are you sure you want to remove all ${cartCount} items from your cart? This action cannot be undone.`)) {
      try {
        await clearCart();
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && cartItems.length === 0) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer>      <Header>
        <Title>
          <span className="icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </span>
          Shopping Cart ({cartCount})
        </Title>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {cartItems.length > 0 && (
            <ClearAllButton onClick={handleClearCart}>
              <FontAwesomeIcon icon={faTrash} />
              Clear All
            </ClearAllButton>
          )}
          <BackButton to="/products">
            <FontAwesomeIcon icon={faArrowLeft} />
            Continue Shopping
          </BackButton>
        </div>
      </Header>

      {cartItems.length === 0 ? (
        <EmptyCart>
          <FontAwesomeIcon icon={faShoppingCart} className="icon" />
          <h2>Your cart is empty</h2>
          <p>Add some awesome products to your cart and they'll show up here.</p>
          <ShopButton to="/products">
            Start Shopping
          </ShopButton>
        </EmptyCart>
      ) : (
        <CartContent>
          <CartItems>
            {cartItems.map((item) => (
              <CartItem key={item.id}>
                <ItemImage>
                  <img 
                    src={item.main_image || 'https://via.placeholder.com/120x120?text=No+Image'} 
                    alt={item.name}
                  />
                </ItemImage>
                
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemVariants>
                    {item.color && <span>Color: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </ItemVariants>
                  <ItemPrice>₱{parseFloat(item.price).toFixed(2)}</ItemPrice>
                </ItemDetails>
                
                <ItemActions>
                  <QuantityControl>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={updatingItems.has(item.id) || item.quantity <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      disabled={updatingItems.has(item.id)}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </QuantityControl>
                    <RemoveButton 
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    disabled={updatingItems.has(item.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </RemoveButton>
                </ItemActions>
              </CartItem>
            ))}
          </CartItems>

          <CartSummary>
            <SummaryTitle>Order Summary</SummaryTitle>
            
            <SummaryRow>
              <span>Subtotal ({cartCount} items)</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </SummaryRow>
            
            <SummaryRow>
              <span>Shipping</span>
              <span>Free</span>
            </SummaryRow>
            
            <SummaryRow>
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </SummaryRow>
            
            <SummaryRow className="total">
              <span>Total</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </SummaryRow>
            
            <CheckoutButton 
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
            >
              Proceed to Checkout
            </CheckoutButton>
            
            <Features>
              <div className="feature">
                <FontAwesomeIcon icon={faTruck} className="icon" />
                Free Shipping
              </div>
              <div className="feature">
                <FontAwesomeIcon icon={faShield} className="icon" />
                Secure Payment
              </div>
              <div className="feature">
                <FontAwesomeIcon icon={faHeart} className="icon" />
                Easy Returns
              </div>
            </Features>
          </CartSummary>
        </CartContent>
      )}
    </PageContainer>
  );
};

export default CartPage;