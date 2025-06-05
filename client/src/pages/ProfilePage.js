import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import Welcome from '../components/Welcome';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { auth, logout } = useContext(AuthContext);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
        }
    }, [auth.isAuthenticated, navigate]);

    const handleLogout = async () => {
        await logout();
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
                            <InfoItem>
                                <Label>Gender</Label>
                                <Value>{auth.user.gender}</Value>
                            </InfoItem>
                        </InfoGrid>
                    </InfoGroup>

                    <InfoGroup>
                        <GroupTitle>Location</GroupTitle>
                        <InfoGrid>
                            <InfoItem>
                                <Label>Province</Label>
                                <Value>{auth.user.province_name}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>City</Label>
                                <Value>{auth.user.city_name}</Value>
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
    margin-left: 250px;
    min-height: 100vh;
    background-color: #f5f5f5;
`;

const ProfileSection = styled.div`
    background: white;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const Title = styled.h1`
    font-size: 2rem;
    color: #333;
`;

const LogoutButton = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;

    &:hover {
        background-color: #c82333;
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
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.div`
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
`;

const Value = styled.div`
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
`;

const LoadingWrapper = styled.div`
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #666;
`;

const ErrorWrapper = styled.div`
    text-align: center;
    padding: 2rem;
    color: #dc3545;
    font-size: 1.2rem;
`;

export default ProfilePage;