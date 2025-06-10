import React from 'react';
import styled from 'styled-components';

const AvatarContainer = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const DefaultAvatar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const UserAvatar = ({ src, alt }) => {
    return (
        <AvatarContainer>
            {src ? <AvatarImage src={src} alt={alt} /> : <DefaultAvatar />}
        </AvatarContainer>
    );
};

export default UserAvatar;
