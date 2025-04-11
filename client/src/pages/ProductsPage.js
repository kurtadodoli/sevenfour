// src/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { tshirtProducts } from '../data/tshirtProducts';
import { shortProducts } from '../data/shortProducts';
import { hoodieProducts } from '../data/hoodieProducts';
import { jacketProducts } from '../data/jacketProducts'; // Import jacket products

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

const CategoryFilter = styled.div`
  select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    min-width: 180px;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ProductCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
`;

const ProductInfo = styled.div`
  padding: 1.25rem;
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  font-weight: 500;
`;

const ProductPrice = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #000;
`;

const CategoryLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 0;
  width: 100%;
  grid-column: 1 / -1;
  font-size: 1.2rem;
  color: #666;
`;

const ResultCount = styled.div`
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const ProductsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category') || 'all';

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Categories list
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 't-shirts', name: 'T-Shirts' },
    { id: 'shorts', name: 'Shorts' },
    { id: 'hoodies', name: 'Hoodies' },
    { id: 'jackets', name: 'Jackets' },
    { id: 'headwear', name: 'Headwear' },
    { id: 'socks', name: 'Socks' },
    { id: 'jerseys', name: 'Jerseys' },
    { id: 'sweaters', name: 'Sweaters' },
    { id: 'bags', name: 'Bags' }
  ];
  
  // Update category filter when URL changes
  useEffect(() => {
    setCategoryFilter(categoryFromUrl);
  }, [categoryFromUrl]);
  
  // Filter products based on search term and category
  useEffect(() => {
    // Create the combined product array inside the effect
    const allProducts = [...tshirtProducts, ...shortProducts, ...hoodieProducts, ...jacketProducts];
    
    let results = [...allProducts];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      results = results.filter(product => {
        // Handle specific category filters
        if (categoryFilter === 't-shirts' && product.category === 'T-Shirts') {
          return true;
        }
        if (categoryFilter === 'shorts' && product.category === 'Shorts') {
          return true;
        }
        if (categoryFilter === 'hoodies' && product.category === 'Hoodies') {
          return true;
        }
        if (categoryFilter === 'jackets' && product.category === 'Jackets') {
          return true;
        }
        return product.category.toLowerCase() === categoryFilter.toLowerCase();
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(results);
  }, [searchTerm, categoryFilter]); // Keep dependencies minimal
  
  return (
    <PageContainer>
      <Header>
        <Title>Shop All Products</Title>
      </Header>
      
      <SearchFilterContainer>
        <SearchBar>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
        <CategoryFilter>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </CategoryFilter>
      </SearchFilterContainer>
      
      <ResultCount>
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
      </ResultCount>
      
      <ProductsGrid>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product.id}>
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProductImage src={product.images[0]} alt={product.name} />
                <ProductInfo>
                  <CategoryLabel>{product.category}</CategoryLabel>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>₱{product.price}</ProductPrice>
                </ProductInfo>
              </Link>
            </ProductCard>
          ))
        ) : (
          <NoResults>No products found. Try adjusting your search or filters.</NoResults>
        )}
      </ProductsGrid>
    </PageContainer>
  );
};

export default ProductsPage;