import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        birthday: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { currentUser, getProfile, updateProfile, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Load profile data on component mount
    useEffect(() => {
        const loadProfile = async () => {
            if (currentUser) {
                try {
                    const profileData = await getProfile();
                    setProfile({
                        first_name: profileData.first_name || '',
                        last_name: profileData.last_name || '',
                        email: profileData.email || '',
                        gender: profileData.gender || '',
                        birthday: profileData.birthday ? profileData.birthday.split('T')[0] : ''
                    });
                } catch (error) {
                    console.error('Failed to load profile:', error);
                    setError('Failed to load profile data');
                }
            }
        };

        loadProfile();
    }, [currentUser, getProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Remove email from update data (it shouldn't be editable)
            const { email, ...updateData } = profile;
            await updateProfile(updateData);
            setMessage('Profile updated successfully!');
            setEditMode(false);
        } catch (error) {
            console.error('Profile update error:', error);
            setError(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString();
    };

    const formatRole = (role) => {
        return role === 'admin' ? 'Administrator' : 'Customer';
    };

    if (!currentUser) {
        return (
            <Container>
                <ErrorMessage>Please log in to view your profile.</ErrorMessage>
            </Container>
        );
    }

    return (
        <Container>
            <ProfileCard>
                <ProfileHeader>
                    <Avatar>
                        {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                    </Avatar>
                    <UserInfo>
                        <UserName>{profile.first_name} {profile.last_name}</UserName>
                        <UserEmail>{profile.email}</UserEmail>
                        <UserRole $isAdmin={isAdmin}>{formatRole(currentUser.role)}</UserRole>
                    </UserInfo>
                </ProfileHeader>

                {message && <SuccessMessage>{message}</SuccessMessage>}
                {error && <ErrorMessage>{error}</ErrorMessage>}

                <ProfileContent>
                    <SectionHeader>
                        <SectionTitle>Personal Information</SectionTitle>
                        <ActionButton
                            type="button"
                            onClick={() => setEditMode(!editMode)}
                            $variant="secondary"
                        >
                            {editMode ? 'Cancel' : 'Edit Profile'}
                        </ActionButton>
                    </SectionHeader>

                    {editMode ? (
                        <Form onSubmit={handleSubmit}>
                            <FormRow>
                                <FormGroup>
                                    <Label>First Name</Label>
                                    <Input
                                        type="text"
                                        name="first_name"
                                        value={profile.first_name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Last Name</Label>
                                    <Input
                                        type="text"
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </FormGroup>
                            </FormRow>

                            <FormGroup>
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    style={{ backgroundColor: '#f5f5f5' }}
                                />
                                <HelpText>Email address cannot be changed</HelpText>
                            </FormGroup>

                            <FormRow>
                                <FormGroup>
                                    <Label>Gender</Label>
                                    <Select
                                        name="gender"
                                        value={profile.gender}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Birthday</Label>
                                    <Input
                                        type="date"
                                        name="birthday"
                                        value={profile.birthday}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </FormGroup>
                            </FormRow>

                            <ButtonGroup>
                                <ActionButton type="submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Save Changes'}
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    $variant="secondary"
                                    disabled={loading}
                                >
                                    Cancel
                                </ActionButton>
                            </ButtonGroup>
                        </Form>
                    ) : (
                        <ProfileView>
                            <InfoRow>
                                <InfoLabel>First Name:</InfoLabel>
                                <InfoValue>{profile.first_name || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Last Name:</InfoLabel>
                                <InfoValue>{profile.last_name || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Email:</InfoLabel>
                                <InfoValue>{profile.email || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Gender:</InfoLabel>
                                <InfoValue>{profile.gender || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Birthday:</InfoLabel>
                                <InfoValue>{formatDate(profile.birthday)}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Account Type:</InfoLabel>
                                <InfoValue>{formatRole(currentUser.role)}</InfoValue>
                            </InfoRow>
                        </ProfileView>
                    )}
                </ProfileContent>

                <ProfileActions>
                    <ActionButton
                        onClick={() => navigate('/change-password')}
                        $variant="secondary"
                    >
                        Change Password
                    </ActionButton>
                    
                    {isAdmin && (
                        <ActionButton
                            onClick={() => navigate('/admin')}
                            $variant="admin"
                        >
                            Admin Panel
                        </ActionButton>
                    )}
                    
                    <ActionButton
                        onClick={handleLogout}
                        $variant="danger"
                    >
                        Logout
                    </ActionButton>
                </ProfileActions>
            </ProfileCard>
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ProfileCard = styled.div`
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 700px;
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
`;

const Avatar = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    margin-right: 20px;
`;

const UserInfo = styled.div`
    flex: 1;
`;

const UserName = styled.h1`
    margin: 0 0 5px 0;
    color: #333;
    font-size: 28px;
    font-weight: 600;
`;

const UserEmail = styled.p`
    margin: 0 0 5px 0;
    color: #666;
    font-size: 16px;
`;

const UserRole = styled.span`
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: ${props => props.$isAdmin ? '#e3f2fd' : '#f3e5f5'};
    color: ${props => props.$isAdmin ? '#1976d2' : '#7b1fa2'};
`;

const ProfileContent = styled.div`
    margin-bottom: 30px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
    color: #333;
    font-size: 22px;
    font-weight: 600;
    margin: 0;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
    font-size: 14px;
`;

const Input = styled.input`
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
`;

const Select = styled.select`
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
`;

const HelpText = styled.small`
    color: #666;
    font-size: 12px;
    margin-top: 4px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
`;

const ActionButton = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    ${props => {
        switch (props.$variant) {
            case 'secondary':
                return `
                    background: #f8f9fa;
                    color: #333;
                    border: 2px solid #e1e5e9;
                    
                    &:hover:not(:disabled) {
                        background: #e9ecef;
                        border-color: #d1d5db;
                    }
                `;
            case 'danger':
                return `
                    background: #dc3545;
                    color: white;
                    
                    &:hover:not(:disabled) {
                        background: #c82333;
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
                    }
                `;
            case 'admin':
                return `
                    background: #28a745;
                    color: white;
                    
                    &:hover:not(:disabled) {
                        background: #218838;
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
                    }
                `;
            default:
                return `
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    
                    &:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                    }
                `;
        }
    }}

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
`;

const ProfileView = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const InfoRow = styled.div`
    display: flex;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    align-items: center;
`;

const InfoLabel = styled.span`
    font-weight: 600;
    color: #333;
    width: 150px;
    flex-shrink: 0;
`;

const InfoValue = styled.span`
    color: #666;
    flex: 1;
`;

const ProfileActions = styled.div`
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    border-top: 2px solid #f0f0f0;
    padding-top: 20px;
`;

const SuccessMessage = styled.div`
    background: #d4edda;
    color: #155724;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #c3e6cb;
    font-size: 14px;
`;

const ErrorMessage = styled.div`
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #f5c6cb;
    font-size: 14px;
`;

export default ProfilePage;
