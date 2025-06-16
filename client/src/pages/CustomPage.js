import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 40px;
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 50px;
  font-size: 1.2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FileUploadArea = styled.div`
  border: 3px dashed #667eea;
  border-radius: 15px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$hasFile ? 'rgba(102, 126, 234, 0.05)' : 'transparent'};

  &:hover {
    border-color: #5a67d8;
    background: rgba(102, 126, 234, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 15px;
`;

const UploadText = styled.p`
  color: #667eea;
  font-size: 1.1rem;
  margin-bottom: 10px;
  font-weight: 500;
`;

const UploadSubtext = styled.p`
  color: #999;
  font-size: 0.9rem;
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PreviewImage = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f5f5;
  border: 2px solid #e1e5e9;
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 0, 0, 1);
    transform: scale(1.1);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 30px auto 0;
  min-width: 200px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CustomPage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef();
  const [formData, setFormData] = useState({
    productType: '',
    size: '',
    color: '',
    quantity: 1,
    designDescription: '',
    specialRequests: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productTypes = [
    'T-Shirt',
    'Hoodie',
    'Tank Top',
    'Long Sleeve',
    'Polo Shirt',
    'Sweatshirt',
    'Jacket',
    'Hat/Cap',
    'Other'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const colors = [
    'Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 
    'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedFiles(prev => [...prev, {
            file,
            preview: event.target.result,
            id: Date.now() + Math.random()
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload only image files');
      }
    });
    
    // Reset file input
    e.target.value = '';
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload({ target: { files } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to submit a custom design request');
      return;
    }

    if (!formData.productType || !formData.size || uploadedFiles.length === 0) {
      toast.error('Please fill in all required fields and upload at least one design image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('userId', user.id);
      submitData.append('productType', formData.productType);
      submitData.append('size', formData.size);
      submitData.append('color', formData.color);
      submitData.append('quantity', formData.quantity);
      submitData.append('designDescription', formData.designDescription);
      submitData.append('specialRequests', formData.specialRequests);
      
      uploadedFiles.forEach((fileData, index) => {
        submitData.append(`designImage${index}`, fileData.file);
      });

      // Here you would typically send to your backend API
      // const response = await fetch('/api/custom-orders', {
      //   method: 'POST',
      //   body: submitData,
      // });

      // For now, just show success message
      toast.success('Custom design request submitted successfully! We will contact you soon with a quote.');
      
      // Reset form
      setFormData({
        productType: '',
        size: '',
        color: '',
        quantity: 1,
        designDescription: '',
        specialRequests: ''
      });
      setUploadedFiles([]);
      
    } catch (error) {
      console.error('Error submitting custom order:', error);
      toast.error('Failed to submit custom design request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Container>
        <Title>Custom Design Studio</Title>
        <Subtitle>
          Upload your designs and let us create custom clothing that represents your unique style. 
          Our team will work with you to bring your vision to life.
        </Subtitle>

        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Product Details</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Product Type *</Label>
                <Select
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a product type</option>
                  {productTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Size *</Label>
                <Select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select size</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Base Color</Label>
                <Select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                >
                  <option value="">Select base color</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
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
                  max="100"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>Design Upload *</SectionTitle>
            <FileUploadArea
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              $hasFile={uploadedFiles.length > 0}
            >
              <UploadIcon>📁</UploadIcon>
              <UploadText>
                {uploadedFiles.length > 0 
                  ? `${uploadedFiles.length} file(s) uploaded. Click to add more.`
                  : 'Click to upload or drag and drop your design images'
                }
              </UploadText>
              <UploadSubtext>PNG, JPG, GIF up to 10MB each</UploadSubtext>
            </FileUploadArea>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {uploadedFiles.length > 0 && (
              <PreviewContainer>
                {uploadedFiles.map((fileData) => (
                  <PreviewImage key={fileData.id}>
                    <PreviewImg src={fileData.preview} alt="Design preview" />
                    <RemoveButton onClick={() => removeFile(fileData.id)}>
                      ×
                    </RemoveButton>
                  </PreviewImage>
                ))}
              </PreviewContainer>
            )}
          </FormSection>

          <FormSection>
            <SectionTitle>Additional Information</SectionTitle>
            <FormGroup>
              <Label>Design Description</Label>
              <TextArea
                name="designDescription"
                value={formData.designDescription}
                onChange={handleInputChange}
                placeholder="Describe your design idea, placement preferences, colors, etc..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Special Requests</Label>
              <TextArea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special requests or notes for our design team..."
              />
            </FormGroup>
          </FormSection>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Custom Design Request'}
          </SubmitButton>
        </form>
      </Container>
    </PageContainer>
  );
};

export default CustomPage;
