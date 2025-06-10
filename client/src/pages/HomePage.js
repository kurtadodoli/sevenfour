// client/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { tshirtProducts } from '../data/tshirtProducts';
import { shortProducts } from '../data/shortProducts';
import { hoodieProducts } from '../data/hoodieProducts';
import { jacketProducts } from '../data/jacketProducts'; // Import jacket products

// Import your images with their proper file extensions
import heroImage from '../assets/images/seven-four-hero.jpg';
import sfcLogo from '../assets/images/sfc-logo.png';
import tshirtImage from '../assets/images/seven-four-tshirt.jpg';
import shortsImage from '../assets/images/seven-four-shorts.jpg';
import hatImage from '../assets/images/seven-four-hat.jpg';
import socksImage from '../assets/images/seven-four-socks.jpg';
import hoodieImage from '../assets/images/seven-four-hoodie.jpg';
import jacketImage from '../assets/images/seven-four-jacket.jpg';
import jerseyImage from '../assets/images/seven-four-jersey.jpg';
import sweaterImage from '../assets/images/seven-four-sweater.jpg';
import bagImage from '../assets/images/seven-four-bag.jpg';

const HeroLogo = styled.img`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: auto;
  z-index: 3;
  opacity: 0.9;
`;

const HeroSection = styled.section`
  height: 80vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const HeroImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
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
  background-color: #ffffff;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 3rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 2px;
    background-color: #000;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
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

const HomePage = () => {
  // Category data with links to filtered product pages
  const categories = [
    { id: 't-shirts', name: 'T-SHIRTS', image: tshirtImage },
    { id: 'hoodies', name: 'HOODIES', image: hoodieImage },
    { id: 'jackets', name: 'JACKETS', image: jacketImage },
    { id: 'shorts', name: 'SHORTS', image: shortsImage },
    { id: 'headwear', name: 'HEADWEAR', image: hatImage },
    { id: 'socks', name: 'SOCKS', image: socksImage },
    { id: 'jerseys', name: 'JERSEYS', image: jerseyImage },
    { id: 'sweaters', name: 'SWEATERS', image: sweaterImage },
    { id: 'bags', name: 'BAGS', image: bagImage }
  ];

  // Get featured products - t-shirts, shorts, hoodies, and jackets
  const featuredTshirts = tshirtProducts.slice(0, 1);
  const featuredShorts = shortProducts.slice(0, 1);
  const featuredHoodies = hoodieProducts.slice(0, 1);
  const featuredJackets = jacketProducts.slice(0, 1);
  const featuredProducts = [...featuredTshirts, ...featuredShorts, ...featuredHoodies, ...featuredJackets];

  return (
    <main>
      <HeroSection>
        <HeroImage src={heroImage} alt="Seven Four Clothing Hero" />
        <HeroLogo src={sfcLogo} alt="Seven Four Clothing Logo" />
        <HeroContent>
          <HeroTitle>Welcome to Seven Four Clothing</HeroTitle>
          <HeroSubtitle>Discover our latest collection of premium streetwear designed for comfort and style.</HeroSubtitle>
          <ShopButton to="/products">Shop Now</ShopButton>
        </HeroContent>
      </HeroSection>
        <CategorySection>
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

      <FeaturedProductsSection>
        <SectionTitle>Featured Products</SectionTitle>
        <FeaturedGrid>
          {featuredProducts.map(product => (
            <FeaturedProductCard key={product.id}>
              {/* Link directly to product detail pages */}
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProductImage src={product.images[0]} alt={product.name} />
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <FeaturedProductPrice>₱{product.price}</FeaturedProductPrice>
                </ProductInfo>
              </Link>
            </FeaturedProductCard>
          ))}
        </FeaturedGrid>
      </FeaturedProductsSection>
    </main>
  );
};

export default HomePage;