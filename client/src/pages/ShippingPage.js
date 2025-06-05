import React from 'react';
import styled from 'styled-components';

const ShippingPage = () => {
    return (
        <Container>
            <Title>Shipping Information</Title>
            
            <Grid>
                <ShippingCard>
                    <CardTitle>Standard Shipping</CardTitle>
                    <Price>$5.99</Price>
                    <DeliveryTime>5-7 Business Days</DeliveryTime>
                    <Description>
                        Regular shipping option for all domestic orders.
                    </Description>
                </ShippingCard>

                <ShippingCard>
                    <CardTitle>Express Shipping</CardTitle>
                    <Price>$15.99</Price>
                    <DeliveryTime>2-3 Business Days</DeliveryTime>
                    <Description>
                        Faster delivery for urgent orders.
                    </Description>
                </ShippingCard>

                <ShippingCard>
                    <CardTitle>Next Day Delivery</CardTitle>
                    <Price>$25.99</Price>
                    <DeliveryTime>Next Business Day</DeliveryTime>
                    <Description>
                        Guaranteed delivery by next business day.
                    </Description>
                </ShippingCard>
            </Grid>

            <PolicySection>
                <h2>Shipping Policy</h2>
                <PolicyText>
                    We ship to all domestic locations. International shipping available 
                    for select countries. Free shipping on orders over $100.
                </PolicyText>
            </PolicySection>
        </Container>
    );
};

const Container = styled.div`
    padding: 2rem;
`;

const Title = styled.h1`
    color: #333;
    margin-bottom: 2rem;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
`;

const ShippingCard = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
`;

const CardTitle = styled.h2`
    color: #333;
    margin-bottom: 1rem;
`;

const Price = styled.div`
    font-size: 2rem;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
`;

const DeliveryTime = styled.div`
    color: #666;
    margin-bottom: 1rem;
`;

const Description = styled.p`
    color: #666;
    line-height: 1.5;
`;

const PolicySection = styled.section`
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    h2 {
        color: #333;
        margin-bottom: 1rem;
    }
`;

const PolicyText = styled.p`
    color: #666;
    line-height: 1.6;
`;

export default ShippingPage;