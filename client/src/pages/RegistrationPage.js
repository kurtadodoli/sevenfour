import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faBox, 
  faPlus, 
  faEye, 
  faEyeSlash, 
  faUserShield,
  faUserCheck,
  faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, #000000 0%, #333333 50%, #666666 100%);
    opacity: 0.05;
    z-index: 1;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 2;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666666;
  margin: 0;
  font-weight: 400;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(10px);
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
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
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(135deg, #000000 0%, #333333 100%)' : 
      'rgba(0, 0, 0, 0.05)'
    };
    color: ${props => props.active ? '#ffffff' : '#000000'};
  }
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    background: #ffffff;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    background: #ffffff;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    background: #ffffff;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #000000;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop),
})`
  padding: ${props => props.size === 'small' ? '8px 16px' : '12px 24px'};
  border: none;
  border-radius: 8px;
  font-size: ${props => props.size === 'small' ? '13px' : '14px'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #000000 0%, #333333 100%);
        color: #ffffff;
        
        &:hover {
          background: linear-gradient(135deg, #333333 0%, #555555 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: #ffffff;
        
        &:hover {
          background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
      `;
    }
    if (props.variant === 'success') {
      return `
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: #ffffff;
        
        &:hover {
          background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
      `;
    }
    return `
      background: rgba(255, 255, 255, 0.9);
      color: #333333;
      border: 1px solid rgba(0, 0, 0, 0.1);
      
      &:hover {
        background: #ffffff;
        border-color: #000000;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    `;
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #333333;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 14px;
  color: #333333;
  
  &:last-child {
    text-align: center;
  }
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const Badge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    if (props.variant === 'admin') {
      return `
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: #ffffff;
      `;
    }
    if (props.variant === 'customer') {
      return `
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: #ffffff;
      `;
    }
    if (props.variant === 'active') {
      return `
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: #ffffff;
      `;
    }
    if (props.variant === 'archived') {
      return `
        background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        color: #ffffff;
      `;
    }
    return `
      background: linear-gradient(135deg, #ffc107 0%, #f39c12 100%);
      color: #000000;
    `;
  }}
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.2);
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

// Modern Drag & Drop Upload Components
const DropZone = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragOver', 'hasFiles'].includes(prop),
})`
  border: 2px dashed ${props => props.isDragOver ? '#007bff' : '#e0e0e0'};
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(0, 123, 255, 0.05)' : 'rgba(248, 249, 250, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #007bff;
    background: rgba(0, 123, 255, 0.05);
  }
  
  ${props => props.hasFiles && `
    border-color: #28a745;
    background: rgba(40, 167, 69, 0.05);
  `}
`;

const UploadIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
`;

const UploadText = styled.div`
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
`;

const BrowseButton = styled.button`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
  padding: 20px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(220, 53, 69, 1);
    transform: scale(1.1);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

// Size & Color Variants Components
const VariantsSection = styled.div`
  margin-top: 20px;
  padding: 24px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const VariantsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const VariantsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const TotalStock = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
`;

const VariantRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SizeLabel = styled.div`
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  font-weight: 600;
  border-radius: 6px;
  font-size: 14px;
`;

const ColorDot = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color || '#333'};
  border: 2px solid ${props => props.color === '#ffffff' || props.color === 'white' ? '#ddd' : 'transparent'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ColorName = styled.div`
  flex: 1;
  font-weight: 500;
  color: #333;
  font-size: 14px;
  text-transform: capitalize;
`;

const StockInput = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const RemoveVariantButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(220, 53, 69, 0.2);
    transform: scale(1.1);
  }
`;

const AddVariantSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const AddVariantInput = styled(Input)`
  flex: 1;
`;

const AddVariantButton = styled(Button)`
  white-space: nowrap;
`;

// RegistrationPage Component
const RegistrationPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // User Form State
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
    // Product Form State
  const [productForm, setProductForm] = useState({
    productname: '',
    productdescription: '',
    productprice: '',
    product_type: '',
    productcolor: '',
    sizes: '',
    productimages: [], // Changed from single image to array of images
    productstatus: 'active',
    variants: [] // Array of {size, color, stock} objects
  });

  // New variant form state
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    stock: 0
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Product categories
  const productTypes = [
    'bags', 'hats', 'hoodies', 'jackets', 'jerseys', 'shorts', 'sweaters', 't-shirts'
  ];  // Fetch users and products
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found. Please login as admin to view users.');
        setUsers([]);
        return;
      }

      console.log('Fetching users with token...');
      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.warn('Token is invalid or expired. Please login again.');
        localStorage.removeItem('token');
        setUsers([]);
        return;
      }
      
      if (response.status === 403) {
        console.warn('Access denied. Admin role required to view users.');
        setUsers([]);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users fetched successfully:', data.length);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found. Please login to view products.');
        setProducts([]);
        return;
      }

      console.log('Fetching products with token...');
      const response = await fetch('http://localhost:3001/api/maintenance/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.warn('Token is invalid or expired. Please login again.');
        localStorage.removeItem('token');
        setProducts([]);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products fetched successfully:', data.length);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  // Handle user form submission
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});
    setSuccessMessage('');

    try {      // Validate form
      const errors = {};
      if (!userForm.email) errors.email = 'Email is required';
      if (!userForm.firstName) errors.firstName = 'First name is required';
      if (!userForm.lastName) errors.lastName = 'Last name is required';
      
      // Enhanced password validation to match backend requirements
      if (!userForm.password) {
        errors.password = 'Password is required';
      } else {
        const passwordErrors = [];
        if (userForm.password.length < 8) {
          passwordErrors.push('at least 8 characters');
        }
        if (!/[A-Z]/.test(userForm.password)) {
          passwordErrors.push('one uppercase letter');
        }
        if (!/[a-z]/.test(userForm.password)) {
          passwordErrors.push('one lowercase letter');
        }
        if (!/[0-9]/.test(userForm.password)) {
          passwordErrors.push('one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(userForm.password)) {
          passwordErrors.push('one special character');
        }
        
        if (passwordErrors.length > 0) {
          errors.password = `Password must contain ${passwordErrors.join(', ')}`;
        }
      }
      
      if (!userForm.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (userForm.password !== userForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          email: userForm.email,
          first_name: userForm.firstName,
          last_name: userForm.lastName,
          password: userForm.password,
          role: userForm.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`User ${userForm.email} registered successfully!`);        setUserForm({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
          role: 'customer'
        });
        fetchUsers(); // Refresh user list
        toast.success('User registered successfully!');
      } else {
        setFormErrors({ submit: data.message || 'Registration failed' });
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setFormErrors({ submit: 'Network error. Please try again.' });
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle product form submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});
    setSuccessMessage('');

    try {
      // Validate form
      const errors = {};
      if (!productForm.productname) errors.productname = 'Product name is required';
      if (!productForm.productprice) errors.productprice = 'Price is required';
      if (!productForm.product_type) errors.product_type = 'Product type is required';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoading(false);
        return;
      }      // Create FormData for file upload
      const formData = new FormData();
      formData.append('productname', productForm.productname);
      formData.append('productdescription', productForm.productdescription);
      formData.append('productprice', productForm.productprice);
      formData.append('product_type', productForm.product_type);
      formData.append('productcolor', productForm.productcolor);
      formData.append('sizes', productForm.sizes);
      formData.append('productstatus', productForm.productstatus);
      
      // Append variants data
      if (productForm.variants && productForm.variants.length > 0) {
        formData.append('variants', JSON.stringify(productForm.variants));
      }
      
      // Append multiple images
      if (productForm.productimages && productForm.productimages.length > 0) {
        productForm.productimages.forEach((image, index) => {
          formData.append('productimages', image);
        });
      }

      const response = await fetch('http://localhost:3001/api/maintenance/products', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();      if (response.ok) {
        setSuccessMessage(`Product "${productForm.productname}" added successfully!`);        setProductForm({
          productname: '',
          productdescription: '',
          productprice: '',
          product_type: '',
          productcolor: '',
          sizes: '',
          productimages: [], // Reset to empty array
          productstatus: 'active',
          variants: []
        });
        setNewVariant({
          size: '',
          color: '',
          stock: 0
        });
        fetchProducts(); // Refresh product list
        toast.success('Product added successfully!');
      } else {
        setFormErrors({ submit: data.message || 'Failed to add product' });
        toast.error(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setFormErrors({ submit: 'Network error. Please try again.' });
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleProductInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && name === 'productimages') {
      // Handle multiple file uploads (max 10 images)
      const selectedFiles = Array.from(files);
      if (selectedFiles.length > 10) {
        toast.error('Maximum 10 images allowed');
        return;
      }
      
      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }
      
      // Validate file sizes (max 5MB per image)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        toast.error('Each image must be less than 5MB');
        return;
      }
      
      setProductForm(prev => ({
        ...prev,
        productimages: selectedFiles
      }));
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: type === 'file' ? files[0] : value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }  };

  // Handle image files with validation
  const handleImageFiles = (files) => {
    const validFiles = [];
    const maxFiles = 10;
    const maxSizePerFile = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // Check total count including existing images
    const currentCount = productForm.productimages.length;
    const filesToAdd = Math.min(files.length, maxFiles - currentCount);
    
    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        console.warn(`File ${file.name} is not a supported image type`);
        continue;
      }
      
      // Validate file size
      if (file.size > maxSizePerFile) {
        console.warn(`File ${file.name} is too large (max 5MB)`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setProductForm(prev => ({
        ...prev,
        productimages: [...prev.productimages, ...validFiles]
      }));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  // File input change handler
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleImageFiles(files);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  // Handle removing individual images
  const removeImage = (indexToRemove) => {
    setProductForm(prev => ({
      ...prev,
      productimages: prev.productimages.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Color mapping for display
  const getColorCode = (colorName) => {
    const colorMap = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#dc3545',
      'blue': '#007bff',
      'green': '#28a745',
      'yellow': '#ffc107',
      'orange': '#fd7e14',
      'purple': '#6f42c1',
      'pink': '#e83e8c',
      'gray': '#6c757d',
      'grey': '#6c757d',
      'brown': '#8b4513',
      'navy': '#001f3f',
      'teal': '#20c997',
      'cyan': '#17a2b8'
    };
    
    return colorMap[colorName.toLowerCase()] || '#333333';
  };

  // Calculate total stock
  const getTotalStock = () => {
    return productForm.variants.reduce((total, variant) => total + parseInt(variant.stock || 0), 0);
  };

  // Add new variant
  const addVariant = () => {
    if (!newVariant.size || !newVariant.color) {
      return;
    }

    // Check if this size/color combination already exists
    const exists = productForm.variants.find(v => 
      v.size.toLowerCase() === newVariant.size.toLowerCase() && 
      v.color.toLowerCase() === newVariant.color.toLowerCase()
    );

    if (exists) {
      return;
    }

    setProductForm(prev => ({
      ...prev,
      variants: [...prev.variants, {
        size: newVariant.size.toUpperCase(),
        color: newVariant.color.toLowerCase(),
        stock: parseInt(newVariant.stock) || 0
      }]
    }));

    setNewVariant({
      size: '',
      color: '',
      stock: 0
    });
  };

  // Remove variant
  const removeVariant = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Update variant stock
  const updateVariantStock = (index, stock) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, stock: parseInt(stock) || 0 } : variant
      )
    }));
  };

  // Handle new variant input changes
  const handleNewVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <PageContainer>
      <TopBar />
      <ContentWrapper>
        <Header>
          <Title>Registration Panel</Title>
          <Subtitle>Register new users and add products to the system</Subtitle>
        </Header>

        <TabContainer>
          <Tab 
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            <FontAwesomeIcon icon={faUser} />
            User Registration
          </Tab>
          <Tab 
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
          >
            <FontAwesomeIcon icon={faBox} />
            Product Registration
          </Tab>
        </TabContainer>

        {activeTab === 'users' && (
          <>
            <FormSection>
              <SectionTitle>
                <FontAwesomeIcon icon={faUserShield} />
                Register New User
              </SectionTitle>

              {formErrors.submit && <ErrorMessage>{formErrors.submit}</ErrorMessage>}
              {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

              <form onSubmit={handleUserSubmit}>
                <FormGrid>
                  <FormGroup>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserInputChange}
                      placeholder="Enter email address"
                      required
                    />
                    {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Role *</Label>
                    <Select
                      name="role"
                      value={userForm.role}
                      onChange={handleUserInputChange}
                      required
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>First Name *</Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={userForm.firstName}
                      onChange={handleUserInputChange}
                      placeholder="Enter first name"
                      required
                    />
                    {formErrors.firstName && <ErrorMessage>{formErrors.firstName}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Last Name *</Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={userForm.lastName}
                      onChange={handleUserInputChange}
                      placeholder="Enter last name"
                      required
                    />
                    {formErrors.lastName && <ErrorMessage>{formErrors.lastName}</ErrorMessage>}
                  </FormGroup>                  <FormGroup>
                    <Label>Password *</Label>
                    <PasswordContainer>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={userForm.password}
                        onChange={handleUserInputChange}
                        placeholder="Enter password (min 8 chars, uppercase, lowercase, number, special char)"
                        required
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </PasswordToggle>
                    </PasswordContainer>
                    {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Confirm Password *</Label>
                    <PasswordContainer>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={userForm.confirmPassword}
                        onChange={handleUserInputChange}
                        placeholder="Re-enter password"
                        required
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </PasswordToggle>
                    </PasswordContainer>
                    {formErrors.confirmPassword && <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>}
                  </FormGroup>
                </FormGrid>

                <ButtonGroup>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <LoadingSpinner /> : <FontAwesomeIcon icon={faPlus} />}
                    {loading ? 'Registering...' : 'Register User'}
                  </Button>
                </ButtonGroup>
              </form>
            </FormSection>

            {/* Users List */}
            <FormSection>
              <SectionTitle>
                <FontAwesomeIcon icon={faUserCheck} />
                Registered Users ({users.length})
              </SectionTitle>

              {users.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px', 
                  color: '#666666',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <FontAwesomeIcon icon={faUserShield} size="3x" style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 500 }}>No Users Available</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Please ensure you are logged in as an admin to view registered users.
                  </p>
                </div>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>Name</TableHeader>
                      <TableHeader>Email</TableHeader>
                      <TableHeader>Role</TableHeader>
                      <TableHeader>Registration Date</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              )}
            </FormSection>
          </>
        )}

        {activeTab === 'products' && (
          <>
            <FormSection>
              <SectionTitle>
                <FontAwesomeIcon icon={faBox} />
                Add New Product
              </SectionTitle>

              {formErrors.submit && <ErrorMessage>{formErrors.submit}</ErrorMessage>}
              {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

              <form onSubmit={handleProductSubmit}>
                <FormGrid>
                  <FormGroup>
                    <Label>Product Name *</Label>
                    <Input
                      type="text"
                      name="productname"
                      value={productForm.productname}
                      onChange={handleProductInputChange}
                      placeholder="Enter product name"
                      required
                    />
                    {formErrors.productname && <ErrorMessage>{formErrors.productname}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      name="productprice"
                      value={productForm.productprice}
                      onChange={handleProductInputChange}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                    {formErrors.productprice && <ErrorMessage>{formErrors.productprice}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Product Type *</Label>
                    <Select
                      name="product_type"
                      value={productForm.product_type}
                      onChange={handleProductInputChange}
                      required
                    >
                      <option value="">Select product type</option>
                      {productTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Select>
                    {formErrors.product_type && <ErrorMessage>{formErrors.product_type}</ErrorMessage>}
                  </FormGroup>                  <FormGroup>
                    <Label>Status</Label>
                    <Select
                      name="productstatus"
                      value={productForm.productstatus}
                      onChange={handleProductInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Base Color</Label>
                    <Input
                      type="text"
                      name="productcolor"
                      value={productForm.productcolor}
                      onChange={handleProductInputChange}
                      placeholder="Enter base color"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Available Sizes</Label>
                    <Input
                      type="text"
                      name="sizes"
                      value={productForm.sizes}
                      onChange={handleProductInputChange}
                      placeholder="e.g., XS, S, M, L, XL"
                    />
                  </FormGroup>
                </FormGrid>

                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    name="productdescription"
                    value={productForm.productdescription}
                    onChange={handleProductInputChange}
                    placeholder="Enter product description"
                  />
                </FormGroup>

                {/* Image Upload Section */}
                <FormGroup>
                  <Label>Product Images</Label>
                  <DropZone
                    isDragOver={isDragOver}
                    hasFiles={productForm.productimages.length > 0}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('imageFileInput').click()}
                  >
                    <UploadIcon>
                      <FontAwesomeIcon icon={faCloudUploadAlt} />
                    </UploadIcon>
                    <UploadText>
                      {productForm.productimages.length > 0 
                        ? `${productForm.productimages.length} image(s) selected`
                        : 'Drop images here or click to browse'
                      }
                    </UploadText>
                    <UploadSubtext>
                      Supports: JPEG, PNG, GIF, WebP (Max 10 images, 5MB each)
                    </UploadSubtext>
                    <BrowseButton type="button">
                      Choose Files
                    </BrowseButton>
                    <HiddenFileInput
                      id="imageFileInput"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                    />
                  </DropZone>

                  {productForm.productimages.length > 0 && (
                    <ImagePreviewGrid>
                      {productForm.productimages.map((image, index) => (
                        <ImagePreview key={index}>
                          <PreviewImage 
                            src={URL.createObjectURL(image)} 
                            alt={`Preview ${index + 1}`}
                          />
                          <RemoveImageButton 
                            type="button"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </RemoveImageButton>
                          <ImageCounter>
                            {index + 1}
                          </ImageCounter>
                        </ImagePreview>
                      ))}
                    </ImagePreviewGrid>
                  )}
                </FormGroup>

                {/* Size & Color Variants Section */}
                <VariantsSection>
                  <VariantsHeader>
                    <VariantsTitle>Size & Color Variants</VariantsTitle>
                    <TotalStock>
                      Total Stock: {getTotalStock()}
                    </TotalStock>
                  </VariantsHeader>

                  {productForm.variants.map((variant, index) => (
                    <VariantRow key={index}>
                      <SizeLabel>{variant.size}</SizeLabel>
                      <ColorDot color={getColorCode(variant.color)} />
                      <ColorName>{variant.color}</ColorName>
                      <StockInput
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariantStock(index, e.target.value)}
                        min="0"
                        placeholder="Stock"
                      />
                      <RemoveVariantButton
                        type="button"
                        onClick={() => removeVariant(index)}
                      >
                        ×
                      </RemoveVariantButton>
                    </VariantRow>
                  ))}

                  <AddVariantSection>
                    <FormGroup style={{ margin: 0 }}>
                      <Label>Size</Label>
                      <AddVariantInput
                        type="text"
                        name="size"
                        value={newVariant.size}
                        onChange={handleNewVariantChange}
                        placeholder="e.g., M, L, XL"
                      />
                    </FormGroup>
                    <FormGroup style={{ margin: 0 }}>
                      <Label>Color</Label>
                      <AddVariantInput
                        type="text"
                        name="color"
                        value={newVariant.color}
                        onChange={handleNewVariantChange}
                        placeholder="e.g., black, red"
                      />
                    </FormGroup>
                    <FormGroup style={{ margin: 0 }}>
                      <Label>Stock</Label>
                      <AddVariantInput
                        type="number"
                        name="stock"
                        value={newVariant.stock}
                        onChange={handleNewVariantChange}
                        min="0"
                        placeholder="0"
                      />
                    </FormGroup>
                    <AddVariantButton
                      type="button"
                      variant="success"
                      onClick={addVariant}
                      disabled={!newVariant.size || !newVariant.color}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Add Variant
                    </AddVariantButton>
                  </AddVariantSection>
                </VariantsSection>

                <ButtonGroup>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <LoadingSpinner /> : <FontAwesomeIcon icon={faPlus} />}
                    {loading ? 'Adding Product...' : 'Add Product'}
                  </Button>
                </ButtonGroup>
              </form>
            </FormSection>

            {/* Products List */}
            <FormSection>
              <SectionTitle>
                <FontAwesomeIcon icon={faBox} />
                Products ({products.length})
              </SectionTitle>

              {products.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px', 
                  color: '#666666',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <FontAwesomeIcon icon={faBox} size="3x" style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 500 }}>No Products Available</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Add your first product using the form above.
                  </p>
                </div>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>Product Name</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Price</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Date Added</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.productname}</TableCell>
                        <TableCell style={{ textTransform: 'capitalize' }}>
                          {product.product_type}
                        </TableCell>
                        <TableCell>${parseFloat(product.productprice).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.productstatus}>
                            {product.productstatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(product.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              )}

              {products.length > 10 && (
                <p style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
                  Showing first 10 products. View all products in the Products page.
                </p>
              )}
            </FormSection>
          </>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default RegistrationPage;
