import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProfileImage from '../components/ProfileImage';
import {
    Container,
    Section,
    Form,
    FormGroup,
    Label,
    Input,
    Select,
    Button,
    FormRow,
    TabContainer,
    TabButton,
    SuccessMessage,
    ErrorMessage,
    ProfileTitle,
    ProfileSubtitle,
    ValidationError
} from '../components/StyledComponents';

// PersonalInfoForm component
const PersonalInfoForm = ({ profile, handleInputChange, handleSubmit, loading, errors }) => (
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
                    $error={errors.first_name}
                />
                {errors.first_name && <ValidationError>{errors.first_name}</ValidationError>}
            </FormGroup>
            <FormGroup>
                <Label>Last Name</Label>
                <Input
                    type="text"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleInputChange}
                    required
                    $error={errors.last_name}
                />
                {errors.last_name && <ValidationError>{errors.last_name}</ValidationError>}
            </FormGroup>
        </FormRow>

        <FormRow>
            <FormGroup style={{ flex: 1 }}>
                <Label>Email</Label>
                <Input
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    style={{ backgroundColor: '#f5f5f5' }}
                />
                <ValidationError style={{ color: '#666' }}>Email cannot be changed</ValidationError>
            </FormGroup>
            <FormGroup>
                <Label>Gender</Label>
                <Select
                    name="gender"
                    value={profile.gender || ''}
                    onChange={handleInputChange}
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                </Select>
            </FormGroup>
        </FormRow>

        <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Info'}
        </Button>
    </Form>
);

const ProfilePage = () => {
    const { auth, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    // Form state
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        street_address: '',
        apartment_suite: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        profile_picture_url: ''
    });

    // Validation rules
    const VALIDATION_RULES = {
        name: {
            pattern: /^[\p{L}\s'-]{2,30}$/u, // Allows letters, spaces, hyphens, and apostrophes from any language
            message: 'Must be 2-30 characters long and contain only letters, spaces, hyphens, or apostrophes'
        },
        postal: {
            pattern: /^[\w\s-]{3,10}$/, // More permissive postal code format
            message: 'Please enter a valid postal code (3-10 characters)'
        }
    };

    // Validation functions
    const validatePersonalInfo = () => {
        const newErrors = {};
        
        if (!profile.first_name?.trim()) {
            newErrors.first_name = 'First name is required';
        } else if (!VALIDATION_RULES.name.pattern.test(profile.first_name.trim())) {
            newErrors.first_name = VALIDATION_RULES.name.message;
        }
        
        if (!profile.last_name?.trim()) {
            newErrors.last_name = 'Last name is required';
        } else if (!VALIDATION_RULES.name.pattern.test(profile.last_name.trim())) {
            newErrors.last_name = VALIDATION_RULES.name.message;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateAddress = () => {
        const newErrors = {};

        if (!profile.street_address?.trim()) {
            newErrors.street_address = 'Street address is required';
        }

        if (!profile.city?.trim()) {
            newErrors.city = 'City is required';
        }

        if (!profile.state_province?.trim()) {
            newErrors.state_province = 'State/Province is required';
        }

        if (profile.postal_code && !VALIDATION_RULES.postal.pattern.test(profile.postal_code)) {
            newErrors.postal_code = VALIDATION_RULES.postal.message;
        }

        if (!profile.country?.trim()) {
            newErrors.country = 'Country is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle file selection for profile picture
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Image size should be less than 5MB');
            return;
        }

        // Preview the image
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload the image
        try {
            setUploadLoading(true);
            setError('');
            const formData = new FormData();
            formData.append('profile_picture', file);

            const response = await api.post('/api/users/profile/picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data?.success) {
                const newUrl = response.data.data?.url || response.data.data?.profile_picture_url;
                if (newUrl) {
                    setProfile(prev => ({
                        ...prev,
                        profile_picture_url: newUrl
                    }));
                    updateUser({ profile_picture_url: newUrl });
                    setSuccess('Profile picture updated successfully');
                    setImagePreview(null);
                } else {
                    throw new Error('No image URL in response');
                }
            } else {
                throw new Error(response.data?.message || 'Failed to upload image');
            }
        } catch (err) {
            setError('Failed to upload profile picture: ' + (err.response?.data?.message || err.message));
            console.error('Upload error:', err);
        } finally {
            setUploadLoading(false);
        }
    };

    // Handle form updates
    const handlePersonalInfoUpdate = async (e) => {
        e.preventDefault();
        if (!validatePersonalInfo()) return;

        try {
            setLoading(true);
            setError('');
            
            const updatedData = {
                first_name: profile.first_name.trim(),
                last_name: profile.last_name.trim(),
                gender: profile.gender || '',
                profile_picture_url: profile.profile_picture_url,
                street_address: profile.street_address,
                apartment_suite: profile.apartment_suite,
                city: profile.city,
                state_province: profile.state_province,
                postal_code: profile.postal_code,
                country: profile.country
            };

            const response = await api.put('/api/users/profile', updatedData);

            if (response.data?.success) {
                const updatedProfile = response.data.data;
                setProfile(prev => ({
                    ...prev,
                    ...updatedProfile
                }));
                updateUser({
                    first_name: updatedProfile.first_name,
                    last_name: updatedProfile.last_name,
                    gender: updatedProfile.gender,
                    profile_picture_url: updatedProfile.profile_picture_url
                });
                setSuccess('Personal information updated successfully');
                setErrors({});
            } else {
                throw new Error(response.data?.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAddressUpdate = async (e) => {
        e.preventDefault();
        if (!validateAddress()) return;

        try {
            setLoading(true);
            const response = await api.put('/api/users/profile', {
                street_address: profile.street_address,
                apartment_suite: profile.apartment_suite,
                city: profile.city,
                state_province: profile.state_province,
                postal_code: profile.postal_code,
                country: profile.country
            });

            if (response.data.success) {
                const updatedProfile = response.data.data;
                setProfile(prev => ({
                    ...prev,
                    ...updatedProfile
                }));
                setSuccess('Address updated successfully');
            } else {
                setError('Failed to update address: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            setError('Failed to update address. ' + (err.response?.data?.message || 'Network error occurred'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for the field being edited
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Fetch profile data on component mount
    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await api.get('/api/users/profile');
                
                if (response.data?.success) {
                    const profileData = response.data.data;
                    setProfile(prev => ({
                        ...prev,
                        first_name: profileData.first_name || auth.user?.first_name || '',
                        last_name: profileData.last_name || auth.user?.last_name || '',
                        email: profileData.email || auth.user?.email || '',
                        gender: profileData.gender || '',
                        street_address: profileData.street_address || '',
                        apartment_suite: profileData.apartment_suite || '',
                        city: profileData.city || '',
                        state_province: profileData.state_province || '',
                        postal_code: profileData.postal_code || '',
                        country: profileData.country || '',
                        profile_picture_url: profileData.profile_picture_url || auth.user?.profile_picture_url || ''
                    }));
                } else {
                    setProfile(prev => ({
                        ...prev,
                        first_name: auth.user?.first_name || '',
                        last_name: auth.user?.last_name || '',
                        email: auth.user?.email || '',
                        gender: auth.user?.gender || '',
                        profile_picture_url: auth.user?.profile_picture_url || ''
                    }));
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError('Failed to load profile data. ' + (err.response?.data?.message || 'Network error occurred'));
                
                setProfile(prev => ({
                    ...prev,
                    first_name: auth.user?.first_name || '',
                    last_name: auth.user?.last_name || '',
                    email: auth.user?.email || '',
                    gender: auth.user?.gender || '',
                    profile_picture_url: auth.user?.profile_picture_url || ''
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [auth.isAuthenticated, auth.user, navigate]);

    // Auto-dismiss success messages
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    if (loading && !profile.email) {
        return (
            <Container>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    Loading...
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <ProfileTitle>My Profile</ProfileTitle>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <TabContainer>
                <TabButton 
                    active={activeTab === 'personal'} 
                    onClick={() => {
                        setActiveTab('personal');
                        setErrors({});
                        setError('');
                        setSuccess('');
                    }}
                >
                    Personal Info
                </TabButton>
                <TabButton 
                    active={activeTab === 'address'} 
                    onClick={() => {
                        setActiveTab('address');
                        setErrors({});
                        setError('');
                        setSuccess('');
                    }}
                >
                    Address
                </TabButton>
            </TabContainer>

            {activeTab === 'personal' && (
                <Section>
                    <div style={{ marginBottom: '3rem' }}>
                        <ProfileSubtitle>Profile Picture</ProfileSubtitle>
                        <ProfileImage 
                            src={imagePreview || profile.profile_picture_url}
                            alt="Profile"
                            onFileSelect={handleFileSelect}
                            loading={uploadLoading}
                        />
                    </div>
                    
                    <PersonalInfoForm
                        profile={profile}
                        handleInputChange={handleInputChange}
                        handleSubmit={handlePersonalInfoUpdate}
                        loading={loading}
                        errors={errors}
                    />
                </Section>
            )}

            {activeTab === 'address' && (
                <Section>
                    <ProfileSubtitle>Address Information</ProfileSubtitle>
                    <Form onSubmit={handleAddressUpdate}>
                        <FormGroup>
                            <Label>Street Address</Label>
                            <Input
                                type="text"
                                name="street_address"
                                value={profile.street_address}
                                onChange={handleInputChange}
                                required
                                $error={errors.street_address}
                            />
                            {errors.street_address && <ValidationError>{errors.street_address}</ValidationError>}
                        </FormGroup>
                        <FormGroup>
                            <Label>Apartment/Suite (optional)</Label>
                            <Input
                                type="text"
                                name="apartment_suite"
                                value={profile.apartment_suite}
                                onChange={handleInputChange}
                            />
                        </FormGroup>
                        <FormRow>
                            <FormGroup>
                                <Label>City</Label>
                                <Input
                                    type="text"
                                    name="city"
                                    value={profile.city}
                                    onChange={handleInputChange}
                                    required
                                    $error={errors.city}
                                />
                                {errors.city && <ValidationError>{errors.city}</ValidationError>}
                            </FormGroup>
                            <FormGroup>
                                <Label>State/Province</Label>
                                <Input
                                    type="text"
                                    name="state_province"
                                    value={profile.state_province}
                                    onChange={handleInputChange}
                                    required
                                    $error={errors.state_province}
                                />
                                {errors.state_province && <ValidationError>{errors.state_province}</ValidationError>}
                            </FormGroup>
                        </FormRow>
                        <FormRow>
                            <FormGroup>
                                <Label>Postal Code</Label>
                                <Input
                                    type="text"
                                    name="postal_code"
                                    value={profile.postal_code}
                                    onChange={handleInputChange}
                                    required
                                    $error={errors.postal_code}
                                />
                                {errors.postal_code && <ValidationError>{errors.postal_code}</ValidationError>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Country</Label>
                                <Input
                                    type="text"
                                    name="country"
                                    value={profile.country}
                                    onChange={handleInputChange}
                                    required
                                    $error={errors.country}
                                />
                                {errors.country && <ValidationError>{errors.country}</ValidationError>}
                            </FormGroup>
                        </FormRow>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Address'}
                        </Button>
                    </Form>
                </Section>
            )}
        </Container>
    );
};

export default ProfilePage;
