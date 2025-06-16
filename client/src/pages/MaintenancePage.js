import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';

const MaintenancePage = () => {
    const [activeTab, setActiveTab] = useState('add');
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        productname: '',
        productdescription: '',
        productprice: '',
        productcolor: '',
        sizes: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }]
    });
    
    // Multiple image handling
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);    // Generate random product ID
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
                
                // Separate active and archived products
                const activeProducts = data.filter(product => product.productstatus !== 'archived');
                const archived = data.filter(product => product.productstatus === 'archived');
                
                setProducts(activeProducts);
                setArchivedProducts(archived);
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

    // Fetch product images
    const fetchProductImages = async (productId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/maintenance/products/${productId}/images`);
            if (response.ok) {
                const images = await response.json();
                return images;
            }
        } catch (error) {
            console.error('Error fetching product images:', error);
        }
        return [];
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
    }, [activeTab]);    // Handle form input changes
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle size and stock changes
    const handleSizeChange = (index, field, value) => {
        const newSizes = [...formData.sizes];
        newSizes[index][field] = field === 'stock' ? parseInt(value) || 0 : value;
        setFormData({
            ...formData,
            sizes: newSizes
        });
    };

    // Add new size
    const addSize = () => {
        setFormData({
            ...formData,
            sizes: [...formData.sizes, { size: '', stock: 0 }]
        });
    };

    // Remove size
    const removeSize = (index) => {
        const newSizes = formData.sizes.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            sizes: newSizes
        });
    };

    // Handle multiple image upload
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = selectedImages.length + existingImages.length;
        
        if (totalImages + files.length > 10) {
            setMessage('Maximum 10 images allowed per product');
            return;
        }

        setSelectedImages(prev => [...prev, ...files]);
        
        // Create previews
        const newPreviews = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target.result);
                if (newPreviews.length === files.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove selected image
    const removeSelectedImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
    };

    // Remove existing image
    const removeExistingImage = async (imageId, filename) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/maintenance/images/${imageId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setExistingImages(prev => prev.filter(img => img.image_id !== imageId));
                setMessage('Image deleted successfully!');
            } else {
                setMessage('Error deleting image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            setMessage('Error deleting image');
        }
    };    // Reset form
    const resetForm = () => {
        setFormData({
            productname: '',
            productdescription: '',
            productprice: '',
            productcolor: '',
            sizes: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }]
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setExistingImages([]);
        setEditingProduct(null);
        setShowEditModal(false);
    };    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formDataToSend = new FormData();
            
            // Add product data
            formDataToSend.append('productname', formData.productname);
            formDataToSend.append('productdescription', formData.productdescription);
            formDataToSend.append('productprice', formData.productprice);
            formDataToSend.append('productcolor', formData.productcolor);
            formDataToSend.append('sizes', JSON.stringify(formData.sizes));
              // Calculate total stock
            const totalStock = formData.sizes.reduce((sum, size) => sum + size.stock, 0);
            formDataToSend.append('total_stock', totalStock);

            // Add images only if there are any selected
            if (selectedImages && selectedImages.length > 0) {
                selectedImages.forEach((image, index) => {
                    formDataToSend.append('images', image);
                });
            }

            // Debug: Log what we're sending
            console.log('=== FRONTEND FORM DATA ===');
            console.log('Product name:', formData.productname);
            console.log('Selected images count:', selectedImages.length);
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ':', pair[1]);
            }

            const url = editingProduct 
                ? `http://localhost:3001/api/maintenance/products/${editingProduct.id}`
                : 'http://localhost:3001/api/maintenance/products';
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formDataToSend
            });

            if (response.ok) {
                setMessage(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
                resetForm();
                fetchProducts();
            } else {
                throw new Error(`Failed to ${editingProduct ? 'update' : 'add'} product`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setMessage('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };    // Edit product
    const editProduct = async (product) => {
        setEditingProduct(product);
        
        // Parse sizes from JSON or create default
        let sizes;
        try {
            sizes = product.sizes ? JSON.parse(product.sizes) : 
                   [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }];
        } catch (error) {
            sizes = [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }];
        }
        
        setFormData({
            productname: product.productname || '',
            productdescription: product.productdescription || '',
            productprice: product.productprice || '',
            productcolor: product.productcolor || '',
            sizes: sizes
        });
        
        // Fetch existing images
        const images = await fetchProductImages(product.product_id);
        setExistingImages(images);
        
        setSelectedImages([]);
        setImagePreviews([]);
        setShowEditModal(true);
        setActiveTab('add');
    };    // Archive product
    const archiveProduct = async (id) => {
        if (window.confirm('Are you sure you want to archive this product? It will be removed from public view.')) {
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

    // Restore archived product
    const restoreProduct = async (id) => {
        if (window.confirm('Are you sure you want to restore this product?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/maintenance/products/${id}/restore`, {
                    method: 'POST'
                });
                if (response.ok) {
                    setMessage('Product restored successfully!');
                    fetchProducts();
                } else {
                    setMessage('Error restoring product');
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
                                </div>                                <div style={styles.formGroup}>
                                    <label style={styles.label}>PRODUCT IMAGES (Max: 10)</label>                                    <input
                                        type="file"
                                        name="images"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        style={styles.fileInput}
                                        disabled={selectedImages.length + existingImages.length >= 10}
                                    />
                                    <p style={styles.imageLimit}>
                                        {selectedImages.length + existingImages.length}/10 images uploaded
                                    </p>
                                    
                                    {/* Existing Images */}
                                    {existingImages.length > 0 && (
                                        <div style={styles.imageSection}>
                                            <h4>Existing Images:</h4>
                                            <div style={styles.imageGrid}>
                                                {existingImages.map((img, index) => (
                                                    <div key={img.image_id} style={styles.imageContainer}>
                                                        <img 
                                                            src={`http://localhost:3001/uploads/${img.image_filename}`} 
                                                            alt={`Product ${index + 1}`}
                                                            style={styles.imagePreview}
                                                        />
                                                        {img.is_thumbnail && (
                                                            <div style={styles.thumbnailBadge}>Thumbnail</div>
                                                        )}
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeExistingImage(img.image_id, img.image_filename)}
                                                            style={styles.removeImageButton}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* New Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div style={styles.imageSection}>
                                            <h4>New Images:</h4>
                                            <div style={styles.imageGrid}>
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} style={styles.imageContainer}>
                                                        <img 
                                                            src={preview} 
                                                            alt={`New ${index + 1}`}
                                                            style={styles.imagePreview}
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeSelectedImage(index)}
                                                            style={styles.removeImageButton}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
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
                                </div>                                <div style={styles.formRow}>
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
                                        <label style={styles.label}>COLOR</label>
                                        <input
                                            type="text"
                                            name="productcolor"
                                            value={formData.productcolor}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SIZES & STOCK</label>
                                    {formData.sizes.map((sizeData, index) => (
                                        <div key={index} style={styles.sizeRow}>
                                            <input
                                                type="text"
                                                placeholder="Size (e.g., S, M, L, XL)"
                                                value={sizeData.size}
                                                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                                style={styles.sizeInput}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Stock quantity"
                                                value={sizeData.stock}
                                                onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                                                style={styles.stockInput}
                                                min="0"
                                            />
                                            {formData.sizes.length > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => removeSize(index)}
                                                    style={styles.removeSizeButton}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button 
                                        type="button"
                                        onClick={addSize}
                                        style={styles.addSizeButton}
                                    >
                                        Add Size
                                    </button>
                                    <div style={styles.totalStock}>
                                        Total Stock: {formData.sizes.reduce((sum, size) => sum + size.stock, 0)}
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
                    )}                    {/* Manage Products Tab */}
                    {activeTab === 'manage' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.sectionTitle}>Manage Products</h2>
                            
                            {/* Sub-tabs for Active and Archived */}
                            <div style={styles.subTabs}>
                                <button 
                                    style={{...styles.subTab, backgroundColor: products.length > 0 ? '#28a745' : '#6c757d'}}
                                    onClick={() => {/* Show active products */}}
                                >
                                    Active Products ({products.length})
                                </button>
                                <button 
                                    style={{...styles.subTab, backgroundColor: archivedProducts.length > 0 ? '#ffc107' : '#6c757d'}}
                                    onClick={() => {/* Show archived products */}}
                                >
                                    Archived Products ({archivedProducts.length})
                                </button>
                            </div>
                            
                            {loading ? (
                                <div style={styles.loading}>Loading products...</div>
                            ) : (
                                <div>
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
                                                        <p style={styles.productStock}>
                                                            Stock: {product.total_stock || product.productquantity || 0}
                                                        </p>
                                                        <p style={styles.productColor}>Color: {product.productcolor}</p>
                                                        
                                                        <div style={styles.productActions}>
                                                            <button 
                                                                style={styles.editButton}
                                                                onClick={() => editProduct(product)}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button 
                                                                style={styles.archiveButton}
                                                                onClick={() => archiveProduct(product.id)}
                                                            >
                                                                📦 Archive
                                                            </button>
                                                            <button 
                                                                style={styles.deleteButton}
                                                                onClick={() => deleteProduct(product.id)}
                                                            >
                                                                🗑️ Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Archived Products Section */}
                                    {archivedProducts.length > 0 && (
                                        <div style={styles.archivedSection}>
                                            <h3 style={styles.sectionTitle}>Archived Products</h3>
                                            <div style={styles.productsGrid}>
                                                {archivedProducts.map(product => (
                                                    <div key={product.id} style={{...styles.productCard, ...styles.archivedCard}}>
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
                                                            <p style={styles.archivedLabel}>ARCHIVED</p>
                                                            
                                                            <div style={styles.productActions}>
                                                                <button 
                                                                    style={styles.restoreButton}
                                                                    onClick={() => restoreProduct(product.id)}
                                                                >
                                                                    🔄 Restore
                                                                </button>
                                                                <button 
                                                                    style={styles.deleteButton}
                                                                    onClick={() => deleteProduct(product.id)}
                                                                >
                                                                    🗑️ Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
    },    imagePreview: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '1px solid #ddd'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '10px',
        marginTop: '10px'
    },
    imageContainer: {
        position: 'relative',
        display: 'inline-block'
    },
    removeImageButton: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    thumbnailBadge: {
        position: 'absolute',
        bottom: '2px',
        left: '2px',
        backgroundColor: '#28a745',
        color: 'white',
        fontSize: '8px',
        padding: '2px 4px',
        borderRadius: '3px'
    },
    imageSection: {
        marginTop: '15px'
    },
    imageLimit: {
        fontSize: '12px',
        color: '#666',
        margin: '5px 0'
    },
    sizeRow: {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        alignItems: 'center'
    },
    sizeInput: {
        flex: 1,
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    stockInput: {
        width: '100px',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    removeSizeButton: {
        padding: '8px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    addSizeButton: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px'
    },
    totalStock: {
        fontWeight: 'bold',
        marginTop: '10px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
    },
    subTabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
    },
    subTab: {
        padding: '8px 16px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    editButton: {
        padding: '6px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        marginRight: '5px'
    },
    archiveButton: {
        padding: '6px 12px',
        backgroundColor: '#ffc107',
        color: '#212529',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        marginRight: '5px'
    },
    restoreButton: {
        padding: '6px 12px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        marginRight: '5px'
    },
    archivedSection: {
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    archivedCard: {
        opacity: 0.7,
        border: '2px dashed #ffc107'
    },
    archivedLabel: {
        color: '#ffc107',
        fontWeight: 'bold',
        fontSize: '12px'
    },
    productColor: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '10px'
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

