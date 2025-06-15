import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled, { keyframes, css } from 'styled-components';
import { Navigate } from 'react-router-dom';
import { triggerProductRefresh } from '../hooks/useProducts';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #4a9eff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const PulseIndicator = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
  animation: ${pulse} 2s infinite;
`;

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #0a0a0a;
  min-height: 100vh;
  color: #ffffff;
  padding-top: 80px; /* Account for fixed TopBar */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: #1a1a1a;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateTime = styled.div`
  text-align: right;
  color: #888888;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const TabContainer = styled.div`
  display: flex;
  background: #1a1a1a;
  border-radius: 8px 8px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  margin-bottom: 0;
`;

const Tab = styled.button`
  background: ${props => props.active ? '#2d2d2d' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#888888'};
  border: none;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: ${props => props.first ? '8px 0 0 0' : props.last ? '0 8px 0 0' : '0'};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.active ? '#2d2d2d' : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.active ? '#ffffff' : '#cccccc'};
  }

  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #4a9eff;
    }
  `}
`;

const ContentArea = styled.div`
  background: #1a1a1a;
  border-radius: 0 0 8px 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  min-height: 600px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  color: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    border-color: rgba(74, 158, 255, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.accentColor || '#4a9eff'};
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.9;
`;

const StatTitle = styled.h3`
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const StatValue = styled.p`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: ${props => props.valueColor || '#ffffff'};
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ActionButton = styled.button`
  background: ${props => props.color || '#4a9eff'};
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    background: ${props => {
      const color = props.color || '#4a9eff';
      return color === '#4a9eff' ? '#3d8bff' : 
             color === '#28a745' ? '#218838' :
             color === '#17a2b8' ? '#138496' :
             color === '#ffc107' ? '#e0a800' : color;
    }};
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
  background: #2d2d2d;
  color: #ffffff;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
  }

  &::placeholder {
    color: #888888;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #2d2d2d;
  border-radius: 6px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: #1a1a1a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  color: #cccccc;
  
  &:first-child {
    color: #ffffff;
    font-weight: 500;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${props => {
    switch (props.type) {
      case 'low': return 'rgba(255, 193, 7, 0.2)';
      case 'out': return 'rgba(220, 53, 69, 0.2)';
      case 'good': return 'rgba(40, 167, 69, 0.2)';
      case 'processing': return 'rgba(23, 162, 184, 0.2)';
      case 'completed': return 'rgba(40, 167, 69, 0.2)';
      case 'cancelled': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'low': return '#ffc107';
      case 'out': return '#dc3545';
      case 'good': return '#28a745';
      case 'processing': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'low': return 'rgba(255, 193, 7, 0.3)';
      case 'out': return 'rgba(220, 53, 69, 0.3)';
      case 'good': return 'rgba(40, 167, 69, 0.3)';
      case 'processing': return 'rgba(23, 162, 184, 0.3)';
      case 'completed': return 'rgba(40, 167, 69, 0.3)';
      case 'cancelled': return 'rgba(220, 53, 69, 0.3)';
      default: return 'rgba(108, 117, 125, 0.3)';
    }
  }};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80%;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  
  h2 {
    color: #ffffff;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #cccccc;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 1rem;
  background: #2d2d2d;
  color: #ffffff;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
  }

  &::placeholder {
    color: #888888;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  background: #2d2d2d;
  color: #ffffff;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
  }

  &::placeholder {
    color: #888888;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 1rem;
  background: #2d2d2d;
  color: #ffffff;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a9eff;
  }

  option {
    background: #2d2d2d;
    color: #ffffff;
  }
`;

const SectionHeader = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.variant === 'secondary' ? '#6c757d' : '#4a9eff'};
  color: white;
  border: 1px solid ${props => props.variant === 'secondary' ? '#6c757d' : '#4a9eff'};

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#545b62' : '#3d8bff'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #ffffff;
  font-weight: 500;
`;

const OrderItemsList = styled.div`
  background: #2d2d2d;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 1rem;
  background: #2d2d2d;
  color: #ffffff;
  margin-bottom: 1rem;

  option {
    background: #2d2d2d;
    color: #ffffff;
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #2d2d2d;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;

  &:hover {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.1);
  }

  &.dragover {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.2);
  }
`;

const ImageUploadText = styled.div`
  color: #cccccc;
  font-size: 1rem;
  margin-bottom: 0.5rem;

  .upload-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: block;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImagePreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageRemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(220, 53, 69, 1);
  }
`;

const ColorSelection = styled.div`
  margin-bottom: 1rem;
`;

const ColorInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ColorInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: #2d2d2d;
  color: #ffffff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
  }

  &::placeholder {
    color: #888888;
  }
`;

const AddColorButton = styled.button`
  padding: 0.75rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ColorList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ColorTag = styled.span`
  display: inline-flex;
  align-items: center;
  background: rgba(74, 158, 255, 0.2);
  color: #4a9eff;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  border: 1px solid rgba(74, 158, 255, 0.3);
  gap: 0.5rem;

  .remove-color {
    cursor: pointer;
    color: #dc3545;
    font-weight: bold;
    
    &:hover {
      color: #c82333;
    }
  }
`;

const DashboardPage = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data states
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    todaySales: 0
  });
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
    // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newColor, setNewColor] = useState('');
  const [imagePreview, setImagePreview] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
    colors: [],
    images: []
  });  // Function to calculate real-time stats from current data
  const calculateStats = (currentProducts, currentCustomers, currentOrders) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    // Calculate today's sales and orders (exclude cancelled orders)
    const todaysOrders = currentOrders.filter(order => {
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      return orderDate === today && order.status !== 'cancelled';
    });
    
    const todaySales = todaysOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    
    // Calculate total revenue (all completed orders)
    const totalRevenue = currentOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    
    // Calculate low stock items (stock <= 5 and active)
    const lowStockItems = currentProducts.filter(product => 
      product.stock <= 5 && product.status === 'active'
    ).length;
    
    // Count active products only
    const activeProducts = currentProducts.filter(p => p.status === 'active').length;
    
    // Count active customers only
    const activeCustomers = currentCustomers.filter(c => c.status === 'active').length;
    
    // Total orders (all orders except cancelled)
    const totalOrders = currentOrders.filter(order => order.status !== 'cancelled').length;
    
    return {
      totalProducts: activeProducts,
      totalOrders: totalOrders,
      totalCustomers: activeCustomers,
      totalRevenue: totalRevenue,
      lowStockItems: lowStockItems,
      todaySales: todaySales
    };
  };
  // Update stats whenever products, customers, or orders change
  useEffect(() => {
    if (products.length > 0 || customers.length > 0 || orders.length > 0) {
      const newStats = calculateStats(products, customers, orders);
      console.log('Stats recalculated:', {
        newStats,
        productsCount: products.length,
        customersCount: customers.length,
        ordersCount: orders.length
      });
      setStats(newStats);
    }
  }, [products, customers, orders]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);  // Fetch dashboard data
  useEffect(() => {    const fetchDashboardData = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Calculate today and yesterday dates at the top
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          // Fetch real products from API first
        try {
          const productsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/admin/all`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (productsResponse.data.success && productsResponse.data.data.length > 0) {
            console.log('Loaded products from API:', productsResponse.data.data.length);
            setProducts(productsResponse.data.data);
          } else {
            console.log('No products found in API, using mock data');
            // Fallback to mock data if API returns empty
            setProducts([
              { 
                product_id: 1, 
                name: 'Classic White T-Shirt', 
                category: 'T-Shirts', 
                price: 29.99, 
                stock: 45, 
                status: 'active',
                colors: ['White', 'Black', 'Gray'],
                images: [],
                description: 'Comfortable cotton t-shirt perfect for everyday wear'
              },
              { 
                product_id: 2, 
                name: 'Blue Denim Jeans', 
                category: 'Jeans', 
                price: 89.99, 
                stock: 12, 
                status: 'active',
                colors: ['Dark Blue', 'Light Blue', 'Black'],
                images: [],
                description: 'Classic fit denim jeans with premium quality'
              },
              { 
                product_id: 3, 
                name: 'Black Hoodie', 
                category: 'Hoodies', 
                price: 59.99, 
                stock: 3, 
                status: 'active',
                colors: ['Black', 'Navy', 'Gray'],
                images: [],
                description: 'Warm and comfortable hoodie for cold weather'
              },
              { 
                product_id: 4, 
                name: 'Sports Cap', 
                category: 'Accessories', 
                price: 24.99, 
                stock: 0, 
                status: 'active',
                colors: ['Black', 'Red', 'Blue', 'White'],
                images: [],
                description: 'Adjustable sports cap with premium materials'
              },
              { 
                product_id: 5, 
                name: 'Graphic T-Shirt', 
                category: 'T-Shirts', 
                price: 34.99, 
                stock: 8, 
                status: 'active',
                colors: ['White', 'Black', 'Navy'],
                images: [],
                description: 'Trendy graphic t-shirt with unique designs'
              }
            ]);
          }        } catch (apiError) {
          console.log('API error, using mock data:', apiError.message);
          // Fallback to mock data if API is not available
          setProducts([
            { 
              product_id: 1, 
              name: 'Classic White T-Shirt', 
              category: 'T-Shirts', 
              price: 29.99, 
              stock: 45, 
              status: 'active',
              colors: ['White', 'Black', 'Gray'],
              images: [],
              description: 'Comfortable cotton t-shirt perfect for everyday wear'
            },
            { 
              product_id: 2, 
              name: 'Blue Denim Jeans', 
              category: 'Jeans', 
              price: 89.99, 
              stock: 12, 
              status: 'active',
              colors: ['Dark Blue', 'Light Blue', 'Black'],
              images: [],
              description: 'Classic fit denim jeans with premium quality'
            },
            { 
              product_id: 3, 
              name: 'Black Hoodie', 
              category: 'Hoodies', 
              price: 59.99, 
              stock: 3, 
              status: 'active',
              colors: ['Black', 'Navy', 'Gray'],
              images: [],
              description: 'Warm and comfortable hoodie for cold weather'
            },
            { 
              product_id: 4, 
              name: 'Sports Cap', 
              category: 'Accessories', 
              price: 24.99, 
              stock: 0, 
              status: 'active',
              colors: ['Black', 'Red', 'Blue', 'White'],
              images: [],
              description: 'Adjustable sports cap with premium materials'
            },
            { 
              product_id: 5, 
              name: 'Graphic T-Shirt', 
              category: 'T-Shirts', 
              price: 34.99, 
              stock: 8, 
              status: 'active',
              colors: ['White', 'Black', 'Navy'],
              images: [],
              description: 'Trendy graphic t-shirt with unique designs'
            }
          ]);        }

        // Mock customer data with more details
        setCustomers([
          { 
            id: 1, 
            name: 'John Doe', 
            email: 'john@example.com', 
            phone: '+63 912 345 6789',
            address: '123 Main St, Quezon City, Metro Manila',
            orders: 5, 
            totalSpent: 450.50, 
            lastOrder: today,
            joinDate: '2024-01-15',
            status: 'active',
            orderHistory: [
              { id: 'ORD-001', date: today, total: 89.99, status: 'processing' },
              { id: 'ORD-015', date: '2024-05-22', total: 125.50, status: 'completed' },
              { id: 'ORD-032', date: '2024-04-18', total: 235.01, status: 'completed' }
            ]
          },
          { 
            id: 2, 
            name: 'Jane Smith', 
            email: 'jane@example.com', 
            phone: '+63 917 234 5678',
            address: '456 Oak Ave, Makati City, Metro Manila',
            orders: 12, 
            totalSpent: 890.25, 
            lastOrder: today,
            joinDate: '2023-11-08',
            status: 'active',
            orderHistory: [
              { id: 'ORD-002', date: today, total: 154.98, status: 'completed' },
              { id: 'ORD-025', date: '2024-06-05', total: 89.99, status: 'completed' },
              { id: 'ORD-041', date: '2024-05-28', total: 299.50, status: 'completed' }
            ]
          },
          { 
            id: 3, 
            name: 'Bob Johnson', 
            email: 'bob@example.com', 
            phone: '+63 920 123 4567',
            address: '789 Pine Rd, Pasig City, Metro Manila',
            orders: 3, 
            totalSpent: 275.00, 
            lastOrder: yesterday,
            joinDate: '2024-03-22',
            status: 'active',
            orderHistory: [
              { id: 'ORD-003', date: yesterday, total: 29.99, status: 'completed' },
              { id: 'ORD-018', date: '2024-05-15', total: 125.01, status: 'completed' },
              { id: 'ORD-029', date: '2024-04-30', total: 120.00, status: 'completed' }
            ]
          },
          { 
            id: 4, 
            name: 'Alice Brown', 
            email: 'alice@example.com', 
            phone: '+63 908 765 4321',
            address: '321 Elm St, Taguig City, Metro Manila',
            orders: 2, 
            totalSpent: 199.96, 
            lastOrder: today,
            joinDate: '2024-02-10',
            status: 'active',
            orderHistory: [
              { id: 'ORD-004', date: today, total: 124.97, status: 'shipped' },
              { id: 'ORD-020', date: '2024-05-10', total: 74.99, status: 'completed' }
            ]
          }        ]);
        
        // Mock order data with more details (some orders from today for accurate stats)
        setOrders([
          { 
            id: 'ORD-001', 
            customer: 'John Doe', 
            customerEmail: 'john@example.com',
            date: today, // Today's order
            total: 89.99, 
            status: 'processing', 
            items: 2,
            shippingAddress: '123 Main St, Quezon City, Metro Manila',
            paymentMethod: 'Credit Card',
            orderItems: [
              { name: 'Classic White T-Shirt', quantity: 1, price: 29.99 },
              { name: 'Blue Denim Jeans', quantity: 1, price: 60.00 }
            ],
            trackingNumber: null,
            notes: 'Customer requested express delivery'
          },
          { 
            id: 'ORD-002', 
            customer: 'Jane Smith', 
            customerEmail: 'jane@example.com',
            date: today, // Today's order
            total: 154.98, 
            status: 'completed', 
            items: 3,
            shippingAddress: '456 Oak Ave, Makati City, Metro Manila',
            paymentMethod: 'GCash',
            orderItems: [
              { name: 'Black Hoodie', quantity: 1, price: 59.99 },
              { name: 'Graphic T-Shirt', quantity: 2, price: 47.49 }
            ],
            trackingNumber: 'TRK-2024-001',
            notes: 'Delivered successfully'
          },
          { 
            id: 'ORD-003', 
            customer: 'Bob Johnson', 
            customerEmail: 'bob@example.com',
            date: yesterday, // Yesterday's order
            total: 29.99, 
            status: 'completed', 
            items: 1,
            shippingAddress: '789 Pine Rd, Pasig City, Metro Manila',
            paymentMethod: 'PayPal',
            orderItems: [
              { name: 'Sports Cap', quantity: 1, price: 29.99 }
            ],
            trackingNumber: 'TRK-2024-002',
            notes: 'Standard delivery'
          },
          { 
            id: 'ORD-004', 
            customer: 'Alice Brown', 
            customerEmail: 'alice@example.com',
            date: today, // Today's order
            total: 124.97, 
            status: 'shipped', 
            items: 3,
            shippingAddress: '321 Elm St, Taguig City, Metro Manila',
            paymentMethod: 'Credit Card',
            orderItems: [
              { name: 'Classic White T-Shirt', quantity: 2, price: 59.98 },
              { name: 'Graphic T-Shirt', quantity: 1, price: 34.99 },
              { name: 'Sports Cap', quantity: 1, price: 24.99 }
            ],
            trackingNumber: 'TRK-2024-003',
            notes: 'Rush delivery requested'
          }
        ]);        setLoading(false);
        console.log('Dashboard data loaded successfully');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        console.error('Error details:', err.message, err.stack);
        
        // Try to retry once if this is the first attempt
        if (retryCount === 0) {
          console.log('Retrying dashboard data fetch...');
          setTimeout(() => fetchDashboardData(1), 1000);
          return;
        }
        
        setError(`Failed to load dashboard data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: parseFloat(productForm.price),
        brand: 'Seven Four', // Default brand
        status: productForm.status,
        is_featured: false,
        colors: productForm.colors,
        sizes: ['S', 'M', 'L', 'XL'], // Default sizes for now
      };

      if (editingProduct) {
        // Update existing product via API
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${editingProduct.product_id}`,
          productData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Update local state
          setProducts(products.map(p => 
            p.product_id === editingProduct.product_id 
              ? { 
                  ...p, 
                  ...productData,
                  images: productForm.images.length > 0 ? productForm.images : p.images
                }
              : p
          ));
          
          // Trigger refresh for customer-facing pages
          triggerProductRefresh();
        }
      } else {
        // Create new product via API
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`,
          productData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Add to local state with full product data
          const newProduct = {
            ...response.data.data,
            colors: productForm.colors,
            images: productForm.images,
            stock: 50, // Default stock
            stock_status: 'in_stock'
          };
          setProducts([...products, newProduct]);
          
          // Trigger refresh for customer-facing pages
          triggerProductRefresh();
          
          console.log('New product added successfully:', newProduct);
        }
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setImagePreview([]);
      setProductForm({ 
        name: '', 
        description: '', 
        category: '', 
        price: '', 
        stock: '', 
        status: 'active',
        colors: [],
        images: []
      });
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product. Please try again.');
    }
  };const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price.toString(),
      stock: product.stock?.toString() || '0',
      status: product.status,
      colors: product.colors || [],
      images: product.images || []
    });
    
    // Set image previews for existing product images
    if (product.images && product.images.length > 0) {
      setImagePreview(product.images.map(img => 
        typeof img === 'string' ? img : URL.createObjectURL(img)
      ));
    } else {
      setImagePreview([]);
    }
    
    setShowProductModal(true);
  };  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${productId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }        );

        if (response.data.success) {
          // Remove from local state
          setProducts(products.filter(p => p.product_id !== productId));
          
          // Trigger refresh for customer-facing pages
          triggerProductRefresh();
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateOrderStatus = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = (newStatus) => {
    if (selectedOrder) {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatus, trackingNumber: newStatus === 'shipped' && !order.trackingNumber ? `TRK-${Date.now()}` : order.trackingNumber }
          : order
      ));
      
      // Also update customer order history if applicable
      setCustomers(customers.map(customer => ({
        ...customer,
        orderHistory: customer.orderHistory?.map(historyOrder =>
          historyOrder.id === selectedOrder.id
            ? { ...historyOrder, status: newStatus }
            : historyOrder
        ) || customer.orderHistory
      })));
        setShowStatusModal(false);
      setSelectedOrder(null);
    }
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files);
    const imageUrls = newImages.map(file => URL.createObjectURL(file));
    
    setImagePreview(prev => [...prev, ...imageUrls]);
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = (index) => {
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    const newImages = productForm.images.filter((_, i) => i !== index);
    
    setImagePreview(newPreviews);
    setProductForm(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !productForm.colors.includes(newColor.trim())) {
      setProductForm(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge type="out">Out of Stock</Badge>;
    if (stock <= 10) return <Badge type="low">Low Stock</Badge>;
    return <Badge type="good">In Stock</Badge>;
  };

  const getOrderBadge = (status) => {
    return <Badge type={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) return (
    <DashboardContainer>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>        <LoadingSpinner />
        <p style={{ color: '#cccccc', fontSize: '1.1rem' }}>Loading dashboard...</p>
      </div>
    </DashboardContainer>
  );
  
  if (error) return (
    <DashboardContainer>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>Dashboard Error</h2>
        <p style={{ color: '#cccccc', marginBottom: '1.5rem', maxWidth: '500px' }}>
          {error}
        </p>
        <ActionButton 
          color="#4a9eff" 
          onClick={() => window.location.reload()}
        >
          🔄 Retry Loading
        </ActionButton>
      </div>
    </DashboardContainer>
  );
  if (!isAdmin) return <Navigate to="/" />;

  const formatCurrency = (amount) => `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardContainer>      <Header>
        <Title>Admin Dashboard</Title>
        <DateTime>
          <div>{currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
          <div>{currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</div>
        </DateTime>
      </Header>

      <TabContainer>        <Tab 
          first 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Tab>
        <Tab 
          active={activeTab === 'products'} 
          onClick={() => setActiveTab('products')}
        >
          Products
        </Tab>
        <Tab 
          active={activeTab === 'customers'} 
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </Tab>
        <Tab 
          last
          active={activeTab === 'orders'} 
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </Tab>
      </TabContainer>

      <ContentArea>        {activeTab === 'overview' && (
          <>            <StatsGrid>
              <StatCard accentColor="#4a9eff">
                <StatIcon>💰</StatIcon>
                <StatTitle>Today's Sales</StatTitle>
                <StatValue valueColor="#4a9eff">{formatCurrency(stats.todaySales)}</StatValue>
              </StatCard>
              <StatCard accentColor="#28a745">
                <StatIcon>📊</StatIcon>
                <StatTitle>Total Revenue</StatTitle>
                <StatValue valueColor="#28a745">{formatCurrency(stats.totalRevenue)}</StatValue>
              </StatCard>
              <StatCard accentColor="#17a2b8">
                <StatIcon>🛍️</StatIcon>
                <StatTitle>Total Orders</StatTitle>
                <StatValue valueColor="#17a2b8">{stats.totalOrders}</StatValue>
              </StatCard>
              <StatCard accentColor="#ffc107">
                <StatIcon>👥</StatIcon>
                <StatTitle>Total Customers</StatTitle>
                <StatValue valueColor="#ffc107">{stats.totalCustomers}</StatValue>
              </StatCard>
              <StatCard accentColor="#6f42c1">
                <StatIcon>📦</StatIcon>
                <StatTitle>Total Products</StatTitle>
                <StatValue valueColor="#6f42c1">{stats.totalProducts}</StatValue>
              </StatCard>
              <StatCard accentColor="#dc3545">
                <StatIcon>⚠️</StatIcon>
                <StatTitle>Low Stock Items</StatTitle>
                <StatValue valueColor="#dc3545">{stats.lowStockItems}</StatValue>
              </StatCard>
            </StatsGrid>
            
            {/* Real-time indicator */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem',
              color: '#28a745',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>              <PulseIndicator />
              Stats are updated in real-time
            </div><QuickActions>
              <ActionButton color="#28a745" onClick={() => setShowProductModal(true)}>
                Add New Product
              </ActionButton>
              <ActionButton color="#4a9eff" onClick={() => setActiveTab('orders')}>
                View Orders
              </ActionButton>
              <ActionButton color="#17a2b8" onClick={() => setActiveTab('customers')}>
                Manage Customers
              </ActionButton>
              <ActionButton color="#ffc107" onClick={() => setActiveTab('products')}>
                Inventory Check
              </ActionButton>
            </QuickActions>

            {/* Test Section for Real-time Stats */}
            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              background: '#2d2d2d', 
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ 
                color: '#ffffff', 
                marginBottom: '1rem',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🧪 Test Real-time Stats
              </h3>
              <p style={{ 
                color: '#cccccc', 
                marginBottom: '1rem', 
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                Use these buttons to test how the dashboard stats update in real-time when data changes:
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.75rem' 
              }}>
                <ActionButton 
                  color="#28a745" 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    const newOrder = {
                      id: `ORD-TEST-${Date.now()}`,
                      customer: 'Test Customer',
                      customerEmail: 'test@example.com',
                      date: today,
                      total: Math.floor(Math.random() * 200) + 50,
                      status: Math.random() > 0.5 ? 'completed' : 'processing',
                      items: Math.floor(Math.random() * 3) + 1,
                      shippingAddress: 'Test Address',
                      paymentMethod: 'Credit Card',
                      orderItems: [{ name: 'Test Product', quantity: 1, price: 50 }],
                      trackingNumber: null,
                      notes: 'Test order for stats'
                    };
                    setOrders(prev => [...prev, newOrder]);
                  }}
                  style={{ fontSize: '0.85rem' }}
                >
                  + Add Test Order
                </ActionButton>
                <ActionButton 
                  color="#6f42c1" 
                  onClick={() => {
                    const newProduct = {
                      id: Date.now(),
                      name: `Test Product ${Math.floor(Math.random() * 1000)}`,
                      category: 'Test',
                      price: Math.floor(Math.random() * 100) + 20,
                      stock: Math.floor(Math.random() * 10),
                      status: 'active',
                      colors: ['Red', 'Blue'],
                      images: [],
                      description: 'Test product for stats'
                    };
                    setProducts(prev => [...prev, newProduct]);
                  }}
                  style={{ fontSize: '0.85rem' }}
                >
                  + Add Test Product
                </ActionButton>
                <ActionButton 
                  color="#ffc107" 
                  onClick={() => {
                    const newCustomer = {
                      id: Date.now(),
                      name: `Test Customer ${Math.floor(Math.random() * 1000)}`,
                      email: `test${Date.now()}@example.com`,
                      phone: '+63 900 000 0000',
                      address: 'Test Address',
                      orders: 0,
                      totalSpent: 0,
                      lastOrder: null,
                      joinDate: new Date().toISOString().split('T')[0],
                      status: 'active',
                      orderHistory: []
                    };
                    setCustomers(prev => [...prev, newCustomer]);
                  }}
                  style={{ fontSize: '0.85rem' }}
                >
                  + Add Test Customer
                </ActionButton>
                <ActionButton 
                  color="#dc3545" 
                  onClick={() => {
                    // Reset to original data
                    const today = new Date().toISOString().split('T')[0];
                    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    
                    setProducts([
                      { id: 1, name: 'Classic White T-Shirt', category: 'T-Shirts', price: 29.99, stock: 45, status: 'active', colors: ['White', 'Black', 'Gray'], images: [], description: 'Comfortable cotton t-shirt perfect for everyday wear' },
                      { id: 2, name: 'Blue Denim Jeans', category: 'Jeans', price: 89.99, stock: 12, status: 'active', colors: ['Dark Blue', 'Light Blue', 'Black'], images: [], description: 'Classic fit denim jeans with premium quality' },
                      { id: 3, name: 'Black Hoodie', category: 'Hoodies', price: 59.99, stock: 3, status: 'active', colors: ['Black', 'Navy', 'Gray'], images: [], description: 'Warm and comfortable hoodie for cold weather' },
                      { id: 4, name: 'Sports Cap', category: 'Accessories', price: 24.99, stock: 0, status: 'active', colors: ['Black', 'Red', 'Blue', 'White'], images: [], description: 'Adjustable sports cap with premium materials' },
                      { id: 5, name: 'Graphic T-Shirt', category: 'T-Shirts', price: 34.99, stock: 8, status: 'active', colors: ['White', 'Black', 'Navy'], images: [], description: 'Trendy graphic t-shirt with unique designs' }
                    ]);
                    
                    setOrders([
                      { id: 'ORD-001', customer: 'John Doe', customerEmail: 'john@example.com', date: today, total: 89.99, status: 'processing', items: 2, shippingAddress: '123 Main St, Quezon City, Metro Manila', paymentMethod: 'Credit Card', orderItems: [{ name: 'Classic White T-Shirt', quantity: 1, price: 29.99 }, { name: 'Blue Denim Jeans', quantity: 1, price: 60.00 }], trackingNumber: null, notes: 'Customer requested express delivery' },
                      { id: 'ORD-002', customer: 'Jane Smith', customerEmail: 'jane@example.com', date: today, total: 154.98, status: 'completed', items: 3, shippingAddress: '456 Oak Ave, Makati City, Metro Manila', paymentMethod: 'GCash', orderItems: [{ name: 'Black Hoodie', quantity: 1, price: 59.99 }, { name: 'Graphic T-Shirt', quantity: 2, price: 47.49 }], trackingNumber: 'TRK-2024-001', notes: 'Delivered successfully' },
                      { id: 'ORD-003', customer: 'Bob Johnson', customerEmail: 'bob@example.com', date: yesterday, total: 29.99, status: 'completed', items: 1, shippingAddress: '789 Pine Rd, Pasig City, Metro Manila', paymentMethod: 'PayPal', orderItems: [{ name: 'Sports Cap', quantity: 1, price: 29.99 }], trackingNumber: 'TRK-2024-002', notes: 'Standard delivery' },
                      { id: 'ORD-004', customer: 'Alice Brown', customerEmail: 'alice@example.com', date: today, total: 124.97, status: 'shipped', items: 3, shippingAddress: '321 Elm St, Taguig City, Metro Manila', paymentMethod: 'Credit Card', orderItems: [{ name: 'Classic White T-Shirt', quantity: 2, price: 59.98 }, { name: 'Graphic T-Shirt', quantity: 1, price: 34.99 }, { name: 'Sports Cap', quantity: 1, price: 24.99 }], trackingNumber: 'TRK-2024-003', notes: 'Rush delivery requested' }
                    ]);
                    
                    setCustomers([
                      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+63 912 345 6789', address: '123 Main St, Quezon City, Metro Manila', orders: 5, totalSpent: 450.50, lastOrder: today, joinDate: '2024-01-15', status: 'active', orderHistory: [{ id: 'ORD-001', date: today, total: 89.99, status: 'processing' }] },
                      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+63 917 234 5678', address: '456 Oak Ave, Makati City, Metro Manila', orders: 12, totalSpent: 890.25, lastOrder: today, joinDate: '2023-11-08', status: 'active', orderHistory: [{ id: 'ORD-002', date: today, total: 154.98, status: 'completed' }] },
                      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+63 920 123 4567', address: '789 Pine Rd, Pasig City, Metro Manila', orders: 3, totalSpent: 275.00, lastOrder: yesterday, joinDate: '2024-03-22', status: 'active', orderHistory: [{ id: 'ORD-003', date: yesterday, total: 29.99, status: 'completed' }] },
                      { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+63 908 765 4321', address: '321 Elm St, Taguig City, Metro Manila', orders: 2, totalSpent: 199.96, lastOrder: today, joinDate: '2024-02-10', status: 'active', orderHistory: [{ id: 'ORD-004', date: today, total: 124.97, status: 'shipped' }] }
                    ]);
                  }}
                  style={{ fontSize: '0.85rem' }}
                >
                  🔄 Reset Data
                </ActionButton>
              </div>
            </div>
          </>
        )}        {activeTab === 'products' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <SectionHeader>Product Management</SectionHeader>
              <ActionButton color="#28a745" onClick={() => setShowProductModal(true)}>
                Add Product
              </ActionButton>
            </div>
            
            <SearchBar
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Table>
              <thead>                <tr>
                  <Th>Product Name</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Colors</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>                {filteredProducts.map(product => (
                  <tr key={product.product_id || product.id}>
                    <Td>{product.name}</Td>
                    <Td>{product.category}</Td>
                    <Td>{formatCurrency(product.price)}</Td>                    <Td>
                      {product.stock || 0} {getStockBadge(product.stock || 0)}
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {product.colors && product.colors.length > 0 
                          ? product.colors.slice(0, 3).map((color, index) => (
                              <Badge key={index} type="good" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                {color}
                              </Badge>
                            ))
                          : <span style={{ color: '#888888', fontSize: '0.9rem' }}>No colors</span>
                        }
                        {product.colors && product.colors.length > 3 && (
                          <span style={{ color: '#888888', fontSize: '0.8rem' }}>+{product.colors.length - 3} more</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <Badge type={product.status === 'active' ? 'good' : 'cancelled'}>
                        {product.status}
                      </Badge>
                    </Td>
                    <Td>
                      <ButtonGroup>
                        <Button onClick={() => handleEditProduct(product)}>Edit</Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleDeleteProduct(product.product_id || product.id)}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}        {activeTab === 'customers' && (
          <>
            <SectionHeader>Customer Management</SectionHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Total Orders</Th>
                  <Th>Total Spent</Th>
                  <Th>Last Order</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <Td>{customer.name}</Td>
                    <Td>{customer.email}</Td>
                    <Td>{customer.orders}</Td>
                    <Td>{formatCurrency(customer.totalSpent)}</Td>                    <Td>{customer.lastOrder}</Td>
                    <Td>
                      <Button onClick={() => handleViewCustomer(customer)}>View Details</Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}        {activeTab === 'orders' && (
          <>
            <SectionHeader>Order Management</SectionHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Order ID</Th>
                  <Th>Customer</Th>
                  <Th>Date</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <Td>{order.id}</Td>
                    <Td>{order.customer}</Td>
                    <Td>{order.date}</Td>
                    <Td>{order.items}</Td>
                    <Td>{formatCurrency(order.total)}</Td>                    <Td>{getOrderBadge(order.status)}</Td>
                    <Td>
                      <ButtonGroup>
                        <Button onClick={() => handleViewOrder(order)}>View Details</Button>
                        <Button variant="secondary" onClick={() => handleUpdateOrderStatus(order)}>Update Status</Button>
                      </ButtonGroup>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </ContentArea>

      {/* Product Modal */}
      <Modal show={showProductModal}>
        <ModalContent>
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleProductSubmit}>
            <FormGroup>
              <Label>Product Name</Label>
              <Input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Category</Label>              <Select
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Shorts">Shorts</option>
                <option value="Jackets">Jackets</option>
                <option value="Accessories">Accessories</option>
                <option value="Jeans">Jeans</option>
                <option value="Shoes">Shoes</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Price (₱)</Label>
              <Input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                required
              />
            </FormGroup>
              <FormGroup>
              <Label>Status</Label>
              <Select
                value={productForm.status}
                onChange={(e) => setProductForm({...productForm, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Product Images</Label>
              <ImageUploadArea
                onDrop={handleImageDrop}
                onDragOver={handleImageDragOver}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <ImageUploadText>
                  <span className="upload-icon">📷</span>
                  Drag & drop images here or click to select
                  <div style={{ fontSize: '0.8rem', color: '#888888', marginTop: '0.5rem' }}>
                    Supports: JPG, PNG, GIF (Max 5MB each)
                  </div>
                </ImageUploadText>
              </ImageUploadArea>
              
              <HiddenFileInput
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
              />

              {imagePreview.length > 0 && (
                <ImagePreviewContainer>
                  {imagePreview.map((preview, index) => (
                    <ImagePreview key={index}>
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <ImageRemoveButton onClick={() => handleRemoveImage(index)}>
                        ×
                      </ImageRemoveButton>
                    </ImagePreview>
                  ))}
                </ImagePreviewContainer>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Available Colors</Label>
              <ColorSelection>
                <ColorInputContainer>
                  <ColorInput
                    type="text"
                    placeholder="Enter color name (e.g., Red, Blue, Black)"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                  />
                  <AddColorButton 
                    type="button" 
                    onClick={handleAddColor}
                    disabled={!newColor.trim() || productForm.colors.includes(newColor.trim())}
                  >
                    Add Color
                  </AddColorButton>
                </ColorInputContainer>
                
                {productForm.colors.length > 0 && (
                  <ColorList>
                    {productForm.colors.map((color, index) => (
                      <ColorTag key={index}>
                        {color}
                        <span 
                          className="remove-color" 
                          onClick={() => handleRemoveColor(color)}
                        >
                          ×
                        </span>
                      </ColorTag>
                    ))}
                  </ColorList>
                )}
                
                {productForm.colors.length === 0 && (
                  <div style={{ color: '#888888', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    No colors added yet. Add colors to help customers choose variants.
                  </div>
                )}
              </ColorSelection>
            </FormGroup>
            
            <ButtonGroup>              <Button variant="secondary" type="button" onClick={() => {
                setShowProductModal(false);
                setEditingProduct(null);
                setImagePreview([]);
                setNewColor('');
                setProductForm({ 
                  name: '', 
                  description: '', 
                  category: '', 
                  price: '', 
                  stock: '', 
                  status: 'active',
                  colors: [],
                  images: []
                });
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>

      {/* Customer Details Modal */}
      <Modal show={showCustomerModal}>
        <ModalContent>
          <h2>Customer Details</h2>
          {selectedCustomer && (
            <>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Name</InfoLabel>
                  <InfoValue>{selectedCustomer.name}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{selectedCustomer.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{selectedCustomer.phone}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue>
                    <Badge type={selectedCustomer.status === 'active' ? 'good' : 'cancelled'}>
                      {selectedCustomer.status}
                    </Badge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Join Date</InfoLabel>
                  <InfoValue>{selectedCustomer.joinDate}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Total Orders</InfoLabel>
                  <InfoValue>{selectedCustomer.orders}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Total Spent</InfoLabel>
                  <InfoValue>{formatCurrency(selectedCustomer.totalSpent)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Order</InfoLabel>
                  <InfoValue>{selectedCustomer.lastOrder}</InfoValue>
                </InfoItem>
              </InfoGrid>

              <div style={{ marginBottom: '1rem' }}>
                <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Shipping Address</InfoLabel>
                <InfoValue>{selectedCustomer.address}</InfoValue>
              </div>

              <div>
                <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Recent Order History</InfoLabel>
                <OrderItemsList>
                  {selectedCustomer.orderHistory?.map((order, index) => (
                    <OrderItem key={index}>
                      <div>
                        <strong>{order.id}</strong> - {order.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{formatCurrency(order.total)}</span>
                        <Badge type={order.status}>{order.status}</Badge>
                      </div>
                    </OrderItem>
                  ))}
                </OrderItemsList>
              </div>

              <ButtonGroup>
                <Button variant="secondary" onClick={() => {
                  setShowCustomerModal(false);
                  setSelectedCustomer(null);
                }}>
                  Close
                </Button>
                <Button onClick={() => {
                  // In a real app, this would open an edit customer form
                  alert('Edit customer functionality would be implemented here');
                }}>
                  Edit Customer
                </Button>
              </ButtonGroup>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Order Details Modal */}
      <Modal show={showOrderModal}>
        <ModalContent>
          <h2>Order Details</h2>
          {selectedOrder && (
            <>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Order ID</InfoLabel>
                  <InfoValue>{selectedOrder.id}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Customer</InfoLabel>
                  <InfoValue>{selectedOrder.customer}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{selectedOrder.customerEmail}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Order Date</InfoLabel>
                  <InfoValue>{selectedOrder.date}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue>
                    <Badge type={selectedOrder.status}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Payment Method</InfoLabel>
                  <InfoValue>{selectedOrder.paymentMethod}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Total Amount</InfoLabel>
                  <InfoValue>{formatCurrency(selectedOrder.total)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Tracking Number</InfoLabel>
                  <InfoValue>{selectedOrder.trackingNumber || 'Not assigned'}</InfoValue>
                </InfoItem>
              </InfoGrid>

              <div style={{ marginBottom: '1rem' }}>
                <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Shipping Address</InfoLabel>
                <InfoValue>{selectedOrder.shippingAddress}</InfoValue>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Order Items</InfoLabel>
                <OrderItemsList>
                  {selectedOrder.orderItems?.map((item, index) => (
                    <OrderItem key={index}>
                      <div>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '0.9rem', color: '#888888' }}>
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div>{formatCurrency(item.price)}</div>
                    </OrderItem>
                  ))}
                  <OrderItem style={{ borderTop: '2px solid rgba(255, 255, 255, 0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <strong>Total: {formatCurrency(selectedOrder.total)}</strong>
                  </OrderItem>
                </OrderItemsList>
              </div>

              {selectedOrder.notes && (
                <div style={{ marginBottom: '1rem' }}>
                  <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Notes</InfoLabel>
                  <InfoValue>{selectedOrder.notes}</InfoValue>
                </div>
              )}

              <ButtonGroup>
                <Button variant="secondary" onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowOrderModal(false);
                  handleUpdateOrderStatus(selectedOrder);
                }}>
                  Update Status
                </Button>
              </ButtonGroup>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Order Status Update Modal */}
      <Modal show={showStatusModal}>
        <ModalContent>
          <h2>Update Order Status</h2>
          {selectedOrder && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <InfoLabel>Order ID: {selectedOrder.id}</InfoLabel>
                <InfoLabel>Customer: {selectedOrder.customer}</InfoLabel>
                <InfoLabel>Current Status: <Badge type={selectedOrder.status}>{selectedOrder.status}</Badge></InfoLabel>
              </div>

              <Label>New Status</Label>
              <StatusSelect 
                defaultValue={selectedOrder.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  if (window.confirm(`Are you sure you want to change the order status to "${newStatus}"?`)) {
                    handleStatusUpdate(newStatus);
                  }
                }}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </StatusSelect>

              <div style={{ background: '#2d2d2d', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                <InfoLabel style={{ marginBottom: '0.5rem' }}>Status Information</InfoLabel>
                <ul style={{ color: '#cccccc', fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                  <li><strong>Pending:</strong> Order received, awaiting processing</li>
                  <li><strong>Processing:</strong> Order is being prepared</li>
                  <li><strong>Shipped:</strong> Order has been dispatched</li>
                  <li><strong>Delivered:</strong> Order has reached customer</li>
                  <li><strong>Completed:</strong> Order successfully fulfilled</li>
                  <li><strong>Cancelled:</strong> Order has been cancelled</li>
                  <li><strong>Refunded:</strong> Payment has been refunded</li>
                </ul>
              </div>

              <ButtonGroup>
                <Button variant="secondary" onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}>
                  Cancel
                </Button>
              </ButtonGroup>
            </>
          )}
        </ModalContent>
      </Modal>
    </DashboardContainer>
  );
};

export default DashboardPage;
