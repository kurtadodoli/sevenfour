import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Update fetchProducts to use the same endpoint as MaintenancePage
    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Fetching products for customers...');
            
            const response = await fetch('http://localhost:3001/api/maintenance/products');
            
            if (response.ok) {
                const data = await response.json();
                console.log('Products received:', data);
                
                // Filter only active products for customers
                const activeProducts = data.filter(product => 
                    product.productstatus === 'active'
                );
                
                setProducts(activeProducts);
            } else {
                setError('Failed to load products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Parse sizes data for display
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

    // Get available sizes for display
    const getAvailableSizes = (sizesData) => {
        const sizes = parseSizes(sizesData);
        return sizes.filter(size => size.stock > 0).map(size => size.size);
    };

    // Get total stock
    const getTotalStock = (product) => {
        if (product.total_stock !== undefined) {
            return product.total_stock;
        }
        const sizes = parseSizes(product.sizes);
        return sizes.reduce((total, size) => total + (size.stock || 0), 0);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '60vh' }}>
            <TopBar />
            {/* Remove the sidebar and flex container */}
            <div>
                <h1 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem', color: '#333' }}>
                    Our Products
                </h1>
                
                {loading && (
                    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                        <h2>Loading products...</h2>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                        <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>
                            {error}
                        </h2>
                        <button 
                            onClick={fetchProducts}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#333',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Try Again
                        </button>
                        </div>
                    )}

                    {!loading && !error && products.length > 0 && (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                            gap: '30px',
                            marginBottom: '40px'
                        }}>
                            {products.map(product => (
                                <div key={product.id} style={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'pointer'
                                }}                                onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    {/* Product Image with multiple image support */}
                                    {product.productimage && (
                                        <div style={{ position: 'relative' }}>
                                            <img 
                                                src={`http://localhost:3001/uploads/${product.productimage}`} 
                                                alt={product.productname}
                                                style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />                                            {/* Show image count if multiple images */}
                                            {product.images && product.images.length > 1 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '10px',
                                                    right: '10px',
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px'
                                                }}>
                                                    +{product.images.length - 1} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#333' }}>
                                            {product.productname}
                                        </h3>
                                        
                                        <p style={{ 
                                            color: '#666', 
                                            fontSize: '14px', 
                                            lineHeight: '1.4', 
                                            marginBottom: '15px',
                                            height: '60px',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {product.productdescription || 'No description available'}
                                        </p>
                                        
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ 
                                                fontSize: '1.5rem', 
                                                fontWeight: 'bold', 
                                                color: '#e74c3c', 
                                                marginBottom: '10px' 
                                            }}>
                                                ${parseFloat(product.productprice || 0).toFixed(2)}
                                            </div>
                                            
                                            {/* Available Sizes */}
                                            {getAvailableSizes(product.sizes).length > 0 && (
                                                <div style={{ fontSize: '14px', color: '#555', margin: '5px 0' }}>
                                                    Sizes: {getAvailableSizes(product.sizes).join(', ')}
                                                </div>
                                            )}
                                            
                                            {product.productcolor && (
                                                <div style={{ fontSize: '14px', color: '#555', margin: '5px 0' }}>
                                                    Color: {product.productcolor}
                                                </div>
                                            )}
                                            
                                            <div style={{ 
                                                fontSize: '14px', 
                                                color: getTotalStock(product) > 0 ? '#28a745' : '#dc3545', 
                                                fontWeight: '500'
                                            }}>
                                                {getTotalStock(product) > 0 ? 
                                                    `${getTotalStock(product)} in stock` : 
                                                    'Out of stock'
                                                }
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                                                const existingItem = cart.find(item => item.id === product.id);
                                                
                                                if (existingItem) {
                                                    existingItem.quantity += 1;
                                                } else {
                                                    cart.push({ ...product, quantity: 1 });
                                                }
                                                
                                                localStorage.setItem('cart', JSON.stringify(cart));
                                                alert(`${product.productname} added to cart!`);
                                            }}                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                backgroundColor: getTotalStock(product) > 0 ? '#333' : '#ccc',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: getTotalStock(product) > 0 ? 'pointer' : 'not-allowed'
                                            }}
                                            disabled={getTotalStock(product) === 0}                                        >
                                            {getTotalStock(product) > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <h2 style={{ color: '#666' }}>No products available</h2>
                            <p style={{ color: '#999' }}>
                                Check back later for new products!
                            </p>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default ProductsPage;