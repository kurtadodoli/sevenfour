import React from 'react';
import styled from 'styled-components';

const AboutPage = () => {
    return (
        <Container>
            <Title>About Seven Four Clothing</Title>
            <Section>
                <h2>Our Story</h2>
                <Content>
                    Seven Four Clothing was founded with a vision to provide high-quality, 
                    sustainable fashion that makes a difference. Our journey began in 2024, 
                    and we continue to grow while maintaining our commitment to quality and sustainability.
                </Content>
            </Section>
            <Section>
                <h2>Our Mission</h2>
                <Content>
                    To create sustainable, stylish clothing while minimizing our environmental impact 
                    and maximizing our positive influence on communities worldwide.
                </Content>
            </Section>
            <Section>
                <h2>Our Values</h2>
                <ValuesList>
                    <Value>
                        <h3>Quality</h3>
                        <p>We never compromise on the quality of our products.</p>
                    </Value>
                    <Value>
                        <h3>Sustainability</h3>
                        <p>Environmental responsibility is at the core of everything we do.</p>
                    </Value>
                    <Value>
                        <h3>Community</h3>
                        <p>We believe in building and supporting strong communities.</p>
                    </Value>
                </ValuesList>
            </Section>
        </Container>
    );
};

const Container = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
`;

const Section = styled.section`
    margin-bottom: 3rem;
    
    h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #444;
    }
`;

const Content = styled.p`
    line-height: 1.6;
    color: #666;
    font-size: 1.1rem;
`;

const ValuesList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
`;

const Value = styled.div`
    background: #f8f8f8;
    padding: 1.5rem;
    border-radius: 8px;
    
    h3 {
        color: #333;
        margin-bottom: 1rem;
    }
    
    p {
        color: #666;
        line-height: 1.5;
    }
`;

export default AboutPage;