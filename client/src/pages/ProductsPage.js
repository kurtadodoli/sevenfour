// src/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import api from '../utils/api';

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
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
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#1a1a1a' : 'transparent'};
  color: ${props => props.active ? 'white' : '#1a1a1a'};
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#1a1a1a' : '#f1f1f1'};
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

// Main Component
const ProductsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category') || 'all';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);
  
  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch products
        const productsResponse = await api.get('/api/products');
        
        // Fetch categories
        const categoriesResponse = await api.get('/api/products/categories');
        
        setProducts(productsResponse.data.products || []);
        setCategories(categoriesResponse.data.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
        ) : (
          filteredProducts.map(product => (
            <ProductCard to={`/products/${product.product_id}`} key={product.product_id}>
              <ProductImage>
                <img 
                  src={product.images && product.images.length > 0 
                    ? product.images[0] 
                    : 'https://via.placeholder.com/300x300?text=No+Image'
                  } 
                  alt={product.name}
                />
              </ProductImage>
              <ProductInfo>
                <ProductName>
                  {product.name}
                  {product.stock_status && product.stock_status !== 'in_stock' && (
                    <StockTag status={product.stock_status}>
                      {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                    </StockTag>
                  )}
                </ProductName>
                <ProductPrice>${parseFloat(product.price).toFixed(2)}</ProductPrice>
              </ProductInfo>
            </ProductCard>
          ))
        )}
      </ProductGrid>
    </PageContainer>
  );
};

export default ProductsPage;