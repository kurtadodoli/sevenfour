const axios = require('axios');

async function testCustomPageAPI() {
    console.log('🧪 Testing CustomPage API flow...');
    
    try {
        // Step 1: Login to get token
        console.log('1. Logging in...');        const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token received');
        
        // Step 2: Test the my-orders endpoint
        console.log('2. Fetching custom orders...');
        const ordersResponse = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Orders fetched successfully');
        console.log(`📊 Found ${ordersResponse.data.count} orders`);
        console.log('Response structure:', {
            success: ordersResponse.data.success,
            count: ordersResponse.data.count,
            firstOrderKeys: ordersResponse.data.data[0] ? Object.keys(ordersResponse.data.data[0]) : 'No orders'
        });
        
        // Check each order has images properly formatted
        ordersResponse.data.data.forEach((order, index) => {
            console.log(`Order ${index + 1}: ${order.custom_order_id}`);
            console.log(`  - Product: ${order.product_display_name}`);
            console.log(`  - Status: ${order.status_display}`);
            console.log(`  - Images: ${order.images.length} files`);
            console.log(`  - Days since order: ${order.days_since_order}`);
        });
        
        console.log('\n🎉 SUCCESS: CustomPage API flow working perfectly!');
        console.log('The frontend should now be able to fetch and display all orders.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testCustomPageAPI();
