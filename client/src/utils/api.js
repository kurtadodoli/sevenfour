import axios from 'axios';

// API configuration - server is running on port 5000
const API_URL = 'http://localhost:5000';
const API_TIMEOUT = 15000;

// Create axios instance with improved configuration
const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Using token from localStorage for authentication');
        } else {
            console.warn('No authentication token found in localStorage');
        }
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('📤 API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging and error handling
api.interceptors.response.use(
    (response) => {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('🚫 API Error:', error);
        
        // Enhance error object with more useful information
        const enhancedError = {
            message: 'Unknown API error',
            originalError: error
        };
        
        if (error.response) {
            // Server responded with an error status
            enhancedError.status = error.response.status;
            enhancedError.data = error.response.data;
            enhancedError.message = error.response.data?.message || `Error ${error.response.status}`;
        } else if (error.request) {
            // Request was made but no response received
            enhancedError.message = 'No response from server. Check your network connection.';
            enhancedError.request = error.request;
        } else {
            // Something else caused the error
            enhancedError.message = error.message || 'Request setup error';
        }
        
        return Promise.reject(enhancedError);
    }
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
