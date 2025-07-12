import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const ProfilePage = () => {
    // Philippines provinces and cities data
    const philippinesData = {
        'Metro Manila': ['Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'],
        'Cebu': ['Alcantara', 'Alcoy', 'Alegria', 'Aloguinsan', 'Argao', 'Asturias', 'Badian', 'Balamban', 'Bantayan', 'Barili', 'Bogo', 'Boljoon', 'Borbon', 'Carcar', 'Carmen', 'Catmon', 'Cebu City', 'Compostela', 'Consolacion', 'Cordova', 'Daanbantayan', 'Dalaguete', 'Danao', 'Dumanjug', 'Ginatilan', 'Lapu-Lapu', 'Liloan', 'Madridejos', 'Malabuyoc', 'Mandaue', 'Medellin', 'Minglanilla', 'Moalboal', 'Naga', 'Oslob', 'Pilar', 'Pinamungajan', 'Poro', 'Ronda', 'Samboan', 'San Fernando', 'San Francisco', 'San Remigio', 'Santa Fe', 'Santander', 'Sibonga', 'Sogod', 'Tabogon', 'Tabuelan', 'Talisay', 'Toledo', 'Tuburan', 'Tudela'],
        'Davao del Sur': ['Bansalan', 'Davao City', 'Digos', 'Hagonoy', 'Kiblawan', 'Magsaysay', 'Malalag', 'Matanao', 'Padada', 'Santa Cruz', 'Sulop'],
        'Laguna': ['Alaminos', 'Bay', 'Biñan', 'Cabuyao', 'Calamba', 'Calauan', 'Cavinti', 'Famy', 'Kalayaan', 'Liliw', 'Los Baños', 'Luisiana', 'Lumban', 'Mabitac', 'Magdalena', 'Majayjay', 'Nagcarlan', 'Paete', 'Pagsanjan', 'Pakil', 'Pangil', 'Pila', 'Rizal', 'San Pablo', 'San Pedro', 'Santa Cruz', 'Santa Maria', 'Santa Rosa', 'Siniloan', 'Victoria'],
        'Cavite': ['Alfonso', 'Amadeo', 'Bacoor', 'Carmona', 'Cavite City', 'Dasmariñas', 'General Emilio Aguinaldo', 'General Mariano Alvarez', 'General Trias', 'Imus', 'Indang', 'Kawit', 'Magallanes', 'Maragondon', 'Mendez', 'Naic', 'Noveleta', 'Rosario', 'Silang', 'Tagaytay', 'Tanza', 'Ternate', 'Trece Martires'],
        'Bulacan': ['Angat', 'Balagtas', 'Baliuag', 'Bocaue', 'Bulakan', 'Bustos', 'Calumpit', 'Doña Remedios Trinidad', 'Guiguinto', 'Hagonoy', 'Marilao', 'Meycauayan', 'Norzagaray', 'Obando', 'Pandi', 'Paombong', 'Plaridel', 'Pulilan', 'San Ildefonso', 'San Jose del Monte', 'San Miguel', 'San Rafael', 'Santa Maria'],
        'Rizal': ['Angono', 'Antipolo', 'Baras', 'Binangonan', 'Cainta', 'Cardona', 'Jala-Jala', 'Morong', 'Pililla', 'Rodriguez', 'San Mateo', 'Tanay', 'Taytay', 'Teresa']
    };

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        birthday: '',
        province: '',
        city: '',
        address: '',
        postal_code: '',
        phone: ''
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
                    const profileData = await getProfile();                    setProfile({
                        first_name: profileData.first_name || '',
                        last_name: profileData.last_name || '',
                        email: profileData.email || '',
                        gender: profileData.gender || '',
                        birthday: profileData.birthday ? profileData.birthday.split('T')[0] : '',
                        province: profileData.province || '',
                        city: profileData.city || '',
                        address: profileData.address || '',
                        postal_code: profileData.postal_code || '',
                        phone: profileData.phone || ''
                    });
                } catch (error) {
                    console.error('Failed to load profile:', error);
                    setError('Failed to load profile data');
                }
            }
        };

        loadProfile();
    }, [currentUser, getProfile]);    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value,
            // Reset city when province changes
            ...(name === 'province' && { city: '' })
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
                        {profile.first_name?.charAt(0) || ''}{profile.last_name?.charAt(0) || ''}
                    </Avatar>
                    <UserInfo>
                        <UserName>{profile.first_name} {profile.last_name}</UserName>
                        <UserEmail>{profile.email}</UserEmail>
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
                            </FormRow>

                            <FormGroup>
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
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

                            <FormRow>
                                <FormGroup>
                                    <Label>Area</Label>
                                    <Select
                                        name="province"
                                        value={profile.province}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Area</option>
                                        {Object.keys(philippinesData).map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label>City</Label>
                                    <Select
                                        name="city"
                                        value={profile.city}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading || !profile.province}
                                    >
                                        <option value="">Select City</option>
                                        {profile.province && philippinesData[profile.province].map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </Select>
                                </FormGroup>
                            </FormRow>

                            <FormGroup>
                                <Label>Address</Label>
                                <Input
                                    type="text"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                />
                            </FormGroup>

                            <FormRow>
                                <FormGroup>
                                    <Label>Postal Code</Label>
                                    <Input
                                        type="text"
                                        name="postal_code"
                                        value={profile.postal_code}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Phone Number</Label>
                                    <Input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
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
                                <InfoValue>{formatRole(currentUser?.role)}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Area:</InfoLabel>
                                <InfoValue>{profile.province || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>City:</InfoLabel>
                                <InfoValue>{profile.city || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Address:</InfoLabel>
                                <InfoValue>{profile.address || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Postal Code:</InfoLabel>
                                <InfoValue>{profile.postal_code || 'Not provided'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Phone Number:</InfoLabel>
                                <InfoValue>{profile.phone || 'Not provided'}</InfoValue>
                            </InfoRow>
                        </ProfileView>
                    )}
                </ProfileContent>

                <ProfileActions>                    <ActionButton
                        onClick={() => navigate('/change-password')}
                        $variant="secondary"
                    >
                        Change Password
                    </ActionButton>
                    
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

// Modern Black & White Styled Components with Enhanced Design
const Container = styled.div`
    min-height: 100vh;
    background: #ffffff;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ProfileCard = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 56px;
    border: 1px solid #e9ecef;
    width: 100%;
    max-width: 900px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%);
        border-radius: 20px 20px 0 0;
    }
    
    @media (max-width: 768px) {
        padding: 32px 24px;
        margin: 20px;
    }
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 56px;
    padding-bottom: 40px;
    border-bottom: 2px solid #f8f9fa;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 60px;
        height: 2px;
        background: #000000;
    }
    
    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: 24px;
    }
`;

const Avatar = styled.div`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 300;
    margin-right: 40px;
    border: 4px solid #f8f9fa;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }
    
    @media (max-width: 768px) {
        margin-right: 0;
        margin-bottom: 16px;
    }
`;

const UserInfo = styled.div`
    flex: 1;
`;

const UserName = styled.h1`
    margin: 0 0 12px 0;
    color: #000000;
    font-size: 38px;
    font-weight: 200;
    letter-spacing: -1px;
    line-height: 1.1;
    
    @media (max-width: 768px) {
        font-size: 32px;
    }
`;

const UserEmail = styled.p`
    margin: 0 0 16px 0;
    color: #6c757d;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 0.3px;
`;

const UserRole = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: ${props => props.$isAdmin ? 
        'linear-gradient(135deg, #000000 0%, #333333 100%)' : 
        'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
    };
    color: ${props => props.$isAdmin ? '#ffffff' : '#000000'};
    border: 2px solid ${props => props.$isAdmin ? '#000000' : '#e9ecef'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &::before {
        content: '${props => props.$isAdmin ? '★' : '◆'}';
        margin-right: 8px;
        font-size: 10px;
    }
`;

const ProfileContent = styled.div`
    margin-bottom: 40px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
`;

const SectionTitle = styled.h2`
    color: #000000;
    font-size: 32px;
    font-weight: 200;
    margin: 0;
    letter-spacing: -0.8px;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 40px;
        height: 2px;
        background: #000000;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

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
    color: #000000;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
`;

const Input = styled.input`
    padding: 18px 24px;
    border: 2px solid #f8f9fa;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #ffffff;
    color: #000000;
    font-weight: 400;

    &:focus {
        outline: none;
        border-color: #000000;
        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
        transform: translateY(-1px);
    }
    
    &:hover:not(:disabled) {
        border-color: #e9ecef;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
        color: #6c757d;
        border-color: #e9ecef;
    }
`;

const Select = styled.select`
    padding: 18px 24px;
    border: 2px solid #f8f9fa;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #000000;
    font-weight: 400;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #000000;
        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
        transform: translateY(-1px);
    }
    
    &:hover:not(:disabled) {
        border-color: #e9ecef;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
        color: #6c757d;
        border-color: #e9ecef;
    }
`;

const HelpText = styled.small`
    color: #6c757d;
    font-size: 12px;
    margin-top: 6px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 24px;
`;

const ActionButton = styled.button`
    padding: 16px 32px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    &:hover::before {
        left: 100%;
    }

    ${props => {
        switch (props.$variant) {
            case 'secondary':
                return `
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    color: #000000;
                    border: 2px solid #e9ecef;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    
                    &:hover:not(:disabled) {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-color: #000000;
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                    }
                `;
            case 'danger':
                return `
                    background: linear-gradient(135deg, #000000 0%, #333333 100%);
                    color: #ffffff;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    
                    &:hover:not(:disabled) {
                        background: linear-gradient(135deg, #333333 0%, #555555 100%);
                        transform: translateY(-2px);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    }
                `;
            case 'admin':
                return `
                    background: linear-gradient(135deg, #000000 0%, #333333 100%);
                    color: #ffffff;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    position: relative;
                    
                    &::after {
                        content: '★';
                        position: absolute;
                        top: 50%;
                        right: 12px;
                        transform: translateY(-50%);
                        font-size: 12px;
                    }
                    
                    &:hover:not(:disabled) {
                        background: linear-gradient(135deg, #333333 0%, #555555 100%);
                        transform: translateY(-2px);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    }
                `;
            default:
                return `
                    background: linear-gradient(135deg, #000000 0%, #333333 100%);
                    color: #ffffff;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    
                    &:hover:not(:disabled) {
                        background: linear-gradient(135deg, #333333 0%, #555555 100%);
                        transform: translateY(-2px);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                    }
                `;
        }
    }}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

const ProfileView = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const InfoRow = styled.div`
    display: flex;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    align-items: center;
    border: 1px solid #e9ecef;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    position: relative;
    
    &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        border-color: #000000;
    }
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, #000000 0%, #333333 100%);
        border-radius: 12px 0 0 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    &:hover::before {
        opacity: 1;
    }
`;

const InfoLabel = styled.span`
    font-weight: 700;
    color: #000000;
    width: 160px;
    flex-shrink: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    
    &::after {
        content: ':';
        margin-left: 4px;
        color: #6c757d;
    }
`;

const InfoValue = styled.span`
    color: #6c757d;
    flex: 1;
    font-size: 16px;
    font-weight: 400;
    padding-left: 16px;
`;

const ProfileActions = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    border-top: 1px solid #e9ecef;
    padding-top: 32px;
    margin-top: 32px;
`;

const SuccessMessage = styled.div`
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    color: #000000;
    padding: 20px 24px;
    border-radius: 12px;
    margin-bottom: 32px;
    border: 2px solid #000000;
    font-size: 15px;
    font-weight: 500;
    position: relative;
    
    &::before {
        content: '✓';
        position: absolute;
        left: 24px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: bold;
        font-size: 18px;
        color: #000000;
    }
    
    padding-left: 56px;
`;

const ErrorMessage = styled.div`
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    color: #000000;
    padding: 20px 24px;
    border-radius: 12px;
    margin-bottom: 32px;
    border: 2px solid #000000;
    font-size: 15px;
    font-weight: 500;
    position: relative;
    
    &::before {
        content: '⚠';
        position: absolute;
        left: 24px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: bold;
        font-size: 18px;
        color: #000000;
    }
    
    padding-left: 56px;
`;

export default ProfilePage;
