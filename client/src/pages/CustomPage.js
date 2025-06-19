import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faTimes, 
  faImage, 
  faPalette,
  faShirt,
  faPaperPlane,
  faCheck,
  faHourglass,
  faExclamationTriangle,
  faShoppingCart,
  faDownload,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';
import api from '../utils/api';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 40px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666666;
  margin: 16px 0 0 0;
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FormContainer = styled.div`
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  padding: 40px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 400;
  color: #000000;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
  
  &::placeholder {
    color: #999999;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  font-size: 16px;
  background-color: #ffffff;
  cursor: pointer;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const TextArea = styled.textarea`
  padding: 16px;
  border: 1px solid #e0e0e0;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
  
  &::placeholder {
    color: #999999;
  }
`;

const ImageUploadSection = styled.div`
  border: 2px dashed #e0e0e0;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #fafafa;
  
  &:hover {
    border-color: #000000;
    background-color: #f5f5f5;
  }
  
  &.dragover {
    border-color: #000000;
    background-color: #f0f0f0;
  }
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  color: #666666;
  margin: 16px 0;
  font-weight: 300;
`;

const UploadSubtext = styled.div`
  font-size: 14px;
  color: #999999;
  margin-top: 8px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  background-color: #f9f9f9;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }
`;

const SubmitButton = styled.button`
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  
  &:hover {
    background-color: #333333;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 20px;
  margin-bottom: 32px;
  
  h3 {
    margin: 0 0 12px 0;
    color: #000000;
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: #666666;
    line-height: 1.6;
  }
  
  li {
    margin-bottom: 6px;
  }
`;

// TabContainer component for navigation
const TabContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.active ? '#000000' : '#666666'};
  cursor: pointer;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #000000;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: #000000;
    
    &:after {
      transform: scaleX(1);
    }
  }
`;

// Design card component for viewing designs
const DesignCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DesignHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DesignTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const DesignStatus = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch(props.status) {
      case 'pending': return '#FFF9C4';
      case 'approved': return '#C8E6C9';
      case 'rejected': return '#FFCDD2';
      case 'in_progress': return '#BBDEFB';
      case 'completed': return '#B2DFDB';
      default: return '#E0E0E0';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'pending': return '#F57F17';
      case 'approved': return '#1B5E20';
      case 'rejected': return '#B71C1C';
      case 'in_progress': return '#0D47A1';
      case 'completed': return '#004D40';
      default: return '#424242';
    }
  }};
`;

const DesignContent = styled.div`
  padding: 16px;
`;

const CustomPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'designs'
  const [userDesigns, setUserDesigns] = useState([]);
  const [allDesigns, setAllDesigns] = useState([]); // For admin to view all designs
  const [images, setImages] = useState([]);
  const [isAdminView, setIsAdminView] = useState(false);
  
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    productType: '',
    size: '',
    color: '',
    quantity: 1,
    price: 0,
    designConcept: '',
    specialRequirements: '',
    notes: ''
  });

  // Check if user is authenticated
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if the user is accessing the admin route
    const isAdminRoute = location.pathname.includes('/admin');
    setIsAdminView(currentUser.role === 'admin' && isAdminRoute);
  }, [currentUser, navigate, location.pathname]);
  // Load designs based on user role
  useEffect(() => {
    if (currentUser && activeTab === 'designs') {
      if (isAdminView) {
        // Admin sees all designs
        loadAllDesigns();
      } else {
        // Normal users only see their own designs
        loadUserDesigns();
      }
    }
  }, [currentUser, activeTab, isAdminView]);

  const loadUserDesigns = async () => {
    try {
      const response = await api.get('/api/custom-designs/user');
      if (response.data.success) {
        setUserDesigns(response.data.data);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
      toast.error('Failed to load your designs');
    }
  };

  const loadAllDesigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/custom-designs/all');
      if (response.data.success) {
        setAllDesigns(response.data.data);
      } else {
        toast.error('Failed to load designs');
      }
    } catch (error) {
      console.error('Error loading all designs:', error);
      toast.error('Failed to load designs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed (1 concept + 3 reference images)');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.productType || !formData.designConcept) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one concept image');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add images with specific names
      images.forEach((img, index) => {
        if (index === 0) {
          submitData.append('conceptImage', img.file);
        } else {
          submitData.append(`referenceImage${index}`, img.file);
        }
      });

      const response = await api.post('/api/custom-designs/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Custom design submitted successfully! We will review it and get back to you soon.');
        // Reset form
        setFormData({
          productName: '',
          productDescription: '',
          productType: '',
          size: '',
          color: '',
          quantity: 1,
          price: 0,
          designConcept: '',
          specialRequirements: '',
          notes: ''
        });
        setImages([]);
        
        // Switch to designs tab to show the submitted design
        setActiveTab('designs');
        loadUserDesigns();
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit design request');
    } finally {
      setLoading(false);
    }
  };

  const createOrderFromDesign = async (designId) => {
    const address = prompt('Please enter your shipping address:');
    if (!address) return;

    const phone = prompt('Please enter your contact phone number (optional):');

    try {
      setLoading(true);
      const response = await api.post(`/api/custom-designs/order/${designId}`, {
        shippingAddress: address,
        contactPhone: phone,
        orderNotes: 'Cash on Delivery order'
      });

      if (response.data.success) {
        toast.success('Order created successfully!');
        // Generate and download invoice
        downloadInvoice(response.data.data);
        loadUserDesigns();
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (orderData) => {
    // Create invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Seven Four Clothing - Custom Design Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin: 20px 0; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Seven Four Clothing</h1>
          <h2>Custom Design Invoice</h2>
        </div>
        <div class="invoice-details">
          <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          <p><strong>Design ID:</strong> ${orderData.designId}</p>
          <p><strong>Customer:</strong> ${currentUser.first_name} ${currentUser.last_name}</p>
          <p><strong>Email:</strong> ${currentUser.email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          <hr>
          <p class="total"><strong>Total Amount: ₱${orderData.totalAmount}</strong></p>
          <hr>
          <p><strong>Note:</strong> Payment will be collected upon delivery. Please have the exact amount ready.</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the invoice
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderData.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  // If not logged in
  if (!currentUser) {
    return null;
  }

  return (
    <PageContainer>      <TopBar />
      <ContentWrapper>
        <Header>
          {isAdminView ? (
            <>
              <Title>Custom Design Management</Title>
              <Subtitle>
                Review and manage custom design requests from customers. Approve designs, update statuses, and manage the design workflow.
              </Subtitle>
            </>
          ) : (
            <>
              <Title>Custom Design Request</Title>
              <Subtitle>
                Bring your unique clothing ideas to life. Upload your designs and let our team create something special just for you.
              </Subtitle>
            </>
          )}
        </Header>

        {!isAdminView && (
          <InfoBox>
            <h3>How It Works</h3>
            <ul>
              <li>Upload up to 10 design images (sketches, inspirations, or reference photos)</li>
              <li>Provide detailed descriptions of your vision</li>
              <li>Our design team will review your request within 2-3 business days</li>
              <li>Once approved, we'll provide a detailed quote and timeline</li>
              <li>Upon confirmation, we'll begin crafting your custom piece</li>
            </ul>
          </InfoBox>
        )}
          {isAdminView && (
          <InfoBox>
            <h3>Admin Design Management</h3>
            <ul>
              <li>Review all customer design requests</li>
              <li>Approve or reject designs based on feasibility</li>
              <li>Update design statuses as they progress through production</li>
              <li>Communicate with customers about their designs</li>
              <li>Generate quotes and manage the custom design workflow</li>
            </ul>
          </InfoBox>
        )}
        
        {/* Tab navigation - different tabs for admin and regular users */}
        <TabContainer>
          {isAdminView ? (
            <>
              <Tab 
                active={activeTab === 'pending'} 
                onClick={() => setActiveTab('pending')}
              >
                Pending Designs
              </Tab>
              <Tab 
                active={activeTab === 'approved'} 
                onClick={() => setActiveTab('approved')}
              >
                Approved Designs
              </Tab>
              <Tab 
                active={activeTab === 'all'} 
                onClick={() => setActiveTab('all')}
              >
                All Designs
              </Tab>
            </>
          ) : (
            <>
              <Tab 
                active={activeTab === 'submit'} 
                onClick={() => setActiveTab('submit')}
              >
                Submit Design
              </Tab>
              <Tab 
                active={activeTab === 'designs'} 
                onClick={() => setActiveTab('designs')}
              >
                My Designs
              </Tab>
            </>
          )}
        </TabContainer>

        {/* Admin design view */}
        {isAdminView && (
          <div>
            {loading ? (
              <p>Loading designs...</p>
            ) : allDesigns.length === 0 ? (
              <p>No designs found.</p>
            ) : (
              allDesigns.filter(design => 
                (activeTab === 'all') || 
                (activeTab === 'pending' && design.status === 'pending') || 
                (activeTab === 'approved' && design.status === 'approved')
              ).map(design => (
                <DesignCard key={design.id}>
                  <DesignHeader>
                    <DesignTitle>{design.designName || 'Untitled Design'}</DesignTitle>
                    <DesignStatus status={design.status}>
                      {design.status.replace('_', ' ').toUpperCase()}
                    </DesignStatus>
                  </DesignHeader>
                  <DesignContent>
                    <p><strong>Customer:</strong> {design.customerName}</p>
                    <p><strong>Submitted:</strong> {new Date(design.createdAt).toLocaleDateString()}</p>
                    <p><strong>Category:</strong> {design.category}</p>
                    <p><strong>Description:</strong> {design.description}</p>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px'}}>
                      <button>View Details</button>
                      {design.status === 'pending' && (
                        <>
                          <button style={{background: '#4CAF50', color: 'white'}}>Approve</button>
                          <button style={{background: '#F44336', color: 'white'}}>Reject</button>
                        </>
                      )}
                    </div>
                  </DesignContent>
                </DesignCard>
              ))
            )}
          </div>
        )}

        {/* Regular user form - only visible to non-admin or when in submit tab */}
        {!isAdminView && activeTab === 'submit' && (
          <FormContainer>
            <form onSubmit={handleSubmit}>
            <Section>
              <SectionTitle>
                <FontAwesomeIcon icon={faPalette} />
                Design Information
              </SectionTitle>
              
              <FormGrid>
                <FormGroup>
                  <Label>Design Name *</Label>
                  <Input
                    type="text"
                    name="designName"
                    value={formData.designName}
                    onChange={handleInputChange}
                    placeholder="Give your design a name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="t-shirts">T-Shirts</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="jackets">Jackets</option>
                    <option value="pants">Pants</option>
                    <option value="dresses">Dresses</option>
                    <option value="accessories">Accessories</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Preferred Color</Label>
                  <Input
                    type="text"
                    name="preferredColor"
                    value={formData.preferredColor}
                    onChange={handleInputChange}
                    placeholder="e.g., Black, Navy Blue, Custom"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Size</Label>
                  <Select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                  >
                    <option value="">Select size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="custom">Custom Size</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Budget Range</Label>
                  <Select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                  >
                    <option value="">Select budget range</option>
                    <option value="500-1000">₱500 - ₱1,000</option>
                    <option value="1000-2500">₱1,000 - ₱2,500</option>
                    <option value="2500-5000">₱2,500 - ₱5,000</option>
                    <option value="5000+">₱5,000+</option>
                    <option value="discuss">Let's Discuss</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Urgency</Label>
                  <Select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                  >
                    <option value="normal">Normal (2-3 weeks)</option>
                    <option value="rush">Rush (1-2 weeks)</option>
                    <option value="express">Express (3-5 days)</option>
                  </Select>
                </FormGroup>
              </FormGrid>
            </Section>

            <Section>
              <SectionTitle>
                <FontAwesomeIcon icon={faImage} />
                Design Images
              </SectionTitle>
              
              <ImageUploadSection
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('imageInput').click()}
              >
                <FontAwesomeIcon icon={faUpload} size="2x" color="#999999" />
                <UploadText>
                  Click to upload or drag and drop your design images
                </UploadText>
                <UploadSubtext>
                  Maximum 10 images, 5MB each (JPG, PNG, GIF)
                </UploadSubtext>
                <HiddenInput
                  id="imageInput"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </ImageUploadSection>

              {images.length > 0 && (
                <ImagePreviewGrid>
                  {images.map((img) => (
                    <ImagePreview key={img.id}>
                      <PreviewImage src={img.preview} alt="Design preview" />
                      <RemoveButton onClick={() => removeImage(img.id)}>
                        <FontAwesomeIcon icon={faTimes} />
                      </RemoveButton>
                    </ImagePreview>
                  ))}
                </ImagePreviewGrid>
              )}
            </Section>

            <Section>
              <SectionTitle>
                <FontAwesomeIcon icon={faShirt} />
                Design Description
              </SectionTitle>
              
              <FormGroup>
                <Label>Detailed Description *</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your design in detail. Include materials, style, fit, colors, patterns, or any specific requirements..."
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Special Requests</Label>
                <TextArea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requests, modifications, or additional notes for our design team..."
                />
              </FormGroup>
            </Section>

            <SubmitButton type="submit" disabled={loading}>
              <FontAwesomeIcon icon={faPaperPlane} />
              {loading ? 'Submitting...' : 'Submit Design Request'}
            </SubmitButton>
          </form>
        </FormContainer>

        {isAdminView && (
          <>
            <TabContainer>
              <Tab
                active={activeTab === 'designs'}
                onClick={() => setActiveTab('designs')}
              >
                All Designs
              </Tab>
              <Tab
                active={activeTab === 'submitted'}
                onClick={() => setActiveTab('submitted')}
              >
                Submitted Designs
              </Tab>
            </TabContainer>

            {activeTab === 'designs' && (
              <>
                {loading && <p>Loading designs...</p>}
                
                {!loading && allDesigns.length === 0 && (
                  <p>No designs found.</p>
                )}

                {!loading && allDesigns.length > 0 && (
                  <div>
                    {allDesigns.map(design => (
                      <DesignCard key={design._id}>
                        <DesignHeader>
                          <DesignTitle>{design.productName}</DesignTitle>
                          <DesignStatus status={design.status}>
                            {design.status.charAt(0).toUpperCase() + design.status.slice(1)}
                          </DesignStatus>
                        </DesignHeader>

                        <DesignContent>
                          <p><strong>Customer:</strong> {design.customerName}</p>
                          <p><strong>Email:</strong> {design.customerEmail}</p>
                          <p><strong>Phone:</strong> {design.customerPhone || 'N/A'}</p>
                          <p><strong>Address:</strong> {design.shippingAddress}</p>
                          <p><strong>Design Concept:</strong> {design.designConcept}</p>
                          <p><strong>Special Requirements:</strong> {design.specialRequirements || 'None'}</p>
                          <p><strong>Notes:</strong> {design.notes || 'None'}</p>
                          
                          <button onClick={() => createOrderFromDesign(design._id)}>
                            <FontAwesomeIcon icon={faShoppingCart} />
                            Create Order
                          </button>
                        </DesignContent>
                      </DesignCard>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'submitted' && (
              <>
                {loading && <p>Loading your designs...</p>}
                
                {!loading && userDesigns.length === 0 && (
                  <p>No submitted designs found.</p>
                )}

                {!loading && userDesigns.length > 0 && (
                  <div>
                    {userDesigns.map(design => (
                      <DesignCard key={design._id}>
                        <DesignHeader>
                          <DesignTitle>{design.productName}</DesignTitle>
                          <DesignStatus status={design.status}>
                            {design.status.charAt(0).toUpperCase() + design.status.slice(1)}
                          </DesignStatus>
                        </DesignHeader>

                        <DesignContent>
                          <p><strong>Customer:</strong> {design.customerName}</p>
                          <p><strong>Email:</strong> {design.customerEmail}</p>
                          <p><strong>Phone:</strong> {design.customerPhone || 'N/A'}</p>
                          <p><strong>Address:</strong> {design.shippingAddress}</p>
                          <p><strong>Design Concept:</strong> {design.designConcept}</p>
                          <p><strong>Special Requirements:</strong> {design.specialRequirements || 'None'}</p>
                          <p><strong>Notes:</strong> {design.notes || 'None'}</p>
                          
                          <button onClick={() => createOrderFromDesign(design._id)}>
                            <FontAwesomeIcon icon={faShoppingCart} />
                            Create Order
                          </button>
                        </DesignContent>
                      </DesignCard>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default CustomPage;
