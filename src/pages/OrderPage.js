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
  faFileInvoiceDollar,
  faDownload,
  faCheck,
  faSpinner,
  faTimes,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import InvoiceModal from '../components/InvoiceModal';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
`;

const Header = styled.div`
  margin-bottom: 2rem;
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
    border-radius: 6px;
    font-size: 1.5rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  border: none;
  background: ${props => props.active ? '#1a1a1a' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#1a1a1a' : '#f5f5f5'};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CartSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const CheckoutSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ItemSpecs = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const ItemPrice = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
  }
`;

const OrderSummary = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #eee;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  &.total {
    font-size: 1.25rem;
    font-weight: 700;
    border-top: 1px solid #eee;
    padding-top: 1rem;
    margin-top: 1rem;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #333;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const OrderStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404;';
      case 'confirmed':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'processing':
        return 'background: #d4edda; color: #155724;';
      case 'shipped':
        return 'background: #cce7ff; color: #004085;';
      case 'delivered':
        return 'background: #d4edda; color: #155724;';
      case 'cancelled':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderInfo = styled.div`
  font-size: 0.875rem;
  color: #666;
  
  strong {
    color: #333;
    font-weight: 600;
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #1a1a1a;
  background: ${props => props.primary ? '#1a1a1a' : 'white'};
  color: ${props => props.primary ? 'white' : '#1a1a1a'};
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.primary ? '#333' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
        <h2>Shopping Cart ({cartCount} items)</h2>
        {cartItems.length === 0 ? (
          <EmptyState>
            <FontAwesomeIcon icon={faShoppingBag} size="3x" color="#ccc" />
            <p>Your cart is empty</p>
          </EmptyState>
        ) : (
          <div>
            {cartItems.map((item) => (
              <CartItem key={item.id}>
                <ItemImage 
                  src={item.main_image ? `http://localhost:3001/uploads/${item.main_image}` : '/placeholder.png'} 
                  alt={item.name} 
                />
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemSpecs>
                    Color: {item.color} | Size: {item.size}
                  </ItemSpecs>
                  <QuantityControls>
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={cartLoading}
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </QuantityButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={cartLoading}
                    >
                      +
                    </QuantityButton>
                  </QuantityControls>
                </ItemDetails>
                <ItemPrice>₱{(item.price * item.quantity).toFixed(2)}</ItemPrice>
              </CartItem>
            ))}
          </div>
        )}
      </CartSection>
      
      {cartItems.length > 0 && (
        <CheckoutSection>
          <h3>Checkout Information</h3>
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
      <h2>My Orders</h2>
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
      <Header>
        <Title>
          <FontAwesomeIcon icon={faShoppingBag} className="icon" />
          My Orders
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
    </PageContainer>
  );
};

export default OrderPage;
