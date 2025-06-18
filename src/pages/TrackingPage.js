import React from 'react';
import styled from 'styled-components';

const TrackingPage = () => {
    return (
        <Container>
            <Title>Order Tracking</Title>
            
            <SearchSection>
                <SearchInput 
                    type="text" 
                    placeholder="Enter tracking number..."
                />
                <SearchButton>Track Order</SearchButton>
            </SearchSection>

            <TrackingInfo>
                <StatusTimeline>
                    <TimelineItem active>
                        <StatusDot />
                        <StatusContent>
                            <StatusTitle>Order Placed</StatusTitle>
                            <StatusDate>June 5, 2024 - 10:30 AM</StatusDate>
                        </StatusContent>
                    </TimelineItem>
                    <TimelineItem>
                        <StatusDot />
                        <StatusContent>
                            <StatusTitle>Processing</StatusTitle>
                            <StatusDate>Pending</StatusDate>
                        </StatusContent>
                    </TimelineItem>
                    <TimelineItem>
                        <StatusDot />
                        <StatusContent>
                            <StatusTitle>Shipped</StatusTitle>
                            <StatusDate>Pending</StatusDate>
                        </StatusContent>
                    </TimelineItem>
                </StatusTimeline>
            </TrackingInfo>
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

const SearchSection = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
`;

const SearchButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const TrackingInfo = styled.div`
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatusTimeline = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const TimelineItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    opacity: ${props => props.active ? 1 : 0.5};
`;

const StatusDot = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #1a1a1a;
    margin-top: 6px;
`;

const StatusContent = styled.div`
    flex: 1;
`;

const StatusTitle = styled.h3`
    margin: 0;
    color: #333;
`;

const StatusDate = styled.p`
    margin: 0.25rem 0 0;
    color: #666;
    font-size: 0.875rem;
`;

export default TrackingPage;