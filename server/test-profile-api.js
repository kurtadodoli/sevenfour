const axios = require('axios');

async function testProfileAPI() {
    try {
        console.log('Testing profile API...');
          // Try to login with existing admin
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'Adminjohnjoshandre@gmail.com',
            password: 'Admin@123'
        });
        
        console.log('Login successful');
        const token = loginRes.data.data.token;
        
        // Get profile
        const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Profile data:', JSON.stringify(profileRes.data, null, 2));
        
        // Check specifically for profile_picture_url
        const user = profileRes.data.data.user;
        console.log('\nSpecific check for profile_picture_url:');
        console.log('Has property:', 'profile_picture_url' in user);
        console.log('Value:', user.profile_picture_url);
        console.log('Type:', typeof user.profile_picture_url);
        
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        
        // If that password doesn't work, try with a different password
        if (err.response?.status === 401) {
            console.log('\nTrying with different password...');
            try {
                const loginRes2 = await axios.post('http://localhost:5000/api/auth/login', {
                    email: 'kurtadodoli@gmail.com',
                    password: 'admin123'
                });
                
                console.log('Login successful with admin123');
                const token2 = loginRes2.data.data.token;
                
                const profileRes2 = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token2}` }
                });
                
                console.log('Profile data:', JSON.stringify(profileRes2.data, null, 2));
                
            } catch (err2) {
                console.error('Second attempt failed:', err2.response?.data || err2.message);
            }
        }
    }
}

testProfileAPI();
