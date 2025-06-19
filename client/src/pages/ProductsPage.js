import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faEye, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import TopBar from '../components/TopBar';

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

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 300;
  color: #000000;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666666;
  margin: 16px 0 0 0;
  font-weight: 300;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #666666;
`;

// Search Components
const SearchSection = styled.div`
  margin-bottom: 40px;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  font-size: 1rem;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #999999;
    font-weight: 300;
  }
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #666666;
  font-size: 1.1rem;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999999;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    color: #000000;
    background-color: #f5f5f5;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.active ? '#000000' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#666666'};
  border: 1px solid ${props => props.active ? '#000000' : '#e0e0e0'};
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#333333' : '#f5f5f5'};
    border-color: ${props => props.active ? '#333333' : '#000000'};
  }
`;

const SearchResults = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: #666666;  font-size: 0.95rem;
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: #666666;
  font-weight: 300;
`;

const ErrorWrapper = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const ErrorText = styled.h2`
  color: #000000;
  font-weight: 400;
  margin-bottom: 24px;
  font-size: 1.5rem;
`;

const RetryButton = styled.button`
  padding: 12px 32px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    background-color: #333333;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
`;

const ProductCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #000000;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  background-color: #fafafa;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.02);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ProductCard}:hover & {
    opacity: 1;
  }
`;

const ViewButton = styled.button`
  background-color: #ffffff;
  color: #000000;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #000000;
    color: #ffffff;
  }
`;

const ImageBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const ProductInfo = styled.div`
  padding: 24px;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 400;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const ProductDescription = styled.p`
  color: #666666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PriceSection = styled.div`
  margin-bottom: 16px;
`;

const Price = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  font-size: 13px;
  color: #666666;
  
  strong {
    color: #000000;
    font-weight: 500;
  }
`;

const StockStatus = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.inStock ? '#000000' : '#999999'};
  margin-bottom: 20px;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${props => props.disabled ? '#f5f5f5' : '#000000'};
  color: ${props => props.disabled ? '#999999' : '#ffffff'};
  border: ${props => props.disabled ? '1px solid #e0e0e0' : 'none'};
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.disabled ? '#f5f5f5' : '#333333'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const EmptyTitle = styled.h2`
  color: #000000;
  font-weight: 300;
  font-size: 1.8rem;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  color: #666666;
  font-size: 1.1rem;
  font-weight: 300;
`;

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const { currentUser } = useAuth();

    // Categories for filtering
    const categories = [
        { value: 'all', label: 'All Products' },
        { value: 't-shirts', label: 'T-Shirts' },
        { value: 'hoodies', label: 'Hoodies' },
        { value: 'shorts', label: 'Shorts' },
        { value: 'jackets', label: 'Jackets' },
        { value: 'bags', label: 'Bags' },
        { value: 'hats', label: 'Hats' },
        { value: 'sweaters', label: 'Sweaters' }
    ];const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Using the enhanced API endpoint that includes size-color variants
            const response = await fetch('http://localhost:3001/api/enhanced-maintenance/products');
            
            if (response.ok) {
                const data = await response.json();
                console.log('Product data received:', data.length, 'items');
                
                // Filter only active products for customers
                const activeProducts = data.filter(product => 
                    product.status === 'active' && !product.is_archived
                );

                // Process products to ensure all have consistent structure
                const processedProducts = activeProducts.map(product => ({
                    ...product,
                    // Ensure product_id is used as id for consistent navigation
                    id: product.product_id
                }));
                
                setProducts(processedProducts);
                setFilteredProducts(processedProducts);
            } else {
                setError('Failed to load products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };    // Filter products based on search term and category
    useEffect(() => {
        // Create a new array from products
        const filtered = products.filter(product => {
            // Apply search filter if there's a search term
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                
                // Basic product properties search
                if (
                    product.productname?.toLowerCase().includes(searchLower) ||
                    product.productdescription?.toLowerCase().includes(searchLower) ||
                    product.product_type?.toLowerCase().includes(searchLower) ||
                    product.productcolor?.toLowerCase().includes(searchLower)
                ) {
                    // If category filter is also applied, check that too
                    return selectedCategory === 'all' || product.product_type === selectedCategory;
                }
                
                // Advanced search in size-color variants
                if (product.sizeColorVariants) {
                    const variants = parseSizeColorVariants(product.sizeColorVariants);
                    const matchesVariant = variants.some(variant => 
                        variant.size?.toLowerCase().includes(searchLower) ||
                        variant.colorStocks?.some(cs => 
                            cs.color?.toLowerCase().includes(searchLower)
                        )
                    );
                    
                    if (matchesVariant) {
                        return selectedCategory === 'all' || product.product_type === selectedCategory;
                    }
                }
                
                // Legacy search in sizes and colors
                const sizes = parseSizes(product.sizes);
                if (sizes.some(size => size.size?.toLowerCase().includes(searchLower))) {
                    return selectedCategory === 'all' || product.product_type === selectedCategory;
                }
                
                return false;
            } 
            
            // If no search term but category filter is applied
            return selectedCategory === 'all' || product.product_type === selectedCategory;
        });
        
        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
    };

    // Handle category filter
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Parse sizes data for display - enhanced for size-color variants
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

    // Parse size-color variants
    const parseSizeColorVariants = (variantsData) => {
        try {
            if (typeof variantsData === 'string') {
                return JSON.parse(variantsData);
            }
            return variantsData || [];
        } catch (error) {
            return [];
        }
    };

    // Get available sizes for display
    const getAvailableSizes = (product) => {
        // Check if the product has the new sizeColorVariants structure
        if (product.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            return variants
                .filter(variant => variant.colorStocks.some(cs => cs.stock > 0))
                .map(variant => variant.size);
        }
        
        // Fallback to the old structure
        const sizes = parseSizes(product.sizes);
        return sizes.filter(size => size.stock > 0).map(size => size.size);
    };

    // Get available colors for a product
    const getAvailableColors = (product) => {
        if (product.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            // Get unique colors across all variants that have stock
            const colors = new Set();
            variants.forEach(variant => {
                variant.colorStocks.forEach(cs => {
                    if (cs.stock > 0) {
                        colors.add(cs.color);
                    }
                });
            });
            return Array.from(colors);
        }
        
        // Fallback to old structure or single color
        if (product.colors) {
            try {
                const colors = parseSizes(product.colors);
                return colors.filter(color => color.trim() !== '');
            } catch {
                return product.productcolor ? [product.productcolor] : [];
            }
        }
        
        return product.productcolor ? [product.productcolor] : [];
    };

    // Get total stock for a product
    const getTotalStock = (product) => {
        // Use total_stock if it exists
        if (product.total_stock !== undefined && product.total_stock !== null) {
            return product.total_stock;
        }
        
        // Use sizeColorVariants if available
        if (product.sizeColorVariants) {
            const variants = parseSizeColorVariants(product.sizeColorVariants);
            return variants.reduce((total, variant) => {
                return total + variant.colorStocks.reduce((subtotal, cs) => {
                    return subtotal + (cs.stock || 0);
                }, 0);
            }, 0);
        }
        
        // Fallback to old sizes structure
        const sizes = parseSizes(product.sizes);
        return sizes.reduce((total, size) => total + (size.stock || 0), 0);
    };    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        
        if (!currentUser) {
            toast.info('Please login to add items to cart');
            navigate('/login');
            return;
        }

        // Use product_id for consistency with MaintenancePage updates
        const productId = product.product_id || product.id;
        
        // Default color and size selection based on availability
        let defaultColor = 'Default';
        let defaultSize = 'One Size';
        
        // Try to get the first available color from the enhanced structure
        const availableColors = getAvailableColors(product);
        if (availableColors.length > 0) {
            defaultColor = availableColors[0];
        }
        
        // Try to get the first available size from the enhanced structure
        const availableSizes = getAvailableSizes(product);
        if (availableSizes.length > 0) {
            defaultSize = availableSizes[0];
        }

        try {
            const result = await addToCart(
                productId,
                defaultColor,
                defaultSize,
                1
            );
            
            if (result.success) {
                toast.success(result.message || 'Item added to cart!');
                navigate('/orders');
            } else {
                toast.error(result.message || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error('Failed to add item to cart');
        }
    };

    return (
        <PageContainer>
            <TopBar />
            <ContentWrapper>                <Header>
                    <Title>Our Collection</Title>
                    <Subtitle>Discover our carefully curated selection of premium products</Subtitle>
                </Header>
                
                {/* Search Section */}
                <SearchSection>
                    <SearchContainer>
                        <SearchIcon icon={faSearch} />
                        <SearchInput
                            type="text"
                            placeholder="Search products by name, description, color, or size..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <ClearButton onClick={clearSearch}>
                                <FontAwesomeIcon icon={faTimes} />
                            </ClearButton>
                        )}
                    </SearchContainer>
                    
                    <FilterContainer>
                        {categories.map(category => (
                            <FilterButton
                                key={category.value}
                                active={selectedCategory === category.value}
                                onClick={() => handleCategoryChange(category.value)}
                            >
                                {category.label}
                            </FilterButton>
                        ))}
                    </FilterContainer>
                    
                    {(searchTerm || selectedCategory !== 'all') && (
                        <SearchResults>
                            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                            {searchTerm && ` for "${searchTerm}"`}
                            {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
                        </SearchResults>
                    )}
                </SearchSection>
                
                {loading && (
                    <LoadingWrapper>
                        <LoadingText>Loading products...</LoadingText>
                    </LoadingWrapper>
                )}

                {error && (
                    <ErrorWrapper>
                        <ErrorText>{error}</ErrorText>
                        <RetryButton onClick={fetchProducts}>
                            Try Again
                        </RetryButton>
                    </ErrorWrapper>
                )}                {!loading && !error && filteredProducts.length > 0 && (
                    <ProductGrid>                        {filteredProducts.map(product => {
                            const totalStock = getTotalStock(product);
                            
                            return (
                                <ProductCard key={product.id}>
                                    <ImageContainer>
                                        {product.productimage && (
                                            <>
                                                <ProductImage 
                                                    src={`http://localhost:3001/uploads/${product.productimage}`} 
                                                    alt={product.productname}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <ImageOverlay>
                                                    <ViewButton onClick={() => navigate(`/product/${product.id}`)}>
                                                        <FontAwesomeIcon icon={faEye} /> View Details
                                                    </ViewButton>
                                                </ImageOverlay>
                                                {product.images && product.images.length > 1 && (
                                                    <ImageBadge>
                                                        +{product.images.length - 1} more
                                                    </ImageBadge>
                                                )}
                                            </>
                                        )}
                                    </ImageContainer>
                                    
                                    <ProductInfo onClick={() => navigate(`/product/${product.id}`)}>
                                        <ProductName>{product.productname}</ProductName>
                                        
                                        <ProductDescription>
                                            {product.productdescription || 'Premium quality product with exceptional craftsmanship'}
                                        </ProductDescription>
                                        
                                        <PriceSection>
                                            <Price>₱{parseFloat(product.productprice || 0).toFixed(2)}</Price>
                                        </PriceSection>
                                          <ProductDetails>
                                            {getAvailableSizes(product).length > 0 && (
                                                <DetailItem>
                                                    <strong>Sizes:</strong> {getAvailableSizes(product).join(', ')}
                                                </DetailItem>
                                            )}
                                            
                                            {getAvailableColors(product).length > 0 && (
                                                <DetailItem>
                                                    <strong>Colors:</strong> {getAvailableColors(product).join(', ')}
                                                </DetailItem>
                                            )}
                                        </ProductDetails>
                                        
                                        <StockStatus inStock={totalStock > 0}>
                                            {totalStock > 0 ? 
                                                `${totalStock} in stock` : 
                                                'Out of stock'
                                            }
                                        </StockStatus>

                                        <AddToCartButton
                                            onClick={(e) => handleAddToCart(e, product)}
                                            disabled={totalStock === 0 || cartLoading}
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} />
                                            {cartLoading ? 'Adding...' : 
                                             totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </AddToCartButton>
                                    </ProductInfo>
                                </ProductCard>
                            );
                        })}
                    </ProductGrid>
                )}                {!loading && !error && products.length === 0 && (
                    <EmptyState>
                        <EmptyTitle>No products available</EmptyTitle>
                        <EmptyText>
                            Check back later for new products in our collection
                        </EmptyText>
                    </EmptyState>
                )}

                {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
                    <EmptyState>
                        <EmptyTitle>No products found</EmptyTitle>
                        <EmptyText>
                            {searchTerm ? 
                                `No products match "${searchTerm}". Try adjusting your search terms.` :
                                `No products found in ${categories.find(c => c.value === selectedCategory)?.label || 'this category'}.`
                            }
                        </EmptyText>
                        <RetryButton onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                            Clear Filters
                        </RetryButton>
                    </EmptyState>
                )}            </ContentWrapper>
        </PageContainer>
    );
};

export default ProductsPage;