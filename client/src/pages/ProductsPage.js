// src/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';

// Styled components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const SearchFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchBar = styled.div`
  flex: 1;
  display: flex;
  
  input {
    flex: 1;
    padding: 0.875rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #1a1a1a;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.active ? '#1a1a1a' : '#e0e0e0'};
  border-radius: 6px;
  background: ${props => props.active ? '#1a1a1a' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #1a1a1a;
    background: ${props => props.active ? '#1a1a1a' : '#f8f9fa'};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const ProductCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Creates a square aspect ratio */
  overflow: hidden;
  background-color: #f9f9f9;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: 1rem 0;
`;

const ProductName = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
`;

const ProductPrice = styled.p`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const NoProducts = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background: #f9f9f9;
  border-radius: 8px;
`;

const Loading = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
`;

const ErrorMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  background-color: #ffecec;
  color: #d8000c;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const StockTag = styled.span`
  display: inline-block;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  color: white;
  border-radius: 4px;
  background-color: ${props => {
    if (props.status === 'out_of_stock') return '#f44336';
    if (props.status === 'low_stock') return '#ff9800';
    return 'transparent';
  }};
`;

const AddToCartButton = styled.button`
  background: white;
  color: #1a1a1a;
  border: 2px solid #1a1a1a;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
  
  &:hover {
    background: #1a1a1a;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: white;
      color: #1a1a1a;
    }
  }
`;

const ProductCardContent = styled.div`
  position: relative;
  
  &:hover .quick-actions {
    opacity: 1;
    transform: translateY(0);
  }
`;

const QuickActions = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  
  button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: white;
      transform: scale(1.1);
    }
  }
`;

// Main Component
const ProductsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category') || 'all';
  // Use the custom hook for product data
  const { products, categories, loading, error, refreshProducts } = useProducts(30000); // Refresh every 30 seconds
  const { addToCart } = useCart(); // Add cart functionality
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(); // Add wishlist functionality
  const { addToast } = useToast(); // Add toast functionality
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);
  const [addingToCart, setAddingToCart] = useState(new Set());
    // Filter products based on search term and category
  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }
    
    let results = [...products];
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      results = results.filter(product => 
        product.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter out inactive and archived products
    results = results.filter(product => 
      product.status === 'active' && !product.is_archived
    );
    
    setFilteredProducts(results);
  }, [products, searchTerm, categoryFilter]);
  
  // Update category filter when URL changes
  useEffect(() => {
    setCategoryFilter(categoryFromUrl);
  }, [categoryFromUrl]);
  
  // Get all available categories for the filter
  const availableCategories = [
    { id: 'all', name: 'All Products' },
    ...categories.map(cat => ({ 
      id: cat.category_name.toLowerCase(), 
      name: cat.category_name 
    }))
  ];
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    
    // Update URL query parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('category', category);
    window.history.pushState({}, '', `${location.pathname}?${searchParams.toString()}`);
  };
    // Handle add to cart
  const handleAddToCart = async (productId) => {
    setAddingToCart(prev => new Set(prev).add(productId));
    
    try {
      // For now, use default color and size - this should be improved with a proper product detail modal
      const result = await addToCart(productId, 1, 1, 1); // product_id, color_id, size_id, quantity
      
      if (result.success) {
        // Find the product name for the toast
        const product = products.find(p => p.product_id === productId);
        const productName = product ? product.name : 'Product';
        addToast(`${productName} added to cart!`, 'success');
      } else {
        addToast(result.message || 'Failed to add product to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast('Failed to add product to cart', 'error');
    }
      setAddingToCart(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId, productName) => {
    const inWishlist = isInWishlist(productId);
    
    try {
      if (inWishlist) {
        const result = await removeFromWishlist(productId);
        if (result.success) {
          addToast(`${productName} removed from wishlist`, 'info');
        } else {
          addToast(result.message, 'error');
        }
      } else {
        const result = await addToWishlist(productId);
        if (result.success) {
          addToast(`${productName} added to wishlist`, 'success');
        } else {
          addToast(result.message, 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      addToast('Failed to update wishlist', 'error');
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Our Products</Title>
        
        <SearchFilterContainer>
          <SearchBar>
            <input 
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </SearchBar>
          
          <FilterContainer>
            {availableCategories.map((category) => (
              <FilterButton
                key={category.id}
                active={categoryFilter === category.id}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </FilterButton>
            ))}
          </FilterContainer>
        </SearchFilterContainer>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <ProductGrid>
        {loading ? (
          <Loading>Loading products...</Loading>
        ) : filteredProducts.length === 0 ? (
          <NoProducts>No products found. Try a different search or category.</NoProducts>
        ) : (          filteredProducts.map(product => (
            <div key={product.product_id}>
              <ProductCardContent>
                <ProductImage>
                  <img 
                    src={product.images && product.images.length > 0 
                      ? product.images[0] 
                      : 'https://via.placeholder.com/300x300?text=No+Image'
                    } 
                    alt={product.name}
                  />
                  <QuickActions className="quick-actions">
                    <button 
                      onClick={() => handleAddToCart(product.product_id)}
                      disabled={addingToCart.has(product.product_id)}
                      title="Add to Cart"
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </button>                    <button title="Add to Wishlist" onClick={() => handleWishlistToggle(product.product_id, product.name)}>
                      <FontAwesomeIcon icon={isInWishlist(product.product_id) ? faHeartSolid : faHeartOutline} />
                    </button>
                  </QuickActions>
                </ProductImage>
                <ProductInfo>
                  <ProductName>
                    <Link to={`/products/${product.product_id}`} style={{color: 'inherit', textDecoration: 'none'}}>
                      {product.name}
                    </Link>
                    {product.stock_status && product.stock_status !== 'in_stock' && (
                      <StockTag status={product.stock_status}>
                        {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </StockTag>
                    )}
                  </ProductName>
                  <ProductPrice>₱{parseFloat(product.price).toFixed(2)}</ProductPrice>
                  <AddToCartButton 
                    onClick={() => handleAddToCart(product.product_id)}
                    disabled={addingToCart.has(product.product_id) || product.stock_status === 'out_of_stock'}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    {addingToCart.has(product.product_id) ? 'Adding...' : 'Add to Cart'}
                  </AddToCartButton>
                </ProductInfo>
              </ProductCardContent>
            </div>
          ))
        )}
      </ProductGrid>
    </PageContainer>
  );
};

export default ProductsPage;