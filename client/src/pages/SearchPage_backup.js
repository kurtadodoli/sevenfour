// Backup of the original SearchPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faBox, 
  faUsers, 
  faReceipt,
  faSortAlphaDown,
  faSortAlphaUp,
  faEye,
  faEdit,
  faUser,
  faShoppingCart,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  width: 100%;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
  background: #fafafa;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 200;
  color: #000;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  font-weight: 300;
`;

const SearchPage = () => {
  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '1rem' }} />
            Search
          </Title>
          <Subtitle>Search functionality is temporarily disabled</Subtitle>
        </Header>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Search functionality is under maintenance. Please try again later.</p>
        </div>
      </Container>
    </PageWrapper>
  );
};

export default SearchPage;
