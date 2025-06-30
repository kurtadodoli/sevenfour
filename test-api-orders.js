const axios = require('axios');

async function testAPIOrderRetrieval() {
    try {
        console.log('=== TESTING FRONTEND API ORDER RETRIEVAL ===\n');

        // Test the delivery-enhanced/orders endpoint that the frontend uses
        console.log('📡 Calling /api/delivery-enhanced/orders endpoint...');
        
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        console.log(`✅ API Response Status: ${response.status}`);
        console.log(`📊 Response Data Type:`, typeof response.data);
        console.log(`📊 Response Data:`, JSON.stringify(response.data, null, 2));
        
        // Check if data is an array
        let orders = response.data;
        if (!Array.isArray(orders)) {
            if (orders && orders.orders) {
                orders = orders.orders;
            } else if (orders && orders.data) {
                orders = orders.data;
            } else {
                console.log('❌ Response is not an array and has no orders or data property');
                return;
            }
        }
        
        console.log(`📊 Total Orders Found: ${orders.length || 0}`);
        
        // Look for our test custom order
        const testOrder = orders.find(order => 
            (order.order_number && order.order_number.includes('Q5SVA')) ||
            (order.custom_order_id && order.custom_order_id.includes('Q5SVA'))
        );
        
        if (testOrder) {
            console.log(`\n🎯 FOUND TEST ORDER: ${testOrder.order_number || testOrder.custom_order_id}`);
            console.log(`📋 Order Details:`, JSON.stringify({
                id: testOrder.id,
                order_number: testOrder.order_number,
                order_type: testOrder.order_type,
                delivery_status: testOrder.delivery_status,
                customer_name: testOrder.customer_name,
                status: testOrder.status,
                delivery_schedule_id: testOrder.delivery_schedule_id
            }, null, 2));
            
            // Check if this order should show the production start button
            if (testOrder.order_type === 'custom_order' || testOrder.order_type === 'custom') {
                if (testOrder.delivery_status === 'pending' && testOrder.status === 'approved') {
                    console.log(`\n✅ ORDER IS READY FOR PRODUCTION SCHEDULING`);
                    console.log(`  - Should show "Set Production Start" button`);
                } else if (testOrder.delivery_status === 'scheduled') {
                    console.log(`\n✅ ORDER IS SCHEDULED FOR DELIVERY`);
                    console.log(`  - Should show "Delivered" button (functional)`);
                    console.log(`  - Should show "In Transit" button (functional)`);
                    console.log(`  - This is perfect for testing the delivery status update!`);
                } else {
                    console.log(`\n⚠️ ORDER STATUS: ${testOrder.status}, DELIVERY: ${testOrder.delivery_status}`);
                }
            }
        } else {
            console.log(`\n❌ Test order not found in API response`);
            console.log(`Available orders:`, orders.map(o => ({
                id: o.id,
                order_number: o.order_number || o.custom_order_id,
                type: o.order_type,
                delivery_status: o.delivery_status
            })));
        }

    } catch (error) {
        console.error('❌ API Test Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPIOrderRetrieval();
