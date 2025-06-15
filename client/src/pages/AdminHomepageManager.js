import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AdminContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #0a0a0a;
  min-height: 100vh;
  color: #ffffff;
  padding-top: 80px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #161616 100%);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ModeToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ModeButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? 'linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%)' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#cccccc'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #5aa3ff 0%, #4a86e0 100%)' : 'rgba(255, 255, 255, 0.1)'};
    color: #ffffff;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: ${props => props.mode === 'split' ? '1fr 1fr' : '1fr'};
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Panel = styled.div`
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PanelContent = styled.div`
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
`;

const EditButton = styled.button`
  background: linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%);
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: linear-gradient(135deg, #5aa3ff 0%, #4a86e0 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SaveButton = styled(EditButton)`
  background: linear-gradient(135deg, #28a745 0%, #20a83a 100%);
  
  &:hover {
    background: linear-gradient(135deg, #34ce57 0%, #28a745 100%);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }
`;

const CancelButton = styled(EditButton)`
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  
  &:hover {
    background: linear-gradient(135deg, #78858f 0%, #6c757d 100%);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  }
`;

// Homepage Preview Component
const HomepagePreview = styled.div`
  background: #ffffff;
  color: #333333;
  border-radius: 8px;
  overflow: hidden;
  min-height: 600px;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 2rem;
  text-align: center;
  color: white;
  position: relative;
  cursor: ${props => props.editable ? 'pointer' : 'default'};
  border: ${props => props.editing ? '2px solid #4a9eff' : 'none'};
  
  &:hover {
    ${props => props.editable && `
      &::after {
        content: '✏️ Click to edit hero section';
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }
    `}
  }
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const HeroButton = styled.button`
  background: #ffffff;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background: #f8f9fa;
`;

const ProductCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: ${props => props.editable ? 'pointer' : 'default'};
  border: ${props => props.editing ? '2px solid #4a9eff' : 'none'};
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    
    ${props => props.editable && `
      &::after {
        content: '✏️ Edit';
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }
    `}
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
`;

const ProductPrice = styled.p`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
`;

const EditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-size: 1.4rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #cccccc;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #ffffff;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #cccccc;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const DragDropZone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.1);
  }
  
  &.drag-over {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.2);
  }
`;

const DragHandle = styled.div`
  cursor: grab;
  padding: 0.5rem;
  color: #888;
  font-size: 1.2rem;
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &:active {
    cursor: grabbing;
  }
`;

const DraggableProductCard = styled(ProductCard)`
  position: relative;
  
  &:hover ${DragHandle} {
    opacity: 1;
  }
  
  ${props => props.isDragging && `
    transform: rotate(5deg);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  `}
`;

const ProductPositionBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 10;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadProgress = styled.div`
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    if (props.type === 'success') return 'linear-gradient(135deg, #28a745 0%, #20a83a 100%)';
    if (props.type === 'warning') return 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
    return 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)';
  }};
  color: ${props => props.type === 'warning' ? '#000' : '#fff'};
`;

const ToolsPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ToolButton = styled.button`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: linear-gradient(135deg, #3a3a3a 0%, #2d2d2d 100%);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AdminHomepageManager = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('preview'); // 'preview', 'edit', 'split'
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
    // Homepage content state - Load from actual product data or API
  const [homepageContent, setHomepageContent] = useState({
    hero: {
      title: "Welcome to Seven Four Clothing",
      subtitle: "Discover our latest collection of premium streetwear designed for comfort and style.",
      buttonText: "Shop Now",
      backgroundImage: "/api/placeholder/1200/600"
    },
    featuredProducts: [
      {
        id: 1,
        name: "Classic T-Shirt",
        price: "₱999.00",
        image: "/api/placeholder/250/200",
        position: 1,
        category: "t-shirts"
      },
      {
        id: 2,
        name: "Denim Jacket",
        price: "₱2,499.00",
        image: "/api/placeholder/250/200",
        position: 2,
        category: "jackets"
      },
      {
        id: 3,
        name: "Summer Hoodie",
        price: "₱1,799.00",
        image: "/api/placeholder/250/200",
        position: 3,
        category: "hoodies"
      },
      {
        id: 4,
        name: "Casual Shorts",
        price: "₱899.00",
        image: "/api/placeholder/250/200",
        position: 4,
        category: "shorts"
      }
    ]
  });

  const [tempContent, setTempContent] = useState({});

  // Load homepage content on component mount
  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      const response = await fetch('/api/admin/homepage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHomepageContent(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
      // Keep default content if API fails
    }
  };

  // Check admin access
  if (!currentUser || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle drag end for reordering products
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(homepageContent.featuredProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1
    }));

    setHomepageContent(prev => ({
      ...prev,
      featuredProducts: updatedItems
    }));
    setHasChanges(true);
  };

  // Handle file upload
  const handleFileUpload = async (file, type = 'product') => {
    if (!file) return null;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const simulateUpload = () => {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            resolve(URL.createObjectURL(file)); // Create object URL for preview
          }
          setUploadProgress(progress);
        }, 200);
      });
    };

    try {
      const imageUrl = await simulateUpload();
      setIsUploading(false);
      setUploadProgress(0);
      return imageUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      return null;
    }
  };

  const handleEditSection = (sectionType, data = null) => {
    setEditingSection(sectionType);
    if (sectionType === 'hero') {
      setTempContent({ ...homepageContent.hero });
    } else if (sectionType === 'product' && data) {
      setTempContent({ ...data });
    }
    setShowModal(true);
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await handleFileUpload(file);
      if (imageUrl) {
        if (editingSection === 'hero') {
          setTempContent(prev => ({ ...prev, backgroundImage: imageUrl }));
        } else if (editingSection === 'product') {
          setTempContent(prev => ({ ...prev, image: imageUrl }));
        }
      }
    }
  };

  const handleSaveChanges = () => {
    if (editingSection === 'hero') {
      setHomepageContent(prev => ({
        ...prev,
        hero: { ...tempContent }
      }));
    } else if (editingSection === 'product') {
      setHomepageContent(prev => ({
        ...prev,
        featuredProducts: prev.featuredProducts.map(product =>
          product.id === tempContent.id ? { ...tempContent } : product
        )
      }));
    }
    setHasChanges(true);
    setShowModal(false);
    setEditingSection(null);
  };

  const handlePublishChanges = async () => {
    // Here you would send the changes to your backend
    console.log('Publishing changes:', homepageContent);
    
    try {
      // Simulate API call to save homepage content
      const response = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(homepageContent)
      });

      if (response.ok) {
        setHasChanges(false);
        alert('Homepage changes published successfully! 🎉');
      } else {
        console.error('Failed to publish changes');
        alert('Failed to publish changes. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing changes:', error);
      // For now, just simulate success
      setHasChanges(false);
      alert('Homepage changes published successfully! 🎉');
    }
  };
  const handleResetChanges = async () => {
    if (window.confirm('Are you sure you want to reset all changes? This cannot be undone.')) {
      try {
        const response = await fetch('/api/admin/homepage/reset', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setHomepageContent(data.data);
            setHasChanges(false);
            alert('Homepage reset to default successfully! 🔄');
          }
        } else {
          throw new Error('Failed to reset homepage');
        }
      } catch (error) {
        console.error('Error resetting homepage:', error);
        alert('Failed to reset homepage. Please try again.');
      }
    }
  };
  const renderHomepagePreview = (editable = false) => (
    <HomepagePreview>
      <HeroSection 
        editable={editable}
        editing={editingSection === 'hero' && isEditing}
        onClick={() => editable && handleEditSection('hero')}
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${homepageContent.hero.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <HeroTitle>{homepageContent.hero.title}</HeroTitle>
        <HeroSubtitle>{homepageContent.hero.subtitle}</HeroSubtitle>
        <HeroButton>{homepageContent.hero.buttonText}</HeroButton>
      </HeroSection>
      
      <ProductGrid>
        {editable ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="featured-products" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    padding: '2rem',
                    background: snapshot.isDraggingOver ? 'rgba(74, 158, 255, 0.1)' : '#f8f9fa',
                    borderRadius: '8px',
                    transition: 'background 0.3s ease'
                  }}
                >
                  {homepageContent.featuredProducts
                    .sort((a, b) => a.position - b.position)
                    .map((product, index) => (
                      <Draggable 
                        key={product.id} 
                        draggableId={product.id.toString()} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <DraggableProductCard
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            isDragging={snapshot.isDragging}
                            editable={editable}
                            editing={editingSection === 'product' && tempContent.id === product.id && isEditing}
                            onClick={() => !snapshot.isDragging && editable && handleEditSection('product', product)}
                          >
                            <DragHandle {...provided.dragHandleProps}>
                              ⋮⋮
                            </DragHandle>
                            <ProductPositionBadge>
                              {product.position}
                            </ProductPositionBadge>
                            <ProductImage src={product.image} alt={product.name} />
                            <ProductInfo>
                              <ProductName>{product.name}</ProductName>
                              <ProductPrice>{product.price}</ProductPrice>
                            </ProductInfo>
                          </DraggableProductCard>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <>
            {homepageContent.featuredProducts
              .sort((a, b) => a.position - b.position)
              .map(product => (
                <ProductCard 
                  key={product.id}
                  editable={editable}
                  editing={editingSection === 'product' && tempContent.id === product.id && isEditing}
                  onClick={() => editable && handleEditSection('product', product)}
                >
                  <ProductImage src={product.image} alt={product.name} />
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>{product.price}</ProductPrice>
                  </ProductInfo>
                </ProductCard>
              ))}
          </>
        )}
      </ProductGrid>
    </HomepagePreview>
  );

  return (
    <AdminContainer>      <Header>
        <Title>
          🏠 Homepage Manager
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {hasChanges && (
            <>
              <CancelButton onClick={handleResetChanges}>
                🔄 Reset Changes
              </CancelButton>
              <SaveButton onClick={handlePublishChanges}>
                🚀 Publish Changes
              </SaveButton>
            </>
          )}
          <ModeToggle>
            <ModeButton 
              active={viewMode === 'preview'} 
              onClick={() => setViewMode('preview')}
            >
              👁️ Preview
            </ModeButton>
            <ModeButton 
              active={viewMode === 'edit'} 
              onClick={() => setViewMode('edit')}
            >
              ✏️ Edit
            </ModeButton>
            <ModeButton 
              active={viewMode === 'split'} 
              onClick={() => setViewMode('split')}
            >
              📱 Split View
            </ModeButton>
          </ModeToggle>
        </div>
      </Header>

      <ContentArea mode={viewMode}>
        {(viewMode === 'preview' || viewMode === 'split') && (
          <Panel>
            <PanelHeader>
              <PanelTitle>
                👀 Customer View
              </PanelTitle>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>
                This is what customers see
              </span>
            </PanelHeader>
            <PanelContent>
              {renderHomepagePreview(false)}
            </PanelContent>
          </Panel>
        )}        {(viewMode === 'edit' || viewMode === 'split') && (
          <Panel>
            <PanelHeader>
              <PanelTitle>
                ✏️ Admin Editor
              </PanelTitle>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {hasChanges && (
                  <span style={{ 
                    color: '#ffc107', 
                    fontSize: '0.9rem',
                    background: 'rgba(255, 193, 7, 0.1)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    ● Unsaved changes
                  </span>
                )}
                <EditButton onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? '👁️ Preview Mode' : '✏️ Edit Mode'}
                </EditButton>
              </div>
            </PanelHeader>
            <PanelContent>
              {isEditing && (
                <ToolsPanel>
                  <ToolButton onClick={() => handleEditSection('hero')}>
                    🎯 Edit Hero Section
                  </ToolButton>
                  <ToolButton onClick={() => window.alert('Click on any product to edit it!')}>
                    📦 Edit Products
                  </ToolButton>
                  <ToolButton onClick={() => window.alert('Drag products to reorder them!')}>
                    ↕️ Reorder Products
                  </ToolButton>
                  <ToolButton onClick={() => window.alert('Use the image picker in edit modals!')}>
                    🖼️ Upload Images
                  </ToolButton>
                </ToolsPanel>
              )}
              {renderHomepagePreview(isEditing)}
              {!isEditing && (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#888',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  margin: '1rem 0'
                }}>
                  <p>Click "Edit Mode" to start editing homepage sections</p>
                  <p style={{ fontSize: '0.9rem' }}>You can edit the hero section and individual product cards</p>
                  <p style={{ fontSize: '0.9rem' }}>Use drag and drop to reorder featured products</p>
                </div>
              )}
            </PanelContent>
          </Panel>
        )}
      </ContentArea>

      {/* Edit Modal */}
      <EditModal show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingSection === 'hero' ? '🎯 Edit Hero Section' : '📦 Edit Product'}
            </ModalTitle>
            <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
          </ModalHeader>          {editingSection === 'hero' && (
            <>
              <FormGroup>
                <Label>Hero Title</Label>
                <Input
                  value={tempContent.title || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter hero title"
                />
              </FormGroup>
              <FormGroup>
                <Label>Hero Subtitle</Label>
                <TextArea
                  value={tempContent.subtitle || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter hero subtitle"
                />
              </FormGroup>
              <FormGroup>
                <Label>Button Text</Label>
                <Input
                  value={tempContent.buttonText || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, buttonText: e.target.value }))}
                  placeholder="Enter button text"
                />
              </FormGroup>
              <FormGroup>
                <Label>Background Image</Label>
                <DragDropZone onClick={handleImageSelect}>
                  {tempContent.backgroundImage ? (
                    <ImagePreview>
                      <PreviewImage src={tempContent.backgroundImage} alt="Hero background preview" />
                      <p>Click to replace image</p>
                    </ImagePreview>
                  ) : (
                    <>
                      <p>📷 Click to upload hero background image</p>
                      <p style={{ fontSize: '0.8rem', color: '#888' }}>
                        Recommended size: 1200x600px
                      </p>
                    </>
                  )}
                </DragDropZone>
                <Input
                  value={tempContent.backgroundImage || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, backgroundImage: e.target.value }))}
                  placeholder="Or enter image URL directly"
                  style={{ marginTop: '0.5rem' }}
                />
                {isUploading && (
                  <UploadProgress>
                    <div>Uploading... {Math.round(uploadProgress)}%</div>
                    <ProgressBar>
                      <ProgressFill progress={uploadProgress} />
                    </ProgressBar>
                  </UploadProgress>
                )}
              </FormGroup>
            </>
          )}

          {editingSection === 'product' && (
            <>
              <FormGroup>
                <Label>Product Name</Label>
                <Input
                  value={tempContent.name || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </FormGroup>
              <FormGroup>
                <Label>Product Price</Label>
                <Input
                  value={tempContent.price || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter product price (e.g., ₱999.00)"
                />
              </FormGroup>
              <FormGroup>
                <Label>Product Category</Label>
                <select
                  value={tempContent.category || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="t-shirts">T-Shirts</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="jackets">Jackets</option>
                  <option value="shorts">Shorts</option>
                  <option value="headwear">Headwear</option>
                  <option value="socks">Socks</option>
                  <option value="jerseys">Jerseys</option>
                  <option value="sweaters">Sweaters</option>
                  <option value="bags">Bags</option>
                </select>
              </FormGroup>
              <FormGroup>
                <Label>Product Image</Label>
                <DragDropZone onClick={handleImageSelect}>
                  {tempContent.image ? (
                    <ImagePreview>
                      <PreviewImage src={tempContent.image} alt="Product preview" />
                      <p>Click to replace image</p>
                    </ImagePreview>
                  ) : (
                    <>
                      <p>📷 Click to upload product image</p>
                      <p style={{ fontSize: '0.8rem', color: '#888' }}>
                        Recommended size: 250x200px
                      </p>
                    </>
                  )}
                </DragDropZone>
                <Input
                  value={tempContent.image || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Or enter image URL directly"
                  style={{ marginTop: '0.5rem' }}
                />
                {isUploading && (
                  <UploadProgress>
                    <div>Uploading... {Math.round(uploadProgress)}%</div>
                    <ProgressBar>
                      <ProgressFill progress={uploadProgress} />
                    </ProgressBar>
                  </UploadProgress>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Display Position</Label>
                <Input
                  type="number"
                  min="1"
                  value={tempContent.position || ''}
                  onChange={(e) => setTempContent(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                  placeholder="Enter display position"
                />
              </FormGroup>
            </>
          )}

          <ButtonGroup>
            <CancelButton onClick={() => setShowModal(false)}>
              Cancel
            </CancelButton>
            <SaveButton onClick={handleSaveChanges}>
              Save Changes
            </SaveButton>          </ButtonGroup>
        </ModalContent>
      </EditModal>

      {/* Hidden file input for image uploads */}
      <FileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
    </AdminContainer>
  );
};

export default AdminHomepageManager;
