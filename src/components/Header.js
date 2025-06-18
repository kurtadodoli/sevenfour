// src/components/Header.js
import React from 'react';
import styled from 'styled-components';

const Header = () => {
    return (
        <HeaderContainer>
        </HeaderContainer>
    );
};

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
`;

export default Header;