const axios = require('axios');

async function testDeliveryAPI() {
    try {
        console.log('🧪 Testing delivery API response...\n');
        
        // Test the actual API endpoint
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        console.log('📊 API Response Status:', response.status);
        console.log('📊 API Response Success:', response.data.success);
        console.log('📊 Total Orders Returned:', response.data.data.length);
        
        // Find our test order
        const testOrder = response.data.data.find(order => 
            order.order_number === 'CUSTOM-8H-QMZ5R-2498'
        );
        
        if (testOrder) {
            console.log('\n🎯 Found test order CUSTOM-8H-QMZ5R-2498:');
            console.log('   - Order Type:', testOrder.order_type);
            console.log('   - Status:', testOrder.status);
            console.log('   - Delivery Status:', testOrder.delivery_status);
            console.log('   - Scheduled Delivery Date:', testOrder.scheduled_delivery_date);
            console.log('   - Delivery Schedule ID:', testOrder.delivery_schedule_id);
            console.log('   - Full object:', JSON.stringify(testOrder, null, 2));
        } else {
            console.log('\n❌ Test order CUSTOM-8H-QMZ5R-2498 not found in API response');
            console.log('\n📋 Available orders:');
            response.data.data.forEach(order => {
                console.log(`   - ${order.order_number} (${order.order_type}) - delivery_status: ${order.delivery_status}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {
            console.error('❌ Response status:', error.response.status);
            console.error('❌ Response data:', error.response.data);
        }
    }
}

testDeliveryAPI();
