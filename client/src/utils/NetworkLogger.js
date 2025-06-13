// NetworkLogger.js - A utility to log network requests and responses
import axios from 'axios';

// Save the original axios methods
const originalGet = axios.get;
const originalPost = axios.post;
const originalPut = axios.put;
const originalDelete = axios.delete;

// Add logging to axios methods
export const setupNetworkLogger = () => {
  // Intercept axios requests
  axios.interceptors.request.use(
    (config) => {
      console.group(`📤 REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.groupEnd();
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Intercept axios responses
  axios.interceptors.response.use(
    (response) => {
      console.group(`📥 RESPONSE: ${response.status} ${response.config.url}`);
      console.log('Data:', response.data);
      console.log('Headers:', response.headers);
      console.groupEnd();
      return response;
    },
    (error) => {
      console.group(`🚫 ERROR: ${error.config?.url || 'Unknown URL'}`);
      console.log('Error Object:', error);
      
      if (error.response) {
        // The server responded with a status code outside of 2xx
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        console.log('Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log('No response received. Request:', error.request);
      } else {
        // Something happened in setting up the request
        console.log('Error Message:', error.message);
      }
      
      console.groupEnd();
      return Promise.reject(error);
    }
  );
};

export default setupNetworkLogger;
