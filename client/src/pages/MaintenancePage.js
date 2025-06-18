import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';

const MaintenancePage = () => {
    const [activeTab, setActiveTab] = useState('add');
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);    // Form state
    const [formData, setFormData] = useState({
        productname: '',
        productdescription: '',
        productprice: '',
        productcolor: '', // Keep for backward compatibility
        colors: [], // This will be deprecated        product_type: '',
        sizeColorVariants: [
            { 
                size: 'S', 
                colorStocks: [{ color: 'Black', stock: 0 }] 
            },
            { 
                size: 'M', 
                colorStocks: [{ color: 'Black', stock: 0 }] 
            },
            { 
                size: 'L', 
                colorStocks: [{ color: 'Black', stock: 0 }] 
            },
            { 
                size: 'XL', 
                colorStocks: [{ color: 'Black', stock: 0 }] 
            }
        ],
        sizes: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }] // Keep for backward compatibility
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
        sessionStorage.clear();        // Reload page to clear any stuck headers
        window.location.reload();
    };

    // Fetch products with enhanced size-color variants
    const fetchProducts = async () => {
        console.log('🔄 fetchProducts called');
        try {
            setLoading(true);
            setMessage('');
              console.log('📡 Making fetch request to /api/enhanced-maintenance/products');
            const response = await fetch('http://localhost:3001/api/enhanced-maintenance/products', {
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
                
                // Data is already processed by the enhanced API with sizeColorVariants
                // Separate active and archived products
                const activeProducts = data.filter(product => product.status !== 'archived' && !product.is_archived);
                const archived = data.filter(product => product.status === 'archived' || product.is_archived);
                
                setProducts(activeProducts);
                setArchivedProducts(archived);
                console.log('✅ Products set in state');
                console.log('Sample product with sizeColorVariants:', activeProducts[0]?.sizeColorVariants);
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
    };// Fetch product images
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
    };    // Handle size and color variant changes
    const handleSizeColorVariantChange = (sizeIndex, colorIndex, field, value) => {
        const newVariants = [...formData.sizeColorVariants];
        if (field === 'size') {
            newVariants[sizeIndex].size = value;
        } else if (field === 'color') {
            newVariants[sizeIndex].colorStocks[colorIndex].color = value;
        } else if (field === 'stock') {
            newVariants[sizeIndex].colorStocks[colorIndex].stock = parseInt(value) || 0;
        }
        setFormData({
            ...formData,
            sizeColorVariants: newVariants
        });
    };

    // Add new color to a specific size
    const addColorToSize = (sizeIndex) => {
        const newVariants = [...formData.sizeColorVariants];
        newVariants[sizeIndex].colorStocks.push({ color: '', stock: 0 });
        setFormData({
            ...formData,
            sizeColorVariants: newVariants
        });
    };

    // Remove color from a specific size
    const removeColorFromSize = (sizeIndex, colorIndex) => {
        const newVariants = [...formData.sizeColorVariants];
        newVariants[sizeIndex].colorStocks = newVariants[sizeIndex].colorStocks.filter((_, i) => i !== colorIndex);
        setFormData({
            ...formData,
            sizeColorVariants: newVariants
        });
    };

    // Add new size variant
    const addSizeVariant = () => {
        setFormData({
            ...formData,
            sizeColorVariants: [...formData.sizeColorVariants, { size: '', colorStocks: [{ color: '', stock: 0 }] }]
        });
    };

    // Remove size variant
    const removeSizeVariant = (index) => {
        const newVariants = formData.sizeColorVariants.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            sizeColorVariants: newVariants
        });
    };    // Calculate total stock across all variants
    const getTotalStock = () => {
        return formData.sizeColorVariants.reduce((total, sizeVariant) => {
            return total + sizeVariant.colorStocks.reduce((sizeTotal, colorStock) => {
                return sizeTotal + colorStock.stock;
            }, 0);
        }, 0);
    };    // Extract all unique colors from sizeColorVariants for display
    const getProductColors = (product) => {
        try {
            // First, try to get colors from new sizeColorVariants structure
            if (product.sizeColorVariants) {
                const sizeColorVariants = typeof product.sizeColorVariants === 'string' 
                    ? JSON.parse(product.sizeColorVariants) 
                    : product.sizeColorVariants;
                
                if (Array.isArray(sizeColorVariants)) {
                    const allColors = [];
                    sizeColorVariants.forEach(sizeVariant => {
                        if (sizeVariant.colorStocks && Array.isArray(sizeVariant.colorStocks)) {
                            sizeVariant.colorStocks.forEach(colorStock => {
                                if (colorStock.color && colorStock.color.trim() !== '' && !allColors.includes(colorStock.color.trim())) {
                                    allColors.push(colorStock.color.trim());
                                }
                            });
                        }
                    });
                    
                    if (allColors.length > 0) {
                        return allColors;
                    }
                }
            }
            
            // Fallback to legacy colors field
            if (product.colors) {
                const colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
                if (Array.isArray(colors) && colors.length > 0) {
                    const validColors = colors.filter(color => color && color.trim() !== '');
                    if (validColors.length > 0) {
                        return validColors;
                    }
                }
            }
            
            // Fallback to single productcolor
            if (product.productcolor && product.productcolor.trim() !== '') {
                return [product.productcolor.trim()];
            }
            
            return ['Not specified'];
        } catch (error) {
            console.error('Error parsing product colors:', error);
            // Fallback handling
            if (product.productcolor && product.productcolor.trim() !== '') {
                return [product.productcolor.trim()];
            }
            return ['Not specified'];
        }
    };

    // Get detailed size-color breakdown for display
    const getSizeColorBreakdown = (product) => {
        try {
            if (product.sizeColorVariants) {
                const sizeColorVariants = typeof product.sizeColorVariants === 'string' 
                    ? JSON.parse(product.sizeColorVariants) 
                    : product.sizeColorVariants;
                
                return sizeColorVariants.filter(sizeVariant => 
                    sizeVariant.colorStocks.some(colorStock => colorStock.stock > 0)
                );
            }
        } catch (error) {
            console.error('Error parsing size-color variants:', error);
        }
        return [];
    };

    // Handle size and stock changes (keep for backward compatibility)
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
    };    // Remove size
    const removeSize = (index) => {
        const newSizes = formData.sizes.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            sizes: newSizes
        });
    };

    // Handle color changes
    const handleColorChange = (index, value) => {
        const newColors = [...formData.colors];
        newColors[index] = value;
        setFormData({
            ...formData,
            colors: newColors
        });
    };

    // Add new color
    const addColor = () => {
        setFormData({
            ...formData,
            colors: [...formData.colors, '']
        });
    };

    // Remove color
    const removeColor = (index) => {
        const newColors = formData.colors.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            colors: newColors
        });
    };// Compress image before upload
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
            colors: [],
            product_type: '',            sizeColorVariants: [
                { 
                    size: 'S', 
                    colorStocks: [{ color: 'Black', stock: 0 }] 
                },
                { 
                    size: 'M', 
                    colorStocks: [{ color: 'Black', stock: 0 }] 
                },
                { 
                    size: 'L', 
                    colorStocks: [{ color: 'Black', stock: 0 }] 
                },
                { 
                    size: 'XL', 
                    colorStocks: [{ color: 'Black', stock: 0 }] 
                }
            ],
            sizes: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }]
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setExistingImages([]);
        setEditingProduct(null);        setShowEditModal(false);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');        // Validate that at least one size-color variant has a color specified
        const hasValidVariants = formData.sizeColorVariants.some(sizeVariant => 
            sizeVariant.colorStocks.some(colorStock => 
                colorStock.color.trim() !== ''
            )
        );

        if (!hasValidVariants) {
            setMessage('Please add at least one color for any size.');
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();              // Add product data
            formDataToSend.append('productname', formData.productname);
            formDataToSend.append('productdescription', formData.productdescription);
            formDataToSend.append('productprice', formData.productprice);
            
            // Handle backward compatibility for productcolor
            const firstColor = formData.sizeColorVariants[0]?.colorStocks[0]?.color || formData.productcolor || '';
            formDataToSend.append('productcolor', firstColor);
            
            // Send the new sizeColorVariants structure
            formDataToSend.append('sizeColorVariants', JSON.stringify(formData.sizeColorVariants));
            
            // Also send legacy formats for backward compatibility
            formDataToSend.append('colors', JSON.stringify(formData.colors));
            formDataToSend.append('sizes', JSON.stringify(formData.sizes));
            formDataToSend.append('product_type', formData.product_type);
              // Calculate total stock from new structure
            const totalStock = formData.sizeColorVariants.reduce((total, sizeVariant) => {
                return total + sizeVariant.colorStocks.reduce((sizeTotal, colorStock) => {
                    return sizeTotal + colorStock.stock;
                }, 0);
            }, 0);
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
            console.log('Size Color Variants:', formData.sizeColorVariants);
            console.log('Total Stock:', totalStock);
            console.log('Selected images count:', selectedImages.length);            for (let pair of formDataToSend.entries()) {
                if (pair[0] !== 'images') { // Don't log file objects
                    console.log(pair[0] + ':', pair[1]);
                }
            }            const url = editingProduct? `http://localhost:3001/api/enhanced-maintenance/products/${editingProduct.id}`
                : 'http://localhost:3001/api/enhanced-maintenance/products';
            
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
            } else {                const errorData = await response.text();
                throw new Error(`Failed to ${editingProduct ? 'update' : 'add'} product: ${errorData}`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setMessage('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    // Edit product
    const editProduct = async (product) => {
        setEditingProduct(product);
        
        // Parse sizes from JSON or create default
        let sizes;
        try {
            sizes = product.sizes ? JSON.parse(product.sizes) : 
                   [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }];
        } catch (error) {
            sizes = [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }];
        }        // Parse colors from JSON or use productcolor as fallback
        let colors = [];
        try {
            if (product.colors) {
                colors = JSON.parse(product.colors);
            } else if (product.productcolor) {
                colors = [product.productcolor];
            }
        } catch (error) {
            colors = product.productcolor ? [product.productcolor] : [];
        }

        // Convert existing data to new sizeColorVariants structure if needed
        let sizeColorVariants = [];
        try {
            if (product.sizeColorVariants) {
                sizeColorVariants = JSON.parse(product.sizeColorVariants);
            } else {
                // Convert from old format to new format
                sizeColorVariants = sizes.map(sizeData => ({
                    size: sizeData.size,
                    colorStocks: colors.length > 0 
                        ? colors.map(color => ({ color, stock: Math.floor(sizeData.stock / colors.length) }))
                        : [{ color: product.productcolor || '', stock: sizeData.stock }]
                }));
            }
        } catch (error) {
            // Fallback to default structure
            sizeColorVariants = [
                { size: 'S', colorStocks: [{ color: '', stock: 0 }] },
                { size: 'M', colorStocks: [{ color: '', stock: 0 }] },
                { size: 'L', colorStocks: [{ color: '', stock: 0 }] },
                { size: 'XL', colorStocks: [{ color: '', stock: 0 }] }
            ];
        }

        setFormData({
            productname: product.productname || '',
            productdescription: product.productdescription || '',
            productprice: product.productprice || '',
            productcolor: product.productcolor || '',
            colors: colors,
            product_type: product.product_type || '',
            sizes: sizes,
            sizeColorVariants: sizeColorVariants
        });
        
        // Fetch existing images
        const images = await fetchProductImages(product.product_id);
        setExistingImages(images);
        
        setSelectedImages([]);
        setImagePreviews([]);
        setShowEditModal(true);
        setActiveTab('add');
    };    
    // Archive product
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
                                    <label style={styles.label}>PRODUCT IMAGES</label>
                                    <div style={styles.imageUploadContainer}>                                        {/* Upload Area */}
                                        <div 
                                            style={styles.uploadArea}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = '#000000';
                                                e.target.style.backgroundColor = '#f5f5f5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = '#e0e0e0';
                                                e.target.style.backgroundColor = '#fafafa';
                                            }}
                                        >
                                            <div style={styles.uploadContent}>
                                                <div style={styles.uploadIcon}>
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                                        <polyline points="21,15 16,10 5,21"/>
                                                    </svg>
                                                </div>
                                                <div style={styles.uploadText}>
                                                    <p style={styles.uploadTitle}>Click to upload images</p>
                                                    <p style={styles.uploadSubtitle}>or drag and drop</p>
                                                </div>
                                                <div style={styles.uploadInfo}>
                                                    <span style={styles.uploadLimit}>
                                                        {selectedImages.length + existingImages.length}/10 images
                                                    </span>
                                                    <span style={styles.uploadFormats}>JPG, PNG up to 10MB each</span>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                name="images"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                style={styles.hiddenFileInput}
                                                disabled={selectedImages.length + existingImages.length >= 10}
                                            />
                                        </div>

                                        {/* Image Grid */}
                                        {(existingImages.length > 0 || imagePreviews.length > 0) && (
                                            <div style={styles.imageGrid}>                                                {/* Existing Images */}
                                                {existingImages.map((img, index) => (
                                                    <div key={`existing-${img.image_id}`} style={styles.imageCard}>
                                                        <div 
                                                            style={styles.imageWrapper}
                                                            onMouseEnter={(e) => {
                                                                const removeBtn = e.currentTarget.querySelector('.remove-btn');
                                                                if (removeBtn) removeBtn.style.opacity = '1';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const removeBtn = e.currentTarget.querySelector('.remove-btn');
                                                                if (removeBtn) removeBtn.style.opacity = '0';
                                                            }}
                                                        >
                                                            <img 
                                                                src={`http://localhost:3001/uploads/${img.image_filename}`} 
                                                                alt={`Product ${index + 1}`}
                                                                style={styles.imagePreview}
                                                            />
                                                            {img.is_thumbnail && (
                                                                <div style={styles.thumbnailBadge}>
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                                                                    </svg>
                                                                    Main
                                                                </div>
                                                            )}                                                            <button 
                                                                type="button"
                                                                onClick={() => removeExistingImage(img.image_id, img.image_filename)}
                                                                style={styles.removeButton}
                                                                className="remove-btn"
                                                                title="Remove image"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div style={styles.imageLabel}>Uploaded</div>
                                                    </div>
                                                ))}                                                {/* New Image Previews */}
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={`new-${index}`} style={styles.imageCard}>
                                                        <div 
                                                            style={styles.imageWrapper}
                                                            onMouseEnter={(e) => {
                                                                const removeBtn = e.currentTarget.querySelector('.remove-btn');
                                                                if (removeBtn) removeBtn.style.opacity = '1';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const removeBtn = e.currentTarget.querySelector('.remove-btn');
                                                                if (removeBtn) removeBtn.style.opacity = '0';
                                                            }}
                                                        >
                                                            <img 
                                                                src={preview} 
                                                                alt={`New ${index + 1}`}
                                                                style={styles.imagePreview}
                                                            />                                                            <button 
                                                                type="button"
                                                                onClick={() => removeSelectedImage(index)}
                                                                style={styles.removeButton}
                                                                className="remove-btn"
                                                                title="Remove image"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div style={styles.imageLabel}>New</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>DESCRIPTION</label>
                                    <textarea
                                        name="productdescription"
                                        value={formData.productdescription}
                                        onChange={handleInputChange}
                                        style={styles.textarea}
                                        rows={4}
                                    />                                </div>

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
                                </div>                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SIZE & COLOR VARIANTS</label>
                                    <div style={styles.variantContainer}>
                                        {formData.sizeColorVariants.map((sizeVariant, sizeIndex) => (
                                            <div key={sizeIndex} style={styles.sizeVariantGroup}>
                                                <div style={styles.sizeHeader}>
                                                    <input
                                                        type="text"
                                                        placeholder="Size (e.g., S, M, L, XL)"
                                                        value={sizeVariant.size}
                                                        onChange={(e) => handleSizeColorVariantChange(sizeIndex, 0, 'size', e.target.value)}
                                                        style={styles.sizeVariantInput}
                                                    />
                                                    {formData.sizeColorVariants.length > 1 && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeSizeVariant(sizeIndex)}
                                                            style={styles.removeSizeVariantButton}
                                                        >
                                                            Remove Size
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <div style={styles.colorStocksContainer}>
                                                    {sizeVariant.colorStocks.map((colorStock, colorIndex) => (
                                                        <div key={colorIndex} style={styles.colorStockRow}>
                                                            <input
                                                                type="text"
                                                                placeholder="Color (e.g., Red, Blue, Black)"
                                                                value={colorStock.color}
                                                                onChange={(e) => handleSizeColorVariantChange(sizeIndex, colorIndex, 'color', e.target.value)}
                                                                style={styles.colorVariantInput}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Stock"
                                                                value={colorStock.stock}
                                                                onChange={(e) => handleSizeColorVariantChange(sizeIndex, colorIndex, 'stock', e.target.value)}
                                                                style={styles.stockVariantInput}
                                                                min="0"
                                                            />
                                                            {sizeVariant.colorStocks.length > 1 && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => removeColorFromSize(sizeIndex, colorIndex)}
                                                                    style={styles.removeColorStockButton}
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button 
                                                        type="button"
                                                        onClick={() => addColorToSize(sizeIndex)}
                                                        style={styles.addColorToSizeButton}
                                                    >
                                                        Add Color for {sizeVariant.size}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div style={styles.variantActions}>
                                            <button 
                                                type="button"
                                                onClick={addSizeVariant}
                                                style={styles.addSizeVariantButton}
                                            >
                                                Add New Size
                                            </button>
                                            <div style={styles.totalStockDisplay}>
                                                Total Stock: {getTotalStock()}
                                            </div>
                                        </div>
                                    </div>                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>PRODUCT TYPE</label>
                                    <select
                                        name="product_type"
                                        value={formData.product_type}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                    >
                                        <option value="">Select Product Type</option>
                                        <option value="bags">Bags</option>
                                        <option value="hats">Hats</option>
                                        <option value="hoodies">Hoodies</option>
                                        <option value="jackets">Jackets</option>
                                        <option value="jerseys">Jerseys</option>
                                        <option value="shorts">Shorts</option>
                                        <option value="sweaters">Sweaters</option>
                                        <option value="t-shirts">T-Shirts</option>
                                    </select>
                                </div>

                                <div style={styles.buttonGroup}><button 
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
                                                    {/* Display all product images */}
                                                    {product.images && product.images.length > 0 ? (
                                                        <div style={styles.productImageContainer}>
                                                            {product.images.map((image, index) => (
                                                                <img 
                                                                    key={index}
                                                                    src={`http://localhost:3001/uploads/${image}`}
                                                                    alt={`${product.productname} ${index + 1}`}
                                                                    style={{
                                                                        ...styles.productImage,
                                                                        ...(index > 0 ? styles.additionalImage : {})
                                                                    }}
                                                                />
                                                            ))}
                                                            {product.images.length > 1 && (
                                                                <div style={styles.imageCount}>
                                                                    {product.images.length} images
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
                                                            No Image
                                                        </div>
                                                    )}<div style={styles.productInfo}>
                                                        <h3 style={styles.productName}>{product.productname}</h3>
                                                        <p style={styles.productPrice}>₱{product.productprice}</p>                                                        <p style={styles.productStock}>
                                                            Stock: {product.total_stock || product.productquantity || 0}
                                                        </p>
                                                        <div style={styles.productColors}>
                                                            <span style={styles.productLabel}>Colors: </span>
                                                            <div style={styles.colorsList}>
                                                                {getProductColors(product).map((color, index) => (
                                                                    <span key={index} style={styles.colorTag}>
                                                                        {color}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Show detailed size-color breakdown if available */}
                                                        {getSizeColorBreakdown(product).length > 0 && (
                                                            <div style={styles.sizeColorBreakdown}>
                                                                <span style={styles.productLabel}>Available: </span>
                                                                <div style={styles.breakdownList}>
                                                                    {getSizeColorBreakdown(product).map((sizeVariant, index) => (
                                                                        <div key={index} style={styles.sizeGroup}>
                                                                            <span style={styles.sizeLabel}>{sizeVariant.size}:</span>
                                                                            {sizeVariant.colorStocks
                                                                                .filter(colorStock => colorStock.stock > 0)
                                                                                .map((colorStock, colorIndex) => (
                                                                                    <span key={colorIndex} style={styles.colorStockTag}>
                                                                                        {colorStock.color} ({colorStock.stock})
                                                                                    </span>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <p style={styles.productType}>Type: {product.product_type ? product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1) : 'Not specified'}</p>
                                                        
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
                                                {archivedProducts.map(product => (                                                    <div key={product.id} style={{...styles.productCard, ...styles.archivedCard}}>                                                        {/* Display all product images */}
                                                        {product.images && product.images.length > 0 ? (
                                                            <div style={styles.productImageContainer}>
                                                                {product.images.map((image, index) => (
                                                                    <img 
                                                                        key={index}
                                                                        src={`http://localhost:3001/uploads/${image}`}
                                                                        alt={`${product.productname} ${index + 1}`}
                                                                        style={{
                                                                            ...styles.productImage,
                                                                            ...(index > 0 ? styles.additionalImage : {})
                                                                        }}
                                                                    />
                                                                ))}
                                                                {product.images.length > 1 && (
                                                                    <div style={styles.imageCount}>
                                                                        {product.images.length} images
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
                                                                No Image
                                                            </div>
                                                        )}                                                        <div style={styles.productInfo}>
                                                            <h3 style={styles.productName}>{product.productname}</h3>
                                                            <p style={styles.productPrice}>₱{product.productprice}</p>
                                                            <p style={styles.archivedLabel}>ARCHIVED</p>
                                                            
                                                            <div style={styles.productColors}>
                                                                <span style={styles.productLabel}>Colors: </span>
                                                                <div style={styles.colorsList}>
                                                                    {getProductColors(product).map((color, index) => (
                                                                        <span key={index} style={styles.colorTag}>
                                                                            {color}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            <div style={styles.productActions}><button 
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
        backgroundColor: '#fafafa'
    },
    mainContent: {
        padding: '2rem 1rem',
        backgroundColor: '#fafafa'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#fafafa'
    },
    tabContainer: {
        display: 'flex',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        padding: '0.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    tab: {
        flex: 1,
        padding: '1rem 1.5rem',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '400',
        color: '#666666',
        transition: 'all 0.2s ease',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    activeTab: {
        backgroundColor: '#000000',
        color: '#ffffff'
    },
    message: {
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        backgroundColor: '#ffffff',
        color: '#333333',
        border: '1px solid #e0e0e0',
        fontSize: '0.95rem',
        fontWeight: '400'
    },
    tabContent: {
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        border: '1px solid #e0e0e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: '200',
        marginBottom: '2rem',
        color: '#000000',
        letterSpacing: '-0.5px'
    },    form: {
        maxWidth: '700px'
    },
    formGroup: {
        marginBottom: '2rem'
    },
    formGroupHalf: {
        flex: 1,
        marginRight: '1.5rem'
    },
    formRow: {
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.8rem',
        fontWeight: '500',
        color: '#333333',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
    },
    input: {
        width: '100%',
        padding: '1rem 1.2rem',
        border: '1px solid #e0e0e0',
        fontSize: '1rem',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
        backgroundColor: '#ffffff',
        color: '#333333',
        fontWeight: '300',
        '&:focus': {
            outline: 'none',
            borderColor: '#000000'
        }
    },
    select: {
        width: '100%',
        padding: '1rem 1.2rem',
        border: '1px solid #e0e0e0',
        fontSize: '1rem',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
        backgroundColor: '#ffffff',
        color: '#333333',
        fontWeight: '300',
        cursor: 'pointer',
        '&:focus': {
            outline: 'none',
            borderColor: '#000000'
        }
    },
    textarea: {
        width: '100%',
        padding: '1rem 1.2rem',
        border: '1px solid #e0e0e0',
        fontSize: '1rem',
        resize: 'vertical',
        boxSizing: 'border-box',
        minHeight: '120px',
        transition: 'border-color 0.2s ease',
        backgroundColor: '#ffffff',
        color: '#333333',
        fontWeight: '300',
        '&:focus': {
            outline: 'none',
            borderColor: '#000000'
        }    },
    // Modern Image Upload Styles
    imageUploadContainer: {
        marginTop: '1rem'
    },
    uploadArea: {
        position: 'relative',
        border: '2px dashed #e0e0e0',
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
            borderColor: '#000000',
            backgroundColor: '#f5f5f5'
        }
    },
    uploadContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
    },
    uploadIcon: {
        color: '#666666',
        marginBottom: '0.5rem'
    },
    uploadText: {
        textAlign: 'center'
    },
    uploadTitle: {
        fontSize: '1rem',
        fontWeight: '500',
        color: '#333333',
        margin: '0 0 0.25rem 0'
    },
    uploadSubtitle: {
        fontSize: '0.9rem',
        color: '#666666',
        margin: '0',
        fontWeight: '300'
    },
    uploadInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        marginTop: '0.5rem'
    },
    uploadLimit: {
        fontSize: '0.85rem',
        fontWeight: '500',
        color: '#333333'
    },
    uploadFormats: {
        fontSize: '0.8rem',
        color: '#999999',
        fontWeight: '300'
    },
    hiddenFileInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
    },
    imageCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease'
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        paddingBottom: '100%', // 1:1 aspect ratio
        overflow: 'hidden'
    },
    imagePreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    removeButton: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        width: '2rem',
        height: '2rem',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 0.2s ease',
        '&:hover': {
            backgroundColor: '#000000'
        }
    },
    thumbnailBadge: {
        position: 'absolute',
        top: '0.5rem',
        left: '0.5rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontSize: '0.7rem',
        padding: '0.25rem 0.5rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    },
    imageLabel: {
        padding: '0.5rem',
        fontSize: '0.8rem',
        color: '#666666',
        fontWeight: '400',
        textAlign: 'center',
        backgroundColor: '#fafafa'
    },
    imageLimit: {
        fontSize: '0.85rem',
        color: '#666666',
        margin: '0.5rem 0',
        fontWeight: '400'
    },    // Legacy size/color styles (updated for minimalist design)
    sizeRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'center'
    },
    sizeInput: {
        flex: 1,
        padding: '0.8rem 1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        fontWeight: '300'
    },
    stockInput: {
        width: '100px',
        padding: '0.8rem 1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        fontWeight: '300'
    },
    removeSizeButton: {
        padding: '0.8rem 1rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    addSizeButton: {
        padding: '0.8rem 1.2rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        marginTop: '1rem',
        fontSize: '0.85rem',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    colorRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'center'
    },
    colorInput: {
        flex: 1,
        padding: '0.8rem 1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        fontWeight: '300'
    },
    removeColorButton: {
        padding: '0.8rem 1rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    addColorButton: {
        padding: '0.8rem 1.2rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        marginTop: '1rem',
        fontSize: '0.85rem',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0f0'
    },
    emptyStateText: {
        color: '#666666',
        fontSize: '0.9rem',
        margin: '0 0 1rem 0',
        fontWeight: '300'
    },
    totalStock: {
        fontWeight: '500',
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        color: '#333333'
    },    // New styles for merged size-color variants (minimalist design)
    variantContainer: {
        border: '1px solid #e0e0e0',
        padding: '1.5rem',
        backgroundColor: '#ffffff'
    },
    sizeVariantGroup: {
        marginBottom: '1.5rem',
        padding: '1.2rem',
        backgroundColor: '#fafafa',
        border: '1px solid #f0f0f0'
    },
    sizeHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        paddingBottom: '0.8rem',
        borderBottom: '1px solid #e0e0e0'
    },
    sizeVariantInput: {
        flex: 1,
        padding: '0.8rem 1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#000000'
    },
    removeSizeVariantButton: {
        padding: '0.6rem 1rem',
        backgroundColor: '#666666',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '400'
    },
    colorStocksContainer: {
        paddingLeft: '1rem'
    },
    colorStockRow: {
        display: 'flex',
        gap: '0.8rem',
        marginBottom: '0.8rem',
        alignItems: 'center'
    },
    colorVariantInput: {
        flex: 2,
        padding: '0.7rem 1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        fontWeight: '300'
    },
    stockVariantInput: {
        flex: 1,
        padding: '0.7rem 1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        fontWeight: '300'
    },
    removeColorStockButton: {
        padding: '0.6rem 0.8rem',
        backgroundColor: '#999999',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '400'
    },
    addColorToSizeButton: {
        padding: '0.6rem 1rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '400',
        marginTop: '0.5rem'
    },
    variantActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e0e0e0'
    },
    addSizeVariantButton: {
        padding: '0.8rem 1.5rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    totalStockDisplay: {
        fontWeight: '500',
        fontSize: '1rem',
        color: '#000000',
        padding: '0.8rem 1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid #000000'
    },    subTabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
    },
    subTab: {
        padding: '0.8rem 1.5rem',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    editButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '0.7rem 1rem',
        border: 'none',
        fontSize: '0.75rem',
        cursor: 'pointer',
        flex: 1,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem'
    },
    archiveButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '0.7rem 1rem',
        border: 'none',
        fontSize: '0.75rem',
        cursor: 'pointer',
        flex: 1,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem'
    },
    deleteButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '0.7rem 1rem',
        border: 'none',
        fontSize: '0.75rem',
        cursor: 'pointer',
        flex: 1,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',        gap: '0.4rem'
    },
    archivedSection: {
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0'
    },
    archivedCard: {
        opacity: 0.7,
        border: '1px dashed #999999'
    },
    archivedLabel: {
        color: '#999999',
        fontWeight: '500',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '0.8rem'
    },
    restoreButton: {
        padding: '0.6rem 1rem',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        marginRight: '0.5rem',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',        gap: '0.4rem'
    },
    productColor: {
        fontSize: '13px',
        color: '#6c757d',
        marginBottom: '6px'
    },
    productType: {
        fontSize: '13px',
        color: '#6c757d',
        marginBottom: '12px',
        fontWeight: '500'
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
    },    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem'
    },
    productCard: {
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        transition: 'box-shadow 0.2s ease'
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
    },    productStock: {
        fontSize: '0.9rem',
        color: '#333333',
        marginBottom: '0.5rem',
        fontWeight: '400'
    },
    // New styles for color display
    productColors: {
        marginBottom: '0.8rem'
    },
    productLabel: {
        fontSize: '0.8rem',
        color: '#666666',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    colorsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        marginTop: '0.3rem'
    },
    colorTag: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '0.3rem 0.6rem',
        fontSize: '0.75rem',
        fontWeight: '400',
        textTransform: 'capitalize'
    },
    sizeColorBreakdown: {
        marginBottom: '0.8rem',
        padding: '0.8rem',
        backgroundColor: '#f8f8f8',
        border: '1px solid #f0f0f0'
    },
    breakdownList: {
        marginTop: '0.5rem'
    },
    sizeGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.4rem',
        flexWrap: 'wrap'
    },
    sizeLabel: {
        fontSize: '0.8rem',
        fontWeight: '500',
        color: '#333333',
        minWidth: '2rem'
    },
    colorStockTag: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '1px solid #e0e0e0',
        padding: '0.2rem 0.5rem',
        fontSize: '0.7rem',
        fontWeight: '400'
    },
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
        bottom: '8px',
        right: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
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
    },
    productImageContainer: {
        position: 'relative',
        width: '100%',
        height: '240px',
        overflow: 'hidden',
        display: 'flex'
    },
    additionalImage: {
        width: '50%',
        opacity: 0.8,
        borderLeft: '2px solid #ffffff'
    }
};

export default MaintenancePage;

