// Updated HomePage.js with explicit debug logging for navigation
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import styled from 'styled-components';

// Import your images with their proper file extensions
import heroImage from '../assets/images/seven-four-hero.jpg';
import tshirtImage from '../assets/images/seven-four-tshirt.jpg';
import shortsImage from '../assets/images/seven-four-shorts.jpg';
import hatImage from '../assets/images/seven-four-hat.jpg';
import socksImage from '../assets/images/seven-four-socks.jpg';
import hoodieImage from '../assets/images/seven-four-hoodie.jpg';
import jacketImage from '../assets/images/seven-four-jacket.jpg';
import jerseyImage from '../assets/images/seven-four-jersey.jpg';
import sweaterImage from '../assets/images/seven-four-sweater.jpg';
import bagImage from '../assets/images/seven-four-bag.jpg';
import secondImage from '../assets/images/seven-four-clothing-2ndhero.jpg';
import thirdImage from '../assets/images/seven-four-clothing-3rdhero.jpg';
import fourthImage from '../assets/images/seven-four-clothing-4thhero.jpg';

const CarouselImage = styled.img`
  width: 100%;
  height: 80vh;
  object-fit: cover;
`;

const HeroSection = styled.section`
  height: 80vh;
  position: relative;
  overflow: hidden;

  // Add styles to darken the carousel images
  .carousel-item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4); // Adds a dark overlay
    z-index: 2;
  }

  // Hide the default Carousel captions
  .carousel-caption {
    display: none;  }
`;

const HeroContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 1200px;
  width: 100%;
  padding: 0 2rem;
  z-index: 3; // Increased z-index to appear above carousel
  color: #fff;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); // Added text shadow for better visibility
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const ShopButton = styled(Link)`
  display: inline-block;
  background-color: #fff;
  color: #000;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CategorySection = styled.section`
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 300;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ProductCard = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer; // Add explicit cursor pointer
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 1rem;
  text-align: center;
  background-color: white;
`;

const ProductName = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 500;
  color: black;
`;

const FeaturedProductsSection = styled.section`
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
  background-color: #f9f9f9;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const FeaturedProductCard = styled(ProductCard)`
  background-color: white;
`;

const FeaturedProductPrice = styled.p`
  margin: 0.5rem 0 0;
  font-weight: 600;
  font-size: 0.9rem;
`;

// Debug-enabled Link component
const DebugLink = ({ to, children, productName, ...props }) => {
  const handleClick = (e) => {
    console.log(`🔗 Clicking product link: ${productName}`);
    console.log(`🎯 Navigating to: ${to}`);
    console.log(`📦 Event details:`, e);
    // Don't prevent default - let React Router handle it
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('🔍 HomePage: Fetching products from API...');
        const response = await fetch('http://localhost:5000/api/maintenance/products', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📦 HomePage: Products fetched successfully:', data.length, 'products');
          setProducts(data);
        } else {
          console.error('❌ HomePage: Failed to fetch products:', response.status);
          setError('Failed to load products');
        }
      } catch (error) {
        console.error('❌ HomePage: Error fetching products:', error);
        setError('Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Category data with links to filtered product pages
  const categories = [
    { id: 't-shirts', name: 'T-SHIRTS', image: tshirtImage },
    { id: 'hoodies', name: 'HOODIES', image: hoodieImage },
    { id: 'jackets', name: 'JACKETS', image: jacketImage },
    { id: 'shorts', name: 'SHORTS', image: shortsImage },
    { id: 'hats', name: 'HEADWEAR', image: hatImage },
    { id: 'socks', name: 'SOCKS', image: socksImage },
    { id: 'jerseys', name: 'JERSEYS', image: jerseyImage },
    { id: 'sweaters', name: 'SWEATERS', image: sweaterImage },
    { id: 'bags', name: 'BAGS', image: bagImage }
  ];

  // Get the newest products (New Releases) - sort by created_at or updated_at
  const getNewReleases = () => {
    if (!products || products.length === 0) return [];
    
    // Sort products by created_at (newest first) and take first 8
    const sortedProducts = [...products]
      .filter(product => product.productstatus === 'active') // Only show active products
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0);
        const dateB = new Date(b.created_at || b.updated_at || 0);
        return dateB - dateA; // Newest first
      })
      .slice(0, 8); // Show up to 8 products

    console.log('🆕 HomePage: New Releases prepared:', sortedProducts.length, 'products');
    return sortedProducts;
  };

  // Helper function to get product image URL
  const getProductImageUrl = (product) => {
    if (product.productimage) {
      // If it's a full URL, use it directly
      if (product.productimage.startsWith('http')) {
        return product.productimage;
      }
      // Otherwise, construct the URL
      return `http://localhost:5000/uploads/${product.productimage}`;
    }
    
    // Fallback to a default image if no product image
    return tshirtImage; // Use one of the category images as fallback
  };

  const newReleases = getNewReleases();

  return (
    <main>
      <HeroSection>
        <Carousel fade interval={3000}>
          <Carousel.Item>
            <CarouselImage 
              src={heroImage} 
              alt="Seven Four Hero"
            />
            <Carousel.Caption>
              <h3>Welcome to Seven Four</h3>
              <p>Discover our latest collection</p>
            </Carousel.Caption>
          </Carousel.Item>

          {/* Add your next 3 images following this pattern: */}
          <Carousel.Item>
            <CarouselImage 
              src={secondImage} 
              alt="Second Slide"
            />
            <Carousel.Caption>
              <h3>Welcome to Seven Four</h3>
              <p>Discover our latest collection</p>
            </Carousel.Caption>
          </Carousel.Item>
          
          <Carousel.Item>
            <CarouselImage 
              src={thirdImage} 
              alt="Third Slide"
            />
            <Carousel.Caption>
              <h3>Welcome to Seven Four</h3>
              <p>Discover our latest collection</p>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <CarouselImage 
              src={fourthImage} 
              alt="Fourth Slide"
            />
            <Carousel.Caption>
              <h3>Welcome to Seven Four</h3>
              <p>Discover our latest collection</p>
            </Carousel.Caption>
          </Carousel.Item>        
        </Carousel>
        <HeroContent>
          <HeroTitle>Welcome to Seven Four Clothing</HeroTitle>
          <HeroSubtitle>Discover our latest collection of premium streetwear designed for comfort and style.</HeroSubtitle>
          <ShopButton to="/products">Shop Now</ShopButton>
        </HeroContent>
      </HeroSection>

      <CategorySection>
        <FeaturedProductsSection>
          <SectionTitle>New Releases</SectionTitle>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading new releases...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
          ) : newReleases.length > 0 ? (
            <FeaturedGrid>
              {newReleases.map(product => (
                <FeaturedProductCard key={product.id}>
                  {/* Enhanced Link with debug logging */}
                  <DebugLink 
                    to={`/product/${product.id}`} 
                    productName={product.productname}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <ProductImage 
                      src={getProductImageUrl(product)} 
                      alt={product.productname}
                      onError={(e) => {
                        e.target.src = tshirtImage; // Fallback image
                      }}
                    />
                    <ProductInfo>
                      <ProductName>{product.productname}</ProductName>
                      <FeaturedProductPrice>₱{parseFloat(product.productprice || 0).toFixed(2)}</FeaturedProductPrice>
                    </ProductInfo>
                  </DebugLink>
                </FeaturedProductCard>
              ))}
            </FeaturedGrid>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No new releases available at the moment.</p>
            </div>
          )}
        </FeaturedProductsSection>

        <SectionTitle>Shop</SectionTitle>
        <CategoryGrid>
          {categories.map(category => (
            <ProductCard key={category.id}>
              {/* Update link to properly filter products by category */}
              <Link to={`/products?category=${category.id}`} style={{ textDecoration: 'none' }}>
                <ProductImage src={category.image} alt={category.name} />
                <ProductInfo>
                  <ProductName>{category.name}</ProductName>
                </ProductInfo>
              </Link>
            </ProductCard>
          ))}
        </CategoryGrid>
      </CategorySection>

    </main>
  );
};

export default HomePage;
