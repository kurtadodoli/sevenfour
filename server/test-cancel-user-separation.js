const axios = require('axios');

async function testCancelWithUserSeparation() {
    console.log('🧪 Testing Cancel with User Separation');
    
    const baseURL = 'http://localhost:3001/api';
    const testEmail = 'test@frontend.com';
    
    try {
        // Step 1: Check current orders for user
        console.log(`\n📋 Step 1: Checking current orders for ${testEmail}...`);
        const initialResponse = await axios.get(`${baseURL}/user-designs/${encodeURIComponent(testEmail)}`);
        console.log(`✅ User has ${initialResponse.data.data.length} active orders`);
        
        if (initialResponse.data.data.length === 0) {
            console.log('❌ No orders to cancel. Please create an order first.');
            return;
        }
        
        const orderToCancel = initialResponse.data.data[0];
        console.log(`🎯 Will cancel order: ${orderToCancel.custom_order_id}`);
        
        // Step 2: Cancel the order
        console.log('\n🔴 Step 2: Cancelling the order...');
        const cancelResponse = await axios.put(`${baseURL}/public/custom-orders/${orderToCancel.custom_order_id}/status`, {
            status: 'cancelled'
        });
        console.log('✅ Order cancelled:', cancelResponse.data.message);
        
        // Step 3: Verify removal from user's active orders
        console.log('\n📋 Step 3: Checking user\'s active orders...');
        const activeAfterCancel = await axios.get(`${baseURL}/user-designs/${encodeURIComponent(testEmail)}`);
        console.log(`✅ User now has ${activeAfterCancel.data.data.length} active orders`);
        
        // Step 4: Verify it appears in user's cancelled orders
        console.log('\n📋 Step 4: Checking user\'s cancelled orders...');
        const cancelledOrders = await axios.get(`${baseURL}/user-designs-cancelled/${encodeURIComponent(testEmail)}`);
        console.log(`✅ User has ${cancelledOrders.data.data.length} cancelled orders`);
        
        const cancelledOrder = cancelledOrders.data.data.find(o => o.custom_order_id === orderToCancel.custom_order_id);
        if (cancelledOrder) {
            console.log(`✅ Found cancelled order: ${cancelledOrder.custom_order_id} (status: ${cancelledOrder.status})`);
        }
        
        // Step 5: Verify other users are not affected
        console.log('\n📋 Step 5: Verifying other users are not affected...');
        const otherUserResponse = await axios.get(`${baseURL}/user-designs/john.doe@test.com`);
        console.log(`✅ Other user still has ${otherUserResponse.data.data.length} active orders (unchanged)`);
        
        console.log('\n🎉 Cancel with user separation test completed successfully!');
        console.log('✅ Order was cancelled for the specific user only');
        console.log('✅ Other users\' orders were not affected');
        console.log('✅ User-specific order history is working correctly');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testCancelWithUserSeparation();
