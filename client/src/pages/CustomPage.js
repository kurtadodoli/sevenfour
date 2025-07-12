import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudUploadAlt, 
  faUser, 
  faPhone, 
  faMapMarkerAlt,
  faShoppingCart,
  faSpinner,
  faCheck,
  faTimes,
  faImage,
  faPalette,
  faTshirt,
  faRulerCombined,
  faCreditCard,
  faUpload,
  faShieldAlt,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

// Custom SVG Icons for clothing types
const ShortsIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8h24v6l-2 4v18h-8V20h-4v16h-8V18l-2-4V8z" fill={color} stroke={color} strokeWidth="1"/>
    <path d="M16 8v6M32 8v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const JacketIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12h6v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h6l2 4v26H8V16l2-4z" fill={color}/>
    <path d="M18 12h12M14 18v20M34 18v20M18 20h12M18 24h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="22" r="1" fill="white"/>
    <circle cx="16" cy="26" r="1" fill="white"/>
    <circle cx="32" cy="22" r="1" fill="white"/>
    <circle cx="32" cy="26" r="1" fill="white"/>
  </svg>
);

const SweaterIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14h4v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h4l2 2v26H10V16l2-2z" fill={color}/>
    <path d="M18 14h12M16 18v22M32 18v22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 20h12M18 24h12M18 28h12M18 32h12" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

const HoodieIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14h4v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h4l2 2v26H10V16l2-2z" fill={color}/>
    <path d="M16 8c0-2 2-4 8-4s8 2 8 4c0 1-1 2-2 3h-12c-1-1-2-2-2-3z" fill={color}/>
    <path d="M18 14h12M16 18v22M32 18v22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 18v4h8v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="22" cy="20" r="0.5" fill="white"/>
    <circle cx="26" cy="20" r="0.5" fill="white"/>
  </svg>
);

const JerseyIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12h4v-2c0-1 1-2 2-2h12c1 0 2 1 2 2v2h4v6l-2 2v20H14V20l-2-2v-6z" fill={color}/>
    <path d="M18 12h12M16 16v24M32 16v24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="24" y="28" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">7</text>
  </svg>
);

const TShirtIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12h4v-2c0-1 1-2 2-2h12c1 0 2 1 2 2v2h4v6l-2 2v20H14V20l-2-2v-6z" fill={color}/>
    <path d="M18 12h12M16 16v24M32 16v24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Metro Manila Cities for dropdown (NCR)
const metroManilaCities = [
  'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
  'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
  'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
];

// Product configurations with pricing
const productTypes = {
  't-shirts': {
    name: 'T-Shirts',
    price: 1050,
    icon: TShirtIcon,
    colors: ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink']
  },
  'shorts': {
    name: 'Shorts',
    price: 850,
    icon: ShortsIcon,
    colors: ['Black', 'Navy', 'Gray', 'Khaki', 'Blue', 'Green', 'Red']
  },
  'hoodies': {
    name: 'Hoodies',
    price: 1600,
    icon: HoodieIcon,
    colors: ['Black', 'Gray', 'Navy', 'White', 'Maroon', 'Blue', 'Green']
  },
  'jerseys': {
    name: 'Jerseys',
    price: 1000,
    icon: JerseyIcon,
    colors: ['White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Purple']
  },
  'jackets': {
    name: 'Jackets',
    price: 1800,
    icon: JacketIcon,
    colors: ['Black', 'Navy', 'Gray', 'Brown', 'Olive', 'Charcoal']
  },
  'sweaters': {
    name: 'Sweaters',
    price: 1400,
    icon: SweaterIcon,
    colors: ['Black', 'Gray', 'Cream', 'Navy', 'Burgundy', 'Forest Green']
  }
};

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Styled Components
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
  padding-top: 80px;
  background: #ffffff;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 300;
    color: #000000;
    margin-bottom: 1rem;
    letter-spacing: -0.5px;
  }
  
  p {
    color: #666666;
    font-size: 1rem;
    font-weight: 300;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const StepContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: none;
  border: 1px solid #e5e5e5;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  
  h2 {
    font-size: 1.25rem;
    font-weight: 400;
    color: #000000;
    margin: 0;
    letter-spacing: -0.25px;
  }
  .step-number {
    width: 32px;
    height: 32px;
    background: #000000;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 0.875rem;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ProductCard = styled.div`
  background: ${props => props.selected ? '#000000' : '#ffffff'};
  color: ${props => props.selected ? '#ffffff' : '#000000'};
  border: 1px solid ${props => props.selected ? '#000000' : '#e5e5e5'};
  border-radius: 6px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #000000;
    transform: translateY(-1px);
  }
  
  .icon {
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 0.875rem;
    font-weight: 400;
    margin: 0.5rem 0;
    letter-spacing: -0.25px;
  }
  
  .price {
    font-size: 1rem;
    font-weight: 500;
    color: ${props => props.selected ? '#ffffff' : '#000000'};
  }
`;

const ImageUploadSection = styled.div`
  border: 1px dashed #d0d0d0;
  border-radius: 6px;
  padding: 3rem 2rem;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #000000;
    background: #f5f5f5;
  }
  
  &.dragover {
    border-color: #000000;
    background: #f0f0f0;
  }
  
  h3 {
    font-size: 1rem;
    font-weight: 400;
    color: #000000;
    margin: 1rem 0 0.5rem 0;
    letter-spacing: -0.25px;
  }
  
  p {
    font-size: 0.875rem;
    color: #666666;
    margin: 0;
    font-weight: 300;
  }
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: #f8f8f8;
  aspect-ratio: 1;
  border: 1px solid #e5e5e5;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    
    &:hover {
      background: rgba(0, 0, 0, 1);
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 400;
  color: #000000;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  letter-spacing: -0.25px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
  
  &:invalid {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const OrderSummary = styled.div`
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 2rem;
  margin-top: 2rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #000000;
  font-size: 0.875rem;
  
  &.total {
    font-size: 1.125rem;
    font-weight: 500;
    color: #000000;
    border-top: 1px solid #e5e5e5;
    padding-top: 1rem;
    margin-top: 1rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #333333 0%, #555555 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fafafa;
  color: #000000;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #e5e5e5;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background: #fafafa;
  color: #000000;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #e5e5e5;
  font-size: 0.875rem;
`;

const Icon = styled(FontAwesomeIcon)`
  color: #000000;
`;

const PendingOrderCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #000000;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderId = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
  margin: 0;
  letter-spacing: -0.25px;
`;

const OrderStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#f8f9fa';
      case 'approved': return '#e3f2fd';
      case 'confirmed': return '#e3f2fd';
      case 'processing': return '#fff3e0';
      case 'completed': return '#e8f5e8';
      case 'cancelled': return '#ffebee';
      case 'payment_submitted': return '#fff3e0';
      case 'payment_verified': return '#e8f5e8';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#666666';
      case 'approved': return '#1976d2';
      case 'confirmed': return '#1976d2';
      case 'processing': return '#f57c00';
      case 'completed': return '#388e3c';
      case 'cancelled': return '#d32f2f';
      case 'payment_submitted': return '#f57c00';
      case 'payment_verified': return '#388e3c';
      default: return '#666666';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'pending': return '#e5e5e5';
      case 'approved': return '#2196f3';
      case 'confirmed': return '#2196f3';
      case 'processing': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'payment_submitted': return '#ff9800';
      case 'payment_verified': return '#4caf50';
      default: return '#e5e5e5';
    }
  }};
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  font-size: 0.875rem;
  color: #000000;
  
  strong {
    color: #000000;
    font-weight: 500;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #666666;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    color: #000000;
    background: rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Payment Form Styled Components
const PaymentSection = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const PaymentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  
  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: #000000;
  }
`;

const PaymentForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PaymentFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const PaymentLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaymentInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const PaymentFileInput = styled.input`
  display: none;
`;

const PaymentFileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #666;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    border-color: #000000;
  }
`;

const PaymentProofPreview = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  
  img {
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
  }
`;

const PaymentSubmitButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #218838;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PaymentInstructions = styled.div`
  background: #e7f3ff;
  border: 1px solid #bee5eb;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #0c5460;
  
  h5 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.25rem;
  }
`;

const PaymentStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 1rem;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.pending {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
`;

const CustomPage = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [activeMode, setActiveMode] = useState('customize'); // 'customize' or 'pending'
  
  // Payment-related state for custom orders
  const [paymentForm, setPaymentForm] = useState({});
  const [paymentProofFiles, setPaymentProofFiles] = useState({});
  const [paymentProofPreviews, setPaymentProofPreviews] = useState({});
  const [paymentSubmitting, setPaymentSubmitting] = useState({});

  const [formData, setFormData] = useState({
    // Product details
    productName: '',
    size: '',
    color: '',
    quantity: 1,
    specialInstructions: '',
      // Customer info
    customerName: '',
    phone: '',
    
    // Shipping address
    province: 'Metro Manila', // Fixed to Metro Manila (NCR)
    city: '',
    streetAddress: '',
    houseNumber: '',
    barangay: '',
    postalCode: ''
  });
  // Get user info on component mount
  useEffect(() => {
    console.log('🔄 CustomPage component mounted, checking for token...');
    const token = localStorage.getItem('token');
    console.log('   Token found:', token ? 'Yes' : 'No');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('   Token payload:', payload);
        setUser(payload);
        console.log('✅ User state set from token');
      } catch (error) {
        console.error('❌ Error parsing token:', error);
      }
    } else {
      console.log('❌ No token found in localStorage');
    }
  }, []);  // Fetch pending custom orders by email
  const fetchPendingOrders = useCallback(async () => {
    setLoadingPending(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching pending orders by email...');
      console.log('   Token exists:', token ? 'Yes' : 'No');
      console.log('   User:', user);
      console.log('   User email:', user?.email);
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      console.log('📡 Making request to: http://localhost:5000/api/custom-orders/my-orders');
      console.log('   This will fetch orders for email:', user?.email);
      console.log('   Headers:', headers);
      
      const response = await fetch('http://localhost:5000/api/custom-orders/my-orders', {
        method: 'GET',
        headers
      });

      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Received data:', result);
        console.log('   Orders count:', result.count);
        console.log('   Orders data length:', result.data ? result.data.length : 0);
        
        // Debug: Log each order to see available fields including images
        if (result.data && result.data.length > 0) {
          console.log('🖼️ Checking image fields in orders:');
          result.data.forEach((order, index) => {
            console.log(`   Order ${index + 1}:`, {
              id: order.custom_order_id,
              design_images: order.design_images,
              images: order.images,
              image_urls: order.image_urls,
              files: order.files,
              attachments: order.attachments
            });
          });
        }
        
        // The API returns data in result.data, not result.customOrders
        setPendingOrders(result.data || []);
        console.log('✅ Pending orders updated in state');
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to fetch pending orders:', response.status, errorData);
        if (response.status === 401) {
          console.log('🔑 Authentication required - user might need to log in again');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching pending orders:', error);
    } finally {
      setLoadingPending(false);
    }
  }, [user]);  // Fetch pending orders when user is available
  useEffect(() => {
    console.log('🔄 useEffect triggered for pending orders');
    console.log('   User state:', user);
    console.log('   Will fetch orders:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('✅ User exists, calling fetchPendingOrders...');
      fetchPendingOrders();
    } else {
      console.log('❌ No user state, skipping fetchPendingOrders');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user to prevent infinite loop

  const handleProductSelect = (productType) => {
    setSelectedProduct(productType);
    setFormData(prev => ({
      ...prev,
      productName: productTypes[productType].name,
      color: '', // Reset color selection
      size: '' // Reset size selection
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (uploadedImages.length + files.length > 10) {
      setSubmitStatus({
        type: 'error',
        message: 'Maximum 10 images allowed. Please remove some images first.'
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setSubmitStatus({
          type: 'error',
          message: `File ${file.name} is too large. Maximum size is 10MB.`
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setSubmitStatus({
          type: 'error',
          message: `File ${file.name} is not a valid image.`
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Clear any previous error messages
    setSubmitStatus({ type: '', message: '' });
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for quantity to enforce the 8-item limit
    if (name === 'quantity') {
      const numValue = parseInt(value);
      if (numValue > 8) {
        toast.error('Maximum quantity allowed is 8 items per order');
        return; // Don't update the state if value exceeds 8
      }
      if (numValue < 1) {
        return; // Don't allow quantities less than 1
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!selectedProduct) {
      setSubmitStatus({ type: 'error', message: 'Please select a product type.' });
      return false;
    }

    if (!formData.productName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter a product name.' });
      return false;
    }

    if (!formData.size) {
      setSubmitStatus({ type: 'error', message: 'Please select a size.' });
      return false;
    }

    if (!formData.color) {
      setSubmitStatus({ type: 'error', message: 'Please select a color.' });
      return false;
    }

    if (!formData.quantity || formData.quantity < 1) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid quantity.' });
      return false;
    }

    if (parseInt(formData.quantity) > 8) {
      setSubmitStatus({ type: 'error', message: 'Maximum quantity allowed is 8 items per order.' });
      return false;
    }

    if (uploadedImages.length === 0) {
      setSubmitStatus({ type: 'error', message: 'Please upload at least one design image.' });
      return false;
    }    if (!formData.customerName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your full name.' });
      return false;
    }

    if (!formData.phone.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your phone number.' });
      return false;
    }

    if (!formData.city) {
      setSubmitStatus({ type: 'error', message: 'Please select a city.' });
      return false;
    }

    if (!formData.streetAddress.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your street address.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const submitFormData = new FormData();      // Add form fields
      submitFormData.append('productType', selectedProduct);
      submitFormData.append('productName', formData.productName);
      submitFormData.append('size', formData.size);
      submitFormData.append('color', formData.color);
      submitFormData.append('quantity', formData.quantity);
      submitFormData.append('specialInstructions', formData.specialInstructions);      submitFormData.append('customerName', formData.customerName);
      submitFormData.append('customerEmail', user?.email || ''); // Use logged-in user's email
      submitFormData.append('customerPhone', formData.phone);
      submitFormData.append('province', formData.province);
      submitFormData.append('municipality', formData.city);
      submitFormData.append('streetNumber', formData.streetAddress);
      submitFormData.append('houseNumber', formData.houseNumber);
      submitFormData.append('barangay', formData.barangay);
      submitFormData.append('postalCode', formData.postalCode);// Add images
      uploadedImages.forEach((image, index) => {
        submitFormData.append('images', image.file);
      });

      const token = localStorage.getItem('token');
      const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch('http://localhost:5000/api/custom-orders', {
        method: 'POST',
        headers,
        body: submitFormData
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: `Custom order submitted successfully! Order ID: ${result.customOrderId}. You will receive a confirmation email shortly.`
        });
        
        // Reset form
        setSelectedProduct('');
        setUploadedImages([]);        setFormData({
          productName: '',
          size: '',
          color: '',
          quantity: 1,
          specialInstructions: '',
          customerName: user?.username || '',
          phone: '',
          province: 'Metro Manila',
          city: '',
          streetAddress: '',
          houseNumber: '',
          barangay: '',
          postalCode: ''        });// Refresh pending orders to show the new submission
        console.log('✅ Order submitted successfully, refreshing pending orders...');
        // Add a small delay to ensure database has been updated
        setTimeout(() => {
          fetchPendingOrders();
        }, 1000);
        
        // Auto-switch to pending orders view after successful submission
        setActiveMode('pending');

      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to submit custom order. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting custom order:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment form handlers
  const handlePaymentInputChange = (orderId, field, value) => {
    setPaymentForm(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const handlePaymentProofUpload = (orderId, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setPaymentProofFiles(prev => ({
        ...prev,
        [orderId]: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPaymentProofPreviews(prev => ({
          ...prev,
          [orderId]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (orderId) => {
    const paymentData = paymentForm[orderId];
    const paymentProof = paymentProofFiles[orderId];
    
    // Validate required fields
    if (!paymentData?.fullName || !paymentData?.contactNumber || !paymentData?.gcashReference || !paymentProof) {
      toast.error('Please fill in all required fields and upload payment proof');
      return;
    }
    
    setPaymentSubmitting(prev => ({
      ...prev,
      [orderId]: true
    }));
    
    try {
      const formData = new FormData();
      formData.append('customOrderId', orderId);
      formData.append('fullName', paymentData.fullName);
      formData.append('contactNumber', paymentData.contactNumber);
      formData.append('gcashReference', paymentData.gcashReference);
      formData.append('paymentProof', paymentProof);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/custom-orders/payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Payment submitted successfully! Your order is now pending admin verification.');
        
        // Clear payment form for this order
        setPaymentForm(prev => {
          const newForm = { ...prev };
          delete newForm[orderId];
          return newForm;
        });
        setPaymentProofFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[orderId];
          return newFiles;
        });
        setPaymentProofPreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[orderId];
          return newPreviews;
        });
        
        // Refresh pending orders to show updated status
        fetchPendingOrders();
      } else {
        toast.error(data.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setPaymentSubmitting(prev => ({
        ...prev,
        [orderId]: false
      }));
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return productTypes[selectedProduct].price * formData.quantity;
  };
  return (
    <PageContainer>
      <Header>
        <h1>Custom Design Studio</h1>
        <p>Create your perfect custom clothing with our design studio. Upload your designs and we'll bring them to life!</p>
      </Header>

      {/* Mode Toggle Buttons */}
      {user && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '3rem', 
          justifyContent: 'center',
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '0.25rem',
          width: 'fit-content',
          margin: '0 auto 3rem auto'
        }}>
          <ToggleButton 
            onClick={() => setActiveMode('customize')}
            style={{ 
              background: activeMode === 'customize' ? '#ffffff' : 'transparent',
              color: activeMode === 'customize' ? '#000000' : '#666666',
              boxShadow: activeMode === 'customize' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
              borderRadius: '10px',
              marginBottom: '0'
            }}
          >
            <Icon icon={faTshirt} style={{ marginRight: '0.5rem' }} />
            Design Studio
          </ToggleButton>
          <ToggleButton 
            onClick={() => setActiveMode('pending')}
            style={{ 
              background: activeMode === 'pending' ? '#ffffff' : 'transparent',
              color: activeMode === 'pending' ? '#000000' : '#666666',
              boxShadow: activeMode === 'pending' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
              borderRadius: '10px',
              marginBottom: '0'
            }}
          >
            <Icon icon={faShoppingCart} style={{ marginRight: '0.5rem' }} />
            Pending Orders ({pendingOrders.length})
          </ToggleButton>
        </div>
      )}

      {/* Pending Orders View */}
      {user && activeMode === 'pending' && (
        <StepContainer>
          <StepHeader>
            <div style={{ 
              minWidth: '32px', 
              height: '32px', 
              background: 'transparent', 
              color: '#000000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>📋</div>
            <h2>Your Pending Customized Products</h2>
          </StepHeader>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <ToggleButton 
              onClick={fetchPendingOrders} 
              disabled={loadingPending}
              style={{
                background: '#f8f9fa',
                color: '#666666',
                borderRadius: '8px',
                marginBottom: '0'
              }}
            >
              {loadingPending ? <Icon icon={faSpinner} spin /> : '🔄'} Refresh Orders
            </ToggleButton>
          </div>

          <div>
            {loadingPending ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Icon icon={faSpinner} spin size="2x" />
                <p style={{ marginTop: '1rem', color: '#666666', fontSize: '0.875rem' }}>Loading your orders...</p>
              </div>
            ) : pendingOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>
                <Icon icon={faTshirt} size="2x" />
                <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>No pending custom orders yet.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Switch to Design Studio to submit your first custom design!</p>
              </div>
            ) : (
              <div>
                {pendingOrders && pendingOrders.length > 0 ? pendingOrders
                  .filter(order => order && order.custom_order_id) // Filter out invalid orders
                  .map((order) => (
                  <PendingOrderCard key={order.custom_order_id}>
                    <OrderHeader>
                      <OrderId>Order #{order.custom_order_id}</OrderId>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <OrderStatus status={order.status}>{order.status}</OrderStatus>
                        {order.payment_status && order.payment_status !== 'pending' && (
                          <OrderStatus status={`payment_${order.payment_status}`}>
                            Payment {order.payment_status}
                          </OrderStatus>
                        )}
                      </div>
                    </OrderHeader>
                    
                    {/* Custom Design Images Section */}
                    <div style={{ marginBottom: '1rem' }}>
                      <DetailItem style={{ marginBottom: '0.5rem' }}>
                        <strong>🎨 Custom Design Images:</strong>
                      </DetailItem>
                      {(() => {
                        console.log('🖼️ Order image debug:', {
                          orderId: order.custom_order_id,
                          images: order.images,
                          imageCount: order.image_count,
                          designImages: order.design_images,
                          hasImages: order.images && order.images.length > 0
                        });
                        return null;
                      })()}
                      {order.images && order.images.length > 0 ? (
                        <ImagePreviewGrid style={{ marginTop: '0.5rem', gap: '0.75rem' }}>
                          {order.images.map((image, index) => {
                            // Construct the correct image URL based on the API response structure
                            const imageUrl = `http://localhost:5000/uploads/custom-orders/${image.filename}`;
                            console.log(`🖼️ Image ${index + 1} URL:`, imageUrl, 'Image object:', image);
                            
                            return (
                              <ImagePreview 
                                key={index}
                                style={{ 
                                  position: 'relative',
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  minHeight: '120px',
                                  backgroundColor: '#f8f9fa',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#007bff';
                                  e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                                onClick={() => {
                                  // Open image in new tab for full view
                                  window.open(imageUrl, '_blank');
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Custom design ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onLoad={() => {
                                    console.log(`✅ Image ${index + 1} loaded successfully:`, imageUrl);
                                  }}
                                  onError={(e) => {
                                    console.log('❌ Failed to load image:', imageUrl);
                                    console.log('Trying alternative paths for:', image);
                                    
                                    // Try alternative paths based on the multer upload configuration
                                    const altUrls = [
                                      `http://localhost:5000/uploads/custom-designs/${image.filename}`,
                                      `http://localhost:5000/uploads/${image.filename}`,
                                      `http://localhost:5000/images/${image.filename}`,
                                      // Fallback to original filename if different
                                      `http://localhost:5000/uploads/custom-orders/${image.original_filename}`,
                                      `http://localhost:5000/uploads/custom-designs/${image.original_filename}`
                                    ];
                                    
                                    if (!e.target) return;
                                    
                                    if (!e.target.dataset.retryIndex) {
                                      e.target.dataset.retryIndex = '0';
                                    }
                                    
                                    const retryIndex = parseInt(e.target.dataset.retryIndex);
                                    if (retryIndex < altUrls.length) {
                                      console.log(`🔄 Trying alternative URL ${retryIndex + 1}:`, altUrls[retryIndex]);
                                      e.target.src = altUrls[retryIndex];
                                      e.target.dataset.retryIndex = (retryIndex + 1).toString();
                                    } else {
                                      console.log('❌ All alternative URLs failed');
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex';
                                      }
                                    }
                                  }}
                                />
                              <div style={{
                                display: 'none',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: '#f5f5f5',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                fontSize: '0.75rem',
                                color: '#666666',
                                border: '1px dashed #cccccc'
                              }}>
                                <FontAwesomeIcon icon={faImage} size="2x" style={{ marginBottom: '0.5rem', color: '#cccccc' }} />
                                <span>Design {index + 1}</span>
                                <span style={{ fontSize: '0.625rem', marginTop: '0.25rem', textAlign: 'center' }}>
                                  Image unavailable<br/>Click to open
                                </span>
                              </div>
                              <div style={{
                                position: 'absolute',
                                bottom: '4px',
                                right: '4px',
                                background: 'rgba(0, 0, 0, 0.8)',
                                color: 'white',
                                padding: '3px 7px',
                                borderRadius: '12px',
                                fontSize: '0.625rem',
                                fontWeight: '600'
                              }}>
                                {index + 1}
                              </div>
                            </ImagePreview>
                          );
                          })}
                        </ImagePreviewGrid>
                      ) : (
                        <div style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          border: '2px dashed #dee2e6',
                          borderRadius: '12px',
                          textAlign: 'center',
                          color: '#6c757d',
                          fontSize: '0.875rem'
                        }}>
                          <FontAwesomeIcon icon={faImage} size="2x" style={{ marginBottom: '0.75rem', color: '#adb5bd' }} />
                          <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>No design images available</div>
                          <div style={{ fontSize: '0.75rem', opacity: '0.8' }}>
                            Design images will appear here once uploaded
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <OrderDetails>
                      <DetailItem>
                        <strong>Product:</strong> {order.product_name || order.product_type}
                      </DetailItem>
                      <DetailItem>
                        <strong>Size:</strong> {order.size}
                      </DetailItem>
                      <DetailItem>
                        <strong>Color:</strong> {order.color}
                      </DetailItem>
                      <DetailItem>
                        <strong>Quantity:</strong> {order.quantity}
                      </DetailItem>
                      {order.urgency && (
                        <DetailItem>
                          <strong>Urgency:</strong> {order.urgency.replace('_', ' ')}
                        </DetailItem>
                      )}
                      <DetailItem>
                        <strong>Estimated Price:</strong> ₱{parseFloat(order.estimated_price)?.toLocaleString() || 'TBD'}
                      </DetailItem>
                      {order.final_price && order.final_price > 0 && (
                        <DetailItem>
                          <strong>Final Price:</strong> ₱{parseFloat(order.final_price)?.toLocaleString() || 'TBD'}
                        </DetailItem>
                      )}
                      <DetailItem>
                        <strong>Submitted:</strong> {new Date(order.created_at).toLocaleDateString()}
                      </DetailItem>
                    </OrderDetails>
                    
                    {order.special_instructions && (
                      <DetailItem style={{ marginTop: '0.75rem' }}>
                        <strong>Special Instructions:</strong> {order.special_instructions}
                      </DetailItem>
                    )}
                    
                    {order.admin_notes && (
                      <DetailItem style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fafafa', borderRadius: '4px' }}>
                        <strong>Admin Notes:</strong> {order.admin_notes}
                      </DetailItem>
                    )}
                    
                    {/* Payment Section for Approved Orders (only show if payment not yet submitted) */}
                    {order.status === 'approved' && (!order.payment_status || order.payment_status === 'pending') && (
                      <PaymentSection>
                        <PaymentHeader>
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          <h4>GCash Payment</h4>
                        </PaymentHeader>
                        
                        <PaymentInstructions>
                          <h5>Payment Instructions:</h5>
                          <ul>
                            <li>Send payment to GCash number: <strong>09123456789</strong></li>
                            <li>Amount: <strong>₱{order.final_price ? parseFloat(order.final_price).toLocaleString() : parseFloat(order.estimated_price).toLocaleString()}</strong></li>
                            <li>Reference: Order #{order.custom_order_id}</li>
                            <li>Take a screenshot of your payment confirmation</li>
                            <li>Upload the screenshot below along with your details</li>
                          </ul>
                        </PaymentInstructions>
                        
                        <PaymentForm onSubmit={(e) => { e.preventDefault(); handlePaymentSubmit(order.custom_order_id); }}>
                          <PaymentFormGroup>
                            <PaymentLabel>
                              <FontAwesomeIcon icon={faUser} />
                              Full Name *
                            </PaymentLabel>
                            <PaymentInput
                              type="text"
                              placeholder="Enter your full name"
                              value={paymentForm[order.custom_order_id]?.fullName || ''}
                              onChange={(e) => handlePaymentInputChange(order.custom_order_id, 'fullName', e.target.value)}
                              required
                            />
                          </PaymentFormGroup>
                          
                          <PaymentFormGroup>
                            <PaymentLabel>
                              <FontAwesomeIcon icon={faPhone} />
                              Contact Number *
                            </PaymentLabel>
                            <PaymentInput
                              type="tel"
                              placeholder="09XXXXXXXXX"
                              value={paymentForm[order.custom_order_id]?.contactNumber || ''}
                              onChange={(e) => handlePaymentInputChange(order.custom_order_id, 'contactNumber', e.target.value)}
                              required
                            />
                          </PaymentFormGroup>
                          
                          <PaymentFormGroup>
                            <PaymentLabel>
                              <FontAwesomeIcon icon={faCreditCard} />
                              GCash Reference Number *
                            </PaymentLabel>
                            <PaymentInput
                              type="text"
                              placeholder="Enter GCash reference number"
                              value={paymentForm[order.custom_order_id]?.gcashReference || ''}
                              onChange={(e) => handlePaymentInputChange(order.custom_order_id, 'gcashReference', e.target.value)}
                              required
                            />
                          </PaymentFormGroup>
                          
                          <PaymentFormGroup className="full-width">
                            <PaymentLabel>
                              <FontAwesomeIcon icon={faUpload} />
                              Payment Proof (Screenshot) *
                            </PaymentLabel>
                            <PaymentFileInput
                              type="file"
                              accept="image/*"
                              id={`payment-proof-${order.custom_order_id}`}
                              onChange={(e) => handlePaymentProofUpload(order.custom_order_id, e)}
                            />
                            <PaymentFileLabel htmlFor={`payment-proof-${order.custom_order_id}`}>
                              <FontAwesomeIcon icon={faUpload} />
                              {paymentProofFiles[order.custom_order_id] ? 'Change Payment Proof' : 'Upload Payment Proof'}
                            </PaymentFileLabel>
                            
                            {paymentProofPreviews[order.custom_order_id] && (
                              <PaymentProofPreview>
                                <img 
                                  src={paymentProofPreviews[order.custom_order_id]} 
                                  alt="Payment proof preview"
                                />
                              </PaymentProofPreview>
                            )}
                          </PaymentFormGroup>
                          
                          <PaymentFormGroup className="full-width">
                            <PaymentSubmitButton
                              type="submit"
                              disabled={paymentSubmitting[order.custom_order_id]}
                            >
                              {paymentSubmitting[order.custom_order_id] ? (
                                <>
                                  <FontAwesomeIcon icon={faSpinner} spin />
                                  Submitting Payment...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faShieldAlt} />
                                  Submit Payment
                                </>
                              )}
                            </PaymentSubmitButton>
                          </PaymentFormGroup>
                        </PaymentForm>
                      </PaymentSection>
                    )}
                    
                    {/* Payment Status for orders with payment submitted */}
                    {order.payment_status === 'submitted' && (
                      <PaymentStatus className="pending">
                        <FontAwesomeIcon icon={faSpinner} />
                        Payment verification pending - Admin will review your payment proof
                      </PaymentStatus>
                    )}
                    
                    {order.payment_status === 'verified' && (
                      <PaymentStatus className="success">
                        <FontAwesomeIcon icon={faCheck} />
                        Payment verified! Your order is now being processed.
                      </PaymentStatus>
                    )}
                  </PendingOrderCard>
                )) : <div>No valid orders found</div>}
              </div>
            )}
          </div>
        </StepContainer>
      )}

      {/* Customization Form View */}
      {activeMode === 'customize' && (
        <>
          {submitStatus.message && (
            submitStatus.type === 'error' ? (
              <ErrorMessage>
                <Icon icon={faTimes} /> {submitStatus.message}
              </ErrorMessage>
            ) : (
              <SuccessMessage>
                <Icon icon={faCheck} /> {submitStatus.message}
              </SuccessMessage>
            )
          )}

          {/* Step 1: Product Selection */}
          <StepContainer>
            <StepHeader>
              <div className="step-number">1</div>
              <h2>Choose Your Product</h2>
            </StepHeader>
            <ProductGrid>
              {Object.entries(productTypes).map(([key, product]) => {
                const IconComponent = product.icon;
                return (
                  <ProductCard
                    key={key}
                    selected={selectedProduct === key}
                    onClick={() => handleProductSelect(key)}
                  >
                    <div className="icon">
                      <IconComponent 
                        color={selectedProduct === key ? '#ffffff' : '#000000'} 
                        size={40} 
                      />
                    </div>
                    <h3>{product.name}</h3>
                    <div className="price">₱{product.price?.toLocaleString() || 'TBD'}</div>
                  </ProductCard>
                );
              })}
            </ProductGrid>
          </StepContainer>

          {/* Step 2: Design Upload */}
          <StepContainer>
            <StepHeader>
              <div className="step-number">2</div>
              <h2>Upload Your Design</h2>
            </StepHeader>
            <ImageUploadSection>
              <Icon icon={faCloudUploadAlt} size="2x" />
              <h3>Drop your design files here or click to browse</h3>
              <p>Upload up to 10 images (JPG, PNG, GIF). Maximum 10MB per file.</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="imageUpload"
              />
              <UploadButton as="label" htmlFor="imageUpload">
                <Icon icon={faImage} />
                Select Images
              </UploadButton>
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                {uploadedImages.length}/10 images uploaded
              </p>
            </ImageUploadSection>

            {uploadedImages.length > 0 && (
              <ImagePreviewGrid>
                {uploadedImages.map((image) => (
                  <ImagePreview key={image.id}>
                    <img src={image.preview} alt="Design preview" />
                    <button className="remove-btn" onClick={() => removeImage(image.id)}>
                      <Icon icon={faTimes} />
                    </button>
                  </ImagePreview>
                ))}
              </ImagePreviewGrid>
            )}
          </StepContainer>

          {/* Step 3: Product Details */}
          <StepContainer>
        <StepHeader>
          <div className="step-number">3</div>
          <h2>Product Customization</h2>
        </StepHeader>
        <FormGrid>
          <FormGroup>
            <Label>
              <Icon icon={faTshirt} /> Product Name
            </Label>
            <Input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter custom product name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Icon icon={faRulerCombined} /> Size
            </Label>
            <Select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Size</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              <Icon icon={faPalette} /> Base Color
            </Label>
            <Select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Color</option>
              {selectedProduct && productTypes[selectedProduct].colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Quantity (Max: 8)</Label>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max="8"
              required
            />
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
              Maximum 8 items per custom order
            </small>
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Special Instructions (Optional)</Label>
            <TextArea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="Any special requirements or notes for your custom design..."
            />
          </FormGroup>
        </FormGrid>
          </StepContainer>

          {/* Step 4: Customer Information */}
          <StepContainer>
            <StepHeader>
              <div className="step-number">4</div>
              <h2>Customer Information</h2>
            </StepHeader>
            <FormGrid>
              <FormGroup>
                <Label>
                  <Icon icon={faUser} /> Full Name
                </Label>
                <Input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  <Icon icon={faPhone} /> Phone Number
                </Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </FormGroup>
            </FormGrid>
          </StepContainer>

          {/* Step 5: Shipping Information */}
          <StepContainer>
            <StepHeader>
              <div className="step-number">5</div>
              <h2>Shipping Information</h2>
            </StepHeader>
            <div style={{ 
              background: '#fafafa', 
              border: '1px solid #e5e5e5', 
              borderRadius: '4px', 
              padding: '1rem', 
              marginBottom: '2rem',
              color: '#000000',
              fontSize: '0.875rem'
            }}>
              <strong>📍 Delivery Notice:</strong> We currently deliver only within Metro Manila (National Capital Region). Free delivery for all custom orders.
            </div>
            
            <FormGrid>
              <FormGroup>
                <Label>
                  <Icon icon={faMapMarkerAlt} /> Area
                </Label>
                <Select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  disabled
                >
                  <option value="Metro Manila">Metro Manila</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>City/Municipality</Label>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select City</option>
                  {metroManilaCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup className="full-width">
                <Label>Street Address / House Number</Label>
                <Input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="Enter complete street address and house/building number"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>House/Unit Number (Optional)</Label>
                <Input
                  type="text"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  placeholder="Unit/House number"
                />
              </FormGroup>

              <FormGroup>
                <Label>Barangay (Optional)</Label>
                <Input
                  type="text"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleInputChange}
                  placeholder="Barangay"
                />
              </FormGroup>

              <FormGroup>
                <Label>Postal Code (Optional)</Label>
                <Input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234"
                  maxLength="4"
                  pattern="[0-9]{4}"
                />
              </FormGroup>
            </FormGrid>
          </StepContainer>

          {/* Order Summary */}
          {selectedProduct && (
            <OrderSummary>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#000000', fontSize: '1rem', fontWeight: '400' }}>Order Summary</h3>
              <SummaryRow>
                <span>Product Type:</span>
                <span>{productTypes[selectedProduct].name}</span>
              </SummaryRow>
              {formData.productName && (
                <SummaryRow>
                  <span>Product Name:</span>
                  <span>{formData.productName}</span>
                </SummaryRow>
              )}
              {formData.size && (
                <SummaryRow>
                  <span>Size:</span>
                  <span>{formData.size}</span>
                </SummaryRow>
              )}
              {formData.color && (
                <SummaryRow>
                  <span>Color:</span>
                  <span>{formData.color}</span>
                </SummaryRow>
              )}
              <SummaryRow>
                <span>Quantity:</span>
                <span>{formData.quantity}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Unit Price:</span>
                <span>₱{productTypes[selectedProduct]?.price?.toLocaleString() || 'TBD'}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Design Images:</span>
                <span>{uploadedImages.length} uploaded</span>
              </SummaryRow>
              <SummaryRow>
                <span>Shipping:</span>
                <span>Free</span>
              </SummaryRow>
              <SummaryRow className="total">
                <span>Total Estimated Price:</span>
                <span>₱{calculateTotal()?.toLocaleString() || 'TBD'}</span>
              </SummaryRow>
            </OrderSummary>
          )}

          <SubmitButton 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProduct}
          >
            {isSubmitting ? (
              <>
                <Icon icon={faSpinner} spin />
                Submitting Order...
              </>
            ) : (
              <>
                <Icon icon={faShoppingCart} />
                Submit Custom Order
              </>
            )}
          </SubmitButton>
        </>
      )}
    </PageContainer>
  );
};

export default CustomPage;