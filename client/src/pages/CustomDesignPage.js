import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPalette, 
  faUpload, 
  faShirt, 
  faTimes, 
  faCheck,
  faUser,
  faEnvelope,
  faPhone,
  faMessage,
  faDollarSign,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const CustomDesignPage = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    customerName: currentUser?.first_name && currentUser?.last_name ? 
      `${currentUser.first_name} ${currentUser.last_name}` : '',
    customerEmail: currentUser?.email || '',
    customerPhone: '',
    garmentType: 'T-Shirt',
    baseColor: '#FFFFFF',
    designDescription: '',
    customMessage: '',
    urgency: 'normal',
    designImage: null
  });
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(35.00);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const garmentOptions = [
    { value: 'T-Shirt', label: 'T-Shirt', basePrice: 35 },
    { value: 'Hoodie', label: 'Hoodie', basePrice: 65 },
    { value: 'Tank Top', label: 'Tank Top', basePrice: 30 },
    { value: 'Sweatshirt', label: 'Sweatshirt', basePrice: 55 },
    { value: 'Long Sleeve', label: 'Long Sleeve', basePrice: 40 },
    { value: 'Polo Shirt', label: 'Polo Shirt', basePrice: 45 }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Standard (2-3 weeks)', multiplier: 1 },
    { value: 'normal', label: 'Rush (1-2 weeks)', multiplier: 1.2 },
    { value: 'high', label: 'Express (3-5 days)', multiplier: 1.5 }
  ];

  // Calculate estimated price based on selections
  React.useEffect(() => {
    const garment = garmentOptions.find(g => g.value === formData.garmentType);
    const urgency = urgencyOptions.find(u => u.value === formData.urgency);
    const basePrice = garment?.basePrice || 35;
    const multiplier = urgency?.multiplier || 1;
    const designComplexity = 1.2; // Additional cost for custom design
    
    setEstimatedPrice(Math.round(basePrice * multiplier * designComplexity * 100) / 100);
  }, [formData.garmentType, formData.urgency]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, designImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Custom Design Request:', formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting design request:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Container>
        <SuccessMessage>
          <FontAwesomeIcon icon={faCheck} className="success-icon" />
          <h2>Request Submitted Successfully!</h2>
          <p>Thank you for your custom design request. We'll review your requirements and get back to you within 24 hours with a detailed quote and timeline.</p>
          <div className="order-summary">
            <h3>Order Summary</h3>
            <p><strong>Design Type:</strong> {formData.garmentType}</p>
            <p><strong>Estimated Price:</strong> ${estimatedPrice.toFixed(2)}</p>
            <p><strong>Contact:</strong> {formData.customerEmail}</p>
          </div>
          <button onClick={() => setSubmitted(false)}>Create Another Design</button>
        </SuccessMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FontAwesomeIcon icon={faPalette} />
          Custom Design Studio
        </Title>
        <Subtitle>
          Bring your creative vision to life with our custom design service
        </Subtitle>
      </Header>

      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>
              <FontAwesomeIcon icon={faUser} />
              Contact Information
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </FormGroup>
              <FormGroup>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </FormGroup>
              <FormGroup>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </FormGroup>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <FontAwesomeIcon icon={faShirt} />
              Garment Details
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Garment Type *</Label>
                <Select
                  name="garmentType"
                  value={formData.garmentType}
                  onChange={handleInputChange}
                  required
                >
                  {garmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - ${option.basePrice}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Base Color *</Label>
                <ColorInputContainer>
                  <ColorInput
                    type="color"
                    name="baseColor"
                    value={formData.baseColor}
                    onChange={handleInputChange}
                  />
                  <ColorLabel>{formData.baseColor}</ColorLabel>
                </ColorInputContainer>
              </FormGroup>
              <FormGroup>
                <Label>Urgency Level *</Label>
                <Select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  required
                >
                  {urgencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <FontAwesomeIcon icon={faMessage} />
              Design Details
            </SectionTitle>
            <FormGroup>
              <Label>Design Description *</Label>
              <TextArea
                name="designDescription"
                value={formData.designDescription}
                onChange={handleInputChange}
                required
                placeholder="Describe your design idea in detail..."
                rows={4}
              />
            </FormGroup>
            <FormGroup>
              <Label>Custom Message/Text</Label>
              <Input
                type="text"
                name="customMessage"
                value={formData.customMessage}
                onChange={handleInputChange}
                placeholder="Any text you want on the design"
              />
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>
              <FontAwesomeIcon icon={faUpload} />
              Design Reference
            </SectionTitle>
            <UploadArea
              $dragActive={dragActive}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <UploadContent>
                <UploadIcon>
                  <FontAwesomeIcon icon={faUpload} />
                </UploadIcon>
                <UploadText>
                  {previewImage ? 'Image uploaded! Click to change' : 'Click or drag to upload reference image'}
                </UploadText>
                {previewImage && (
                  <PreviewImage>
                    <img src={previewImage} alt="Design preview" />
                  </PreviewImage>
                )}
              </UploadContent>
            </UploadArea>
          </Section>

          <Section>
            <SectionTitle>
              <FontAwesomeIcon icon={faDollarSign} />
              Pricing Summary
            </SectionTitle>
            <PricingContainer>
              <PriceRow>
                <span>Base Price ({formData.garmentType})</span>
                <span>${garmentOptions.find(g => g.value === formData.garmentType)?.basePrice || 35}</span>
              </PriceRow>
              <PriceRow>
                <span>Urgency Multiplier</span>
                <span>{urgencyOptions.find(u => u.value === formData.urgency)?.multiplier || 1}x</span>
              </PriceRow>
              <PriceRow>
                <span>Design Complexity</span>
                <span>1.2x</span>
              </PriceRow>
              <PriceRow className="total">
                <span>Estimated Total</span>
                <span>${estimatedPrice.toFixed(2)}</span>
              </PriceRow>
            </PricingContainer>
            <PriceNote>
              <FontAwesomeIcon icon={faInfoCircle} />
              Final price may vary based on design complexity and revisions required.
            </PriceNote>
          </Section>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Design Request'}
          </SubmitButton>
        </Form>
      </FormContainer>
    </Container>
  );
};

// Styled Components - OrdersPage Style
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  svg {
    color: #1a1a1a;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

const FormContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.875rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #333;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
  }
`;

const Select = styled.select`
  padding: 0.875rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #333;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #333;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
  }
`;

const ColorInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ColorInput = styled.input`
  width: 50px;
  height: 50px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #1a1a1a;
  }
`;

const ColorLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 500;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.$dragActive ? '#1a1a1a' : '#e0e0e0'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background: ${props => props.$dragActive ? '#f8f9fa' : 'white'};
  cursor: pointer;
  
  &:hover {
    border-color: #1a1a1a;
    background: #f8f9fa;
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #1a1a1a;
`;

const UploadText = styled.div`
  color: #666;
  font-size: 1rem;
`;

const PreviewImage = styled.div`
  margin-top: 1rem;
  max-width: 200px;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const PricingContainer = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
  
  &.total {
    border-top: 2px solid #1a1a1a;
    border-bottom: none;
    font-weight: 700;
    font-size: 1.1rem;
    color: #333;
    margin-top: 1rem;
    padding-top: 1rem;
  }
  
  &:last-child:not(.total) {
    border-bottom: none;
  }
`;

const PriceNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
  
  svg {
    color: #1a1a1a;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  border: 2px solid #1a1a1a;
  border-radius: 6px;
  background: white;
  color: #1a1a1a;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1a1a1a;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #f0f0f0;
  
  .success-icon {
    font-size: 4rem;
    color: #28a745;
    margin-bottom: 1rem;
  }
  
  h2 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .order-summary {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 2rem 0;
    text-align: left;
    
    h3 {
      color: #333;
      margin-bottom: 1rem;
    }
    
    p {
      margin-bottom: 0.5rem;
      color: #666;
    }
  }
  
  button {
    padding: 0.75rem 1.5rem;
    border: 2px solid #1a1a1a;
    border-radius: 6px;
    background: white;
    color: #1a1a1a;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      background: #1a1a1a;
      color: white;
    }
  }
`;

export default CustomDesignPage;
