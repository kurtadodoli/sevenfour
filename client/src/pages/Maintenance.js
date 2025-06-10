import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaArchive, FaTruck, FaDownload, FaUpload } from 'react-icons/fa';
import ImageUploader from '../components/ImageUploader';

const Maintenance = () => {
    const { auth } = useAuth();
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'

    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        sizes: [],
        stock: '',
        image: null,
        deliverySchedule: {
            estimatedDays: 3,
            shippingCost: 0,
            availableRegions: []
        }
    });

    const categories = [
        'T-Shirts',
        'Hoodies',
        'Jerseys',
        'Jackets',
        'Sweaters',
        'Shorts',
        'Headwear',
        'Bags'
    ];

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const [activeResponse, archivedResponse] = await Promise.all([
                axios.get('http://localhost:5000/api/products/active'),
                axios.get('http://localhost:5000/api/products/archived')
            ]);
            
            setProducts(activeResponse.data.products);
            setArchivedProducts(archivedResponse.data.products);
            setError('');
        } catch (err) {
            setError('Failed to fetch products: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (files) => {
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                setError(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name} exceeds the 5MB size limit`);
                return false;
            }
            return true;
        });

        if (validFiles.length !== files.length) {
            setError('Some files were not added due to invalid type or size');
        }

        const newPreviews = validFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviews).then(previews => {
            setImagePreviews(prev => [...prev, ...previews]);
            setProductForm(prev => ({
                ...prev,
                image: prev.image ? [...prev.image, ...validFiles] : validFiles
            }));
        });
    };

    const handleRemoveImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setProductForm(prev => {
            const newImages = Array.from(prev.image).filter((_, i) => i !== index);
            return { ...prev, image: newImages };
        });
    };

    const handleSizeToggle = (size) => {
        setProductForm(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            setUploadProgress(0);
            const formData = new FormData();
            
            Object.keys(productForm).forEach(key => {
                if (key === 'sizes' || key === 'deliverySchedule') {
                    formData.append(key, JSON.stringify(productForm[key]));
                } else if (key === 'image' && productForm[key]) {
                    // Append each image file
                    Array.from(productForm[key]).forEach(file => {
                        formData.append('images', file);
                    });
                } else {
                    formData.append(key, productForm[key]);
                }
            });

            const config = {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (showEditModal) {
                await axios.put(
                    `http://localhost:5000/api/products/${selectedProduct.id}`,
                    formData,
                    config
                );
            } else {
                await axios.post('http://localhost:5000/api/products', formData, config);
            }

            await fetchProducts();
            resetAndCloseModals();
            setError('');
        } catch (err) {
            setError('Failed to save product: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleArchive = async (productId) => {
        try {
            await axios.post(`http://localhost:5000/api/products/${productId}/archive`);
            await fetchProducts();
            setError('');
        } catch (err) {
            setError('Failed to archive product: ' + err.message);
        }
    };    const handleRestoreProduct = async (productId) => {
        try {
            await axios.post(`http://localhost:5000/api/products/${productId}/restore`);
            await fetchProducts();
            setError('');
        } catch (err) {
            setError('Failed to restore product: ' + err.message);
        }
    };

    const handleBackup = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products/backup', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `products-backup-${new Date().toISOString()}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setError('');
        } catch (err) {
            setError('Failed to backup products: ' + err.message);
        }
    };

    const handleRestoreBackup = async (file) => {
        try {
            const formData = new FormData();
            formData.append('backup', file);
            await axios.post('http://localhost:5000/api/products/restore', formData);
            await fetchProducts();
            setError('');
        } catch (err) {
            setError('Failed to restore products: ' + err.message);
        }
    };

    const resetAndCloseModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeliveryModal(false);
        setSelectedProduct(null);
        setProductForm({
            name: '',
            description: '',
            price: '',
            category: '',
            sizes: [],
            stock: '',
            image: null,
            deliverySchedule: {
                estimatedDays: 3,
                shippingCost: 0,
                availableRegions: []
            }
        });
        setImagePreviews([]);
    };

    if (!auth.user?.role === 'admin') {
        return <UnauthorizedMessage>You are not authorized to view this page.</UnauthorizedMessage>;
    }

    return (
        <MaintenanceContainer>
            <Header>
                <Title>Product Maintenance</Title>
                <Actions>
                    <Button onClick={() => setShowAddModal(true)}>Add Product</Button>
                    <Button onClick={handleBackup}>
                        <FaDownload /> Backup Products
                    </Button>
                    <input
                        type="file"
                        id="restore-backup"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={(e) => handleRestoreBackup(e.target.files[0])}
                    />
                    <Button as="label" htmlFor="restore-backup">
                        <FaUpload /> Restore Backup
                    </Button>
                </Actions>
            </Header>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <TabContainer>
                <Tab
                    active={activeTab === 'active'}
                    onClick={() => setActiveTab('active')}
                >
                    Active Products
                </Tab>
                <Tab
                    active={activeTab === 'archived'}
                    onClick={() => setActiveTab('archived')}
                >
                    Archived Products
                </Tab>
            </TabContainer>

            {loading ? (
                <LoadingMessage>Loading products...</LoadingMessage>
            ) : (
                <ProductGrid>
                    {(activeTab === 'active' ? products : archivedProducts).map(product => (
                        <ProductCard key={product.id}>
                            <ProductImage src={product.imageUrl || '/placeholder.png'} alt={product.name} />
                            <ProductInfo>
                                <ProductName>{product.name}</ProductName>
                                <ProductPrice>${product.price}</ProductPrice>
                                <ProductCategory>{product.category}</ProductCategory>
                                <SizeList>{product.sizes.join(', ')}</SizeList>
                                <StockInfo>Stock: {product.stock}</StockInfo>
                            </ProductInfo>
                            <CardActions>
                                <IconButton onClick={() => {
                                    setSelectedProduct(product);
                                    setProductForm({ ...product, image: null });
                                    setShowEditModal(true);
                                }}>
                                    <FaEdit />
                                </IconButton>
                                <IconButton onClick={() => {
                                    setSelectedProduct(product);
                                    setShowDeliveryModal(true);
                                }}>
                                    <FaTruck />
                                </IconButton>
                                <IconButton onClick={() => activeTab === 'active'                                    ? handleArchive(product.id)
                                    : handleRestoreProduct(product.id)
                                }>
                                    <FaArchive />
                                </IconButton>
                            </CardActions>
                        </ProductCard>
                    ))}
                </ProductGrid>
            )}

            {/* Add/Edit Product Modal */}
            {(showAddModal || showEditModal) && (
                <Modal onClose={resetAndCloseModals}>
                    <ModalContent>
                        <ModalHeader>
                            <h2>{showEditModal ? 'Edit Product' : 'Add New Product'}</h2>
                            <CloseButton onClick={resetAndCloseModals}>&times;</CloseButton>
                        </ModalHeader>
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label>Product Images</Label>
                                <ImageUploader
                                    onImageChange={handleImageChange}
                                    onRemoveImage={handleRemoveImage}
                                    previews={imagePreviews}
                                    isUploading={isUploading}
                                    uploadProgress={uploadProgress}
                                />
                            </FormGroup>
                            <FormRow>
                                <FormGroup>
                                    <Label>Name</Label>
                                    <Input
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Category</Label>
                                    <Select
                                        value={productForm.category}
                                        onChange={(e) => setProductForm(prev => ({
                                            ...prev,
                                            category: e.target.value
                                        }))}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Select>
                                </FormGroup>
                            </FormRow>
                            <FormGroup>
                                <Label>Description</Label>
                                <TextArea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    required
                                    rows={4}
                                />
                            </FormGroup>
                            <FormRow>
                                <FormGroup>
                                    <Label>Price ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm(prev => ({
                                            ...prev,
                                            price: e.target.value
                                        }))}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Stock</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm(prev => ({
                                            ...prev,
                                            stock: e.target.value
                                        }))}
                                        required
                                    />
                                </FormGroup>
                            </FormRow>
                            <FormGroup>
                                <Label>Available Sizes</Label>
                                <SizeGrid>
                                    {availableSizes.map(size => (
                                        <SizeButton
                                            key={size}
                                            type="button"
                                            selected={productForm.sizes.includes(size)}
                                            onClick={() => handleSizeToggle(size)}
                                        >
                                            {size}
                                        </SizeButton>
                                    ))}
                                </SizeGrid>
                            </FormGroup>
                            <ModalActions>
                                <Button type="button" onClick={resetAndCloseModals}>Cancel</Button>
                                <Button type="submit" primary>
                                    {showEditModal ? 'Save Changes' : 'Add Product'}
                                </Button>
                            </ModalActions>
                        </Form>
                    </ModalContent>
                </Modal>
            )}

            {/* Delivery Schedule Modal */}
            {showDeliveryModal && (
                <Modal onClose={resetAndCloseModals}>
                    <ModalContent>
                        <ModalHeader>
                            <h2>Edit Delivery Schedule</h2>
                            <CloseButton onClick={resetAndCloseModals}>&times;</CloseButton>
                        </ModalHeader>
                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            // Handle delivery schedule update
                            resetAndCloseModals();
                        }}>
                            <FormGroup>
                                <Label>Estimated Delivery Days</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={productForm.deliverySchedule.estimatedDays}
                                    onChange={(e) => setProductForm(prev => ({
                                        ...prev,
                                        deliverySchedule: {
                                            ...prev.deliverySchedule,
                                            estimatedDays: e.target.value
                                        }
                                    }))}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Shipping Cost ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={productForm.deliverySchedule.shippingCost}
                                    onChange={(e) => setProductForm(prev => ({
                                        ...prev,
                                        deliverySchedule: {
                                            ...prev.deliverySchedule,
                                            shippingCost: e.target.value
                                        }
                                    }))}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Available Regions</Label>
                                <TextArea
                                    placeholder="Enter regions, one per line"
                                    value={productForm.deliverySchedule.availableRegions.join('\n')}
                                    onChange={(e) => setProductForm(prev => ({
                                        ...prev,
                                        deliverySchedule: {
                                            ...prev.deliverySchedule,
                                            availableRegions: e.target.value.split('\n').filter(r => r.trim())
                                        }
                                    }))}
                                    rows={4}
                                />
                            </FormGroup>
                            <ModalActions>
                                <Button type="button" onClick={resetAndCloseModals}>Cancel</Button>
                                <Button type="submit" primary>Save Changes</Button>
                            </ModalActions>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </MaintenanceContainer>
    );
};

// Styled Components
const MaintenanceContainer = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const Title = styled.h1`
    font-size: 2rem;
    color: #333;
`;

const Actions = styled.div`
    display: flex;
    gap: 1rem;
`;

const TabContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #eee;
`;

const Tab = styled.button`
    padding: 1rem 2rem;
    border: none;
    background: none;
    font-size: 1.1rem;
    color: ${props => props.active ? '#000' : '#666'};
    border-bottom: 2px solid ${props => props.active ? '#000' : 'transparent'};
    margin-bottom: -2px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        color: #000;
    }
`;

const ProductGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
`;

const ProductCard = styled.div`
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
    }
`;

const ProductImage = styled.img`
    width: 100%;
    height: 200px;
    object-fit: cover;
`;

const ProductInfo = styled.div`
    padding: 1rem;
`;

const ProductName = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    color: #333;
`;

const ProductPrice = styled.p`
    font-size: 1.2rem;
    font-weight: bold;
    color: #000;
    margin: 0.5rem 0;
`;

const ProductCategory = styled.span`
    font-size: 0.9rem;
    color: #666;
    display: block;
`;

const SizeList = styled.p`
    font-size: 0.9rem;
    color: #666;
    margin: 0.5rem 0;
`;

const StockInfo = styled.p`
    font-size: 0.9rem;
    color: #666;
    margin: 0;
`;

const CardActions = styled.div`
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    border-top: 1px solid #eee;
`;

const IconButton = styled.button`
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
        color: #000;
    }
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
        margin: 0;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-weight: 500;
    color: #333;
`;

const Input = styled.input`
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #000;
    }
`;

const Select = styled.select`
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #000;
    }
`;

const TextArea = styled.textarea`
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #000;
    }
`;

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    background: ${props => props.primary ? '#000' : '#eee'};
    color: ${props => props.primary ? '#fff' : '#333'};
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.primary ? '#333' : '#ddd'};
    }
`;

const SizeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 0.5rem;
`;

const SizeButton = styled.button`
    padding: 0.5rem;
    border: 1px solid ${props => props.selected ? '#000' : '#ddd'};
    background: ${props => props.selected ? '#000' : 'white'};
    color: ${props => props.selected ? 'white' : '#333'};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        border-color: #000;
    }
`;

// Styled components moved to ImageUploader.js

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
`;

const ErrorMessage = styled.div`
    background: #fee;
    color: #c00;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 2rem;
    color: #666;
`;

const UnauthorizedMessage = styled.div`
    text-align: center;
    padding: 2rem;
    color: #c00;
    font-size: 1.2rem;
`;

export default Maintenance;