import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  width: 100%;
  padding: 80px 24px 40px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  font-weight: 300;
`;

const MaintenanceCard = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  padding: 3rem 2rem;
  text-align: center;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  
  h3 {
    margin: 1rem 0;
    color: #333;
    font-weight: 400;
    font-size: 1.5rem;
  }
  
  p {
    margin-bottom: 2rem;
    font-weight: 300;
    line-height: 1.6;
  }
`;

const SearchPage = () => {
  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>
            <FontAwesomeIcon icon={faSearch} />
            Search
          </Title>
          <Subtitle>Advanced search functionality</Subtitle>
        </Header>
        
        <MaintenanceCard>
          <h3>Search Under Maintenance</h3>
          <p>
            The search functionality is currently being enhanced to provide better results
            across products, customers, and transactions. Please check back soon for the
            improved search experience.
          </p>
          <p>
            In the meantime, you can navigate to specific sections using the sidebar menu
            to find what you're looking for.
          </p>
        </MaintenanceCard>
      </Container>
    </PageWrapper>
  );
};

export default SearchPage;