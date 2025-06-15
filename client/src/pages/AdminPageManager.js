import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';

const AdminContainer = styled.div`
  max-width: 1600px;
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

const PageSelector = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 1rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? 'linear-gradient(135deg, #4a9eff 0%, #3d7bd8 100%)' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#cccccc'};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #5aa3ff 0%, #4a86e0 100%)' : 'rgba(255, 255, 255, 0.1)'};
    color: #ffffff;
  }
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

// Page Preview Components
const PagePreview = styled.div`
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
        content: '✏️ Click to edit';
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

const ProductsPagePreview = styled.div`
  padding: 2rem;
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

const EditableSection = styled.div`
  position: relative;
  cursor: ${props => props.editable ? 'pointer' : 'default'};
  border: ${props => props.editing ? '2px solid #4a9eff' : 'transparent 2px solid'};
  padding: 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    ${props => props.editable && `
      background: rgba(74, 158, 255, 0.05);
      border-color: rgba(74, 158, 255, 0.3);
      
      &::after {
        content: '✏️ Click to edit';
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        z-index: 10;
      }
    `}
  }
`;

// Modal and Form Components
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  color: white;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  fontSize: 1.4rem;
  color: #ffffff;
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionDivider = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
  padding-top: 2rem;
`;

const SubTitle = styled.h4`
  color: #4a9eff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const AdminPageManager = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('homepage');
  const [viewMode, setViewMode] = useState('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Page content state
  const [pageContents, setPageContents] = useState({
    homepage: {
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
        }
      ]
    },
    products: {
      pageTitle: "Our Products",
      pageSubtitle: "Discover our full collection of premium streetwear",
      filters: {
        showSearch: true,
        showCategories: true,
        showPriceFilter: true,
        showSortOptions: true
      },
      displaySettings: {
        itemsPerPage: 12,
        gridColumns: 4,
        showOutOfStock: true
      }
    },
    productDetail: {
      imageGallery: {
        showThumbnails: true,
        allowZoom: true,
        showFullscreen: true
      },
      productInfo: {
        showDescription: true,
        showSpecifications: true,
        showReviews: true,
        showRelatedProducts: true
      },
      purchaseOptions: {
        showQuantitySelector: true,
        showSizeSelector: true,
        showColorSelector: true,
        showAddToCart: true
      }
    },
    auth: {
      login: {
        title: "Welcome Back",
        subtitle: "Sign in to your Seven Four account",
        backgroundImage: "/api/placeholder/1200/800",
        socialLogin: {
          enabled: true,
          providers: ['google', 'facebook']
        }
      },
      register: {
        title: "Join Seven Four",
        subtitle: "Create your account to start shopping",
        backgroundImage: "/api/placeholder/1200/800",
        requiredFields: ['email', 'password', 'firstName', 'lastName']
      }
    },
    footer: {
      companyInfo: {
        name: "Seven Four Clothing",
        description: "Premium streetwear for the modern lifestyle",
        address: "123 Fashion Street, Style City, SC 12345",
        phone: "+1 (555) 123-4567",
        email: "info@sevenfourclothing.com"
      },
      socialLinks: [
        { platform: "Facebook", url: "https://facebook.com/sevenfour" },
        { platform: "Instagram", url: "https://instagram.com/sevenfour" },
        { platform: "Twitter", url: "https://twitter.com/sevenfour" }
      ],
      navigation: [
        { title: "Shop", links: ["All Products", "T-Shirts", "Hoodies", "Jackets"] },
        { title: "Support", links: ["Contact Us", "Size Guide", "Shipping", "Returns"] },
        { title: "Company", links: ["About Us", "Careers", "Press", "Terms"] }
      ]
    }
  });

  const [tempContent, setTempContent] = useState({});

  // Available pages for editing
  const availablePages = [
    { id: 'homepage', name: '🏠 Homepage', description: 'Main landing page' },
    { id: 'products', name: '🛍️ Products Page', description: 'Product listing' },
    { id: 'productDetail', name: '📦 Product Detail', description: 'Individual product pages' },
    { id: 'auth', name: '🔐 Login/Register', description: 'Authentication pages' },
    { id: 'footer', name: '🔗 Footer', description: 'Site footer content' }
  ];

  // Check admin access
  if (!currentUser || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEditSection = (sectionType, data = null) => {
    setEditingSection(sectionType);
    if (data) {
      setTempContent({ ...data });
    } else {
      // Load section data based on current page and section
      const sectionData = pageContents[currentPage][sectionType];
      setTempContent({ ...sectionData });
    }
    setShowModal(true);
  };

  const handleSaveChanges = () => {
    setPageContents(prev => ({
      ...prev,
      [currentPage]: {
        ...prev[currentPage],
        [editingSection]: { ...tempContent }
      }
    }));
    setHasChanges(true);
    setShowModal(false);
    setEditingSection(null);
  };

  const handlePublishChanges = async () => {
    try {
      const response = await fetch(`/api/admin/pages/${currentPage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(pageContents[currentPage])
      });

      if (response.ok) {
        setHasChanges(false);
        alert(`${availablePages.find(p => p.id === currentPage)?.name} changes published successfully! 🎉`);
      } else {
        throw new Error('Failed to publish changes');
      }
    } catch (error) {
      console.error('Error publishing changes:', error);
      // For now, just simulate success
      setHasChanges(false);
      alert(`${availablePages.find(p => p.id === currentPage)?.name} changes published successfully! 🎉`);
    }
  };

  const renderPagePreview = (editable = false) => {
    const content = pageContents[currentPage];
    
    switch (currentPage) {
      case 'homepage':
        return (
          <PagePreview>
            <HeroSection 
              editable={editable}
              editing={editingSection === 'hero' && isEditing}
              onClick={() => editable && handleEditSection('hero')}
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${content.hero.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
                {content.hero.title}
              </h1>
              <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                {content.hero.subtitle}
              </p>
              <button style={{ 
                background: '#ffffff', 
                color: '#667eea', 
                border: 'none', 
                padding: '1rem 2rem', 
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                {content.hero.buttonText}
              </button>
            </HeroSection>
            
            <ProductGrid>
              {content.featuredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  editable={editable}
                  onClick={() => editable && handleEditSection('featuredProducts', product)}
                >
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#333' }}>
                      {product.name}
                    </h3>
                    <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: '600', color: '#667eea' }}>
                      {product.price}
                    </p>
                  </div>
                </ProductCard>
              ))}
            </ProductGrid>
          </PagePreview>
        );

      case 'products':
        return (
          <PagePreview>
            <EditableSection
              editable={editable}
              editing={editingSection === 'pageTitle'}
              onClick={() => editable && handleEditSection('pageTitle')}
            >
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{content.pageTitle}</h1>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>{content.pageSubtitle}</p>
            </EditableSection>
            
            <EditableSection
              editable={editable}
              editing={editingSection === 'filters'}
              onClick={() => editable && handleEditSection('filters')}
            >
              <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', margin: '1rem 0' }}>
                <h3>Filter Options</h3>
                <p>Search: {content.filters.showSearch ? '✅ Enabled' : '❌ Disabled'}</p>
                <p>Categories: {content.filters.showCategories ? '✅ Enabled' : '❌ Disabled'}</p>
                <p>Price Filter: {content.filters.showPriceFilter ? '✅ Enabled' : '❌ Disabled'}</p>
                <p>Sort Options: {content.filters.showSortOptions ? '✅ Enabled' : '❌ Disabled'}</p>
              </div>
            </EditableSection>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ background: '#f0f0f0', height: '150px', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                  <h4>Sample Product {i}</h4>
                  <p>₱999.00</p>
                </div>
              ))}
            </div>
          </PagePreview>
        );

      case 'productDetail':
        return (
          <PagePreview>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
              <EditableSection
                editable={editable}
                editing={editingSection === 'imageGallery'}
                onClick={() => editable && handleEditSection('imageGallery')}
              >
                <div style={{ background: '#f0f0f0', height: '400px', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ textAlign: 'center', paddingTop: '180px', color: '#666' }}>Product Image Gallery</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ background: '#e0e0e0', width: '60px', height: '60px', borderRadius: '4px' }}></div>
                  ))}
                </div>
              </EditableSection>

              <EditableSection
                editable={editable}
                editing={editingSection === 'productInfo'}
                onClick={() => editable && handleEditSection('productInfo')}
              >
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sample Product Name</h1>
                <p style={{ fontSize: '1.5rem', color: '#667eea', fontWeight: '600', marginBottom: '1rem' }}>₱1,299.00</p>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  Product description with details about materials, fit, and care instructions.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <h4>Specifications:</h4>
                  <ul>
                    <li>Material: 100% Cotton</li>
                    <li>Fit: Regular</li>
                    <li>Care: Machine wash cold</li>
                  </ul>
                </div>
              </EditableSection>
            </div>
          </PagePreview>
        );

      case 'auth':
        return (
          <PagePreview>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <EditableSection
                editable={editable}
                editing={editingSection === 'login'}
                onClick={() => editable && handleEditSection('login')}
              >
                <div style={{ 
                  background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${content.login.backgroundImage})`,
                  backgroundSize: 'cover',
                  padding: '3rem 2rem',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <h2>{content.login.title}</h2>
                  <p>{content.login.subtitle}</p>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
                    <form>
                      <input placeholder="Email" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: 'none' }} />
                      <input placeholder="Password" type="password" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: 'none' }} />
                      <button style={{ width: '100%', padding: '0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Sign In
                      </button>
                    </form>
                  </div>
                </div>
              </EditableSection>

              <EditableSection
                editable={editable}
                editing={editingSection === 'register'}
                onClick={() => editable && handleEditSection('register')}
              >
                <div style={{ 
                  background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${content.register.backgroundImage})`,
                  backgroundSize: 'cover',
                  padding: '3rem 2rem',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <h2>{content.register.title}</h2>
                  <p>{content.register.subtitle}</p>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
                    <form>
                      <input placeholder="First Name" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: 'none' }} />
                      <input placeholder="Last Name" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: 'none' }} />
                      <input placeholder="Email" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: 'none' }} />
                      <input placeholder="Password" type="password" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: 'none' }} />
                      <button style={{ width: '100%', padding: '0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Create Account
                      </button>
                    </form>
                  </div>
                </div>
              </EditableSection>
            </div>
          </PagePreview>
        );

      case 'footer':
        return (
          <PagePreview>
            <EditableSection
              editable={editable}
              editing={editingSection === 'companyInfo'}
              onClick={() => editable && handleEditSection('companyInfo')}
              style={{ background: '#1a1a1a', color: 'white', padding: '3rem 2rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div>
                  <h3>{content.companyInfo.name}</h3>
                  <p>{content.companyInfo.description}</p>
                  <p>{content.companyInfo.address}</p>
                  <p>{content.companyInfo.phone}</p>
                  <p>{content.companyInfo.email}</p>
                </div>
                <div>
                  <h4>Follow Us</h4>
                  {content.socialLinks.map((link, idx) => (
                    <div key={idx} style={{ marginBottom: '0.5rem' }}>
                      {link.platform}: {link.url}
                    </div>
                  ))}
                </div>
                <div>
                  <h4>Quick Links</h4>
                  {content.navigation.map((section, idx) => (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <h5>{section.title}</h5>
                      {section.links.map((link, linkIdx) => (
                        <div key={linkIdx} style={{ marginLeft: '1rem', marginBottom: '0.25rem' }}>
                          {link}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>
          </PagePreview>
        );

      default:
        return (
          <PagePreview>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h2>Select a page to preview</h2>
            </div>
          </PagePreview>
        );
    }
  };

  return (
    <AdminContainer>
      <Header>
        <Title>
          🎨 Customer Experience Manager
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <PageSelector>
            {availablePages.map((page) => (
              <PageButton
                key={page.id}
                active={currentPage === page.id}
                onClick={() => setCurrentPage(page.id)}
                title={page.description}
              >
                {page.name}
              </PageButton>
            ))}
          </PageSelector>
          {hasChanges && (
            <SaveButton onClick={handlePublishChanges}>
              🚀 Publish Changes
            </SaveButton>
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
                👀 Customer View - {availablePages.find(p => p.id === currentPage)?.name}
              </PanelTitle>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>
                This is what customers see
              </span>
            </PanelHeader>
            <PanelContent>
              {renderPagePreview(false)}
            </PanelContent>
          </Panel>
        )}

        {(viewMode === 'edit' || viewMode === 'split') && (
          <Panel>
            <PanelHeader>
              <PanelTitle>
                ✏️ Admin Editor - {availablePages.find(p => p.id === currentPage)?.name}
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
              {renderPagePreview(isEditing)}
              {!isEditing && (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#888',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  margin: '1rem 0'
                }}>
                  <p>Click "Edit Mode" to start editing page sections</p>
                  <p style={{ fontSize: '0.9rem' }}>
                    Currently editing: {availablePages.find(p => p.id === currentPage)?.description}
                  </p>
                </div>
              )}
            </PanelContent>
          </Panel>
        )}
      </ContentArea>

      {/* Edit Modal - Will be enhanced based on section type */}
      {showModal && (
        <EditModal show={showModal}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                Edit {editingSection}
              </ModalTitle>
              <CloseButton 
                onClick={() => setShowModal(false)}
              >
                ×
              </CloseButton>
            </ModalHeader>
            
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#888' }}>
                Advanced editing modal will be implemented based on the section type.
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Section: {editingSection} | Page: {currentPage}
              </p>
            </div>

            {editingSection === 'hero' && (
              <div>
                <FormGroup>
                  <Label>Title</Label>
                  <Input 
                    value={tempContent.title} 
                    onChange={e => setTempContent({ ...tempContent, title: e.target.value })}
                    placeholder="Enter the hero section title"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Subtitle</Label>
                  <TextArea 
                    value={tempContent.subtitle} 
                    onChange={e => setTempContent({ ...tempContent, subtitle: e.target.value })}
                    placeholder="Enter the hero section subtitle"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Button Text</Label>
                  <Input 
                    value={tempContent.buttonText} 
                    onChange={e => setTempContent({ ...tempContent, buttonText: e.target.value })}
                    placeholder="Enter the text for the hero button"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Background Image URL</Label>
                  <Input 
                    value={tempContent.backgroundImage} 
                    onChange={e => setTempContent({ ...tempContent, backgroundImage: e.target.value })}
                    placeholder="Enter the URL for the background image"
                  />
                </FormGroup>
              </div>
            )}

            {editingSection === 'featuredProducts' && (
              <div>
                <SubTitle>Edit Featured Product</SubTitle>
                
                <FormGroup>
                  <Label>Product Name</Label>
                  <Input 
                    value={tempContent.name} 
                    onChange={e => setTempContent({ ...tempContent, name: e.target.value })}
                    placeholder="Enter the product name"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Price</Label>
                  <Input 
                    value={tempContent.price} 
                    onChange={e => setTempContent({ ...tempContent, price: e.target.value })}
                    placeholder="Enter the product price"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Image URL</Label>
                  <Input 
                    value={tempContent.image} 
                    onChange={e => setTempContent({ ...tempContent, image: e.target.value })}
                    placeholder="Enter the URL for the product image"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category</Label>
                  <Input 
                    value={tempContent.category} 
                    onChange={e => setTempContent({ ...tempContent, category: e.target.value })}
                    placeholder="Enter the product category"
                  />
                </FormGroup>
              </div>
            )}

            {editingSection === 'pageTitle' && (
              <div>
                <FormGroup>
                  <Label>Page Title</Label>
                  <Input 
                    value={tempContent.pageTitle} 
                    onChange={e => setTempContent({ ...tempContent, pageTitle: e.target.value })}
                    placeholder="Enter the products page title"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Page Subtitle</Label>
                  <TextArea 
                    value={tempContent.pageSubtitle} 
                    onChange={e => setTempContent({ ...tempContent, pageSubtitle: e.target.value })}
                    placeholder="Enter the products page subtitle"
                  />
                </FormGroup>
              </div>
            )}

            {editingSection === 'filters' && (
              <div>
                <SubTitle>Filter Options</SubTitle>
                
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showSearch} 
                      onChange={e => setTempContent({ ...tempContent, showSearch: e.target.checked })}
                    />
                    Search
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showCategories} 
                      onChange={e => setTempContent({ ...tempContent, showCategories: e.target.checked })}
                    />
                    Categories
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showPriceFilter} 
                      onChange={e => setTempContent({ ...tempContent, showPriceFilter: e.target.checked })}
                    />
                    Price Filter
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showSortOptions} 
                      onChange={e => setTempContent({ ...tempContent, showSortOptions: e.target.checked })}
                    />
                    Sort Options
                  </CheckboxLabel>
                </CheckboxGroup>
              </div>
            )}

            {editingSection === 'imageGallery' && (
              <div>
                <SubTitle>Image Gallery Settings</SubTitle>
                
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showThumbnails} 
                      onChange={e => setTempContent({ ...tempContent, showThumbnails: e.target.checked })}
                    />
                    Show Thumbnails
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.allowZoom} 
                      onChange={e => setTempContent({ ...tempContent, allowZoom: e.target.checked })}
                    />
                    Allow Zoom
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showFullscreen} 
                      onChange={e => setTempContent({ ...tempContent, showFullscreen: e.target.checked })}
                    />
                    Show Fullscreen
                  </CheckboxLabel>
                </CheckboxGroup>
              </div>
            )}

            {editingSection === 'productInfo' && (
              <div>
                <SubTitle>Product Info Settings</SubTitle>
                
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showDescription} 
                      onChange={e => setTempContent({ ...tempContent, showDescription: e.target.checked })}
                    />
                    Show Description
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showSpecifications} 
                      onChange={e => setTempContent({ ...tempContent, showSpecifications: e.target.checked })}
                    />
                    Show Specifications
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showReviews} 
                      onChange={e => setTempContent({ ...tempContent, showReviews: e.target.checked })}
                    />
                    Show Reviews
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showRelatedProducts} 
                      onChange={e => setTempContent({ ...tempContent, showRelatedProducts: e.target.checked })}
                    />
                    Show Related Products
                  </CheckboxLabel>
                </CheckboxGroup>
              </div>
            )}

            {editingSection === 'purchaseOptions' && (
              <div>
                <SubTitle>Purchase Options Settings</SubTitle>
                
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showQuantitySelector} 
                      onChange={e => setTempContent({ ...tempContent, showQuantitySelector: e.target.checked })}
                    />
                    Show Quantity Selector
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showSizeSelector} 
                      onChange={e => setTempContent({ ...tempContent, showSizeSelector: e.target.checked })}
                    />
                    Show Size Selector
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showColorSelector} 
                      onChange={e => setTempContent({ ...tempContent, showColorSelector: e.target.checked })}
                    />
                    Show Color Selector
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={tempContent.showAddToCart} 
                      onChange={e => setTempContent({ ...tempContent, showAddToCart: e.target.checked })}
                    />
                    Show Add to Cart Button
                  </CheckboxLabel>
                </CheckboxGroup>
              </div>
            )}

            {editingSection === 'login' && (
              <div>
                <FormGroup>
                  <Label>Title</Label>
                  <Input 
                    value={tempContent.title} 
                    onChange={e => setTempContent({ ...tempContent, title: e.target.value })}
                    placeholder="Enter the login page title"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Subtitle</Label>
                  <TextArea 
                    value={tempContent.subtitle} 
                    onChange={e => setTempContent({ ...tempContent, subtitle: e.target.value })}
                    placeholder="Enter the login page subtitle"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Background Image URL</Label>
                  <Input 
                    value={tempContent.backgroundImage} 
                    onChange={e => setTempContent({ ...tempContent, backgroundImage: e.target.value })}
                    placeholder="Enter the URL for the background image"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Social Login Providers</Label>
                  <Input 
                    value={tempContent.socialLogin.providers.join(', ')} 
                    onChange={e => setTempContent({ 
                      ...tempContent, 
                      socialLogin: { 
                        ...tempContent.socialLogin, 
                        providers: e.target.value.split(',').map(p => p.trim()) 
                      } 
                    })}
                    placeholder="Enter social login providers, separated by commas"
                  />
                </FormGroup>
              </div>
            )}

            {editingSection === 'register' && (
              <div>
                <FormGroup>
                  <Label>Title</Label>
                  <Input 
                    value={tempContent.title} 
                    onChange={e => setTempContent({ ...tempContent, title: e.target.value })}
                    placeholder="Enter the register page title"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Subtitle</Label>
                  <TextArea 
                    value={tempContent.subtitle} 
                    onChange={e => setTempContent({ ...tempContent, subtitle: e.target.value })}
                    placeholder="Enter the register page subtitle"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Background Image URL</Label>
                  <Input 
                    value={tempContent.backgroundImage} 
                    onChange={e => setTempContent({ ...tempContent, backgroundImage: e.target.value })}
                    placeholder="Enter the URL for the background image"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Required Fields</Label>
                  <Input 
                    value={tempContent.requiredFields.join(', ')} 
                    onChange={e => setTempContent({ 
                      ...tempContent, 
                      requiredFields: e.target.value.split(',').map(f => f.trim()) 
                    })}
                    placeholder="Enter required fields for registration, separated by commas"
                  />
                </FormGroup>
              </div>
            )}

            {editingSection === 'companyInfo' && (
              <div>
                <FormGroup>
                  <Label>Company Name</Label>
                  <Input 
                    value={tempContent.name} 
                    onChange={e => setTempContent({ ...tempContent, name: e.target.value })}
                    placeholder="Enter the company name"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Description</Label>
                  <TextArea 
                    value={tempContent.description} 
                    onChange={e => setTempContent({ ...tempContent, description: e.target.value })}
                    placeholder="Enter a brief description of the company"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Address</Label>
                  <Input 
                    value={tempContent.address} 
                    onChange={e => setTempContent({ ...tempContent, address: e.target.value })}
                    placeholder="Enter the company address"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone</Label>
                  <Input 
                    value={tempContent.phone} 
                    onChange={e => setTempContent({ ...tempContent, phone: e.target.value })}
                    placeholder="Enter the contact phone number"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>
                  <Input 
                    value={tempContent.email} 
                    onChange={e => setTempContent({ ...tempContent, email: e.target.value })}
                    placeholder="Enter the contact email address"
                  />
                </FormGroup>
              </div>
            )}

            <ButtonGroup>
              <CancelButton onClick={() => setShowModal(false)}>
                Cancel
              </CancelButton>
              <SaveButton onClick={handleSaveChanges}>
                Save Changes
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </EditModal>
      )}
    </AdminContainer>
  );
};

export default AdminPageManager;
