// Test viewing existing cancellation requests
const axios = require('axios');

async function testViewCancellationRequests() {
    console.log('🧪 Testing View Cancellation Requests...');
    
    try {
        // Step 1: Login to get fresh token
        console.log('\n🔑 Step 1: Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'krutadodoli@gmail.com',
            password: 'NewAdmin123!'
        });
        
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Login successful!');
        console.log('User:', user.username, '(Role:', user.role, ')');
        
        // Step 2: Check existing cancellation requests
        console.log('\n📋 Step 2: Checking existing cancellation requests...');
        const adminResponse = await axios.get(
            'http://localhost:5000/api/custom-orders/cancellation-requests',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Admin cancellation requests fetched successfully!');
        console.log('Raw response:', JSON.stringify(adminResponse.data, null, 2));
        
        // Check if the response has the expected structure
        let requestsArray;
        if (adminResponse.data.data) {
            requestsArray = adminResponse.data.data;
        } else if (Array.isArray(adminResponse.data)) {
            requestsArray = adminResponse.data;
        } else {
            console.log('❌ Unexpected response structure:', typeof adminResponse.data);
            return;
        }
        
        console.log('Total requests:', requestsArray.length);
        
        requestsArray.forEach((req, index) => {
            console.log(`${index + 1}. Request ID: ${req.id}`);
            console.log(`   Custom Order ID: ${req.customOrderId}`);
            console.log(`   Customer: ${req.customerName} (${req.customerEmail})`);
            console.log(`   Status: ${req.status}`);
            console.log(`   Reason: ${req.reason}`);
            console.log(`   Created: ${req.createdAt}`);
            console.log('   ---');
        });
        
        // Step 3: Check custom orders to see if they show pending cancellation
        console.log('\n🔍 Step 3: Checking custom orders status...');
        const customOrdersResponse = await axios.get(
            'http://localhost:5000/api/custom-orders/admin/all',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Custom orders fetched successfully!');
        console.log('Total custom orders:', customOrdersResponse.data.length);
        
        customOrdersResponse.data.forEach((order, index) => {
            console.log(`${index + 1}. Order ID: ${order.customOrderId}`);
            console.log(`   Customer: ${order.customerName}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Has pending cancellation: ${order.hasPendingCancellation}`);
            console.log(`   Product: ${order.productName}`);
            console.log(`   Amount: $${order.finalPrice}`);
            console.log('   ---');
        });
        
        console.log('\n🎉 View cancellation requests test completed!');
        
    } catch (error) {
        console.error('❌ Error in view cancellation requests test:');
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testViewCancellationRequests();
