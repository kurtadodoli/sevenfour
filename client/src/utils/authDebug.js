/**
 * Debug utilities for the authentication system
 */

// Check and report on the token's existence and expiration
export const debugToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('🔑 No token found in localStorage');
        return null;
    }
    
    try {
        // JWT format is: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('🔑 Token does not appear to be in JWT format');
            return token;
        }
        
        // Decode the payload (middle part)
        const payload = JSON.parse(atob(parts[1]));
        
        // Check expiration
        if (payload.exp) {
            const expiryDate = new Date(payload.exp * 1000);
            const now = new Date();
            const timeRemaining = expiryDate - now;
            
            if (timeRemaining > 0) {
                console.log(`🔑 Token valid. Expires in: ${Math.round(timeRemaining / 1000 / 60)} minutes`);
            } else {
                console.warn(`🔑 TOKEN EXPIRED ${Math.round(Math.abs(timeRemaining) / 1000 / 60)} minutes ago`);
            }
        } else {
            console.log('🔑 Token has no expiration information');
        }
        
        // Log token contents
        console.log('🔑 Token payload:', payload);
        return payload;
    } catch (error) {
        console.error('🔑 Error parsing token:', error);
        return token;
    }
};

// Add this utility to the window for console debugging
if (typeof window !== 'undefined') {
    window.debugAuth = {
        token: debugToken,
        clearToken: () => {
            localStorage.removeItem('token');
            console.log('🔑 Token removed from localStorage');
        }
    };
}

export default { debugToken };
