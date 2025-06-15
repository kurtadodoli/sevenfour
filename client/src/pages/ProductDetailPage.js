// src/pages/ProductDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../components/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import api from '../utils/api';

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Breadcrumbs = styled.div`
  margin-bottom: 2rem;
  font-size: 0.9rem;
  
  a {
    color: #666;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.5rem;
    color: #999;
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const MainImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  margin-bottom: 1rem;
  border-radius: 8px;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 4px;
  border: 2px solid ${props => props.active ? '#000' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #666;
  }
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h1`
  font-size: 2rem;
  margin: 0 0 1rem;
  font-weight: 500;
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const ProductDescription = styled.p`
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #444;
`;

const OptionsContainer = styled.div`
  margin-bottom: 2rem;
`;

const OptionTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.75rem;
  font-weight: 500;
`;

const SizeOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SizeButton = styled.button`
  background: ${props => props.selected ? '#000' : '#fff'};
  color: ${props => props.selected ? '#fff' : '#000'};
  border: 1px solid #000;
  padding: 0.5rem 1rem;
  min-width: 50px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? '#000' : '#f0f0f0'};
  }
  
  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ColorButton = styled.button`
  background: #fff;
  color: ${props => props.selected ? '#fff' : '#000'};
  border: 1px solid #000;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#000' : '#fff'};
  
  &:hover {
    background: ${props => props.selected ? '#000' : '#f0f0f0'};
  }
`;

const AddToCartButton = styled.button`
  background: #000;
  color: #fff;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s ease;
  margin-top: 1rem;
  
  &:hover {
    background: #333;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const QuantityLabel = styled.span`
  font-weight: 500;
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const QuantityButton = styled.button`
  background: #f8f9fa;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const QuantityInput = styled.input`
  border: none;
  width: 60px;
  height: 40px;
  text-align: center;
  font-size: 1rem;
  outline: none;
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
`;

const WishlistButton = styled.button`
  background: ${props => props.isInWishlist ? '#dc3545' : 'transparent'};
  color: ${props => props.isInWishlist ? '#fff' : '#dc3545'};
  border: 2px solid #dc3545;
  padding: 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 120px;
  
  &:hover {
    background: ${props => props.isInWishlist ? '#c82333' : '#dc3545'};
    color: #fff;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, loading: productsLoading } = useProducts();
  const { addToCart, loading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Find product by id from the products list
  useEffect(() => {
    if (!productsLoading && products.length > 0) {
      const foundProduct = products.find(p => p.id === parseInt(id) || p.id === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Set default color and size
        if (foundProduct.colors && foundProduct.colors.length > 0) {
          const colors = typeof foundProduct.colors === 'string' 
            ? foundProduct.colors.split(',').map(c => c.trim())
            : foundProduct.colors;
          setSelectedColor(colors[0]);
        }
        
        if (foundProduct.sizes && foundProduct.sizes.length > 0) {
          const sizes = typeof foundProduct.sizes === 'string' 
            ? foundProduct.sizes.split(',').map(s => s.trim())
            : foundProduct.sizes;
          setSelectedSize(sizes[0]);
        }
      }
      
      setLoading(false);
    }
  }, [id, products, productsLoading]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Validate selections
    const productColors = product.colors 
      ? (typeof product.colors === 'string' 
          ? product.colors.split(',').map(c => c.trim())
          : product.colors)
      : [];
    
    const productSizes = product.sizes 
      ? (typeof product.sizes === 'string' 
          ? product.sizes.split(',').map(s => s.trim())
          : product.sizes)
      : [];
    
    if (productColors.length > 0 && !selectedColor) {
      addToast('Please select a color', 'error');
      return;
    }
    
    if (productSizes.length > 0 && !selectedSize) {
      addToast('Please select a size', 'error');
      return;
    }
    
    setAddingToCart(true);
    
    try {
      const cartItem = {
        productId: product.id,
        quantity: quantity,
        selectedColor: selectedColor || null,
        selectedSize: selectedSize || null
      };
      
      await addToCart(cartItem);
      
      const itemDescription = `${quantity} ${product.name}${selectedColor ? ` (${selectedColor})` : ''}${selectedSize ? ` (Size: ${selectedSize})` : ''}`;
      addToast(`Added ${itemDescription} to cart!`, 'success');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast('Failed to add item to cart. Please try again.', 'error');
    } finally {      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    const productId = product.id;
    const inWishlist = isInWishlist(productId);
    
    try {
      if (inWishlist) {
        const result = await removeFromWishlist(productId);
        if (result.success) {
          addToast(`${product.name} removed from wishlist`, 'info');
        } else {
          addToast(result.message, 'error');
        }
      } else {
        const result = await addToWishlist(productId);
        if (result.success) {
          addToast(`${product.name} added to wishlist`, 'success');
        } else {
          addToast(result.message, 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      addToast('Failed to update wishlist', 'error');
    }
  };
  
  if (loading || productsLoading) {
    return <PageContainer>Loading...</PageContainer>;
  }
  
  if (!product) {
    return <PageContainer>Product not found</PageContainer>;
  }

  // Process colors and sizes
  const productColors = product.colors 
    ? (typeof product.colors === 'string' 
        ? product.colors.split(',').map(c => c.trim())
        : product.colors)
    : [];
  
  const productSizes = product.sizes 
    ? (typeof product.sizes === 'string' 
        ? product.sizes.split(',').map(s => s.trim())
        : product.sizes)
    : [];

  // Handle images - use default if no images
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['/api/placeholder/600/600'];
  
  return (
    <PageContainer>
      <Breadcrumbs>
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <Link to={`/products?category=${product.category?.toLowerCase().replace(' ', '-') || 'all'}`}>
          {product.category || 'All Products'}
        </Link>
        <span>›</span>
        {product.name}
      </Breadcrumbs>
      
      <ProductContainer>
        <ImageSection>
          <MainImage src={productImages[selectedImage]} alt={product.name} />
          <ThumbnailContainer>
            {productImages.map((image, index) => (
              <Thumbnail 
                key={index} 
                src={image} 
                alt={`${product.name} - View ${index + 1}`}
                active={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </ThumbnailContainer>
        </ImageSection>
        
        <ProductDetails>
          <ProductName>{product.name}</ProductName>
          <ProductPrice>₱{product.price}</ProductPrice>
          
          <OptionsContainer>
            {productColors.length > 0 && (
              <>
                <OptionTitle>Color: {selectedColor}</OptionTitle>
                <ColorOptions>
                  {productColors.map((color) => (
                    <ColorButton
                      key={color}
                      selected={selectedColor === color}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </ColorButton>
                  ))}
                </ColorOptions>
              </>
            )}
            
            {productSizes.length > 0 && (
              <>
                <OptionTitle>Size: {selectedSize}</OptionTitle>
                <SizeOptions>
                  {productSizes.map((size) => (
                    <SizeButton
                      key={size}
                      selected={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </SizeButton>
                  ))}
                </SizeOptions>
              </>
            )}
          </OptionsContainer>
          
          <QuantitySection>
            <QuantityLabel>Quantity:</QuantityLabel>
            <QuantityContainer>
              <QuantityButton 
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                −
              </QuantityButton>
              <QuantityInput
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min="1"
              />
              <QuantityButton 
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </QuantityButton>
            </QuantityContainer>
          </QuantitySection>          <ActionButtons>
            <AddToCartButton 
              onClick={handleAddToCart}
              disabled={addingToCart || cartLoading}
            >
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </AddToCartButton>
            
            <WishlistButton
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              isInWishlist={isInWishlist(product.id)}
            >
              <FontAwesomeIcon 
                icon={isInWishlist(product.id) ? faHeartSolid : faHeartOutline} 
              />
              {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
            </WishlistButton>
          </ActionButtons>
          
          <ProductDescription>
            {product.description || `Experience the premium quality and style of Seven Four Clothing's ${product.name}. Our products are designed for both comfort and durability, making them perfect for everyday wear.`}
          </ProductDescription>
        </ProductDetails>
      </ProductContainer>
    </PageContainer>
  );
};

export default ProductDetailPage;