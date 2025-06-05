import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Maintenance = () => {
    const [products, setProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        sizes: '',
        stock: ''
    });

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        
        try {
            // Format the product data
            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                price: newProduct.price,
                sizes: newProduct.sizes,
                stock: newProduct.stock
            };

            console.log('Sending product data:', productData);

            // Send request to add product
            const response = await axios.post(
                'http://localhost:5001/api/products',
                productData
            );

            console.log('Server response:', response.data);

            // Update local state immediately without waiting for fetch
            const addedProduct = response.data.product || {
                id: Date.now(), // Fallback ID if server doesn't provide one
                ...productData
            };
            
            setProducts(currentProducts => [...currentProducts, addedProduct]);
            
            // Reset form and close modal
            setNewProduct({
                name: '',
                description: '',
                price: '',
                sizes: '',
                stock: ''
            });
            setShowAddModal(false);

        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Container>
            <Header>
                <h1>Product Maintenance</h1>
                <AddButton onClick={() => setShowAddModal(true)}>Add Product</AddButton>
            </Header>

            {showAddModal && (
                <Modal>
                    <ModalContent>
                        <h2>Add New Product</h2>
                        <Form onSubmit={handleAddProduct}>
                            <FormGroup>
                                <Label>Name:</Label>
                                <Input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Description:</Label>
                                <TextArea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Sizes (comma-separated):</Label>
                                <Input
                                    type="text"
                                    value={newProduct.sizes}
                                    onChange={(e) => setNewProduct({...newProduct, sizes: e.target.value})}
                                    placeholder="S, M, L"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Stock:</Label>
                                <Input
                                    type="number"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                                    required
                                />
                            </FormGroup>
                            <ButtonGroup>
                                <SubmitButton type="submit">Add Product</SubmitButton>
                                <CancelButton type="button" onClick={() => setShowAddModal(false)}>Cancel</CancelButton>
                            </ButtonGroup>
                        </Form>
                    </ModalContent>
                </Modal>
            )}

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Sizes</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes}</td>
                            <td>{product.stock}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

// Styled components
const Container = styled.div`
    padding: 20px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const Label = styled.label`
    font-weight: bold;
`;

const Input = styled.input`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const TextArea = styled.textarea`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 100px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
`;

const AddButton = styled.button`
    padding: 8px 16px;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const SubmitButton = styled(AddButton)``;

const CancelButton = styled(AddButton)`
    background: #666;
`;

export default Maintenance;