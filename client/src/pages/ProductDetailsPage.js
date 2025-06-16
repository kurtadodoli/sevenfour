import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');

    const fetchProduct = async () => {
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
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

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
    };

    const addToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.productname} added to cart!`);
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <TopBar />
                <div style={styles.loading}>Loading product details...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={styles.container}>
                <TopBar />
                <div style={styles.error}>
                    <h2>{error}</h2>
                    <button onClick={() => navigate('/products')} style={styles.backButton}>
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <TopBar />
            <div style={styles.content}>
                <button onClick={() => navigate('/products')} style={styles.backButton}>
                    ← Back to Products
                </button>                
                <div style={styles.productContainer}>
                    {/* Image Section with Carousel */}
                    <div style={styles.imageSection}>
                        {productImages.length > 0 ? (
                            <div style={styles.imageCarousel}>
                                {/* Main Image */}
                                <div style={styles.mainImageContainer}>
                                    <img 
                                        src={`http://localhost:3001/uploads/${productImages[currentImageIndex]?.image_filename}`}
                                        alt={product.productname}
                                        style={styles.productImage}
                                    />
                                    
                                    {/* Navigation arrows for multiple images */}
                                    {productImages.length > 1 && (
                                        <>
                                            <button 
                                                style={{...styles.navButton, left: '10px'}}
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev > 0 ? prev - 1 : productImages.length - 1
                                                )}
                                            >
                                                ‹
                                            </button>
                                            <button 
                                                style={{...styles.navButton, right: '10px'}}
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev < productImages.length - 1 ? prev + 1 : 0
                                                )}
                                            >
                                                ›
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                {/* Thumbnail navigation */}
                                {productImages.length > 1 && (
                                    <div style={styles.thumbnailContainer}>
                                        {productImages.map((image, index) => (
                                            <img
                                                key={image.image_id}
                                                src={`http://localhost:3001/uploads/${image.image_filename}`}
                                                alt={`${product.productname} ${index + 1}`}
                                                style={{
                                                    ...styles.thumbnail,
                                                    border: index === currentImageIndex ? '3px solid #007bff' : '1px solid #ddd'
                                                }}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : product.productimage ? (
                            <img 
                                src={`http://localhost:3001/uploads/${product.productimage}`}
                                alt={product.productname}
                                style={styles.productImage}
                            />
                        ) : (
                            <div style={styles.noImagePlaceholder}>
                                No Image Available
                            </div>
                        )}
                    </div>
                      <div style={styles.detailsSection}>
                        <h1 style={styles.productName}>{product.productname}</h1>
                        
                        <div style={styles.price}>
                            ₱{parseFloat(product.productprice || 0).toFixed(2)}
                        </div>
                        
                        <div style={styles.description}>
                            <h3>Description</h3>
                            <p>{product.productdescription || 'No description available'}</p>
                        </div>
                        
                        <div style={styles.specifications}>
                            <h3>Product Details</h3>
                            
                            {product.productcolor && (
                                <div style={styles.specItem}>
                                    <span style={styles.specLabel}>Color:</span>
                                    <span>{product.productcolor}</span>
                                </div>
                            )}
                            
                            {/* Size Selection */}
                            {getAvailableSizes(product.sizes).length > 0 && (
                                <div style={styles.specItem}>
                                    <span style={styles.specLabel}>Available Sizes:</span>
                                    <div style={styles.sizeOptions}>
                                        {getAvailableSizes(product.sizes).map((sizeData) => (
                                            <button
                                                key={sizeData.size}
                                                style={{
                                                    ...styles.sizeButton,
                                                    backgroundColor: selectedSize === sizeData.size ? '#007bff' : '#f8f9fa',
                                                    color: selectedSize === sizeData.size ? 'white' : '#333',
                                                    border: selectedSize === sizeData.size ? '2px solid #007bff' : '1px solid #ddd'
                                                }}
                                                onClick={() => setSelectedSize(sizeData.size)}
                                            >
                                                {sizeData.size}
                                                <br />
                                                <small>({sizeData.stock} in stock)</small>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div style={styles.specItem}>
                                <span style={styles.specLabel}>Total Availability:</span>
                                <span style={{
                                    color: getTotalStock(product) > 0 ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                }}>
                                    {getTotalStock(product) > 0 ? 
                                        `${getTotalStock(product)} items in stock` : 
                                        'Out of stock'
                                    }
                                </span>
                            </div>
                        </div>
                        
                        {getTotalStock(product) > 0 && (
                            <div style={styles.purchaseSection}>
                                <div style={styles.quantitySection}>
                                    <label style={styles.quantityLabel}>Quantity:</label>
                                    <div style={styles.quantityControls}>
                                        <button 
                                            style={styles.quantityButton}
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        >
                                            -
                                        </button>
                                        <span style={styles.quantityDisplay}>{quantity}</span>
                                        <button 
                                            style={styles.quantityButton}
                                            onClick={() => {
                                                const maxQuantity = selectedSize ? 
                                                    getStockForSize(selectedSize) : 
                                                    getTotalStock(product);
                                                setQuantity(prev => Math.min(maxQuantity, prev + 1));
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        if (getAvailableSizes(product.sizes).length > 0 && !selectedSize) {
                                            alert('Please select a size first');
                                            return;
                                        }
                                        addToCart();
                                    }}
                                    style={styles.addToCartButton}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        )}
                        
                        {product.productquantity === 0 && (
                            <div style={styles.outOfStock}>
                                This product is currently out of stock
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    loading: {
        textAlign: 'center',
        padding: '100px',
        fontSize: '18px'
    },
    error: {
        textAlign: 'center',
        padding: '100px'
    },
    backButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px',
        fontSize: '14px'
    },
    productContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    imageSection: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    productImage: {
        width: '100%',
        maxWidth: '500px',
        height: 'auto',
        borderRadius: '8px'
    },
    noImagePlaceholder: {
        width: '100%',
        height: '400px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: '#999',
        fontSize: '18px'
    },
    detailsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    productName: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px'
    },
    price: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#e74c3c'
    },
    description: {
        lineHeight: '1.6'
    },
    specifications: {
        borderTop: '1px solid #eee',
        paddingTop: '20px'
    },
    specItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        padding: '5px 0'
    },    specLabel: {
        fontWeight: 'bold',
        color: '#555'
    },
    sizeOptions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '10px'
    },
    sizeButton: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'center',
        minWidth: '60px',
        fontSize: '14px'
    },
    imageCarousel: {
        width: '100%'
    },
    mainImageContainer: {
        position: 'relative',
        marginBottom: '15px'
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer',
        fontSize: '20px',
        zIndex: 10
    },
    thumbnailContainer: {
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '10px'
    },
    thumbnail: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '4px',
        cursor: 'pointer',
        flexShrink: 0
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    quantityButton: {
        width: '30px',
        height: '30px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    quantityDisplay: {
        padding: '5px 15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: 'white'
    },
    purchaseSection: {
        borderTop: '1px solid #eee',
        paddingTop: '20px'
    },
    quantitySection: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
    },
    quantityLabel: {
        fontWeight: 'bold'
    },
    quantitySelect: {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    addToCartButton: {
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        width: '100%'
    },
    outOfStock: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '15px',
        borderRadius: '4px',
        textAlign: 'center',
        fontWeight: 'bold'
    }
};

export default ProductDetailsPage;
