import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import Welcome from '../components/Welcome';

const ProfilePage = () => {
    const { auth, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
        }
    }, [auth.isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!auth.user) return null;

    return (
        <PageContainer>
            <Welcome user={auth.user} />
            <ProfileSection>
                <Header>
                    <Title>My Profile</Title>
                    <LogoutButton onClick={handleLogout}>Sign Out</LogoutButton>
                </Header>

                <InfoContainer>
                    <InfoGroup>
                        <GroupTitle>Personal Information</GroupTitle>
                        <InfoGrid>
                            <InfoItem>
                                <Label>Full Name</Label>
                                <Value>{`${auth.user.first_name} ${auth.user.last_name}`}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Email</Label>
                                <Value>{auth.user.email}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Username</Label>
                                <Value>{auth.user.username}</Value>
                            </InfoItem>
                        </InfoGrid>
                    </InfoGroup>
                </InfoContainer>
            </ProfileSection>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    padding: 2rem;
    background: #f5f5f5;
    min-height: 100vh;
`;

const ProfileSection = styled.div`
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 2rem;
    margin-top: 2rem;
    max-width: 800px;
    margin: 2rem auto;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
    color: #2c3e50;
    margin: 0;
`;

const LogoutButton = styled.button`
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        background: #c0392b;
    }
`;

const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const InfoGroup = styled.div`
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
`;

const GroupTitle = styled.h3`
    color: #34495e;
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.span`
    color: #7f8c8d;
    font-size: 0.9rem;
`;

const Value = styled.span`
    color: #2c3e50;
    font-weight: 500;
`;

export default ProfilePage;