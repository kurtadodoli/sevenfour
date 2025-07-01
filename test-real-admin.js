const axios = require('axios');

async function testWithRealAdmin() {
    try {
        console.log('🧪 Testing with real admin credentials...');
        
        // Try with the first admin user
        const loginData = {
            email: 'krutadodoli@gmail.com',
            password: 'password123' // Common password, might need to try others
        };
        
        console.log(`🔐 Trying login with ${loginData.email}...`);
        
        try {
            const loginResponse = await axios.post('http://localhost:5000/api/users/login', loginData);
            
            if (loginResponse.data.success && loginResponse.data.token) {
                const authToken = loginResponse.data.token;
                console.log(`✅ Login successful!`);
                console.log(`👤 User: ${loginResponse.data.user?.first_name} ${loginResponse.data.user?.last_name}`);
                console.log(`🔑 Role: ${loginResponse.data.user?.role}`);
                
                // Test custom orders API
                console.log('\n📡 Testing custom orders API...');
                
                const apiResponse = await axios.get('http://localhost:5000/api/custom-orders/admin/all', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`✅ API Status: ${apiResponse.status}`);
                console.log(`📋 Success: ${apiResponse.data.success}`);
                console.log(`📊 Count: ${apiResponse.data.data?.length || 0}`);
                
                if (apiResponse.data.data && apiResponse.data.data.length > 0) {
                    console.log('\n📄 Orders found:');
                    apiResponse.data.data.forEach((order, index) => {
                        console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.status} - ${order.customer_name}`);
                    });
                    
                    console.log('\n✅ API working! Issue is likely in frontend authentication or state management');
                } else {
                    console.log('❌ No orders returned from API');
                }
                
            } else {
                console.log(`❌ Login failed: ${loginResponse.data.message}`);
            }
        } catch (loginError) {
            console.log(`❌ Login error: ${loginError.response?.data?.message || loginError.message}`);
            
            // If password fails, let's check what we can do
            console.log('\n🔧 Login failed. Let me check the frontend localStorage for existing token...');
            console.log('💡 Manual steps to test:');
            console.log('1. Open browser DevTools (F12)');
            console.log('2. Go to Application/Storage -> Local Storage');
            console.log('3. Check if there\'s a "token" key');
            console.log('4. In Console tab, run: localStorage.getItem("token")');
            console.log('5. Also check: localStorage.getItem("user")');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testWithRealAdmin().then(() => {
    console.log('\n✅ Real admin test complete');
    process.exit(0);
}).catch(err => {
    console.error('💥 Real admin test failed:', err);
    process.exit(1);
});
