// Test script to debug frontend login issue
async function testFrontendLogin() {
    const API_BASE_URL = 'http://localhost:5000';
    
    console.log('Testing frontend login...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'kurtadodoli@gmail.com',
                password: 'Admin123!@#'
            })
        });
        
        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (data.success) {
            console.log('✅ Login successful!');
            console.log('User:', data.data.user);
            console.log('Token:', data.data.token);
        } else {
            console.log('❌ Login failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

testFrontendLogin();
