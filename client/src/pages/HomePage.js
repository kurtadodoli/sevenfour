// client/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import styled, { keyframes } from 'styled-components';
import { getSaleInfo } from '../utils/saleUtils';
import '../styles/saleStyles.css';

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
import logoImage from '../assets/images/sfc-logo-white.png';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const logoFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const logoFadeScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 90vh;
  object-fit: cover;
  filter: brightness(0.8);
  transition: filter 0.3s ease;
`;

const HeroSection = styled.section`
  height: 90vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .carousel {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .carousel-item {
    height: 100%;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 2;
    }
  }

  .carousel-caption {
    display: none;
  }

  .carousel-indicators {
    bottom: 20px;
    z-index: 4;
    
    button {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      border: none;
      transition: all 0.2s ease;
      
      &.active {
        background: #ffffff;
        transform: scale(1.2);
      }
    }
  }

  .carousel-control-prev,
  .carousel-control-next {
    width: 5%;
    z-index: 4;
    
    .carousel-control-prev-icon,
    .carousel-control-next-icon {
      background-size: 20px 20px;
      width: 40px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: rgba(255, 255, 255, 1);
        transform: scale(1.1);
      }
    }
  }
`;

const HeroContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${fadeInUp} 1s ease-out;
  pointer-events: none;
  
  * {
    pointer-events: auto;
  }
`;

const HeroLogo = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 1.5rem;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
  animation: ${logoFadeScale} 1.2s ease-out, ${logoFloat} 3s ease-in-out infinite;
  transition: transform 0.3s ease;
  
  @media (min-width: 768px) {
    width: 130px;
    height: 130px;
    margin-bottom: 2rem;
  }
  
  @media (min-width: 1200px) {
    width: 160px;
    height: 160px;
  }
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }
  
  &:hover {
    transform: scale(1.1);
    filter: drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.4));
  }
`;

const HeroTitle = styled.h1`
  font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 2rem;
  margin: 0 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 300;
  line-height: 1.2;
  color: #ffffff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: auto;
  display: block;
  
  @media (min-width: 768px) {
    font-size: 2.8rem;
    letter-spacing: 0.06em;
  }
  
  @media (min-width: 1200px) {
    font-size: 3.5rem;
    letter-spacing: 0.05em;
  }
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    letter-spacing: 0.1em;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  margin: 0 auto 2.5rem auto;
  max-width: 600px;
  line-height: 1.5;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: auto;
  display: block;
  animation: ${slideInRight} 1s ease-out 0.3s both;
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    max-width: 85%;
  }
`;

const ShopButton = styled(Link)`
  display: inline-block;
  background: #000000;
  color: #fff;
  padding: 0.8rem 2rem;
  font-size: 0.9rem;
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
  align-self: center;
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.8rem;
    font-size: 0.85rem;
  }
  
  &:hover {
    background: transparent;
    color: #ffffff;
    border-color: #ffffff;
    text-decoration: none;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const CategorySection = styled.section`
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
  background-color: #ffffff;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 3rem;
  text-transform: none;
  letter-spacing: -0.01em;
  font-weight: 400;
  position: relative;
  color: #000000;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }
`;

const ProductCard = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  transition: all 0.2s ease;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #e0e0e0;
    
    .product-overlay {
      opacity: 1;
    }
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: all 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.02);
  }
`;

const ProductOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  
  .shop-text {
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0.02em;
  }
`;

const ProductInfo = styled.div`
  padding: 1.2rem;
  text-align: center;
  background: #ffffff;
  position: relative;
`;

const ProductName = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 500;
  color: #000000;
  transition: color 0.2s ease;
  
  ${ProductCard}:hover & {
    color: #666666;
  }
`;

const FeaturedProductsSection = styled.section`
  max-width: 1200px;
  margin: 4rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 0;
  position: relative;
  overflow: hidden;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 3rem;
  }
`;

const FeaturedProductCard = styled(ProductCard)`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  
  &:hover {
    border-color: #e0e0e0;
  }
`;

const FeaturedProductPrice = styled.p`
  margin: 0.5rem 0 0;
  font-weight: 600;
  font-size: 1rem;
  color: #000000;
`;

const FeaturedOriginalPrice = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #6c757d;
  text-decoration: line-through;
`;

const FeaturedSalePrice = styled.p`
  margin: 0.25rem 0;
  font-weight: 600;
  font-size: 1rem;
  color: #dc3545;
`;

const FeaturedSaleBadge = styled.div`
  background: #dc3545;
  color: #ffffff;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin-top: 0.25rem;
`;

const FeaturedSaleIndicator = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #dc3545;
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #000000;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 2rem auto;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  p {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: #666666;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  p {
    color: #dc3545;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  p {
    font-size: 1.1rem;
    color: #666666;
  }
`;

const NewBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #000000;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.02em;
  z-index: 3;
`;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/maintenance/products', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Products fetched for HomePage:', data);
          setProducts(data);
        } else {
          console.error('Failed to fetch products:', response.status);
          setError('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
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
        <Carousel fade interval={4000} indicators controls>
          <Carousel.Item>
            <CarouselImage 
              src={heroImage} 
              alt="Seven Four Hero"
            />
          </Carousel.Item>

          <Carousel.Item>
            <CarouselImage 
              src={secondImage} 
              alt="Second Slide"
            />
          </Carousel.Item>
          
          <Carousel.Item>
            <CarouselImage 
              src={thirdImage} 
              alt="Third Slide"
            />
          </Carousel.Item>

          <Carousel.Item>
            <CarouselImage 
              src={fourthImage} 
              alt="Fourth Slide"
            />
          </Carousel.Item>        
        </Carousel>
        <HeroContent>
          <HeroLogo src={logoImage} alt="Seven Four Clothing Logo" />
          <HeroTitle>Seven Four Clothing</HeroTitle>
          <HeroSubtitle>Discover premium streetwear that defines your style. Experience the perfect blend of comfort, quality, and contemporary design.</HeroSubtitle>
          <ShopButton to="/products">Explore Collection</ShopButton>
        </HeroContent>
      </HeroSection>

      <CategorySection>
        <FeaturedProductsSection>
          <SectionTitle>New Releases</SectionTitle>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <p>Loading latest arrivals...</p>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <p>⚠️ {error}</p>
            </ErrorContainer>
          ) : newReleases.length > 0 ? (
            <FeaturedGrid>
              {newReleases.map((product, index) => {
                const saleInfo = getSaleInfo(product);
                return (
                <FeaturedProductCard key={product.id}>
                  {index < 3 && <NewBadge>New</NewBadge>}
                  {saleInfo.isOnSale && <FeaturedSaleIndicator>SALE</FeaturedSaleIndicator>}
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ProductImage 
                      src={getProductImageUrl(product)} 
                      alt={product.productname}
                      onError={(e) => {
                        e.target.src = tshirtImage; // Fallback image
                      }}
                    />
                    <ProductOverlay className="product-overlay">
                      <div className="shop-text">Shop Now</div>
                    </ProductOverlay>
                    <ProductInfo>
                      <ProductName>{product.productname}</ProductName>
                      {(() => {
                        const saleInfo = getSaleInfo(product);
                        if (saleInfo.isOnSale) {
                          return (
                            <div className="sale-price-container">
                              <FeaturedOriginalPrice>₱{saleInfo.originalPrice.toFixed(2)}</FeaturedOriginalPrice>
                              <FeaturedSalePrice>₱{saleInfo.salePrice.toFixed(2)}</FeaturedSalePrice>
                              <FeaturedSaleBadge>-{saleInfo.discountPercentage}% OFF</FeaturedSaleBadge>
                            </div>
                          );
                        } else {
                          return <FeaturedProductPrice>₱{parseFloat(product.productprice || 0).toFixed(2)}</FeaturedProductPrice>;
                        }
                      })()}
                    </ProductInfo>
                  </Link>
                </FeaturedProductCard>
                )
              })}
            </FeaturedGrid>
          ) : (
            <EmptyState>
              <p>No new releases available at the moment.</p>
            </EmptyState>
          )}
        </FeaturedProductsSection>

        <SectionTitle>Shop</SectionTitle>
        <CategoryGrid>
          {categories.map(category => (
            <ProductCard key={category.id}>
              <Link to={`/products?category=${category.id}`} style={{ textDecoration: 'none' }}>
                <ProductImage src={category.image} alt={category.name} />
                <ProductOverlay className="product-overlay">
                  <div className="shop-text">Explore {category.name}</div>
                </ProductOverlay>
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