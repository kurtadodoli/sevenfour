import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const AccountPage = () => {
    const { currentUser } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedDetails, setEditedDetails] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        province: '',
        postalCode: ''
    });
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        newsletterSubscription: false,
        darkMode: false
    });

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(response.data.user);
            setEditedDetails(response.data.user);
            // Set address and preferences if they exist in the response
            if (response.data.user.address) setAddress(response.data.user.address);
            if (response.data.user.preferences) setPreferences(response.data.user.preferences);
        } catch (error) {
            setError('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditedDetails(userDetails);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePreferenceChange = (e) => {
        const { name, checked } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/profile', {
                ...editedDetails,
                address,
                preferences
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(editedDetails);
            setIsEditing(false);
        } catch (error) {
            setError('Failed to update profile');
        }
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/change-password', passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setError('Failed to update password');
        }
    };

    if (isLoading) return <LoadingMessage>Loading...</LoadingMessage>;
    if (error) return <ErrorMessage>{error}</ErrorMessage>;

    return (
        <PageContainer>
            <AccountContainer>
                <ProfileHeader>
                    <AvatarSection>
                        {profileImage ? (
                            <AvatarImage src={profileImage} alt="Profile" />
                        ) : (
                            <AvatarCircle>
                                {userDetails?.first_name?.[0]}{userDetails?.last_name?.[0]}
                            </AvatarCircle>
                        )}
                        <UploadButton onClick={() => fileInputRef.current.click()}>
                            Change Photo
                        </UploadButton>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </AvatarSection>
                    <HeaderInfo>
                        <Title>My Profile</Title>
                        <SubTitle>Welcome back, {userDetails?.first_name}!</SubTitle>
                    </HeaderInfo>
                    <EditButton onClick={handleEditToggle}>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </EditButton>
                </ProfileHeader>

                {isEditing ? (
                    <>
                        <Section>
                            <SectionTitle>Edit Personal Information</SectionTitle>
                            <InfoGrid>
                                <InfoItem>
                                    <Label>First Name</Label>
                                    <Input
                                        name="first_name"
                                        value={editedDetails.first_name || ''}
                                        onChange={handleInputChange}
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>Last Name</Label>
                                    <Input
                                        name="last_name"
                                        value={editedDetails.last_name || ''}
                                        onChange={handleInputChange}
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>Email</Label>
                                    <Input
                                        name="email"
                                        value={editedDetails.email || ''}
                                        onChange={handleInputChange}
                                        type="email"
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>Gender</Label>
                                    <Select
                                        name="gender"
                                        value={editedDetails.gender || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </Select>
                                </InfoItem>
                                <InfoItem>
                                    <Label>Birthday</Label>
                                    <Input
                                        name="birthday"
                                        value={editedDetails.birthday || ''}
                                        onChange={handleInputChange}
                                        type="date"
                                    />
                                </InfoItem>
                            </InfoGrid>
                        </Section>

                        <Section>
                            <SectionTitle>Address Information</SectionTitle>
                            <InfoGrid>
                                <InfoItem>
                                    <Label>Street Address</Label>
                                    <Input
                                        name="street"
                                        value={address.street}
                                        onChange={handleAddressChange}
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>City</Label>
                                    <Input
                                        name="city"
                                        value={address.city}
                                        onChange={handleAddressChange}
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>Area</Label>
                                    <Input
                                        name="province"
                                        value={address.province}
                                        onChange={handleAddressChange}
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>Postal Code</Label>
                                    <Input
                                        name="postalCode"
                                        value={address.postalCode}
                                        onChange={handleAddressChange}
                                    />
                                </InfoItem>
                            </InfoGrid>
                        </Section>

                        <Section>
                            <SectionTitle>Account Preferences</SectionTitle>
                            <PreferencesGrid>
                                <PreferenceItem>
                                    <Label>
                                        <Checkbox
                                            type="checkbox"
                                            name="emailNotifications"
                                            checked={preferences.emailNotifications}
                                            onChange={handlePreferenceChange}
                                        />
                                        Email Notifications
                                    </Label>
                                </PreferenceItem>
                                <PreferenceItem>
                                    <Label>
                                        <Checkbox
                                            type="checkbox"
                                            name="newsletterSubscription"
                                            checked={preferences.newsletterSubscription}
                                            onChange={handlePreferenceChange}
                                        />
                                        Newsletter Subscription
                                    </Label>
                                </PreferenceItem>
                                <PreferenceItem>
                                    <Label>
                                        <Checkbox
                                            type="checkbox"
                                            name="darkMode"
                                            checked={preferences.darkMode}
                                            onChange={handlePreferenceChange}
                                        />
                                        Dark Mode
                                    </Label>
                                </PreferenceItem>
                            </PreferencesGrid>
                        </Section>

                        <ButtonContainer>
                            <SaveButton onClick={handleSaveChanges}>Save Changes</SaveButton>
                        </ButtonContainer>
                    </>
                ) : (
                    <>
                        <Section>
                            <SectionTitle>Personal Information</SectionTitle>
                            <InfoGrid>
                                <InfoItem>
                                    <Label>First Name</Label>
                                    <Value>{userDetails?.first_name}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>Last Name</Label>
                                    <Value>{userDetails?.last_name}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>Email</Label>
                                    <Value>{userDetails?.email}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>Gender</Label>
                                    <Value>{userDetails?.gender}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>Birthday</Label>
                                    <Value>
                                        {userDetails?.birthday && 
                                            format(new Date(userDetails.birthday), 'MMMM dd, yyyy')}
                                    </Value>
                                </InfoItem>
                            </InfoGrid>
                        </Section>

                        <Section>
                            <SectionTitle>Address Information</SectionTitle>
                            <InfoGrid>
                                <InfoItem>
                                    <Label>Street Address</Label>
                                    <Value>{address.street || 'Not provided'}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>City</Label>
                                    <Value>{address.city || 'Not provided'}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>Area</Label>
                                    <Value>{address.province || 'Not provided'}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>Postal Code</Label>
                                    <Value>{address.postalCode || 'Not provided'}</Value>
                                </InfoItem>
                            </InfoGrid>
                        </Section>

                        <Section>
                            <SectionTitle>Account Preferences</SectionTitle>
                            <PreferencesGrid>
                                <PreferenceItem>
                                    <Label>Email Notifications</Label>
                                    <Value>{preferences.emailNotifications ? 'Enabled' : 'Disabled'}</Value>
                                </PreferenceItem>
                                <PreferenceItem>
                                    <Label>Newsletter Subscription</Label>
                                    <Value>{preferences.newsletterSubscription ? 'Subscribed' : 'Not Subscribed'}</Value>
                                </PreferenceItem>
                                <PreferenceItem>
                                    <Label>Dark Mode</Label>
                                    <Value>{preferences.darkMode ? 'Enabled' : 'Disabled'}</Value>
                                </PreferenceItem>
                            </PreferencesGrid>
                        </Section>
                    </>
                )}

                <Section>
                    <SectionTitle>
                        Password Settings
                        <PasswordButton onClick={() => setIsChangingPassword(!isChangingPassword)}>
                            {isChangingPassword ? 'Cancel' : 'Change Password'}
                        </PasswordButton>
                    </SectionTitle>
                    {isChangingPassword && (
                        <PasswordForm>
                            <InfoGrid>
                                <InfoItem>
                                    <Label>Current Password</Label>
                                    <Input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </InfoItem>
                                <InfoItem>
                                    <Label>Confirm New Password</Label>
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </InfoItem>
                            </InfoGrid>
                            <ButtonContainer>
                                <SaveButton onClick={handlePasswordUpdate}>Update Password</SaveButton>
                            </ButtonContainer>
                        </PasswordForm>
                    )}
                </Section>

                <Section>
                    <SectionTitle>Account Activity</SectionTitle>
                    <InfoGrid>
                        <InfoItem>
                            <Label>Member Since</Label>
                            <Value>
                                {userDetails?.created_at && 
                                    format(new Date(userDetails.created_at), 'MMMM dd, yyyy')}
                            </Value>
                        </InfoItem>
                        <InfoItem>
                            <Label>Last Login</Label>
                            <Value>
                                {userDetails?.last_login && 
                                    format(new Date(userDetails.last_login), 'MMMM dd, yyyy HH:mm')}
                            </Value>
                        </InfoItem>
                    </InfoGrid>
                </Section>
            </AccountContainer>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
`;

const AccountContainer = styled.div`
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 30px;
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
`;

const AvatarSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
`;

const AvatarCircle = styled.div`
    width: 80px;
    height: 80px;
    background: #1a1a1a;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    margin-right: 20px;
`;

const AvatarImage = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
`;

const HeaderInfo = styled.div`
    flex: 1;
`;

const Title = styled.h1`
    font-size: 24px;
    color: #1a1a1a;
    margin: 0;
`;

const SubTitle = styled.p`
    font-size: 16px;
    color: #666;
    margin: 5px 0 0;
`;

const Section = styled.div`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    color: #1a1a1a;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #eee;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
`;

const InfoItem = styled.div`
    padding: 15px;
    background: #f8f8f8;
    border-radius: 8px;
`;

const Label = styled.div`
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
`;

const Value = styled.div`
    font-size: 16px;
    color: #1a1a1a;
    font-weight: 500;
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #666;
`;

const ErrorMessage = styled.div`
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #dc3545;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
`;

const Select = styled.select`
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
`;

const EditButton = styled.button`
    padding: 8px 16px;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background: #333;
    }
`;

const SaveButton = styled(EditButton)`
    background: #28a745;
    &:hover {
        background: #218838;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
`;

const PasswordButton = styled(EditButton)`
    font-size: 12px;
    padding: 4px 12px;
    margin-left: 10px;
`;

const PasswordForm = styled.div`
    margin-top: 20px;
`;

const UploadButton = styled.button`
    background: none;
    border: none;
    color: #1a1a1a;
    text-decoration: underline;
    cursor: pointer;
    font-size: 12px;

    &:hover {
        color: #666;
    }
`;

const PreferencesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
`;

const PreferenceItem = styled(InfoItem)`
    display: flex;
    align-items: center;
`;

const Checkbox = styled.input`
    margin-right: 8px;
`;

export default AccountPage;