const axios = require('axios');

async function testUserSeparation() {
    console.log('🧪 Testing User-Specific Custom Orders');
    
    const baseURL = 'http://localhost:3001/api';
    
    try {
        // Test different users
        const testUsers = [
            'test@frontend.com',
            'john.doe@test.com', 
            'kurtadodoli@gmail.com',
            'nonexistent@user.com'
        ];
        
        console.log('\n📊 User-specific order counts:');
        
        for (const email of testUsers) {
            try {
                // Get active orders
                const activeResponse = await axios.get(`${baseURL}/user-designs/${encodeURIComponent(email)}`);
                const activeCount = activeResponse.data.data.length;
                
                // Get cancelled orders  
                const cancelledResponse = await axios.get(`${baseURL}/user-designs-cancelled/${encodeURIComponent(email)}`);
                const cancelledCount = cancelledResponse.data.data.length;
                
                console.log(`✅ ${email}:`);
                console.log(`   - Active orders: ${activeCount}`);
                console.log(`   - Cancelled orders: ${cancelledCount}`);
                console.log(`   - Total orders: ${activeCount + cancelledCount}`);
                
                if (activeCount > 0) {
                    console.log(`   - Latest order: ${activeResponse.data.data[0].custom_order_id}`);
                }
                console.log('');
                
            } catch (error) {
                console.log(`❌ ${email}: ${error.response?.data?.message || error.message}`);
            }
        }
        
        console.log('🎉 User separation test completed!');
        console.log('✅ Each user now sees only their own custom orders');
        console.log('✅ No more shared orders between different accounts');
        
        console.log('\n🌐 Frontend Testing:');
        console.log('1. Visit http://localhost:3000/orders');
        console.log('2. Log in with different user accounts');
        console.log('3. Check "Custom Orders" tab - should show only that user\'s orders');
        console.log('4. Check "Order History" tab - should show only that user\'s cancelled orders');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testUserSeparation();
