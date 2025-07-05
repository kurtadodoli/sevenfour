import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import TopBar from '../components/TopBar';

const MaintenancePage = () => {
    const { fetchStockData, getProductStock } = useStock(); // Add stock context
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
    const [existingImages, setExistingImages] = useState([]);    // Generate random product ID    // Commented out unused functions - these were for legacy compatibility
    // const generateProductId = () => {
    //     return Math.floor(100000000000 + Math.random() * 899999999999);
    // };// Clear browser cache/cookies if needed
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
            setMessage('');              console.log('📡 Making fetch request to /api/maintenance/products');
            const response = await fetch('http://localhost:5000/api/maintenance/products', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            console.log('📡 Response received:', response.status, response.statusText);              if (response.ok) {
                const data = await response.json();
                console.log('📦 Data received:', data);
                console.log('📊 Data length:', data.length);
                console.log('📋 Setting products in state...');
                  // Process the regular maintenance API data to add enhanced functionality
                const processedProducts = data.map(product => {
                    console.log('Processing product:', product.productname, 'Raw sizes:', product.sizes, 'Raw color:', product.productcolor);
                      // Create basic size-color variants from existing data
                    let sizeColorVariants = [];
                    
                    // First, check if the sizes field contains sizeColorVariants structure
                    if (product.sizes) {
                        try {
                            const parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                            
                            // Check if it's the new sizeColorVariants format (has size and colorStocks properties)
                            if (Array.isArray(parsedSizes) && parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                                sizeColorVariants = parsedSizes;
                                console.log('Found sizeColorVariants in sizes field for', product.productname, ':', sizeColorVariants);
                            }
                            // Otherwise it's the old format (array of objects with size and stock, or just strings)
                            else if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
                                // Parse colors from productcolor field
                                let colorsArray = [];
                                if (typeof product.productcolor === 'string' && product.productcolor.startsWith('[')) {
                                    colorsArray = JSON.parse(product.productcolor);
                                } else if (typeof product.productcolor === 'string' && product.productcolor.includes(',')) {
                                    colorsArray = product.productcolor.split(',').map(c => c.trim()).filter(c => c);
                                } else if (typeof product.productcolor === 'string') {
                                    colorsArray = [product.productcolor];
                                } else {
                                    colorsArray = ['Default'];
                                }
                                
                                // Convert old format to new format
                                parsedSizes.forEach(sizeItem => {
                                    const sizeName = typeof sizeItem === 'object' && sizeItem.size ? sizeItem.size : String(sizeItem);
                                    const stock = typeof sizeItem === 'object' && sizeItem.stock ? sizeItem.stock : 0;
                                    
                                    const colorStocks = colorsArray.map(color => ({
                                        color: color,
                                        stock: Math.floor(stock / colorsArray.length)
                                    }));
                                    
                                    sizeColorVariants.push({
                                        size: sizeName,
                                        colorStocks: colorStocks
                                    });
                                });
                                
                                console.log('Converted old format to sizeColorVariants for', product.productname, ':', sizeColorVariants);
                            }
                        } catch (e) {
                            console.log('Error parsing sizes field for product', product.product_id, ':', e);
                        }
                    }
                    
                    // Final fallback: create a default variant
                    if (!sizeColorVariants || sizeColorVariants.length === 0) {
                        sizeColorVariants = [{
                            size: 'One Size', 
                            colorStocks: [{
                                color: product.productcolor || 'Default',
                                stock: product.total_stock || product.productquantity || 0
                            }]
                        }];
                        console.log('Using default sizeColorVariants for', product.productname, ':', sizeColorVariants);
                    }
                    
                    return {
                        ...product,
                        sizeColorVariants,
                        // Add fields for consistency
                        status: product.productstatus || 'active',
                        is_archived: product.productstatus === 'archived'
                    };
                });
                
                // Show all products together, we'll handle archived styling in the UI
                const allProducts = processedProducts;
                const archived = processedProducts.filter(product => product.status === 'archived' || product.is_archived);
                  setProducts(allProducts);
                setArchivedProducts(archived);
                console.log('✅ Products set in state');
                console.log('Sample product with sizeColorVariants:', allProducts[0]?.sizeColorVariants);
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
            const response = await fetch(`http://localhost:5000/api/maintenance/products/${productId}/images`);
            if (response.ok) {
                const images = await response.json();
                return images;
            }
        } catch (error) {
            console.error('Error fetching product images:', error);
        }
        return [];
    };    useEffect(() => {
        fetchProducts();
    }, []);

    // Force refresh every time we switch to manage tab
    useEffect(() => {
        if (activeTab === 'manage') {
            console.log('🔄 Manage tab activated, fetching products...');
            fetchProducts();
        }
    }, [activeTab]);

    // Debug: Log form data changes
    useEffect(() => {
        console.log('Form data changed:', formData);
    }, [formData]);

    // Listen for stock updates from order cancellations and other stock changes
    useEffect(() => {
        const handleStockUpdate = (event) => {
            console.log('📦 Stock update detected in MaintenancePage, refreshing products...', event.detail);
            fetchProducts();
        };

        const handleStorageChange = (e) => {
            if (e.key === 'stock_updated') {
                console.log('📦 Stock updated via localStorage, refreshing products...');
                fetchProducts();
            }
        };

        // Listen for custom stock update events (from cancellation approvals, etc.)
        window.addEventListener('stockUpdated', handleStockUpdate);
        // Listen for cross-tab stock updates
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('stockUpdated', handleStockUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log('Form input changed:', name, '=', value);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle product type change specifically  
    const handleProductTypeChange = (e) => {
        console.log('Product type changed to:', e.target.value);
        setFormData(prev => ({
            ...prev,
            product_type: e.target.value
        }));
    };// Handle size and color variant changes    // Commented out unused legacy function
    // const handleSizeColorVariantChange = (sizeIndex, colorIndex, field, value) => {
    //     const newVariants = [...formData.sizeColorVariants];
    //     if (field === 'size') {
    //         newVariants[sizeIndex].size = value;
    //     } else if (field === 'color') {
    //         newVariants[sizeIndex].colorStocks[colorIndex].color = value;
    //     } else if (field === 'stock') {
    //         newVariants[sizeIndex].colorStocks[colorIndex].stock = parseInt(value) || 0;
    //     }
    //     setFormData({
    //         ...formData,
    //         sizeColorVariants: newVariants
    //     });
    // };    // Add new color to a specific size
    const addColorToSize = (sizeIndex) => {
        console.log('Adding color to size index:', sizeIndex);
        const newVariants = [...formData.sizeColorVariants];
        newVariants[sizeIndex].colorStocks.push({ color: '', stock: 0 });
        setFormData(prev => ({
            ...prev,
            sizeColorVariants: newVariants
        }));
    };

    // Remove color from a specific size
    const removeColorFromSize = (sizeIndex, colorIndex) => {
        console.log('Removing color from size:', sizeIndex, 'color:', colorIndex);
        const newVariants = [...formData.sizeColorVariants];
        newVariants[sizeIndex].colorStocks = newVariants[sizeIndex].colorStocks.filter((_, i) => i !== colorIndex);
        setFormData(prev => ({
            ...prev,
            sizeColorVariants: newVariants
        }));
    };

    // Add new size variant
    const addSizeVariant = () => {
        console.log('Adding new size variant');
        setFormData(prev => ({
            ...prev,
            sizeColorVariants: [...prev.sizeColorVariants, { size: '', colorStocks: [{ color: '', stock: 0 }] }]
        }));
    };

    // Remove size variant
    const removeSizeVariant = (index) => {
        console.log('Removing size variant at index:', index);
        const newVariants = formData.sizeColorVariants.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            sizeColorVariants: newVariants
        }));
    };// Calculate total stock across all variants
    const getTotalStock = () => {
        return formData.sizeColorVariants.reduce((total, sizeVariant) => {
            return total + sizeVariant.colorStocks.reduce((sizeTotal, colorStock) => {
                return sizeTotal + colorStock.stock;
            }, 0);
        }, 0);
    };    // Extract all unique colors from sizeColorVariants for display
    const getProductColors = (product) => {
        try {
            // First, try to get colors from sizeColorVariants structure
            if (product.sizeColorVariants && Array.isArray(product.sizeColorVariants)) {
                const allColors = [];
                product.sizeColorVariants.forEach(sizeVariant => {
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
            
            // Fallback to legacy colors field
            if (product.colors) {
                try {
                    const colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
                    if (Array.isArray(colors) && colors.length > 0) {
                        const validColors = colors.filter(color => color && color.trim() !== '');
                        if (validColors.length > 0) {
                            return validColors;
                        }
                    }
                } catch (e) {
                    console.log('Error parsing colors field:', e);
                }
            }
            
            // Fallback to single productcolor
            if (product.productcolor && product.productcolor.trim() !== '') {
                // Handle comma-separated colors in productcolor field
                if (product.productcolor.includes(',')) {
                    return product.productcolor.split(',').map(c => c.trim()).filter(c => c);
                }
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
    };    // Get detailed size-color breakdown for display
    const getSizeColorBreakdown = (product) => {
        try {
            if (product.sizeColorVariants) {
                const sizeColorVariants = typeof product.sizeColorVariants === 'string' 
                    ? JSON.parse(product.sizeColorVariants) 
                    : product.sizeColorVariants;
                
                // Ensure the structure is correct
                const validVariants = sizeColorVariants.filter(sizeVariant => {
                    // Check that sizeVariant has the expected structure
                    return sizeVariant && 
                           typeof sizeVariant.size === 'string' && 
                           Array.isArray(sizeVariant.colorStocks) &&
                           sizeVariant.colorStocks.some(colorStock => 
                               colorStock && 
                               typeof colorStock.color === 'string' && 
                               typeof colorStock.stock === 'number' && 
                               colorStock.stock > 0
                           );
                });
                
                return validVariants;
            }
        } catch (error) {
            console.error('Error parsing size-color variants:', error);
            console.error('Product sizeColorVariants:', product.sizeColorVariants);        }
        return [];
    };    // Handle size-color variant changes for the new structure
    const handleSizeVariantChange = (sizeIndex, field, value) => {
        console.log('Size variant change:', sizeIndex, field, value);
        const newVariants = [...formData.sizeColorVariants];
        if (field === 'size') {
            newVariants[sizeIndex].size = value;
        }
        setFormData(prev => ({
            ...prev,
            sizeColorVariants: newVariants
        }));
    };

    const handleColorStockChange = (sizeIndex, colorIndex, field, value) => {
        console.log('Color stock change:', sizeIndex, colorIndex, field, value);
        const newVariants = [...formData.sizeColorVariants];
        if (field === 'color') {
            newVariants[sizeIndex].colorStocks[colorIndex].color = value;
        } else if (field === 'stock') {
            newVariants[sizeIndex].colorStocks[colorIndex].stock = parseInt(value) || 0;
        }
        setFormData(prev => ({
            ...prev,
            sizeColorVariants: newVariants
        }));
    };// Legacy functions (keep for backward compatibility but update to sync with sizeColorVariants)    // Commented out legacy functions (keeping for backward compatibility but not currently used)
    // const handleSizeChange = (index, field, value) => {
    //     const newSizes = [...formData.sizes];
    //     newSizes[index][field] = field === 'stock' ? parseInt(value) || 0 : value;
    //     setFormData({
    //         ...formData,
    //         sizes: newSizes
    //     });
    // };

    // const addSize = () => {
    //     setFormData({
    //         ...formData,
    //         sizes: [...formData.sizes, { size: '', stock: 0 }]
    //     });
    // };

    // const removeSize = (index) => {
    //     const newSizes = formData.sizes.filter((_, i) => i !== index);
    //     setFormData({
    //         ...formData,
    //         sizes: newSizes
    //     });
    // };

    // const handleColorChange = (index, value) => {
    //     const newColors = [...formData.colors];
    //     newColors[index] = value;
    //     setFormData({
    //         ...formData,
    //         colors: newColors
    //     });
    // };

    // const addColor = () => {
    //     setFormData({
    //         ...formData,
    //         colors: [...formData.colors, '']
    //     });
    // };

    // const removeColor = (index) => {
    //     const newColors = formData.colors.filter((_, i) => i !== index);
    //     setFormData({
    //         ...formData,
    //         colors: newColors
    //     });
    // };// Compress image before upload
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
            const response = await fetch(`http://localhost:5000/api/maintenance/images/${imageId}`, {
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
        console.log('Resetting form...');
        const defaultFormData = {
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
        };
        
        setFormData(defaultFormData);
        setSelectedImages([]);
        setImagePreviews([]);
        setExistingImages([]);
        setEditingProduct(null);        setShowEditModal(false);
        setMessage('');
        
        console.log('Form reset complete, default form data:', defaultFormData);
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
            }            // Debug: Log what we're sending
            console.log('=== SUBMITTING PRODUCT DATA ===');
            console.log('Product name:', formData.productname);
            console.log('Size Color Variants:', JSON.stringify(formData.sizeColorVariants, null, 2));
            console.log('Total Stock:', totalStock);
            console.log('Selected images count:', selectedImages.length);
            
            console.log('=== FORM DATA BEING SENT ===');
            for (let pair of formDataToSend.entries()) {
                if (pair[0] !== 'images') { // Don't log file objects
                    console.log(pair[0] + ':', pair[1]);
                }
            }const url = editingProduct? `http://localhost:5000/api/maintenance/products/${editingProduct.id}`
                : 'http://localhost:5000/api/maintenance/products';
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formDataToSend
            });

            if (response.ok) {
                setMessage(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
                resetForm();
                fetchProducts();
                
                // Refresh stock data to ensure all pages show updated stock
                await fetchStockData();
                console.log('📦 Stock data refreshed after product update');
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
    };    // Edit product
    const editProduct = async (product) => {
        console.log('=== EDITING PRODUCT ===');
        console.log('Full product data:', product);
        console.log('Raw sizes field:', product.sizes);
        console.log('Raw productcolor field:', product.productcolor);
        console.log('Processed sizeColorVariants:', product.sizeColorVariants);
        
        setEditingProduct(product);
        
        // Use the processed sizeColorVariants from the product data
        let sizeColorVariants = [];
        if (product.sizeColorVariants && Array.isArray(product.sizeColorVariants)) {
            sizeColorVariants = JSON.parse(JSON.stringify(product.sizeColorVariants)); // Deep copy
            console.log('Using processed sizeColorVariants:', sizeColorVariants);
        } else {
            // Fallback: try to parse from raw sizes field
            try {
                if (product.sizes && typeof product.sizes === 'string') {
                    const parsedSizes = JSON.parse(product.sizes);
                    console.log('Parsed sizes from raw field:', parsedSizes);
                    
                    // Check if it's already in sizeColorVariants format
                    if (parsedSizes.length > 0 && parsedSizes[0].colorStocks) {
                        sizeColorVariants = parsedSizes;
                        console.log('Found sizeColorVariants in raw sizes field:', sizeColorVariants);
                    } else {
                        // Convert old format to new format
                        const colors = product.productcolor ? product.productcolor.split(',').map(c => c.trim()).filter(c => c) : ['Default'];
                        sizeColorVariants = parsedSizes.map(sizeItem => ({
                            size: typeof sizeItem === 'object' ? sizeItem.size : sizeItem,
                            colorStocks: colors.map(color => ({
                                color: color,
                                stock: typeof sizeItem === 'object' ? Math.floor(sizeItem.stock / colors.length) : 0
                            }))
                        }));
                        console.log('Converted old format to sizeColorVariants:', sizeColorVariants);
                    }
                }
            } catch (e) {
                console.log('Error parsing sizes field:', e);
            }
            
            // Final fallback
            if (!sizeColorVariants || sizeColorVariants.length === 0) {
                sizeColorVariants = [
                    { size: 'S', colorStocks: [{ color: product.productcolor || 'Black', stock: 0 }] },
                    { size: 'M', colorStocks: [{ color: product.productcolor || 'Black', stock: 0 }] },
                    { size: 'L', colorStocks: [{ color: product.productcolor || 'Black', stock: 0 }] },
                    { size: 'XL', colorStocks: [{ color: product.productcolor || 'Black', stock: 0 }] }
                ];
                console.log('Using final fallback sizeColorVariants:', sizeColorVariants);
            }
        }
        
        // Parse legacy sizes for backward compatibility
        let sizes;
        try {
            if (product.sizes && typeof product.sizes === 'string' && product.sizes.startsWith('[')) {
                sizes = JSON.parse(product.sizes);
            } else {
                sizes = [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }];
            }
        } catch (error) {
            sizes = [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }];
        }
        
        // Parse legacy colors for backward compatibility
        let colors = [];
        try {
            if (product.colors && typeof product.colors === 'string') {
                colors = JSON.parse(product.colors);
            } else if (product.productcolor) {
                colors = [product.productcolor];
            }
        } catch (error) {
            colors = product.productcolor ? [product.productcolor] : [];
        }        setFormData({
            productname: product.productname || '',
            productdescription: product.productdescription || '',
            productprice: product.productprice || '',
            productcolor: product.productcolor || '',
            colors: colors,
            product_type: product.product_type || '',
            sizes: sizes,
            sizeColorVariants: sizeColorVariants
        });
        
        console.log('=== FORM DATA SET FOR EDITING ===');
        console.log('sizeColorVariants being set:', JSON.stringify(sizeColorVariants, null, 2));
        console.log('product_type being set:', product.product_type);
        console.log('Form data after setting:', {
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
    };      // Archive product
    const archiveProduct = async (id) => {
        if (window.confirm('Are you sure you want to archive this product? It will be removed from public view.')) {
            try {
                const response = await fetch(`http://localhost:5000/api/maintenance/products/${id}/archive`, {
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
    };    // Restore archived product
    const restoreProduct = async (id) => {
        if (window.confirm('Are you sure you want to restore this product?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/maintenance/products/${id}/restore`, {
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
                const response = await fetch(`http://localhost:5000/api/maintenance/products/${id}`, {
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
            const response = await fetch('http://localhost:5000/api/maintenance/backup', {
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

    // Add the missing deleteProductImage function    // Commented out unused function
    // const deleteProductImage = async (productId, filename) => {
    //     if (!window.confirm('Are you sure you want to delete this image?')) return;
    //     
    //     try {
    //         const response = await fetch(`http://localhost:5000/api/maintenance/products/${productId}/image/${filename}`, {
    //             method: 'DELETE'
    //         });
    //         
    //         if (response.ok) {
    //             setMessage('Image deleted successfully!');
    //             fetchProducts(); // Refresh products
    //         } else {
    //             setMessage('Error deleting image');
    //         }
    //     } catch (error) {
    //         console.error('Error deleting image:', error);
    //         setMessage('Error deleting image');
    //     }
    // };

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

/* Enhanced Submit Button Styles */
.maintenance-submit-btn {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #000000 0%, #333333 100%) !important;
    border: none !important;
    color: #ffffff !important;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.maintenance-submit-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
    z-index: 1;
}

.maintenance-submit-btn:hover::before {
    left: 100%;
}

.maintenance-submit-btn:hover {
    background: linear-gradient(135deg, #333333 0%, #000000 100%) !important;
    transform: translateY(-3px) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
}

.maintenance-submit-btn:active {
    transform: translateY(-1px) !important;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
}

.maintenance-submit-btn:disabled {
    background: #cccccc !important;
    color: #666666 !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
}

.maintenance-submit-btn:disabled::before {
    display: none;
}

/* Enhanced Cancel Button Styles */
.maintenance-cancel-btn {
    background: transparent !important;
    color: #000000 !important;
    border: 2px solid #000000 !important;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.maintenance-cancel-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: #000000;
    transition: width 0.3s ease;
    z-index: -1;
}

.maintenance-cancel-btn:hover::before {
    width: 100%;
}

.maintenance-cancel-btn:hover {
    color: #ffffff !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
}

.maintenance-cancel-btn:active {
    transform: translateY(0) !important;
    box-shadow: none !important;
}

/* Button Group Animation */
.maintenance-button-group {
    animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Loading state animation */
.maintenance-submit-btn.loading {
    position: relative;
}

.maintenance-submit-btn.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
                                                if (e.target) {
                                                  e.target.style.borderColor = '#000000';
                                                  e.target.style.backgroundColor = '#f5f5f5';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (e.target) {
                                                  e.target.style.borderColor = '#e0e0e0';
                                                  e.target.style.backgroundColor = '#fafafa';
                                                }
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
                                                                src={`http://localhost:5000/uploads/${img.image_filename}`} 
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
                                                <div style={styles.sizeHeader}>                                                    <input
                                                        type="text"
                                                        placeholder="Size (e.g., S, M, L, XL)"
                                                        value={sizeVariant.size}
                                                        onChange={(e) => handleSizeVariantChange(sizeIndex, 'size', e.target.value)}
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
                                                        <div key={colorIndex} style={styles.colorStockRow}>                                                            <input
                                                                type="text"
                                                                placeholder="Color (e.g., Red, Blue, Black)"
                                                                value={colorStock.color}
                                                                onChange={(e) => handleColorStockChange(sizeIndex, colorIndex, 'color', e.target.value)}
                                                                style={styles.colorVariantInput}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Stock"
                                                                value={colorStock.stock}
                                                                onChange={(e) => handleColorStockChange(sizeIndex, colorIndex, 'stock', e.target.value)}
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
                                </div>                                <div style={styles.buttonGroup} className="maintenance-button-group">                                    <button 
                                        type="submit" 
                                        style={styles.submitButton}
                                        className={`maintenance-submit-btn ${loading ? 'loading' : ''}`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', animation: 'spin 1s linear infinite'}}>
                                                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                                </svg>
                                                SAVING...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                                                    <path d="M12 5v14"/>
                                                    <path d="M5 12h14"/>
                                                </svg>
                                                {editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
                                            </>
                                        )}
                                    </button>
                                    {editingProduct && (
                                        <button 
                                            type="button" 
                                            style={styles.cancelButton}
                                            className="maintenance-cancel-btn"
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
                            
                            {/* Product Summary */}
                            <div style={styles.subTabs}>
                                <div style={{...styles.subTab, backgroundColor: '#28a745'}}>
                                    Active Products: {products.filter(p => p.status !== 'archived' && !p.is_archived).length}
                                </div>
                                <div style={{...styles.subTab, backgroundColor: archivedProducts.length > 0 ? '#ffc107' : '#6c757d'}}>
                                    Archived: {archivedProducts.length}
                                </div>
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
                                        <div>
                                            {/* Active Products Section */}
                                            <div style={styles.sectionContainer}>
                                                <h3 style={styles.sectionSubTitle}>Active Products</h3>
                                                <div style={styles.productsGrid}>
                                                    {products.filter(p => p.status !== 'archived' && !p.is_archived).map(product => (
                                                        <div key={product.id} style={styles.productCard} className="maintenance-card">
                                                            {/* Product Image */}
                                                            {product.images && product.images.length > 0 ? (
                                                                <div style={styles.productImageContainer}>
                                                                    <img 
                                                                        src={`http://localhost:5000/uploads/${product.images[0]}`}
                                                                        alt={product.productname}
                                                                        style={styles.productImage}
                                                                    />
                                                                    {product.images.length > 1 && (
                                                                        <div style={styles.imageCount}>
                                                                            {product.images.length} IMAGES
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : product.productimage ? (
                                                                <div style={styles.productImageContainer}>
                                                                    <img 
                                                                        src={`http://localhost:5000/uploads/${product.productimage}`}
                                                                        alt={product.productname}
                                                                        style={styles.productImage}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div style={styles.noImagePlaceholder}>
                                                                    No Image
                                                                </div>
                                                            )}
                                                            
                                                            {/* Product Info */}
                                                            <div style={styles.productInfo}>
                                                                <h3 style={styles.productName}>{product.productname}</h3>
                                                                <p style={styles.productPrice}>₱{product.productprice}</p>
                                                                                  <div style={styles.stockSection}>
                                                                    <p style={styles.productStock}>
                                                                        Total Stock: {product.total_stock || product.productquantity || 0}
                                                                    </p>
                                                                    
                                                                    {/* Show detailed size-color breakdown if available */}
                                                                    {getSizeColorBreakdown(product).length > 0 && (
                                                                        <div style={styles.sizeColorBreakdown}>
                                                                            <span style={styles.productLabel}>Stock Details: </span>
                                                                            <div style={styles.breakdownList}>
                                                                                {getSizeColorBreakdown(product).map((sizeVariant, index) => (
                                                                                    <div key={index} style={styles.sizeGroup}>
                                                                                        <span style={styles.sizeLabel}>
                                                                                            {String(sizeVariant.size || 'Unknown')}:
                                                                                        </span>
                                                                                        <div style={styles.colorStockList}>
                                                                                            {Array.isArray(sizeVariant.colorStocks) && sizeVariant.colorStocks
                                                                                                .filter(colorStock => colorStock && colorStock.stock > 0)
                                                                                                .map((colorStock, colorIndex) => (
                                                                                                    <span key={colorIndex} style={styles.colorStockTag}>
                                                                                                        {String(colorStock.color || 'Unknown')} ({String(colorStock.stock || 0)})
                                                                                                    </span>
                                                                                                ))
                                                                                            }
                                                                                            {(!Array.isArray(sizeVariant.colorStocks) || 
                                                                                              sizeVariant.colorStocks.filter(cs => cs && cs.stock > 0).length === 0) && (
                                                                                                <span style={styles.noStockText}>No stock</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                <div style={styles.productColors}>
                                                                    <span style={styles.productLabel}>Color: </span>
                                                                    <span style={styles.productDetail}>
                                                                        {getProductColors(product).join(', ')}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div style={styles.productType}>
                                                                    <span style={styles.productLabel}>Type: </span>
                                                                    <span style={styles.productDetail}>
                                                                        {product.product_type ? product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1) : 'Not specified'}
                                                                    </span>
                                                                </div>
                                                                  <div style={styles.productActions}>
                                                                    <button 
                                                                        className="action-button edit-button"
                                                                        style={styles.editButton}
                                                                        onClick={() => editProduct(product)}
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                                        </svg>
                                                                        EDIT
                                                                    </button>
                                                                    <button 
                                                                        className="action-button archive-button"
                                                                        style={styles.archiveButton}
                                                                        onClick={() => archiveProduct(product.id)}
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <polyline points="21,8 21,21 3,21 3,8"/>
                                                                            <rect x="1" y="3" width="22" height="5"/>
                                                                            <line x1="10" y1="12" x2="14" y2="12"/>
                                                                        </svg>
                                                                        ARCHIVE
                                                                    </button>
                                                                    <button 
                                                                        className="action-button delete-button"
                                                                        style={styles.deleteButton}
                                                                        onClick={() => deleteProduct(product.id)}
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <polyline points="3,6 5,6 21,6"/>
                                                                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                                                            <line x1="10" y1="11" x2="10" y2="17"/>
                                                                            <line x1="14" y1="11" x2="14" y2="17"/>
                                                                        </svg>
                                                                        REMOVE
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {products.filter(p => p.status !== 'archived' && !p.is_archived).length === 0 && (
                                                    <div style={styles.emptySection}>
                                                        <p>No active products found.</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Archived Products Section */}
                                            {archivedProducts.length > 0 && (
                                                <div style={styles.sectionContainer}>
                                                    <h3 style={styles.archivedSectionTitle}>Archived Products</h3>
                                                    <div style={styles.productsGrid}>
                                                        {archivedProducts.map(product => (
                                                            <div key={product.id} style={styles.archivedProductCard} className="maintenance-card archived">
                                                                {/* Product Image */}
                                                                {product.images && product.images.length > 0 ? (
                                                                    <div style={styles.productImageContainer}>
                                                                        <img 
                                                                            src={`http://localhost:5000/uploads/${product.images[0]}`}
                                                                            alt={product.productname}
                                                                            style={styles.archivedProductImage}
                                                                        />
                                                                        {product.images.length > 1 && (
                                                                            <div style={styles.imageCount}>
                                                                                {product.images.length} IMAGES
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : product.productimage ? (
                                                                    <div style={styles.productImageContainer}>
                                                                        <img 
                                                                            src={`http://localhost:5000/uploads/${product.productimage}`}
                                                                            alt={product.productname}
                                                                            style={styles.archivedProductImage}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div style={{...styles.noImagePlaceholder, ...styles.archivedNoImage}}>
                                                                        No Image
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Product Info */}
                                                                <div style={styles.productInfo}>
                                                                    <h3 style={styles.archivedProductName}>{product.productname}</h3>
                                                                    <p style={styles.archivedProductPrice}>₱{product.productprice}</p>
                                                                      <div style={styles.archivedLabel}>
                                                                        ARCHIVED
                                                                    </div>
                                                                    
                                                                    <div style={styles.stockSection}>
                                                                        <p style={styles.productStock}>
                                                                            Total Stock: {product.total_stock || product.productquantity || 0}
                                                                        </p>
                                                                        
                                                                        {/* Show detailed size-color breakdown if available */}
                                                                        {getSizeColorBreakdown(product).length > 0 && (
                                                                            <div style={styles.sizeColorBreakdown}>
                                                                                <span style={styles.productLabel}>Stock Details: </span>
                                                                                <div style={styles.breakdownList}>
                                                                                    {getSizeColorBreakdown(product).map((sizeVariant, index) => (
                                                                                        <div key={index} style={styles.sizeGroup}>
                                                                                            <span style={styles.sizeLabel}>
                                                                                                {String(sizeVariant.size || 'Unknown')}:
                                                                                            </span>
                                                                                            <div style={styles.colorStockList}>
                                                                                                {Array.isArray(sizeVariant.colorStocks) && sizeVariant.colorStocks
                                                                                                    .filter(colorStock => colorStock && colorStock.stock > 0)
                                                                                                    .map((colorStock, colorIndex) => (
                                                                                                        <span key={colorIndex} style={styles.colorStockTag}>
                                                                                                            {String(colorStock.color || 'Unknown')} ({String(colorStock.stock || 0)})
                                                                                                        </span>
                                                                                                    ))
                                                                                                }
                                                                                                {(!Array.isArray(sizeVariant.colorStocks) || 
                                                                                                  sizeVariant.colorStocks.filter(cs => cs && cs.stock > 0).length === 0) && (
                                                                                                    <span style={styles.noStockText}>No stock</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div style={styles.productColors}>
                                                                        <span style={styles.productLabel}>Color: </span>
                                                                        <span style={styles.productDetail}>
                                                                            {getProductColors(product).join(', ')}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div style={styles.productType}>
                                                                        <span style={styles.productLabel}>Type: </span>
                                                                        <span style={styles.productDetail}>
                                                                            {product.product_type ? product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1) : 'Not specified'}
                                                                        </span>
                                                                    </div>
                                                                      <div style={styles.archivedProductActions}>
                                                                        <button 
                                                                            className="action-button restore-button"
                                                                            style={styles.restoreButton}
                                                                            onClick={() => restoreProduct(product.id)}
                                                                        >
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="23,4 23,10 17,10"/>
                                                                                <path d="M20.49,15a9,9 0 1,1 -2.12,-9.36L23,10"/>
                                                                            </svg>
                                                                            RESTORE
                                                                        </button>
                                                                        <button 
                                                                            className="action-button delete-button"
                                                                            style={styles.deleteButton}
                                                                            onClick={() => deleteProduct(product.id)}
                                                                        >
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="3,6 5,6 21,6"/>
                                                                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                                                                <line x1="10" y1="11" x2="10" y2="17"/>
                                                                                <line x1="14" y1="11" x2="14" y2="17"/>
                                                                            </svg>
                                                                            REMOVE
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
                        </div>                    )}

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
                                    {loading ? 'CREATING BACKUP...' : 'CREATE BACKUP'}                                </button>
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
    },
    form: {
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
        fontWeight: '300'
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
        cursor: 'pointer'
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
        fontWeight: '300'
    },
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
        transition: 'all 0.2s ease'
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
        paddingBottom: '100%',
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
        transition: 'opacity 0.2s ease'
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
    },
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
    },
    subTabs: {
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
        justifyContent: 'center',
        gap: '0.4rem'
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
    sectionContainer: {
        marginBottom: '3rem'
    },
    sectionSubTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: '#000000',
        borderBottom: '2px solid #000000',
        paddingBottom: '0.5rem'
    },
    archivedSectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: '#666666',
        borderBottom: '2px solid #ccc',
        paddingBottom: '0.5rem'
    },
    archivedProductCard: {
        border: '2px dashed #ccc',
        opacity: 0.6,
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
    },
    archivedProductImage: {
        width: '100%',
        height: '240px',
        objectFit: 'cover',
        filter: 'grayscale(50%)'
    },
    archivedNoImage: {
        backgroundColor: '#e9ecef',
        color: '#6c757d'
    },
    archivedProductName: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#666666'
    },
    archivedProductPrice: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#666666',
        marginBottom: '8px'
    },
    archivedProductActions: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem'
    },
    productDetail: {
        fontSize: '13px',
        color: '#333333'
    },
    emptySection: {
        textAlign: 'center',
        padding: '3rem',
        color: '#666666',
        fontSize: '1rem'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
    },
    productCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
    },
    productImage: {
        width: '100%',
        height: '240px',
        objectFit: 'cover'
    },
    productInfo: {
        padding: '1.5rem',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    productName: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#000000',
        letterSpacing: '-0.25px'
    },
    productPrice: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#000000',
        marginBottom: '1rem'
    },
    productMeta: {
        flexGrow: 1
    },
    productStock: {
        fontSize: '0.85rem',
        fontWeight: '500',
        color: '#333333',
        marginBottom: '0.5rem'
    },
    productColors: {
        fontSize: '0.85rem',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    productSizes: {
        fontSize: '0.85rem',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    productType: {
        fontSize: '0.85rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    productLabel: {
        fontWeight: '600',
        color: '#000000',
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '0.5px',
        minWidth: 'fit-content'
    },
    productActions: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: 'auto'
    },
    restoreButton: {
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
    archivedLabel: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        padding: '0.25rem 0.5rem',
        fontSize: '0.7rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    primaryButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '1rem 2rem',
        border: 'none',
        fontSize: '0.85rem',
        cursor: 'pointer',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        transition: 'all 0.2s ease',
        marginRight: '1rem'
    },
    // Enhanced Submit Button Styles
    submitButton: {
        background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
        color: '#ffffff',
        padding: '1.2rem 3rem',
        border: 'none',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        borderRadius: '0',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        minWidth: '200px',
        '&:hover': {
            background: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        },
        '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        },
        '&:disabled': {
            background: '#cccccc',
            color: '#666666',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none'
        },
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            transition: 'left 0.5s ease',
        },
        '&:hover::before': {
            left: '100%'
        }
    },
    // Button Group Container
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '2.5rem',
        paddingTop: '2rem',
        borderTop: '1px solid #e0e0e0',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    // Enhanced Cancel Button
    cancelButton: {
        background: 'transparent',
        color: '#000000',
        padding: '1.2rem 2.5rem',
        border: '2px solid #000000',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderRadius: '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '160px',
        '&:hover': {
            backgroundColor: '#000000',
            color: '#ffffff',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        },
        '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'none'
        }
    },
    backupSection: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0'
    },
    backupDescription: {
        fontSize: '1rem',
        color: '#666666',
        marginBottom: '2rem',
        fontWeight: '300'
    },
    backupButton: {
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '1rem 2rem',
        border: 'none',
        fontSize: '0.85rem',
        cursor: 'pointer',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
    },
    sizeColorBreakdown: {
        fontSize: '0.8rem',
        marginTop: '0.5rem'
    },
    breakdownList: {
        marginTop: '0.25rem'
    },
    sizeGroup: {
        marginBottom: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
    },
    sizeLabel: {
        fontWeight: '600',
        color: '#000000',
        minWidth: 'fit-content'
    },
    colorStockList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.25rem'
    },
    colorStockTag: {
        backgroundColor: '#f0f0f0',
        color: '#333333',
        padding: '0.15rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: '400'
    },
    noStockText: {
        color: '#999999',
        fontStyle: 'italic',
        fontSize: '0.75rem'
    },
    noImagePlaceholder: {
        width: '100%',
        height: '240px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999999',
        fontSize: '0.9rem',
        fontWeight: '400'
    },
    imageCount: {
        position: 'absolute',
        bottom: '0.5rem',
        right: '0.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        padding: '0.25rem 0.5rem',
        fontSize: '0.7rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    multiImageIndicator: {
        position: 'absolute',
        top: '0.5rem',
        left: '0.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        padding: '0.25rem 0.5rem',
        fontSize: '0.7rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    },
    mainImageContainer: {
        position: 'relative',
        width: '100%',
        height: '240px',
        overflow: 'hidden',
        backgroundColor: '#fafafa',
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
