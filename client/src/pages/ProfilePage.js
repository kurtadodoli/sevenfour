import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const ProfilePage = () => {    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        birthday: '',
        user_id: '',
        role: '',
        profile_picture_url: ''
    });    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploadingPicture, setUploadingPicture] = useState(false);    const { currentUser, getProfile, updateProfile, uploadProfilePicture, logout, isAdmin } = useAuth();
    const navigate = useNavigate();    const loadProfile = useCallback(async () => {
        if (!currentUser) {
            // If no user is logged in, redirect to login
            navigate('/login', { state: { from: { pathname: '/profile' } } });
            throw new Error('No user logged in');
        }
        
        try {
            // Use getProfile from AuthContext to fetch the latest user data
            const profileData = await getProfile();
            
            // Add safety check for profileData
            if (!profileData) {
                console.error('No profile data received');
                setError('No profile data received');
                throw new Error('No profile data received');
            }
            
            // Update local state with profile data
            setProfile({
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                email: profileData.email || '',
                gender: profileData.gender || '',
                birthday: profileData.birthday ? profileData.birthday.split('T')[0] : '',
                user_id: profileData.id || '',
                role: profileData.role || '',
                profile_picture_url: profileData.profile_picture_url || ''
            });
            
            return profileData;
        } catch (error) {
            console.error('Failed to load profile:', error);
            setError('Failed to load profile data: ' + (error.message || 'Unknown error'));
            throw error;
        }
    }, [currentUser, getProfile, navigate]);// Load profile data on component mount
    useEffect(() => {
        // Set loading state
        setLoading(true);
        
        // Add console logs for debugging
        console.log('ProfilePage: Loading profile data...');
        
        // Add a timeout to ensure loading state is eventually turned off
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.log('ProfilePage: Loading timeout reached, forcing loading state off');
                setLoading(false);
                setError('Loading took too long. Please try refreshing the page.');
            }
        }, 10000); // 10 second timeout
        
        loadProfile()
            .then((profileData) => {
                console.log('ProfilePage: Profile loaded successfully', profileData);
                // Clear any errors on successful load
                setError('');
            })
            .catch((err) => {
                // Handle errors without crashing the component
                console.error('Error in initial profile load:', err);
                setError('Could not load profile. Please try refreshing the page.');
                
                // Provide reasonable fallback data if profile load fails
                if (currentUser) {
                    setProfile(prev => ({
                        ...prev,
                        email: currentUser.email || '',
                        role: currentUser.role || '',
                        user_id: currentUser.id || ''
                    }));
                }
            })
            .finally(() => {
                // Always turn off loading state
                setLoading(false);
                clearTimeout(timeoutId);
            });
            
        return () => clearTimeout(timeoutId); // Clean up timeout on unmount
    }, [loadProfile, currentUser, loading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');        try {
            // Remove email, user_id, and role from update data (they shouldn't be editable)
            const { email, user_id, role, ...updateData } = profile;
            await updateProfile(updateData);
            
            // Reload profile data from database to ensure consistency
            await loadProfile();
            
            setMessage('Profile updated successfully!');
            setEditMode(false);
        } catch (error) {
            console.error('Profile update error:', error);
            setError(error.message || 'Failed to update profile');        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image file size should be less than 5MB');
            return;
        }

        setUploadingPicture(true);
        setError('');
        setMessage('');        try {
            const updatedProfile = await uploadProfilePicture(file);
            
            // Check if updatedProfile exists and has the expected structure
            if (updatedProfile && updatedProfile.profile_picture_url !== undefined) {
                setProfile(prev => ({
                    ...prev,
                    profile_picture_url: updatedProfile.profile_picture_url
                }));
                setMessage('Profile picture updated successfully!');
            } else {
                // Fallback: reload the entire profile
                await loadProfile();
                setMessage('Profile picture updated successfully!');
            }
        } catch (error) {
            console.error('Profile picture upload error:', error);
            setError(error.message || 'Failed to upload profile picture');
        } finally {
            setUploadingPicture(false);
        }
    };const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString();
    };    const formatRole = (role) => {
        return role === 'admin' ? 'Administrator' : 'Customer';
    };

    const formatGender = (gender) => {
        if (!gender) return 'Not provided';
        switch(gender.toUpperCase()) {
            case 'MALE': return 'Male';
            case 'FEMALE': return 'Female';
            case 'OTHER': return 'Other';
            default: return gender;
        }
    };    if (!currentUser) {
        return (
            <Container>
                <ErrorMessage>Please log in to view your profile.</ErrorMessage>
            </Container>
        );
    }

    // Add safety check for profile data
    if (!profile || !profile.first_name) {
        return (
            <Container>
                <ProfileCard>
                    <div>Loading profile...</div>
                </ProfileCard>
            </Container>
        );
    }    // Handle initial loading state
    if (loading && !profile.user_id) {
        return (
            <Container>
                <LoadingOverlay>
                    <LoadingSpinner />
                    <p>Loading profile...</p>
                </LoadingOverlay>
            </Container>
        );
    }
    
    // Handle case when user is not authenticated
    if (!currentUser && !loading) {
        // This will redirect, but we need a fallback UI
        return (
            <Container>
                <ErrorContainer>
                    <h2>Authentication Required</h2>
                    <p>Please log in to view your profile.</p>
                    <ActionButton 
                        as="a" 
                        href="/login" 
                        $variant="primary"
                    >
                        Go to Login
                    </ActionButton>
                </ErrorContainer>
            </Container>
        );
    }

    return (
        <Container>
            <ProfileCard>                <ProfileHeader>
                    <ProfilePictureContainer>                        <Avatar $hasImage={!!(profile?.profile_picture_url)}>
                            {profile?.profile_picture_url ? (
                                <img 
                                    src={`http://localhost:5000${profile.profile_picture_url}`} 
                                    alt="Profile" 
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23888"/><text x="50%" y="50%" font-size="24" text-anchor="middle" dy=".3em" fill="%23fff">' + (profile?.first_name?.charAt(0) || '') + (profile?.last_name?.charAt(0) || '') + '</text></svg>';
                                    }}
                                />
                            ) : (
                                `${profile?.first_name?.charAt(0) || ''}${profile?.last_name?.charAt(0) || ''}`
                            )}
                        </Avatar><UploadOverlay className="upload-overlay">
                            <FileInput
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureUpload}
                                disabled={uploadingPicture}
                                id="profile-picture-upload"
                            />
                            <FileInputLabel htmlFor="profile-picture-upload">
                                {uploadingPicture ? 'Uploading...' : 'Change Picture'}
                            </FileInputLabel>
                        </UploadOverlay>
                    </ProfilePictureContainer>                    <UserInfo>
                        <UserName>{profile?.first_name || ''} {profile?.last_name || ''}</UserName>
                        <UserEmail>{profile?.email || ''}</UserEmail>
                        <UserRole $isAdmin={isAdmin}>{formatRole(currentUser?.role)}</UserRole>
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
                            </FormRow>                            <FormGroup>
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
                                    <Label>User ID</Label>
                                    <Input
                                        type="text"
                                        value={profile.user_id}
                                        disabled
                                        style={{ backgroundColor: '#f5f5f5' }}
                                    />
                                    <HelpText>User ID cannot be changed</HelpText>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Account Type</Label>
                                    <Input
                                        type="text"
                                        value={formatRole(profile.role)}
                                        disabled
                                        style={{ backgroundColor: '#f5f5f5' }}
                                    />
                                    <HelpText>Role cannot be changed</HelpText>
                                </FormGroup>
                            </FormRow>

                            <FormRow>
                                <FormGroup>
                                    <Label>Gender</Label>                                    <Select
                                        name="gender"
                                        value={profile.gender}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
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
                            </InfoRow>                            <InfoRow>
                                <InfoLabel>Email:</InfoLabel>
                                <InfoValue>{profile.email || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>User ID:</InfoLabel>
                                <InfoValue>{profile.user_id || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Gender:</InfoLabel>
                                <InfoValue>{formatGender(profile.gender)}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Birthday:</InfoLabel>
                                <InfoValue>{formatDate(profile.birthday)}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Account Type:</InfoLabel>
                                <InfoValue>{formatRole(profile.role)}</InfoValue>
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
    background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    margin-right: 20px;
    overflow: hidden;
    position: relative;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const ProfilePictureContainer = styled.div`
    position: relative;
    display: inline-block;

    &:hover {
        .upload-overlay {
            opacity: 1;
        }
    }
`;

const UploadOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 20px;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;
`;

const FileInput = styled.input`
    display: none;
`;

const FileInputLabel = styled.label`
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    padding: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.2);
    transition: background 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.3);
    }
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

const LoadingOverlay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 30px;
    text-align: center;
    
    p {
        margin-top: 20px;
        font-size: 16px;
        color: #666;
    }
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #000;
    animation: spin 1s ease-in-out infinite;
    margin: 0 auto;
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    
    h2 {
        color: #333;
        margin-bottom: 16px;
    }
    
    p {
        color: #666;
        margin-bottom: 24px;
    }
    
    a {
        text-decoration: none;
    }
`;

export default ProfilePage;
