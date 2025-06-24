const axios = require('axios');

async function testPendingOrders() {
    console.log('🧪 TESTING PENDING ORDERS FUNCTIONALITY\n');
    
    try {
        // Step 1: Login to get a valid JWT token
        console.log('1. Logging in as Kurt...');
        const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'password123' // Assuming this is the test password
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed. Please make sure the test user exists with correct credentials.');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token');
        
        // Step 2: Fetch current pending orders
        console.log('\n2. Fetching current pending orders...');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        const ordersResponse = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
            headers
        });
        
        console.log('✅ Pending orders API call successful');
        console.log(`📊 Found ${ordersResponse.data.count} existing orders for this user`);
        
        // Display the orders
        if (ordersResponse.data.data && ordersResponse.data.data.length > 0) {
            console.log('\n📋 Current pending orders:');
            ordersResponse.data.data.forEach((order, index) => {
                console.log(`  ${index + 1}. ${order.custom_order_id} - ${order.product_type} (${order.status})`);
                console.log(`      Created: ${new Date(order.created_at).toLocaleString()}`);
            });
        } else {
            console.log('📭 No pending orders found');
        }
        
        console.log('\n✅ TEST COMPLETED SUCCESSFULLY!');
        console.log('💡 The pending orders functionality is working correctly.');
        console.log('   If orders aren\'t showing up in the frontend, the issue might be:');
        console.log('   - Token not being stored correctly in localStorage');
        console.log('   - Frontend making request before user is properly authenticated');
        console.log('   - Browser cache issues');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testPendingOrders();
