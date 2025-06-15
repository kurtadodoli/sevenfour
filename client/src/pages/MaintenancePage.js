import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';

const MaintenancePage = () => {
    const [activeTab, setActiveTab] = useState('add');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        productname: '',
        productdescription: '',
        productprice: '',
        productsize: '',
        productcolor: '',
        productquantity: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Generate random product ID
    const generateProductId = () => {
        return Math.floor(100000000000 + Math.random() * 899999999999);
    };

    // Add detailed logging to trace the issue
    const fetchProducts = async () => {
        console.log('🔄 fetchProducts called');
        try {
            setLoading(true);
            setMessage('');
            
            console.log('📡 Making fetch request to /api/maintenance/products');
            const response = await fetch('http://localhost:3001/api/maintenance/products');
            console.log('📡 Response received:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Data received:', data);
                console.log('📊 Data length:', data.length);
                console.log('📋 Setting products in state...');
                
                setProducts(data);
                console.log('✅ Products set in state');
                
            } else {
                const errorText = await response.text();
                console.error('❌ Response not OK:', response.status, errorText);
                setMessage('Error fetching products: ' + response.status);
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setMessage('Connection error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Force refresh every time we switch to manage tab
    useEffect(() => {
        if (activeTab === 'manage') {
            console.log('🔄 Manage tab activated, fetching products...');
            fetchProducts();
        }
    }, [activeTab]);

    // Handle form input changes
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle single image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            productname: '',
            productdescription: '',
            productprice: '',
            productsize: '',
            productcolor: '',
            productquantity: ''
        });
        setImageFile(null);
        setImagePreview('');
        setEditingProduct(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formDataToSend = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (imageFile) {
                formDataToSend.append('productimage', imageFile);
            }

            const response = await fetch('http://localhost:3001/api/maintenance/products', {
                method: 'POST',
                body: formDataToSend
            });

            if (response.ok) {
                setMessage('Product added successfully!');
                resetForm();
                fetchProducts();
            } else {
                throw new Error('Failed to add product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setMessage('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit product
    const editProduct = (product) => {
        setEditingProduct(product);
        setFormData({
            productname: product.productname || '',
            productdescription: product.productdescription || '',
            productprice: product.productprice || '',
            productsize: product.productsize || '',
            productcolor: product.productcolor || '',
            productquantity: product.productquantity || ''
        });
        setImagePreview(product.productimage ? `http://localhost:3001/uploads/${product.productimage}` : '');
        setActiveTab('add');
    };

    // Archive product
    const archiveProduct = async (id) => {
        if (window.confirm('Are you sure you want to archive this product?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/maintenance/products/${id}/archive`, {
                    method: 'POST'
                });
                if (response.ok) {
                    setMessage('Product archived successfully!');
                    fetchProducts();
                } else {
                    setMessage('Error archiving product');
                }
            } catch (error) {
                setMessage('Error: ' + error.message);
            }
        }
    };

    // Delete product
    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this product?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/maintenance/products/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setMessage('Product deleted successfully!');
                    fetchProducts();
                } else {
                    setMessage('Error deleting product');
                }
            } catch (error) {
                setMessage('Error: ' + error.message);
            }
        }
    };

    // Backup data
    const backupData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/maintenance/backup', {
                method: 'POST'
            });
            if (response.ok) {
                const data = await response.json();
                setMessage(`Backup created successfully! File: ${data.filename}`);
            } else {
                setMessage('Error creating backup');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Add the missing deleteProductImage function
    const deleteProductImage = async (productId, filename) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/maintenance/products/${productId}/image/${filename}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setMessage('Image deleted successfully!');
                fetchProducts(); // Refresh products
            } else {
                setMessage('Error deleting image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            setMessage('Error deleting image');
        }
    };

    return (
        <div style={styles.container}>
            <TopBar />
            <div style={styles.mainContent}>
                <div style={styles.content}>
                    {/* Tab Navigation */}
                    <div style={styles.tabContainer}>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'add' ? styles.activeTab : {})}}
                            onClick={() => setActiveTab('add')}
                        >
                            ADD PRODUCT
                        </button>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'manage' ? styles.activeTab : {})}}
                            onClick={() => setActiveTab('manage')}
                        >
                            MANAGE PRODUCTS
                        </button>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'backup' ? styles.activeTab : {})}}
                            onClick={() => setActiveTab('backup')}
                        >
                            BACKUP DATA
                        </button>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div style={styles.message}>
                            {message}
                        </div>
                    )}

                    {/* Add Product Tab */}
                    {activeTab === 'add' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.sectionTitle}>
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} style={styles.form}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>PRODUCT NAME *</label>
                                    <input
                                        type="text"
                                        name="productname"
                                        value={formData.productname}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>PRODUCT IMAGE</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={styles.fileInput}
                                    />
                                    {imagePreview && (
                                        <div style={styles.imagePreviewContainer}>
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                style={styles.imagePreview}
                                            />
                                            <p style={styles.imageCaption}>Image preview</p>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>DESCRIPTION</label>
                                    <textarea
                                        name="productdescription"
                                        value={formData.productdescription}
                                        onChange={handleInputChange}
                                        style={styles.textarea}
                                        rows={4}
                                    />
                                </div>

                                <div style={styles.formRow}>
                                    <div style={styles.formGroupHalf}>
                                        <label style={styles.label}>PRICE *</label>
                                        <input
                                            type="number"
                                            name="productprice"
                                            value={formData.productprice}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroupHalf}>
                                        <label style={styles.label}>SIZE</label>
                                        <input
                                            type="text"
                                            name="productsize"
                                            value={formData.productsize}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>

                                <div style={styles.formRow}>
                                    <div style={styles.formGroupHalf}>
                                        <label style={styles.label}>COLOR</label>
                                        <input
                                            type="text"
                                            name="productcolor"
                                            value={formData.productcolor}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.formGroupHalf}>
                                        <label style={styles.label}>QUANTITY *</label>
                                        <input
                                            type="number"
                                            name="productquantity"
                                            value={formData.productquantity}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={styles.buttonGroup}>
                                    <button 
                                        type="submit" 
                                        style={styles.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? 'SAVING...' : (editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT')}
                                    </button>
                                    {editingProduct && (
                                        <button 
                                            type="button" 
                                            style={styles.cancelButton}
                                            onClick={resetForm}
                                        >
                                            CANCEL
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Manage Products Tab */}
                    {activeTab === 'manage' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.sectionTitle}>Manage Products</h2>
                            
                            {loading ? (
                                <div style={styles.loading}>Loading products...</div>
                            ) : (
                                <div>
                                    <p>Total products: {products.length}</p>
                                    {products.length === 0 ? (
                                        <div style={styles.noProducts}>
                                            <p>No products found in database</p>
                                            <button onClick={fetchProducts}>Refresh</button>
                                        </div>
                                    ) : (
                                        <div style={styles.productsGrid}>
                                            {products.map(product => (
                                                <div key={product.id} style={styles.productCard}>
                                                    {product.productimage && (
                                                        <img 
                                                            src={`http://localhost:3001/uploads/${product.productimage}`}
                                                            alt={product.productname}
                                                            style={styles.productImage}
                                                        />
                                                    )}
                                                    <div style={styles.productInfo}>
                                                        <h3 style={styles.productName}>{product.productname}</h3>
                                                        <p style={styles.productPrice}>${product.productprice}</p>
                                                        <p style={styles.productStock}>Stock: {product.productquantity}</p>
                                                        
                                                        <div style={styles.productActions}>
                                                            <button 
                                                                style={styles.deleteButton}
                                                                onClick={() => deleteProduct(product.id)}
                                                            >
                                                                DELETE
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Backup Data Tab */}
                    {activeTab === 'backup' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.sectionTitle}>Backup Data</h2>
                            <div style={styles.backupSection}>
                                <p style={styles.backupDescription}>
                                    Create a backup of all product data including images and details.
                                </p>
                                <button 
                                    style={styles.backupButton}
                                    onClick={backupData}
                                    disabled={loading}
                                >
                                    {loading ? 'CREATING BACKUP...' : 'CREATE BACKUP'}
                                </button>
                            </div>
                        </div>
                    )}
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
    mainContent: {
        padding: '20px',
        backgroundColor: '#f8f9fa'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    tabContainer: {
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '4px',
        marginBottom: '24px'
    },
    tab: {
        flex: 1,
        padding: '12px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: '#6c757d',
        borderRadius: '6px'
    },
    activeTab: {
        backgroundColor: '#000',
        color: 'white'
    },
    message: {
        padding: '12px 16px',
        marginBottom: '20px',
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        borderRadius: '6px'
    },
    tabContent: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '24px',
        color: '#333'
    },
    form: {
        maxWidth: '800px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    formGroupHalf: {
        flex: 1,
        marginRight: '12px'
    },
    formRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#333'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        resize: 'vertical',
        boxSizing: 'border-box'
    },
    fileInput: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px'
    },
    imagePreviewContainer: {
        marginTop: '12px',
        textAlign: 'center'
    },
    imagePreview: {
        maxWidth: '200px',
        maxHeight: '200px',
        objectFit: 'cover',
        borderRadius: '6px'
    },
    imageCaption: {
        fontSize: '12px',
        color: '#666',
        marginTop: '8px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px'
    },
    submitButton: {
        backgroundColor: '#000',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        color: '#333',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#6c757d'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
    },
    productCard: {
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    productImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover'
    },
    noImagePlaceholder: {
        width: '100%',
        height: '200px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '14px'
    },
    productInfo: {
        padding: '16px'
    },
    productName: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '8px'
    },
    productPrice: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#e74c3c',
        marginBottom: '6px'
    },
    productDetails: {
        fontSize: '13px',
        color: '#6c757d',
        marginBottom: '6px'
    },
    productStock: {
        fontSize: '14px',
        color: '#28a745',
        marginBottom: '6px'
    },
    databaseInfo: {
        fontSize: '11px',
        color: '#999',
        marginBottom: '12px'
    },
    productActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '12px'
    },
    editButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        flex: 1
    },
    archiveButton: {
        backgroundColor: '#ffc107',
        color: 'white',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        flex: 1
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        flex: 1
    },
    backupSection: {
        textAlign: 'center',
        padding: '40px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
    },
    backupDescription: {
        fontSize: '14px',
        color: '#333',
        marginBottom: '24px'
    },
    backupButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    debugInfo: {
        backgroundColor: '#e3f2fd',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    refreshButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px'
    },
    noProducts: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        margin: '20px 0'
    },
    productId: {
        fontSize: '11px',
        color: '#666',
        marginBottom: '10px'
    },
    simpleList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    simpleCard: {
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
    },
    imagePreviewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '10px',
        marginTop: '15px'
    },
    imagePreviewItem: {
        position: 'relative'
    },
    removePreviewButton: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    productImagesContainer: {
        marginBottom: '15px'
    },
    mainImageContainer: {
        position: 'relative',
        marginBottom: '10px'
    },
    imageCount: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px'
    },
    imageManagement: {
        borderTop: '1px solid #eee',
        paddingTop: '10px'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        gap: '5px'
    },
    imageItem: {
        position: 'relative'
    },
    thumbnailImage: {
        width: '100%',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px'
    },
    deleteImageButton: {
        position: 'absolute',
        top: '2px',
        right: '2px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '16px',
        height: '16px',
        cursor: 'pointer',
        fontSize: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

export default MaintenancePage;

