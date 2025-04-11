// src/pages/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Fetch product by id
  useEffect(() => {
    // Combine all products for searching
    const allProducts = [...tshirtProducts, ...shortProducts, ...hoodieProducts, ...jacketProducts];
    const foundProduct = allProducts.find(p => p.id === id);
    
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.colors && foundProduct.colors.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
    }
    
    setLoading(false);
  }, [id]);
  
  if (loading) {
    return <PageContainer>Loading...</PageContainer>;
  }
  
  if (!product) {
    return <PageContainer>Product not found</PageContainer>;
  }

  // Get category path for breadcrumbs
  const categoryPath = product.category.toLowerCase().replace(' ', '-');
  
  return (
    <PageContainer>
      <Breadcrumbs>
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <Link to={`/products?category=${categoryPath}`}>{product.category}</Link>
        <span>›</span>
        {product.name}
      </Breadcrumbs>
      
      <ProductContainer>
        <ImageSection>
          <MainImage src={product.images[selectedImage]} alt={product.name} />
          <ThumbnailContainer>
            {product.images.map((image, index) => (
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
            {product.colors && product.colors.length > 0 && (
              <>
                <OptionTitle>Color: {selectedColor}</OptionTitle>
                <ColorOptions>
                  {product.colors.map((color) => (
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
            
            {product.sizes && product.sizes.length > 0 && (
              <>
                <OptionTitle>Size: {selectedSize}</OptionTitle>
                <SizeOptions>
                  {product.sizes.map((size) => (
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
          
          <AddToCartButton>Add to Cart</AddToCartButton>
          
          <ProductDescription>
            {product.description || `Experience the premium quality and style of Seven Four Clothing's ${product.name}. Our products are designed for both comfort and durability, making them perfect for everyday wear.`}
          </ProductDescription>
        </ProductDetails>
      </ProductContainer>
    </PageContainer>
  );
};

export default ProductDetailPage;