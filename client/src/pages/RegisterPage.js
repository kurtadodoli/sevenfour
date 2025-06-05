import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
  background-color: #f7f7f7;
`;

const AuthBox = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 40px;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
`;

const Title = styled.h1`
  font-size: 28px;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #222222;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  flex: 1;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const Required = styled.span`
  color: #e74c3c;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  border-color: ${props => props.error ? '#e74c3c' : '#ddd'};

  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  border-color: ${props => props.error ? '#e74c3c' : '#ddd'};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23333' d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-color: white;
  
  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
`;

const RadioInput = styled.input`
  margin-right: 8px;
`;

const CheckboxGroup = styled.div`
  margin-top: 15px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.5;
  
  input {
    margin-right: 8px;
    margin-top: 3px;
  }
  
  a {
    color: #000;
    text-decoration: underline;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
  letter-spacing: 0.5px;
  
  &:hover {
    background-color: #333;
  }
  
  &:disabled {
    background-color: #999;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
`;

const AccountLink = styled(Link)`
  display: inline-block;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 10px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fff0f0;
  color: #e74c3c;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
`;

const PasswordStrengthIndicator = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
`;

const StrengthMeter = styled.div`
  height: 5px;
  flex: 1;
  background-color: ${props => {
    if (props.strength === 'strong') return '#4caf50';
    if (props.strength === 'medium') return '#ff9800';
    if (props.strength === 'weak') return '#f44336';
    return '#e0e0e0';
  }};
  border-radius: 2px;
`;

const StrengthText = styled.span`
  margin-left: 8px;
  font-size: 12px;
  color: ${props => {
    if (props.strength === 'strong') return '#4caf50';
    if (props.strength === 'medium') return '#ff9800';
    if (props.strength === 'weak') return '#f44336';
    return '#757575';
  }};
`;

const ValidationHint = styled.p`
  font-size: 11px;
  color: #757575;
  margin-top: 4px;
  margin-bottom: 0;
`;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        gender: '',
        province: '',
        city: '',
        newsletter: false,
        termsAccepted: false
    });

    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState('');
    const [contextError, setContextError] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/auth/provinces');
                if (response.data) {
                    setProvinces(response.data);
                    setContextError('');
                }
            } catch (error) {
                console.error('Error fetching provinces:', error);
                setContextError('Failed to load provinces. Please try again.');
            }
        };

        fetchProvinces();
    }, []);

    const handleProvinceChange = async (provinceId) => {
        if (!provinceId) {
            setCities([]);
            return;
        }
        
        try {
            const response = await axios.get(`http://localhost:5001/api/auth/cities/${provinceId}`);
            if (response.data) {
                setCities(response.data);
                setContextError('');
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
            setContextError('Failed to load cities. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setContextError('');

        try {
            // Add console log to verify data being sent
            console.log('Submitting registration data:', {
                username: `${formData.firstName.toLowerCase()}_${formData.lastName.toLowerCase()}`,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthday: formData.birthday,
                gender: formData.gender,
                province_id: parseInt(formData.province),
                city_id: parseInt(formData.city),
                newsletter: Boolean(formData.newsletter)
            });

            const response = await axios.post('http://localhost:5001/api/auth/register', {
                username: `${formData.firstName.toLowerCase()}_${formData.lastName.toLowerCase()}`,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthday: formData.birthday,
                gender: formData.gender,
                province_id: parseInt(formData.province),
                city_id: parseInt(formData.city),
                newsletter: Boolean(formData.newsletter)
            });

            if (response.data.success) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration error:', error.response?.data || error);
            setContextError(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const checkPasswordStrength = (password) => {
        if (!password) {
            setPasswordStrength('');
            return;
        }

        let strength = '';
        
        // Has at least 8 characters
        const hasLength = password.length >= 8;
        // Has lowercase letters
        const hasLowercase = /[a-z]/.test(password);
        // Has uppercase letters
        const hasUppercase = /[A-Z]/.test(password);
        // Has numbers
        const hasNumbers = /\d/.test(password);
        // Has special characters
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        const strengthScore = [hasLength, hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length;

        if (strengthScore <= 2) {
            strength = 'weak';
        } else if (strengthScore <= 4) {
            strength = 'medium';
        } else {
            strength = 'strong';
        }

        setPasswordStrength(strength);
        return strength;
    };

    const validateForm = () => {
        const newErrors = {};

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Birthday validation
        if (!formData.birthday) {
            newErrors.birthday = 'Birthday is required';
        }

        // Gender validation
        if (!formData.gender) {
            newErrors.gender = 'Please select your gender';
        }

        // Province validation
        if (!formData.province) {
            newErrors.province = 'Please select your province';
        }

        // City validation
        if (formData.province && !formData.city) {
            newErrors.city = 'Please select your city';
        }

        // Terms validation
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Real-time validation
        if (name === 'password') {
            checkPasswordStrength(value);
        }
        
        // Clear specific field error when user starts typing again
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const getPasswordRequirements = () => {
        const requirements = [];
        
        if (formData.password) {
            // Check each requirement and add hint if not met
            if (formData.password.length < 8) {
                requirements.push('At least 8 characters');
            }
            if (!/[a-z]/.test(formData.password)) {
                requirements.push('At least one lowercase letter');
            }
            if (!/[A-Z]/.test(formData.password)) {
                requirements.push('At least one uppercase letter');
            }
            if (!/\d/.test(formData.password)) {
                requirements.push('At least one number');
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
                requirements.push('At least one special character');
            }
        }
        
        return requirements;
    };

    const passwordRequirements = getPasswordRequirements();

    if (contextError) {
        return (
            <Container>
                <AuthBox>
                    <ErrorMessage>{contextError}</ErrorMessage>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </AuthBox>
            </Container>
        );
    }

    return (
        <Container>
          <AuthBox>
            <Title>BECOME A MEMBER</Title>
            
            {contextError && <ErrorMessage>{contextError}</ErrorMessage>}
            
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>FIRST NAME <Required>*</Required></Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                  />
                  {errors.firstName && <ValidationHint>{errors.firstName}</ValidationHint>}
                </FormGroup>
                
                <FormGroup>
                  <Label>LAST NAME <Required>*</Required></Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                  />
                  {errors.lastName && <ValidationHint>{errors.lastName}</ValidationHint>}
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <Label>EMAIL <Required>*</Required></Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                {errors.email && <ValidationHint>{errors.email}</ValidationHint>}
              </FormGroup>
              
              <FormGroup>
                <Label>PASSWORD <Required>*</Required></Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                {errors.password && <ValidationHint>{errors.password}</ValidationHint>}
                
                {formData.password && (
                  <PasswordStrengthIndicator>
                    <StrengthMeter strength={passwordStrength} />
                    <StrengthText strength={passwordStrength}>
                      {passwordStrength && passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </StrengthText>
                  </PasswordStrengthIndicator>
                )}
                
                {passwordRequirements.length > 0 && (
                  <ValidationHint>
                    Password should include: {passwordRequirements.join(', ')}
                  </ValidationHint>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label>CONFIRM PASSWORD <Required>*</Required></Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
                {errors.confirmPassword && <ValidationHint>{errors.confirmPassword}</ValidationHint>}
              </FormGroup>
              
              <FormGroup>
                <Label>BIRTHDAY <Required>*</Required></Label>
                <Input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  error={errors.birthday}
                />
                {errors.birthday && <ValidationHint>{errors.birthday}</ValidationHint>}
              </FormGroup>
              
              <FormGroup>
                <Label>GENDER <Required>*</Required></Label>
                <RadioGroup>
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={formData.gender === 'MALE'}
                      onChange={handleChange}
                    />
                    MALE
                  </RadioLabel>
                  
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={formData.gender === 'FEMALE'}
                      onChange={handleChange}
                    />
                    FEMALE
                  </RadioLabel>
                  
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name="gender"
                      value="PREFER_NOT_TO_SAY"
                      checked={formData.gender === 'PREFER_NOT_TO_SAY'}
                      onChange={handleChange}
                    />
                    PREFER NOT TO SAY
                  </RadioLabel>
                </RadioGroup>
                {errors.gender && <ValidationHint>{errors.gender}</ValidationHint>}
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <Label>PROVINCE <Required>*</Required></Label>
                  <Select
                    name="province"
                    value={formData.province}
                    onChange={(e) => {
                        handleChange(e);
                        handleProvinceChange(e.target.value);
                    }}
                    error={errors.province}
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                        <option key={province.id} value={province.id}>
                            {province.province_name}
                        </option>
                    ))}
                  </Select>
                  {errors.province && <ValidationHint>{errors.province}</ValidationHint>}
                </FormGroup>
                
                <FormGroup>
                  <Label>CITY <Required>*</Required></Label>
                  <Select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!formData.province}
                    error={errors.city}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                        <option key={city.id} value={city.id}>
                            {city.city_name}
                        </option>
                    ))}
                  </Select>
                  {errors.city && <ValidationHint>{errors.city}</ValidationHint>}
                </FormGroup>
              </FormRow>
              
              <CheckboxGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                  />
                  EMAIL ME WITH NEWS AND OFFERS
                </CheckboxLabel>
              </CheckboxGroup>
              
              <CheckboxGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                  />
                  <span>
                    I HAVE READ AND ACCEPTED THE <Link to="/terms">TERMS & CONDITIONS</Link> AND <Link to="/privacy">PRIVACY POLICY</Link>. 
                    I GIVE MY CONSENT TO SEVEN CLOTHING INCORPORATED AND ITS AFFILIATES TO COLLECT, USE, STORE, OR 
                    SHARE OR PROCESS MY PERSONAL DATA AS STATED IN THE DATA PRIVACY POLICY.
                  </span>
                </CheckboxLabel>
                {errors.termsAccepted && <ValidationHint>{errors.termsAccepted}</ValidationHint>}
              </CheckboxGroup>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form>
            
            <Footer>
              <AccountLink to="/login">
                I ALREADY HAVE AN ACCOUNT
              </AccountLink>
            </Footer>
          </AuthBox>
        </Container>
    );
};

export default RegisterPage;

// Replace escaped characters with proper regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
const phoneRegex = /^[0-9]+$/;
