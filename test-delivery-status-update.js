const axios = require('axios');

async function testDeliveryStatusUpdate() {
    try {
        console.log('=== TESTING DELIVERY STATUS UPDATE ===\n');
        
        // Get the current custom order
        const ordersResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        const orders = ordersResponse.data.data;
        
        const targetOrder = orders.find(order => 
            order.order_number === 'CUSTOM-MCNQQ7NW-GQEOI'
        );
        
        if (!targetOrder) {
            console.log('❌ Target order not found');
            return;
        }
        
        console.log('📦 CURRENT ORDER STATE:');
        console.log(`   Order: ${targetOrder.order_number}`);
        console.log(`   ID: ${targetOrder.id}`);
        console.log(`   Status: ${targetOrder.status}`);
        console.log(`   Delivery Status: ${targetOrder.delivery_status}`);
        console.log(`   Order Type: ${targetOrder.order_type}`);
        
        // Test the delivery status update API
        console.log('\n🧪 TESTING DELIVERY STATUS API:');
        
        try {
            // Try to update to 'in_transit' status
            const updateResponse = await axios.put(
                `http://localhost:5000/api/delivery-status/orders/${targetOrder.id}/status`,
                {
                    delivery_status: 'in_transit',
                    order_type: targetOrder.order_type || 'custom_order',
                    delivery_notes: 'Test status update via API'
                }
            );
            
            console.log('✅ API Response:', updateResponse.data);
            
            // Verify the update worked
            console.log('\n🔍 VERIFYING UPDATE:');
            const verifyResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
            const updatedOrders = verifyResponse.data.data;
            const updatedOrder = updatedOrders.find(order => 
                order.order_number === 'CUSTOM-MCNQQ7NW-GQEOI'
            );
            
            if (updatedOrder) {
                console.log(`   Updated Delivery Status: ${updatedOrder.delivery_status}`);
                console.log(`   Status Change: ${targetOrder.delivery_status} → ${updatedOrder.delivery_status}`);
                
                if (updatedOrder.delivery_status === 'in_transit') {
                    console.log('✅ Status update SUCCESSFUL!');
                } else {
                    console.log('❌ Status update FAILED - Status not changed');
                }
            }
            
        } catch (apiError) {
            console.log('❌ API Error:', apiError.message);
            if (apiError.response) {
                console.log('   Status:', apiError.response.status);
                console.log('   Response:', apiError.response.data);
            }
            
            // Check if it's an authentication issue
            if (apiError.response?.status === 401) {
                console.log('\n🔒 AUTHENTICATION ISSUE DETECTED!');
                console.log('The API requires authentication but DeliveryPage.js might not be sending auth headers.');
                
                // Test without auth to see what happens
                console.log('\n🧪 Testing without auth requirement...');
                try {
                    // Let's try the unified endpoint
                    const unifiedResponse = await axios.put(
                        `http://localhost:5000/api/delivery-status-unified/orders/${targetOrder.id}/status`,
                        {
                            delivery_status: 'in_transit',
                            order_type: targetOrder.order_type || 'custom_order',
                            delivery_notes: 'Test status update via unified API'
                        }
                    );
                    console.log('✅ Unified API Response:', unifiedResponse.data);
                } catch (unifiedError) {
                    console.log('❌ Unified API also failed:', unifiedError.message);
                }
            }
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testDeliveryStatusUpdate();
