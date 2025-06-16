import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';

const MaintenancePage = () => {
    const [activeTab, setActiveTab] = useState('add');
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);    const [loading, setLoading] = useState(false);
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
    };    // Clear browser cache/cookies if needed
    const clearBrowserData = () => {
        // Clear localStorage
        localStorage.clear();
        // Clear sessionStorage  
        sessionStorage.clear();
        // Reload page to clear any stuck headers
        window.location.reload();
    };

    // Add detailed logging to trace the issue
    const fetchProducts = async () => {
        console.log('🔄 fetchProducts called');
        try {
            setLoading(true);
            setMessage('');
              console.log('📡 Making fetch request to /api/maintenance/products');
            const response = await fetch('http://localhost:3001/api/maintenance/products', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
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
                
            } else if (response.status === 431) {
                console.error('❌ Request Header Fields Too Large');
                setMessage('Error: Request headers too large. Please try refreshing the page.');
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
    };    // Fetch product images
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
    };    // Compress image before upload
    const compressImage = (file, maxWidth = 800, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    // Handle multiple image upload with compression
    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        const totalImages = selectedImages.length + existingImages.length;
        
        if (totalImages + files.length > 10) {
            setMessage('Maximum 10 images allowed per product');
            return;
        }

        setLoading(true);
        setMessage('Compressing images...');
        
        try {
            // Compress images
            const compressedFiles = await Promise.all(
                files.map(async (file) => {
                    if (file.size > 1024 * 1024) { // If larger than 1MB, compress
                        const compressed = await compressImage(file);
                        return new File([compressed], file.name, { type: 'image/jpeg' });
                    }
                    return file;
                })
            );

            setSelectedImages(prev => [...prev, ...compressedFiles]);
            
            // Create previews
            const newPreviews = [];
            compressedFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newPreviews.push(e.target.result);
                    if (newPreviews.length === compressedFiles.length) {
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            });
              setMessage('');
        } catch (error) {
            console.error('Error compressing images:', error);
            setMessage('Error processing images');
        } finally {
            setLoading(false);
        }
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
            }            const url = editingProduct                ? `http://localhost:3001/api/maintenance/products/${editingProduct.id}`
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
            } else if (response.status === 431) {
                throw new Error('Request headers too large - please try with smaller images or refresh the page');
            } else {
                const errorData = await response.text();
                throw new Error(`Failed to ${editingProduct ? 'update' : 'add'} product: ${errorData}`);
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

    // Add hover effect styles for better interactivity
const hoverStyles = `
.maintenance-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.maintenance-input:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.maintenance-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.maintenance-tab:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.action-button {
    transition: all 0.2s ease;
}

.action-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    background-color: #333333 !important;
}

.action-button:hover svg {
    transform: scale(1.1);
    transition: transform 0.2s ease;
}

.edit-button:hover {
    background-color: #1a73e8 !important;
}

.archive-button:hover {
    background-color: #ea8600 !important;
}

.delete-button:hover {
    background-color: #d93025 !important;
}

.restore-button:hover {
    background-color: #137333 !important;
}
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = hoverStyles;
    document.head.appendChild(styleSheet);
}

    return (
        <div style={styles.container}>
            <TopBar />
            <div style={styles.mainContent}>
                <div style={styles.content}>
                    {/* Tab Navigation */}
                    <div style={styles.tabContainer}>                        <button 
                            style={{...styles.tab, ...(activeTab === 'add' ? styles.activeTab : {})}}
                            className="maintenance-tab"
                            onClick={() => setActiveTab('add')}
                        >
                            ADD PRODUCT
                        </button>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'manage' ? styles.activeTab : {})}}
                            className="maintenance-tab"
                            onClick={() => setActiveTab('manage')}
                        >
                            MANAGE PRODUCTS
                        </button>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'backup' ? styles.activeTab : {})}}
                            className="maintenance-tab"
                            onClick={() => setActiveTab('backup')}
                        >
                            BACKUP DATA
                        </button>
                    </div>                    {/* Message Display */}
                    {message && (
                        <div style={styles.message}>
                            {message}
                            {message.includes('Request headers too large') && (
                                <div style={{ marginTop: '10px' }}>
                                    <button 
                                        onClick={clearBrowserData}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#3a7bd5',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Clear Browser Data & Reload
                                    </button>
                                </div>
                            )}
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
                                    <label style={styles.label}>PRODUCT NAME *</label>                                    <input
                                        type="text"
                                        name="productname"
                                        value={formData.productname}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        className="maintenance-input"
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

                                <div style={styles.buttonGroup}>                                    <button 
                                        type="submit" 
                                        style={styles.submitButton}
                                        className="maintenance-button"
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
                                    ) : (                                        <div style={styles.productsGrid}>                                            {products.map(product => (                                                <div key={product.id} style={styles.productCard} className="maintenance-card">
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
                                                        
                                                        <div style={styles.productActions}>                                                            <button 
                                                                className="action-button edit-button"
                                                                style={styles.editButton}
                                                                onClick={() => editProduct(product)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                                </svg>
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="action-button archive-button"
                                                                style={styles.archiveButton}
                                                                onClick={() => archiveProduct(product.id)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="21,8 21,21 3,21 3,8"/>
                                                                    <rect x="1" y="3" width="22" height="5"/>
                                                                    <line x1="10" y1="12" x2="14" y2="12"/>
                                                                </svg>
                                                                Archive
                                                            </button>
                                                            <button 
                                                                className="action-button delete-button"
                                                                style={styles.deleteButton}
                                                                onClick={() => deleteProduct(product.id)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3,6 5,6 21,6"/>
                                                                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                                                </svg>
                                                                Remove
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
                                            <h3 style={styles.sectionTitle}>Archived Products</h3>                                            <div style={styles.productsGrid}>
                                                {archivedProducts.map(product => (
                                                    <div key={product.id} style={{...styles.productCard, ...styles.archivedCard}}>                                                        {product.productimage && (
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
                                                            
                                                            <div style={styles.productActions}>                                                                <button 
                                                                    className="action-button restore-button"
                                                                    style={styles.restoreButton}
                                                                    onClick={() => restoreProduct(product.id)}
                                                                >
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="23,4 23,10 17,10"/>
                                                                        <path d="M20.49,15a9,9 0 1,1 -2.12,-9.36L23,10"/>
                                                                    </svg>
                                                                    Restore
                                                                </button>
                                                                <button 
                                                                    className="action-button delete-button"
                                                                    style={styles.deleteButton}
                                                                    onClick={() => deleteProduct(product.id)}
                                                                >
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="3,6 5,6 21,6"/>
                                                                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                                                    </svg>
                                                                    Remove
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
        backgroundColor: '#ffffff'
    },
    mainContent: {
        padding: '40px 20px',
        backgroundColor: '#ffffff'
    },
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#ffffff'
    },
    tabContainer: {
        display: 'flex',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '40px',
        border: '1px solid #e9ecef'
    },
    tab: {
        flex: 1,
        padding: '16px 24px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: '#6c757d',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    activeTab: {
        backgroundColor: '#000000',
        color: '#ffffff',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    message: {
        padding: '16px 20px',
        marginBottom: '32px',
        backgroundColor: '#f8f9fa',
        color: '#000000',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500'
    },
    tabContent: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid #e9ecef'
    },
    sectionTitle: {
        fontSize: '32px',
        fontWeight: '300',
        marginBottom: '40px',
        color: '#000000',
        letterSpacing: '-0.5px'
    },
    form: {
        maxWidth: '800px'
    },
    formGroup: {
        marginBottom: '32px'
    },
    formGroupHalf: {
        flex: 1,
        marginRight: '20px'
    },
    formRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '32px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '11px',
        fontWeight: '600',
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
    },    input: {
        width: '100%',
        padding: '16px 20px',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '15px',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },    textarea: {
        width: '100%',
        padding: '16px 20px',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '15px',
        resize: 'vertical',
        boxSizing: 'border-box',
        minHeight: '120px',
        transition: 'all 0.2s ease',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    fileInput: {
        width: '100%',
        padding: '16px 20px',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#ffffff'
    },
    imagePreviewContainer: {
        marginTop: '20px',
        textAlign: 'center'
    },    imagePreview: {
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px',
        marginTop: '16px'
    },
    imageContainer: {
        position: 'relative',
        display: 'inline-block'
    },
    removeImageButton: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    thumbnailBadge: {
        position: 'absolute',
        bottom: '4px',
        left: '4px',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontSize: '10px',
        padding: '4px 6px',
        borderRadius: '4px',
        fontWeight: '600'
    },
    imageSection: {
        marginTop: '24px'
    },
    imageLimit: {
        fontSize: '13px',
        color: '#6c757d',
        margin: '8px 0',
        fontWeight: '500'
    },
    sizeRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        alignItems: 'center'
    },
    sizeInput: {
        flex: 1,
        padding: '12px 16px',
        border: '1px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '14px'
    },
    stockInput: {
        width: '120px',
        padding: '12px 16px',
        border: '1px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '14px'
    },
    removeSizeButton: {
        padding: '12px 16px',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    addSizeButton: {
        padding: '12px 20px',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '16px',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    totalStock: {
        fontWeight: '600',
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        fontSize: '14px'
    },
    subTabs: {
        display: 'flex',
        gap: '16px',
        marginBottom: '32px'
    },
    subTab: {
        padding: '12px 20px',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },    editButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '11px',
        cursor: 'pointer',
        flex: 1,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
    },
    archiveButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '11px',
        cursor: 'pointer',
        flex: 1,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
    },
    deleteButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '11px',
        cursor: 'pointer',
        flex: 1,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
    },
    restoreButton: {
        padding: '8px 16px',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '11px',
        marginRight: '8px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
    },
    archivedSection: {
        marginTop: '48px',
        padding: '32px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef'
    },
    archivedCard: {
        opacity: 0.7,
        border: '2px dashed #6c757d'
    },
    archivedLabel: {
        color: '#6c757d',
        fontWeight: '600',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
    },
    productColor: {
        fontSize: '13px',
        color: '#6c757d',
        marginBottom: '12px'
    },
    imageCaption: {
        fontSize: '13px',
        color: '#6c757d',
        marginTop: '8px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '16px',
        marginTop: '40px'
    },
    submitButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '16px 32px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        transition: 'transform 0.2s ease'
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
        color: '#000000',
        padding: '16px 32px',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        transition: 'transform 0.2s ease'
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        color: '#6c757d',
        fontSize: '16px',
        fontWeight: '300'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '32px'
    },
    productCard: {
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    productImage: {
        width: '100%',
        height: '240px',
        objectFit: 'cover'
    },
    noImagePlaceholder: {
        width: '100%',
        height: '240px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6c757d',
        fontSize: '14px',
        fontWeight: '500'
    },
    productInfo: {
        padding: '24px'
    },
    productName: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#000000'
    },
    productPrice: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#000000',
        marginBottom: '8px'
    },
    productDetails: {
        fontSize: '13px',
        color: '#6c757d',
        marginBottom: '8px'
    },
    productStock: {
        fontSize: '14px',
        color: '#000000',
        marginBottom: '8px',
        fontWeight: '500'    },
    databaseInfo: {
        fontSize: '11px',
        color: '#adb5bd',
        marginBottom: '16px'
    },
    productActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '16px'
    },
    backupSection: {
        textAlign: 'center',
        padding: '60px 40px',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        backgroundColor: '#f8f9fa'
    },
    backupDescription: {
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '32px',
        fontWeight: '300',
        lineHeight: '1.6'
    },
    backupButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '16px 32px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        transition: 'transform 0.2s ease'
    },
    debugInfo: {
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '32px',
        fontSize: '14px',
        border: '1px solid #e9ecef'
    },
    refreshButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '16px',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    noProducts: {
        textAlign: 'center',
        padding: '60px 40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '32px 0',
        border: '1px solid #e9ecef'
    },
    productId: {
        fontSize: '11px',
        color: '#adb5bd',
        marginBottom: '12px',
        fontWeight: '500'
    },
    simpleList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    simpleCard: {
        border: '1px solid #e9ecef',
        padding: '24px',
        borderRadius: '8px',
        backgroundColor: '#ffffff'
    },
    imagePreviewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px',
        marginTop: '24px'
    },
    imagePreviewItem: {
        position: 'relative'
    },
    removePreviewButton: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    productImagesContainer: {
        marginBottom: '24px'
    },
    mainImageContainer: {
        position: 'relative',
        marginBottom: '16px'
    },
    imageCount: {
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#ffffff',
        padding: '6px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
    },    imageManagement: {
        borderTop: '1px solid #e9ecef',
        paddingTop: '16px'
    },
    imageItem: {
        position: 'relative'
    },
    thumbnailImage: {
        width: '100%',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '6px'
    },
    deleteImageButton: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        fontSize: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    }
};

export default MaintenancePage;

