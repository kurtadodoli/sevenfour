// src/pages/WishlistPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../components/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faShoppingCart, 
  faTrash,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: #dc3545;
  }
`;

const BackButton = styled(Link)`
  padding: 0.5rem 1rem;
  border: 2px solid #1a1a1a;
  border-radius: 6px;
  background: white;
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #1a1a1a;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #f0f0f0;
  
  svg {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1rem;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
`;

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const WishlistCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ProductImage = styled.div`
  position: relative;
  height: 250px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 6px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc3545;
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #007bff;
    }
  }
`;

const ProductPrice = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: white;
  color: #1a1a1a;
  border: 2px solid #1a1a1a;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #1a1a1a;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ViewButton = styled(Link)`
  flex: 1;
  background: transparent;
  color: #666;
  border: 2px solid #e0e0e0;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }
`;

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { products, loading: productsLoading } = useProducts();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(new Set());

  // Filter products that are in the wishlist
  useEffect(() => {
    if (!productsLoading && products.length > 0) {
      const filteredProducts = products.filter(product => 
        wishlistItems.includes(product.id) || wishlistItems.includes(product.product_id)
      );
      setWishlistProducts(filteredProducts);
    }
  }, [products, wishlistItems, productsLoading]);

  const handleRemoveFromWishlist = async (productId, productName) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        addToast(`${productName} removed from wishlist`, 'info');
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      addToast('Failed to remove from wishlist', 'error');
    }
  };

  const handleAddToCart = async (productId, productName) => {
    setAddingToCart(prev => new Set(prev).add(productId));
    
    try {
      const result = await addToCart(productId, 1, 1, 1);
      
      if (result.success) {
        addToast(`${productName} added to cart!`, 'success');
      } else {
        addToast(result.message || 'Failed to add product to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast('Failed to add product to cart', 'error');
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (productsLoading) {
    return (
      <PageContainer>
        <div>Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>
          <FontAwesomeIcon icon={faHeart} />
          My Wishlist ({wishlistItems.length})
        </Title>
        <BackButton to="/products">
          <FontAwesomeIcon icon={faArrowLeft} />
          Continue Shopping
        </BackButton>
      </Header>

      {wishlistProducts.length === 0 ? (
        <EmptyState>
          <FontAwesomeIcon icon={faHeart} />
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items to your wishlist and they'll appear here.</p>
          <Link to="/products" style={{ textDecoration: 'none' }}>
            <AddToCartButton as="div" style={{ display: 'inline-flex', maxWidth: '200px' }}>
              Start Shopping
            </AddToCartButton>
          </Link>
        </EmptyState>
      ) : (
        <WishlistGrid>
          {wishlistProducts.map(product => {
            const productId = product.id || product.product_id;
            const productImage = product.image_url || product.images?.[0] || '/api/placeholder/280/250';
            
            return (
              <WishlistCard key={productId}>
                <ProductImage>
                  <img src={productImage} alt={product.name} />
                  <RemoveButton
                    onClick={() => handleRemoveFromWishlist(productId, product.name)}
                    title="Remove from Wishlist"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </RemoveButton>
                </ProductImage>
                
                <ProductInfo>
                  <ProductName>
                    <Link to={`/products/${productId}`}>
                      {product.name}
                    </Link>
                  </ProductName>
                  
                  <ProductPrice>₱{product.price}</ProductPrice>
                  
                  <ActionButtons>
                    <AddToCartButton
                      onClick={() => handleAddToCart(productId, product.name)}
                      disabled={addingToCart.has(productId)}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      {addingToCart.has(productId) ? 'Adding...' : 'Add to Cart'}
                    </AddToCartButton>
                    
                    <ViewButton to={`/products/${productId}`}>
                      View Details
                    </ViewButton>
                  </ActionButtons>
                </ProductInfo>
              </WishlistCard>
            );
          })}
        </WishlistGrid>
      )}
    </PageContainer>
  );
};

export default WishlistPage;
