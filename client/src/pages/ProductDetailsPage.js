import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faShoppingCart, 
  faMinus, 
  faPlus,
  faChevronLeft,
  faChevronRight,
  faHeart,
  faTruck,
  faShield,
  faExchangeAlt,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';
import { useCart } from '../context/CartContext';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 40px;
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #f0f0f0;
  color: #666666;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 40px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    border-color: #000000;
    color: #000000;
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainImageContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  display: block;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  
  ${props => props.direction === 'left' ? 'left: 16px;' : 'right: 16px;'}
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#000000' : '#f0f0f0'};
  transition: border-color 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    border-color: #000000;
  }
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 500px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
`;

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ProductName = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const Description = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #000000;
    margin: 0 0 12px 0;
  }
  
  p {
    color: #666666;
    line-height: 1.6;
    margin: 0;
    font-size: 16px;
  }
`;

const Specifications = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 32px;
  
  h3 {
    font-size: 1.2rem;
    font-weight: 500;
    color: #000000;
    margin: 0 0 20px 0;
  }
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 12px 0;
`;

const SpecLabel = styled.span`
  font-weight: 500;
  color: #000000;
  min-width: 120px;
`;

const SpecValue = styled.span`
  color: #666666;
  text-align: right;
  
  &.stock-available {
    color: #27ae60;
    font-weight: 500;
  }
  
  &.stock-unavailable {
    color: #e74c3c;
    font-weight: 500;
  }
`;

const SizeOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SizeButton = styled.button`
  padding: 12px 16px;
  border: 1px solid ${props => props.selected ? '#000000' : '#e0e0e0'};
  background: ${props => props.selected ? '#000000' : '#ffffff'};
  color: ${props => props.selected ? '#ffffff' : '#000000'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 60px;
  
  &:hover {
    border-color: #000000;
    background: ${props => props.selected ? '#000000' : '#fafafa'};
  }
  
  small {
    display: block;
    font-size: 12px;
    opacity: 0.7;
    margin-top: 2px;
  }
`;

const PurchaseSection = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const QuantityLabel = styled.span`
  font-weight: 500;
  color: #000000;
  min-width: 80px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #000000;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  padding: 0 16px;
  font-weight: 500;
  color: #000000;
  min-width: 40px;
  text-align: center;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  
  &:hover {
    background-color: #333333;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
  }
  
  svg {
    &.loading {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const WishlistButton = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  color: #666666;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #000000;
    color: #000000;
  }
`;

const OutOfStock = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
  padding: 16px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
`;

const InfoCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #f0f0f0;
`;

const InfoCard = styled.div`
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #e0e0e0;
    background: #fafafa;
  }
  
  .icon {
    color: #666666;
    margin-bottom: 8px;
  }
  
  .title {
    font-weight: 500;
    color: #000000;
    margin-bottom: 4px;
    font-size: 14px;
  }
  
  .description {
    color: #666666;
    font-size: 12px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 18px;
  color: #666666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  
  h2 {
    color: #000000;
    margin-bottom: 16px;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 24px;
  background: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  padding: 16px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart: addToCartContext } = useCart();    const [product, setProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [notification, setNotification] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/maintenance/products`);
            
            if (response.ok) {
                const products = await response.json();
                const foundProduct = products.find(p => p.id === parseInt(id));
                
                if (foundProduct) {
                    setProduct(foundProduct);
                    
                    // Fetch product images
                    const imagesResponse = await fetch(`http://localhost:3001/api/maintenance/products/${foundProduct.product_id}/images`);
                    if (imagesResponse.ok) {
                        const images = await imagesResponse.json();
                        setProductImages(images);
                    }
                } else {
                    setError('Product not found');
                }
            } else {
                setError('Failed to load product');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    }, [id]);    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Parse sizes data
    const parseSizes = (sizesData) => {
        try {
            if (typeof sizesData === 'string') {
                return JSON.parse(sizesData);
            }
            return sizesData || [];
        } catch (error) {
            return [];
        }
    };

    // Get total stock
    const getTotalStock = (product) => {
        if (product.total_stock !== undefined) {
            return product.total_stock;
        }
        const sizes = parseSizes(product.sizes);
        return sizes.reduce((total, size) => total + (size.stock || 0), 0);
    };

    // Get available sizes
    const getAvailableSizes = (sizesData) => {
        const sizes = parseSizes(sizesData);
        return sizes.filter(size => size.stock > 0);
    };

    // Get stock for selected size
    const getStockForSize = (size) => {
        const sizes = parseSizes(product.sizes);
        const sizeData = sizes.find(s => s.size === size);
        return sizeData ? sizeData.stock : 0;
    };    const addToCart = async () => {
        // Validate required fields
        if (availableSizes.length > 0 && !selectedSize) {
            showNotification('Please select a size first', 'error');
            return;
        }

        try {
            setAddingToCart(true);
            console.log('Adding to cart:', {
                productId: product.product_id || product.id,
                color: product.productcolor || '',
                size: selectedSize || '',
                quantity: quantity
            });
            
            // Use the CartContext addToCart function
            const result = await addToCartContext(
                product.product_id || product.id, 
                product.productcolor || '', 
                selectedSize || '', 
                quantity
            );

            console.log('Add to cart result:', result);

            if (result.success) {
                showNotification(`${product.productname} added to cart!`, 'success');
                // Reset quantity and size selection after successful add
                setQuantity(1);
                if (availableSizes.length > 0) {
                    setSelectedSize('');
                }
            } else {
                showNotification(result.message || 'Failed to add item to cart', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add item to cart', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    // Helper function to show notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 4000); // Hide after 4 seconds
    };

    if (loading) {
        return (
            <PageContainer>
                <TopBar />
                <ContentWrapper>
                    <LoadingContainer>Loading product details...</LoadingContainer>
                </ContentWrapper>
            </PageContainer>
        );
    }

    if (error || !product) {
        return (
            <PageContainer>
                <TopBar />
                <ContentWrapper>
                    <ErrorContainer>
                        <h2>{error}</h2>
                        <BackButton onClick={() => navigate('/products')}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Back to Products
                        </BackButton>
                    </ErrorContainer>
                </ContentWrapper>
            </PageContainer>
        );
    }    const totalStock = getTotalStock(product);
    const availableSizes = getAvailableSizes(product.sizes);
    const maxQuantity = selectedSize ? getStockForSize(selectedSize) : totalStock;

    return (
        <PageContainer>
            <TopBar />
            {notification && (
                <NotificationContainer type={notification.type}>
                    <FontAwesomeIcon 
                        icon={notification.type === 'success' ? faCheck : faExclamationTriangle} 
                    />
                    {notification.message}
                </NotificationContainer>
            )}
            <ContentWrapper>
                <BackButton onClick={() => navigate('/products')}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Products
                </BackButton>
                
                <ProductContainer>
                    {/* Image Section */}
                    <ImageSection>
                        {productImages.length > 0 ? (
                            <>
                                <MainImageContainer>
                                    <ProductImage
                                        src={`http://localhost:3001/uploads/${productImages[currentImageIndex]?.image_filename}`}
                                        alt={product.productname}
                                    />
                                    
                                    {productImages.length > 1 && (
                                        <>
                                            <NavButton 
                                                direction="left"
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev > 0 ? prev - 1 : productImages.length - 1
                                                )}
                                            >
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </NavButton>
                                            <NavButton 
                                                direction="right"
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev < productImages.length - 1 ? prev + 1 : 0
                                                )}
                                            >
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </NavButton>
                                        </>
                                    )}
                                </MainImageContainer>
                                
                                {productImages.length > 1 && (
                                    <ThumbnailContainer>
                                        {productImages.map((image, index) => (
                                            <Thumbnail
                                                key={image.image_id}
                                                src={`http://localhost:3001/uploads/${image.image_filename}`}
                                                alt={`${product.productname} ${index + 1}`}
                                                active={index === currentImageIndex}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </ThumbnailContainer>
                                )}
                            </>
                        ) : product.productimage ? (
                            <MainImageContainer>
                                <ProductImage
                                    src={`http://localhost:3001/uploads/${product.productimage}`}
                                    alt={product.productname}
                                />
                            </MainImageContainer>
                        ) : (
                            <NoImagePlaceholder>
                                No Image Available
                            </NoImagePlaceholder>
                        )}
                    </ImageSection>

                    {/* Details Section */}
                    <DetailsSection>
                        <ProductName>{product.productname}</ProductName>
                        
                        <Price>₱{parseFloat(product.productprice || 0).toFixed(2)}</Price>
                        
                        <Description>
                            <h3>Description</h3>
                            <p>{product.productdescription || 'No description available'}</p>
                        </Description>
                        
                        <Specifications>
                            <h3>Product Details</h3>
                            
                            {product.productcolor && (
                                <SpecItem>
                                    <SpecLabel>Color:</SpecLabel>
                                    <SpecValue>{product.productcolor}</SpecValue>
                                </SpecItem>
                            )}
                            
                            {availableSizes.length > 0 && (
                                <SpecItem>
                                    <SpecLabel>Size:</SpecLabel>
                                    <SizeOptions>
                                        {availableSizes.map((sizeData) => (
                                            <SizeButton
                                                key={sizeData.size}
                                                selected={selectedSize === sizeData.size}
                                                onClick={() => setSelectedSize(sizeData.size)}
                                            >
                                                {sizeData.size}
                                                <small>({sizeData.stock} available)</small>
                                            </SizeButton>
                                        ))}
                                    </SizeOptions>
                                </SpecItem>
                            )}
                            
                            <SpecItem>
                                <SpecLabel>Availability:</SpecLabel>
                                <SpecValue className={totalStock > 0 ? 'stock-available' : 'stock-unavailable'}>
                                    {totalStock > 0 ? 
                                        `${totalStock} items in stock` : 
                                        'Out of stock'
                                    }
                                </SpecValue>
                            </SpecItem>
                        </Specifications>
                        
                        {totalStock > 0 ? (
                            <PurchaseSection>
                                <QuantitySection>
                                    <QuantityLabel>Quantity:</QuantityLabel>
                                    <QuantityControls>
                                        <QuantityButton 
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <FontAwesomeIcon icon={faMinus} />
                                        </QuantityButton>
                                        <QuantityDisplay>{quantity}</QuantityDisplay>
                                        <QuantityButton 
                                            onClick={() => setQuantity(prev => Math.min(maxQuantity, prev + 1))}
                                            disabled={quantity >= maxQuantity}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </QuantityButton>
                                    </QuantityControls>
                                </QuantitySection>
                                  <ActionButtons>                                    <AddToCartButton 
                                        onClick={addToCart}
                                        disabled={addingToCart || totalStock === 0}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faShoppingCart}
                                            className={addingToCart ? 'loading' : ''}
                                        />
                                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                                    </AddToCartButton>
                                    <WishlistButton>
                                        <FontAwesomeIcon icon={faHeart} />
                                    </WishlistButton>
                                </ActionButtons>
                            </PurchaseSection>
                        ) : (
                            <OutOfStock>
                                This product is currently out of stock
                            </OutOfStock>
                        )}

                        <InfoCards>
                            <InfoCard>
                                <div className="icon">
                                    <FontAwesomeIcon icon={faTruck} size="lg" />
                                </div>
                                <div className="title">Free Shipping</div>
                                <div className="description">On orders over ₱1,500</div>
                            </InfoCard>
                            <InfoCard>
                                <div className="icon">
                                    <FontAwesomeIcon icon={faShield} size="lg" />
                                </div>
                                <div className="title">Secure Payment</div>
                                <div className="description">100% secure payment</div>
                            </InfoCard>
                            <InfoCard>
                                <div className="icon">
                                    <FontAwesomeIcon icon={faExchangeAlt} size="lg" />
                                </div>
                                <div className="title">Easy Returns</div>
                                <div className="description">30-day return policy</div>
                            </InfoCard>
                        </InfoCards>
                    </DetailsSection>
                </ProductContainer>
            </ContentWrapper>
        </PageContainer>
    );
};

export default ProductDetailsPage;
