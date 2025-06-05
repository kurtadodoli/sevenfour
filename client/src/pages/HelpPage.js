import React from 'react';
import styled from 'styled-components';

const HelpPage = () => {
    return (
        <Container>
            <Title>Help & Support</Title>
            <Section>
                <h2>Frequently Asked Questions</h2>
                <FAQList>
                    <FAQItem>
                        <Question>How do I place an order?</Question>
                        <Answer>Browse our products, add items to your cart, and proceed to checkout.</Answer>
                    </FAQItem>
                    <FAQItem>
                        <Question>What payment methods do you accept?</Question>
                        <Answer>We accept credit cards, PayPal, and other major payment methods.</Answer>
                    </FAQItem>
                </FAQList>
            </Section>
            <Section>
                <h2>Contact Support</h2>
                <ContactInfo>
                    <p>Email: support@sevenfourclothing.com</p>
                    <p>Phone: 1-800-CLOTHES</p>
                    <p>Hours: Monday-Friday, 9am-5pm EST</p>
                </ContactInfo>
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

const FAQList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FAQItem = styled.div`
    background: #f8f8f8;
    padding: 1.5rem;
    border-radius: 8px;
`;

const Question = styled.h3`
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 0.5rem;
`;

const Answer = styled.p`
    color: #666;
    line-height: 1.5;
`;

const ContactInfo = styled.div`
    background: #f8f8f8;
    padding: 1.5rem;
    border-radius: 8px;
    
    p {
        margin: 0.5rem 0;
        color: #666;
    }
`;

export default HelpPage;