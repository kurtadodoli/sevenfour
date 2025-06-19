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
  font-size: 1.25rem;
  color: #666666;
  max-width: 800px;
  margin: 16px auto 0;
`;

const InfoBox = styled.div`
  background-color: #f8f8f8;
  border-left: 4px solid #000000;
  padding: 24px;
  margin-bottom: 40px;
  border-radius: 4px;
  
  h3 {
    margin-top: 0;
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
  }
`;

// Tab navigation components
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

// Design cards for viewing designs
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

const FormContainer = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 32px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
  }
`;

const ImageUploadSection = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  
  &:hover {
    border-color: #000000;
    background-color: #f9f9f9;
  }
  
  &.dragover {
    border-color: #000000;
    background-color: #f0f0f0;
  }
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  margin: 16px 0 8px;
  color: #333333;
`;

const UploadSubtext = styled.p`
  font-size: 0.9rem;
  color: #666666;
  margin: 0;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1;
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const SubmitButton = styled.button`
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #333333;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    margin-right: 6px;
  }
`;

const CustomPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'designs' for regular users, 'pending', 'approved', 'all' for admin
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

  // Check if user is authenticated and detect admin view
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if the user is accessing the admin route
    const isAdminRoute = location.pathname.includes('/admin');
    setIsAdminView(currentUser.role === 'admin' && isAdminRoute);
    
    // For admin view, default to showing designs
    if (isAdminRoute && currentUser.role === 'admin') {
      setActiveTab('pending');
    }
  }, [currentUser, navigate, location.pathname]);

  // Load designs based on user role
  useEffect(() => {
    if (currentUser) {
      if (isAdminView) {
        if (activeTab === 'pending' || activeTab === 'approved' || activeTab === 'all') {
          loadAllDesigns();
        }
      } else if (activeTab === 'designs') {
        loadUserDesigns();
      }
    }
  }, [currentUser, activeTab, isAdminView]);

  const loadAllDesigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/custom-designs/all');
      if (response.data.success) {
        setAllDesigns(response.data.data || []);
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

  const loadUserDesigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/custom-designs/user');
      if (response.data.success) {
        setUserDesigns(response.data.data || []);
      } else {
        toast.error('Failed to load your designs');
      }
    } catch (error) {
      console.error('Error loading designs:', error);
      toast.error('Failed to load your designs');
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

  // Admin functions
  const approveDesign = async (designId) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/custom-designs/${designId}/approve`);
      
      if (response.data.success) {
        toast.success('Design approved successfully');
        loadAllDesigns();
      } else {
        toast.error('Failed to approve design');
      }
    } catch (error) {
      console.error('Error approving design:', error);
      toast.error('Failed to approve design');
    } finally {
      setLoading(false);
    }
  };
  
  const rejectDesign = async (designId) => {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason === null) return; // User canceled
    
    try {
      setLoading(true);
      const response = await api.put(`/api/custom-designs/${designId}/reject`, { reason });
      
      if (response.data.success) {
        toast.success('Design rejected');
        loadAllDesigns();
      } else {
        toast.error('Failed to reject design');
      }
    } catch (error) {
      console.error('Error rejecting design:', error);
      toast.error('Failed to reject design');
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, return null
  if (!currentUser) {
    return null;
  }

  return (
    <PageContainer>
      <TopBar />
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
        
        {/* Tab navigation */}
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
                <DesignCard key={design.id || design._id}>
                  <DesignHeader>
                    <DesignTitle>{design.designName || design.productName || 'Untitled Design'}</DesignTitle>
                    <DesignStatus status={design.status || 'pending'}>
                      {(design.status || 'pending').toUpperCase()}
                    </DesignStatus>
                  </DesignHeader>
                  <DesignContent>
                    <p><strong>Customer:</strong> {design.customerName || `${design.firstName} ${design.lastName}` || 'Unknown'}</p>
                    <p><strong>Submitted:</strong> {new Date(design.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p><strong>Category:</strong> {design.category || design.productType || 'N/A'}</p>
                    <p><strong>Description:</strong> {design.description || design.designConcept || 'No description'}</p>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px'}}>
                      <button onClick={() => window.open(`/design-details/${design.id || design._id}`, '_blank')}>
                        <FontAwesomeIcon icon={faEye} /> View Details
                      </button>
                      {(design.status === 'pending' || !design.status) && (
                        <>
                          <button 
                            style={{background: '#4CAF50', color: 'white'}}
                            onClick={() => approveDesign(design.id || design._id)}
                          >
                            Approve
                          </button>
                          <button 
                            style={{background: '#F44336', color: 'white'}}
                            onClick={() => rejectDesign(design.id || design._id)}
                          >
                            Reject
                          </button>
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
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      placeholder="Give your design a name"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Category *</Label>
                    <Select
                      name="productType"
                      value={formData.productType}
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
                      name="color"
                      value={formData.color}
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
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                    >
                      <option value="0">Select budget range</option>
                      <option value="750">₱500 - ₱1,000</option>
                      <option value="1750">₱1,000 - ₱2,500</option>
                      <option value="3750">₱2,500 - ₱5,000</option>
                      <option value="5000">₱5,000+</option>
                      <option value="0">Let's Discuss</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                    />
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
                    Maximum 4 images, 5MB each (JPG, PNG, GIF)
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
                    name="designConcept"
                    value={formData.designConcept}
                    onChange={handleInputChange}
                    placeholder="Describe your design in detail. Include materials, style, fit, colors, patterns, or any specific requirements..."
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Special Requests</Label>
                  <TextArea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Any special requests, modifications, or additional notes for our design team..."
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Additional Notes</Label>
                  <TextArea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any other information you'd like to provide..."
                  />
                </FormGroup>
              </Section>

              <SubmitButton type="submit" disabled={loading}>
                <FontAwesomeIcon icon={faPaperPlane} />
                {loading ? 'Submitting...' : 'Submit Design Request'}
              </SubmitButton>
            </form>
          </FormContainer>
        )}
        
        {/* User designs view - only visible when not in admin view and in designs tab */}
        {!isAdminView && activeTab === 'designs' && (
          <div>
            {loading ? (
              <p>Loading your designs...</p>
            ) : userDesigns.length === 0 ? (
              <p>You haven't submitted any designs yet.</p>
            ) : (
              userDesigns.map(design => (
                <DesignCard key={design.id || design._id}>
                  <DesignHeader>
                    <DesignTitle>{design.designName || design.productName || 'Untitled Design'}</DesignTitle>
                    <DesignStatus status={design.status || 'pending'}>
                      {(design.status || 'pending').toUpperCase()}
                    </DesignStatus>
                  </DesignHeader>
                  <DesignContent>
                    <p><strong>Submitted:</strong> {new Date(design.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p><strong>Category:</strong> {design.category || design.productType || 'N/A'}</p>
                    <p><strong>Description:</strong> {design.description || design.designConcept || 'No description'}</p>
                    <p><strong>Status:</strong> {design.statusText || (
                      design.status === 'pending' ? 'Awaiting review by our design team' :
                      design.status === 'approved' ? 'Approved - We\'ll contact you soon' :
                      design.status === 'rejected' ? 'Not feasible - see comments' :
                      design.status === 'in_progress' ? 'In production' :
                      design.status === 'completed' ? 'Ready for pickup/delivery' :
                      'Processing'
                    )}</p>
                    {design.feedback && (
                      <p><strong>Feedback:</strong> {design.feedback}</p>
                    )}
                  </DesignContent>
                </DesignCard>
              ))
            )}
          </div>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default CustomPage;
