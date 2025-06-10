import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaArchive, FaTruck, FaDownload, FaUpload } from 'react-icons/fa';
import ImageUploader from './ImageUploader';

const Maintenance = () => {
    // ...previous state and helper functions...

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

    return (
        <MaintenanceContainer>
            {/* ...header and tabs... */}
            
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
                            {/* ...other form fields... */}
                        </Form>
                    </ModalContent>
                </Modal>
            )}
            
            {/* ...other modals... */}
        </MaintenanceContainer>
    );
};

// ...styled components...

export default Maintenance;
