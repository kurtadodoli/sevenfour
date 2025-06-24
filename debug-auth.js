// Debug script to check user authentication state
// Open this in browser console at localhost:3000

// Check if user is logged in
console.log('=== Authentication Debug ===');

// Check localStorage for token
const token = localStorage.getItem('token');
console.log('Token in localStorage:', token ? 'Present' : 'Missing');

if (token) {
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Try to decode JWT payload (basic decode, no signature verification)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('User ID:', payload.id);
        console.log('User email:', payload.email);
        console.log('User role:', payload.role);
    } catch (e) {
        console.log('Could not decode token:', e);
    }
}

// Check React context (if available)
if (window.React) {
    console.log('React detected');
}

// Make a test API call to verify endpoint
fetch('/api/auth/verify', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    console.log('Auth verify response:', data);
    if (data.success && data.data && data.data.user) {
        console.log('User object from API:', data.data.user);
        console.log('User object keys:', Object.keys(data.data.user));
    }
})
.catch(error => {
    console.log('Auth verify error:', error);
});
