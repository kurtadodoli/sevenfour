import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/maintenance/products`);
            
            if (response.ok) {
                const products = await response.json();
                const foundProduct = products.find(p => p.id === parseInt(id));
                
                if (foundProduct) {
                    setProduct(foundProduct);
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
                    <div style={styles.imageSection}>
                        {product.productimage ? (
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
                            ${parseFloat(product.productprice || 0).toFixed(2)}
                        </div>
                        
                        <div style={styles.description}>
                            <h3>Description</h3>
                            <p>{product.productdescription || 'No description available'}</p>
                        </div>
                        
                        <div style={styles.specifications}>
                            <h3>Product Details</h3>
                            <div style={styles.specItem}>
                                <span style={styles.specLabel}>Size:</span>
                                <span>{product.productsize || 'N/A'}</span>
                            </div>
                            <div style={styles.specItem}>
                                <span style={styles.specLabel}>Color:</span>
                                <span>{product.productcolor || 'N/A'}</span>
                            </div>
                            <div style={styles.specItem}>
                                <span style={styles.specLabel}>Availability:</span>
                                <span style={{
                                    color: product.productquantity > 0 ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                }}>
                                    {product.productquantity > 0 ? 
                                        `${product.productquantity} in stock` : 
                                        'Out of stock'
                                    }
                                </span>
                            </div>
                        </div>
                        
                        {product.productquantity > 0 && (
                            <div style={styles.purchaseSection}>
                                <div style={styles.quantitySection}>
                                    <label style={styles.quantityLabel}>Quantity:</label>
                                    <select 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        style={styles.quantitySelect}
                                    >
                                        {[...Array(Math.min(10, product.productquantity))].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <button 
                                    onClick={addToCart}
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
    },
    specLabel: {
        fontWeight: 'bold',
        color: '#555'
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
