import React from 'react';
import styled from 'styled-components';
import { FaUserCircle } from 'react-icons/fa';

const ProfilePictureContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
`;

const ProfileImageContainer = styled.div`
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
`;

const StyledProfileImage = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #1a1a1a;
`;

const HoverOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(26, 26, 26, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;

    &:hover {
        opacity: 1;
    }
`;

const ImagePreview = styled.div`
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
        ${HoverOverlay} {
            opacity: 1;
        }
    }
`;

const FileUploadLabel = styled.label`
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
`;

const FileInput = styled.input`
    display: none;
`;

const LoadingSpinner = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #1a1a1a;
    animation: spin 1s ease-in-out infinite;

    @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;

const ProfileImage = ({ src, alt, onFileSelect, loading }) => {
    return (
        <ProfilePictureContainer>
            <ImagePreview>
                {src ? (
                    <StyledProfileImage src={src} alt={alt} />
                ) : (
                    <FaUserCircle size={120} color="#1a1a1a" />
                )}
                <HoverOverlay>
                    <FileUploadLabel>
                        {loading ? <LoadingSpinner /> : 'Change Picture'}
                        <FileInput
                            type="file"
                            accept="image/*"
                            onChange={(e) => onFileSelect && onFileSelect(e)}
                            disabled={loading}
                        />
                    </FileUploadLabel>
                </HoverOverlay>
            </ImagePreview>
        </ProfilePictureContainer>
    );
};

export default ProfileImage;
