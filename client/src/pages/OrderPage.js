import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faUser, 
  faPhone, 
  faMapMarkerAlt, 
  faMoneyBillWave,
  faDownload,
  faCheck,
  faSpinner,
  faEye,
  faMinus,
  faPlus,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import InvoiceModal from '../components/InvoiceModal';

// Styled Components with Glassmorphic Design
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(200, 200, 200, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 16px;
  
  svg {
    color: #000000;
    -webkit-text-fill-color: #000000;
  }  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: fit-content;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #000000 0%, #333333 100%)' : 
    'transparent'
  };
  color: ${props => props.active ? '#ffffff' : '#666666'};
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(135deg, #000000 0%, #333333 100%)' : 
      'rgba(0, 0, 0, 0.05)'
    };
    color: ${props => props.active ? '#ffffff' : '#000000'};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const CartSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const CheckoutSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 100px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #000000;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;  
  svg {
    color: #666666;
  }
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding: 20px 16px;
    margin: 0 -16px;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const ItemName = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  color: #000000;
  margin: 0;
  line-height: 1.3;
  word-wrap: break-word;
`;

const ItemSpecs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ItemBadge = styled.span`
  background: rgba(0, 0, 0, 0.05);
  color: #666666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
`;

const ItemPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const Price = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #000000;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  width: fit-content;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000000;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  padding: 0 12px;
  font-weight: 500;
  color: #000000;
  min-width: 30px;
  text-align: center;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 14px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #000000;
  font-size: 14px;
  
  svg {
    color: #666666;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  color: #000000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #999999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  color: #000000;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  font-family: inherit;
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #999999;
  }
`;

const OrderSummary = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666666;
  
  &.total {
    font-size: 1.2rem;
    font-weight: 600;
    color: #000000;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    padding-top: 16px;
    margin-top: 16px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #333333 0%, #555555 100%);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 32px;
  color: #999999;
  
  svg {
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrderCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const OrderNumber = styled.h3`
  margin: 0;
  color: #000000;
  font-size: 1.1rem;
  font-weight: 600;
`;

const OrderStatus = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: rgba(255, 193, 7, 0.2); color: #856404; border: 1px solid rgba(255, 193, 7, 0.3);';
      case 'confirmed':
        return 'background: rgba(13, 202, 240, 0.2); color: #0c5460; border: 1px solid rgba(13, 202, 240, 0.3);';
      case 'processing':
        return 'background: rgba(25, 135, 84, 0.2); color: #155724; border: 1px solid rgba(25, 135, 84, 0.3);';
      case 'shipped':
        return 'background: rgba(13, 110, 253, 0.2); color: #004085; border: 1px solid rgba(13, 110, 253, 0.3);';
      case 'delivered':
        return 'background: rgba(25, 135, 84, 0.2); color: #155724; border: 1px solid rgba(25, 135, 84, 0.3);';
      case 'cancelled':
        return 'background: rgba(220, 53, 69, 0.2); color: #721c24; border: 1px solid rgba(220, 53, 69, 0.3);';
      default:
        return 'background: rgba(108, 117, 125, 0.2); color: #383d41; border: 1px solid rgba(108, 117, 125, 0.3);';
    }
  }}
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const OrderInfo = styled.div`
  font-size: 14px;
  color: #666666;
  
  strong {
    color: #000000;
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.primary ? 'transparent' : 'rgba(0, 0, 0, 0.2)'};
  background: ${props => props.primary ? 
    'linear-gradient(135deg, #000000 0%, #333333 100%)' : 
    'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  color: ${props => props.primary ? '#ffffff' : '#000000'};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: ${props => props.primary ? 
      'linear-gradient(135deg, #333333 0%, #555555 100%)' : 
      'rgba(255, 255, 255, 1)'
    };
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const OrderPage = () => {
  const [activeTab, setActiveTab] = useState('cart');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: '',
    customer_email: '',
    contact_phone: '',
    shipping_address: '',
    notes: ''
  });
  
  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  
  const { cartItems, cartTotal, cartCount, updateCartItem, removeFromCart, loading: cartLoading } = useCart();
  const { user } = useAuth();

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/me');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        customer_name: user.username || '',
        customer_email: user.email || ''
      }));
    }
  }, [user]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async () => {
    try {
      if (!checkoutForm.contact_phone || !checkoutForm.shipping_address) {
        toast.error('Please fill in contact phone and shipping address');
        return;
      }

      setLoading(true);
      const response = await api.post('/orders', checkoutForm);
      
      if (response.data.success) {
        toast.success('Order created successfully!');
        setActiveTab('orders');
        setCheckoutForm({
          customer_name: user?.username || '',
          customer_email: user?.email || '',
          contact_phone: '',
          shipping_address: '',
          notes: ''
        });
        fetchOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.post(`/orders/${orderId}/confirm`);
      
      if (response.data.success) {
        toast.success('Order confirmed successfully!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await api.get(`/orders/invoice/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  // View invoice in modal
  const viewInvoice = async (order) => {
    try {
      setLoading(true);
      // Fetch order items from backend
      const response = await api.get(`/orders/${order.id}/items`);
      if (response.data.success) {
        setSelectedOrder(order);
        setSelectedOrderItems(response.data.data);
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  // Close invoice modal
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedOrder(null);
    setSelectedOrderItems([]);
  };
  const renderCartTab = () => (
    <Content>
      <CartSection>
        <SectionTitle>
          <FontAwesomeIcon icon={faShoppingBag} />
          Shopping Cart ({cartCount} items)
        </SectionTitle>
        {cartItems.length === 0 ? (
          <EmptyState>
            <FontAwesomeIcon icon={faShoppingBag} size="3x" />
            <p>Your cart is empty</p>
          </EmptyState>
        ) : (
          <div>
            {cartItems.map((item) => (
              <CartItem key={item.id}>
                <ItemImage 
                  src={item.main_image ? `http://localhost:3001/uploads/${item.main_image}` : '/placeholder.png'} 
                  alt={item.name} 
                />                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemSpecs>
                    <ItemBadge>Color: {item.color}</ItemBadge>
                    <ItemBadge>Size: {item.size}</ItemBadge>
                  </ItemSpecs>
                  <QuantityControls>
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={cartLoading}
                    >
                      <FontAwesomeIcon icon={faMinus} size="xs" />
                    </QuantityButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={cartLoading}
                    >
                      <FontAwesomeIcon icon={faPlus} size="xs" />
                    </QuantityButton>
                  </QuantityControls>
                </ItemDetails>
                <ItemPrice>
                  <Price>₱{(item.price * item.quantity).toFixed(2)}</Price>
                </ItemPrice>
              </CartItem>
            ))}
          </div>
        )}
      </CartSection>
        {cartItems.length > 0 && (
        <CheckoutSection>
          <SectionTitle>
            <FontAwesomeIcon icon={faMoneyBillWave} />
            Checkout Information
          </SectionTitle>
          <FormGroup>
            <Label><FontAwesomeIcon icon={faUser} /> Full Name</Label>
            <Input
              type="text"
              name="customer_name"
              value={checkoutForm.customer_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </FormGroup>
          
          <FormGroup>
            <Label><FontAwesomeIcon icon={faPhone} /> Contact Phone</Label>
            <Input
              type="tel"
              name="contact_phone"
              value={checkoutForm.contact_phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label><FontAwesomeIcon icon={faMapMarkerAlt} /> Shipping Address</Label>
            <TextArea
              name="shipping_address"
              value={checkoutForm.shipping_address}
              onChange={handleInputChange}
              placeholder="Enter your complete shipping address"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Order Notes (Optional)</Label>
            <TextArea
              name="notes"
              value={checkoutForm.notes}
              onChange={handleInputChange}
              placeholder="Any special instructions for your order"
            />
          </FormGroup>
          
          <OrderSummary>
            <SummaryRow>
              <span>Subtotal:</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping:</span>
              <span>Free</span>
            </SummaryRow>
            <SummaryRow className="total">
              <span>Total:</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </SummaryRow>
          </OrderSummary>
          
          <Button 
            onClick={handleCheckout}
            disabled={loading || cartLoading || cartItems.length === 0}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faMoneyBillWave} />
            )}
            Place Order (Cash on Delivery)
          </Button>
        </CheckoutSection>
      )}
    </Content>
  );
  const renderOrdersTab = () => (
    <div>
      <SectionTitle>
        <FontAwesomeIcon icon={faClipboardList} />
        My Orders
      </SectionTitle>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState>
          <FontAwesomeIcon icon={faShoppingBag} size="3x" color="#ccc" />
          <p>No orders found</p>
        </EmptyState>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderNumber>Order #{order.order_number}</OrderNumber>
                <OrderStatus status={order.status}>{order.status}</OrderStatus>
              </OrderHeader>
              
              <OrderDetails>
                <OrderInfo>
                  <strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}
                </OrderInfo>
                <OrderInfo>
                  <strong>Total:</strong> ₱{parseFloat(order.total_amount).toFixed(2)}
                </OrderInfo>
                <OrderInfo>
                  <strong>Payment:</strong> {order.payment_method || 'Cash on Delivery'}
                </OrderInfo>
                <OrderInfo>
                  <strong>Status:</strong> {order.transaction_status || 'Pending'}
                </OrderInfo>
              </OrderDetails>
                <OrderActions>
                {order.status === 'pending' && (
                  <ActionButton 
                    primary 
                    onClick={() => confirmOrder(order.id)}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Confirm Order
                  </ActionButton>
                )}
                
                {/* Always show View Invoice button for orders */}
                <ActionButton onClick={() => viewInvoice(order)}>
                  <FontAwesomeIcon icon={faEye} />
                  View Invoice
                </ActionButton>
                
                {order.invoice_id && (
                  <ActionButton onClick={() => downloadInvoice(order.invoice_id)}>
                    <FontAwesomeIcon icon={faDownload} />
                    Download PDF
                  </ActionButton>
                )}
              </OrderActions>
            </OrderCard>
          ))}
        </OrderList>
      )}
    </div>
  );
  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faShoppingBag} />
            Order Management
          </Title>
        </Header>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'cart'} 
            onClick={() => setActiveTab('cart')}
          >
            Shopping Cart ({cartCount})
          </Tab>
          <Tab 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </Tab>
        </TabContainer>
        
        {activeTab === 'cart' ? renderCartTab() : renderOrdersTab()}
        
        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={closeInvoiceModal}
          order={selectedOrder}
          orderItems={selectedOrderItems}
          onDownloadPDF={downloadInvoice}
        />
      </ContentWrapper>
    </PageContainer>
  );
};

export default OrderPage;
