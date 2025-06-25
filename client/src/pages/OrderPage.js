import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faUser, 
  faPhone, 
  faMoneyBillWave,
  faCheck,
  faSpinner,
  faEye,
  faMinus,
  faPlus,
  faClipboardList,
  faTrash,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import InvoiceModal from '../components/InvoiceModal';

// Philippine address data - Metro Manila only
const philippineAddressData = {
  "Metro Manila": [
    "Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Muntinlupa", 
    "Parañaque", "Las Piñas", "Marikina", "Pasay", "Caloocan", "Malabon", 
    "Navotas", "Valenzuela", "San Juan", "Mandaluyong", "Pateros"
  ]
};

// Styled Components with Glassmorphic Design
const PageContainer = styled.div`
  height: 100%;
  width: 100%;
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
  padding: 20px;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  
  @media (max-width: 1440px) {
    max-width: 1200px;
  }
    @media (max-width: 768px) {
    padding: 15px;
  }
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

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
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
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  margin: 20px 0;
  
  svg {
    margin-bottom: 20px;
    opacity: 0.4;
    color: #cccccc;
  }
  
  p {
    font-size: 16px;
    margin: 0;
    font-weight: 400;
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
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
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

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary',
})`
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

const RemoveButton = styled.button`
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    background: linear-gradient(135deg, #c82333 0%, #a02030 100%);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 500px;
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
  
  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 20px;
    font-weight: 600;
  }
`;

const ModalContent = styled.div`
  padding: 30px;
  
  p {
    margin: 0 0 20px 0;
    color: #333;
    line-height: 1.5;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
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

const CancelReasonTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
  
  &::placeholder {
    color: #999;
  }
`;

// Order Items Display Components
const OrderItems = styled.div`
  margin: 20px 0;
  padding: 16px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const OrderItemsHeader = styled.div`
  font-weight: 600;
  margin-bottom: 12px;
  color: #000000;
  font-size: 14px;
`;

const OrderItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const OrderItemImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const OrderItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OrderItemName = styled.div`
  font-weight: 500;
  font-size: 13px;
  color: #000000;
`;

const OrderItemMeta = styled.div`
  font-size: 12px;
  color: #666666;
`;

const OrderItemPrice = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #000000;
  text-align: right;
  min-width: 80px;
`;

const ShippingSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: 1 / -1;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &:disabled {
    background: rgba(240, 240, 240, 0.9);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  option {
    padding: 0.5rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

// Cart Item Components
const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #000000;
`;

const ItemSpecs = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ItemBadge = styled.span`
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #666666;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.3);
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
  color: #000000;
`;

const ItemPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const Price = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: #000000;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const OrderPage = () => {  const [activeTab, setActiveTab] = useState('cart');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    province: '',
    city: '',
    street_address: '',
    postal_code: '',
    payment_method: 'cash_on_delivery',
    notes: ''
  });
  
  // Add state for managing city options
  const [availableCities, setAvailableCities] = useState([]);
  
  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  
  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderData, setCancelOrderData] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
    const { cartItems, cartTotal, cartCount, updateCartItem, removeFromCart, loading: cartLoading } = useCart();
  const { currentUser: user } = useAuth(); // Get current user
  const { updateMultipleProductsStock, getProductStock } = useStock(); // Get stock context
  
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Always show user's own orders for order history, regardless of role
      // Admin panel should have a separate page for viewing all orders
      const endpoint = '/orders/me-with-items';
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        const ordersData = response.data.data || [];
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, user]);

  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        customer_name: user.username || '',
        customer_email: user.email || ''
      }));
    }
  }, [user]);

  // Auto-select Metro Manila and load cities on component mount
  useEffect(() => {
    setCheckoutForm(prev => ({
      ...prev,
      province: 'Metro Manila'
    }));
    setAvailableCities(philippineAddressData['Metro Manila'] || []);
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'province') {
      // Reset city when province changes and update available cities
      setCheckoutForm(prev => ({
        ...prev,
        [name]: value,
        city: '' // Reset city selection
      }));
      setAvailableCities(philippineAddressData[value] || []);
    } else {
      setCheckoutForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleCheckout = async () => {
    try {
      // Validate required address fields
      if (!checkoutForm.customer_phone || !checkoutForm.province || !checkoutForm.city || !checkoutForm.street_address) {
        toast.error('Please fill in all required fields including complete address');
        return;
      }

      setLoading(true);
      
      // Combine address fields into shipping_address for backend compatibility
      const combinedAddress = [
        checkoutForm.street_address,
        checkoutForm.city,
        checkoutForm.province,
        checkoutForm.postal_code
      ].filter(Boolean).join(', ');
      
      const orderData = {
        ...checkoutForm,
        shipping_address: combinedAddress,
        contact_phone: checkoutForm.customer_phone,
        address_details: {
          province: checkoutForm.province,
          city: checkoutForm.city,
          street_address: checkoutForm.street_address,
          postal_code: checkoutForm.postal_code
        }
      };
      
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        toast.success('Order created successfully!');
        setActiveTab('orders');
        setCheckoutForm({
          customer_name: user?.username || '',
          customer_email: user?.email || '',
          customer_phone: '',
          province: '',
          city: '',
          street_address: '',
          postal_code: '',
          payment_method: 'cash_on_delivery',
          notes: ''
        });
        setAvailableCities([]); // Reset cities
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
        
        // Update stock context with the affected products
        if (response.data.stockUpdateEvent && response.data.stockUpdateEvent.productIds) {
          await updateMultipleProductsStock(response.data.stockUpdateEvent.productIds);
          console.log('📦 Stock updated for products:', response.data.stockUpdateEvent.productIds);
        }
        
        fetchOrders();
      }    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  // Cancel order function
  const cancelOrder = (orderId, orderNumber) => {
    setCancelOrderData({ orderId, orderNumber });
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelOrderData) return;
    
    try {
      setLoading(true);
      const response = await api.put(`/orders/${cancelOrderData.orderId}/cancel`, {
        reason: cancelReason || 'Customer requested cancellation'
      });
      
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        closeCancelModal();
        fetchOrders(); // Refresh orders list
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelOrderData(null);
    setCancelReason('');
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
  const handleRemoveItem = async (itemId, itemName) => {
    const confirmed = window.confirm(`Are you sure you want to remove "${itemName}" from your cart?`);
    if (confirmed) {
      try {
        await removeFromCart(itemId);
        toast.success(`${itemName} removed from cart`);
      } catch (error) {
        toast.error('Failed to remove item from cart');
      }
    }
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
              <CartItem key={item.id}>                <ItemImage 
                  src={item.main_image ? `http://localhost:3001/uploads/${item.main_image}` : 'http://localhost:3001/images/placeholder.svg'} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'http://localhost:3001/images/placeholder.svg';
                  }}
                /><ItemDetails>
                  <ItemName>{item.name}</ItemName>                  <ItemSpecs>
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
                <RemoveButton 
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  disabled={cartLoading}
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </RemoveButton>
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
              name="customer_phone"
              value={checkoutForm.customer_phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </FormGroup>          <ShippingSection>
            <SectionTitle>📍 Shipping Address (Metro Manila Only)</SectionTitle>
            <div style={{ 
              background: '#e3f2fd', 
              border: '1px solid #2196f3', 
              borderRadius: '8px', 
              padding: '12px', 
              marginBottom: '20px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              <strong>🚚 Delivery Notice:</strong> We currently deliver only within Metro Manila. Free delivery for all orders within our service area.
            </div>
            
            <AddressGrid>              <FormGroup>
                <Label htmlFor="province">Province *</Label>
                <Select
                  id="province"
                  name="province"
                  value={checkoutForm.province}
                  onChange={handleInputChange}
                  required
                  disabled
                >
                  <option value="Metro Manila">Metro Manila</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="city">City/Municipality *</Label>
                <Select
                  id="city"
                  name="city"
                  value={checkoutForm.city}
                  onChange={handleInputChange}
                  required
                  disabled={!checkoutForm.province}
                >
                  <option value="">Select City</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup className="full-width">
                <Label htmlFor="street_address">Street Address / House Number *</Label>
                <Input
                  type="text"
                  id="street_address"
                  name="street_address"
                  value={checkoutForm.street_address}
                  onChange={handleInputChange}
                  placeholder="Enter complete street address, house/building number"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={checkoutForm.postal_code}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234"
                  maxLength="4"
                  pattern="[0-9]{4}"
                />
              </FormGroup>
            </AddressGrid>
          </ShippingSection>
          
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
        My Orders {user && <span style={{ fontSize: '0.8em', color: '#666', fontWeight: '400' }}>({user.username || user.email})</span>}
      </SectionTitle>
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#666" />
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '14px' }}>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState>
          <FontAwesomeIcon icon={faShoppingBag} size="3x" />
          <p>No orders found</p>
          <p style={{ fontSize: '14px', marginTop: '8px', opacity: '0.7' }}>
            Your order history will appear here once you make a purchase
          </p>
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

              {/* Display order items if available */}
              {order.items && order.items.length > 0 && (
                <OrderItems>
                  <OrderItemsHeader>Ordered Items ({order.items.length})</OrderItemsHeader>
                  <OrderItemsList>
                    {order.items.map((item, index) => (
                      <OrderItem key={index}>                        <OrderItemImage 
                          src={item.productimage ? `http://localhost:3001/uploads/${item.productimage}` : 'http://localhost:3001/images/placeholder.svg'}
                          alt={item.productname || 'Product'}
                          onError={(e) => {
                            e.target.src = 'http://localhost:3001/images/placeholder.svg';
                          }}
                        />
                        <OrderItemDetails>
                          <OrderItemName>{item.productname || 'Unknown Product'}</OrderItemName>
                          <OrderItemMeta>
                            {item.productcolor && `Color: ${item.productcolor}`}
                            {item.productcolor && item.product_type && ' • '}
                            {item.product_type && `Type: ${item.product_type}`}
                          </OrderItemMeta>
                          <OrderItemMeta>Qty: {item.quantity}</OrderItemMeta>
                        </OrderItemDetails>
                        <OrderItemPrice>
                          ₱{parseFloat(item.price || 0).toFixed(2)}
                        </OrderItemPrice>
                      </OrderItem>
                    ))}
                  </OrderItemsList>
                </OrderItems>
              )}

              <OrderActions>
                {order.status === 'pending' && (
                  <ActionButton 
                    primary 
                    onClick={() => confirmOrder(order.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} />
                    )}
                    Confirm Order
                  </ActionButton>
                )}
                  {/* Cancel button for cancellable orders */}
                {order.cancellation_status === 'pending' ? (
                  <div style={{
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                    color: '#000',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}>
                    Cancellation Requested
                  </div>
                ) : ['pending', 'confirmed', 'processing'].includes(order.status) && (
                  <ActionButton 
                    onClick={() => cancelOrder(order.id, order.order_number)}
                    disabled={loading}
                    style={{ 
                      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', 
                      color: 'white',
                      border: '1px solid transparent'
                    }}
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faTimes} />
                    )}
                    Cancel Order
                  </ActionButton>
                )}
                
                {/* Show View Invoice only for confirmed and later status orders */}
                {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (                  <ActionButton onClick={() => viewInvoice(order)} disabled={loading}>
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faEye} />
                    )}
                    View Invoice
                  </ActionButton>
                )}
              </OrderActions>
            </OrderCard>
          ))}        </OrderList>
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
        </Header>          <TabContainer>
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
        
        {/* Cancel Order Modal */}
        {showCancelModal && (
          <ModalOverlay onClick={closeCancelModal}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Cancel Order</h2>
                <CloseButton onClick={closeCancelModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>
              <ModalContent>
                <p><strong>Order Number:</strong> {cancelOrderData?.orderNumber}</p>
                <p>Are you sure you want to cancel this order? Please provide a reason:</p>
                
                <CancelReasonTextarea
                  placeholder="Please explain why you want to cancel this order..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows="4"
                />
                
                <ModalActions>
                  <ActionButton onClick={closeCancelModal}>
                    Cancel
                  </ActionButton>
                  <ActionButton 
                    primary 
                    onClick={confirmCancelOrder}
                    disabled={!cancelReason.trim() || loading}
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} />
                    )}
                    Submit Cancellation Request
                  </ActionButton>
                </ModalActions>
              </ModalContent>
            </Modal>
          </ModalOverlay>        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default OrderPage;
