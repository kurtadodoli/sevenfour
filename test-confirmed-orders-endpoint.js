/**
 * Test Confirmed Orders Endpoint
 */

const axios = require('axios');

async function testConfirmedOrdersEndpoint() {
    try {
        console.log('🧪 Testing Confirmed Orders Endpoint...\n');
        
        // Test without authentication first (to see if endpoint exists)
        try {
            const response = await axios.get('http://localhost:5000/api/orders/confirmed');
            console.log('✅ Endpoint /api/orders/confirmed exists');
            console.log(`   Response status: ${response.status}`);
            
            if (response.data.success) {
                console.log(`   Found ${response.data.data.length} confirmed orders`);
                
                // Look for our specific order
                const specificOrder = response.data.data.find(order => 
                    order.order_number === 'ORD17517233654614104'
                );
                
                if (specificOrder) {
                    console.log(`✅ Order ORD17517233654614104 found in confirmed orders!`);
                    console.log(`   Status: ${specificOrder.status}`);
                    console.log(`   Payment Status: ${specificOrder.payment_status}`);
                    console.log(`   Total: ₱${specificOrder.total_amount}`);
                } else {
                    console.log(`❌ Order ORD17517233654614104 NOT found in confirmed orders response`);
                    console.log('   First 5 orders in response:');
                    response.data.data.slice(0, 5).forEach(order => {
                        console.log(`     - ${order.order_number}: ${order.status} - ₱${order.total_amount}`);
                    });
                }
            }
            
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('⚠️  Endpoint requires authentication (403 Forbidden)');
            } else if (error.response?.status === 404) {
                console.log('❌ Endpoint /api/orders/confirmed not found (404)');
            } else {
                console.log('❌ Error accessing endpoint:', error.message);
            }
        }
        
        // Test with search parameter
        console.log('\n🔍 Testing with search parameter...');
        try {
            const searchResponse = await axios.get('http://localhost:5000/api/orders/confirmed?search=ORD17517233654614104');
            
            if (searchResponse.data.success) {
                console.log(`✅ Search returned ${searchResponse.data.data.length} orders`);
                
                if (searchResponse.data.data.length > 0) {
                    const order = searchResponse.data.data[0];
                    console.log(`   Found: ${order.order_number} - ${order.status} - ₱${order.total_amount}`);
                } else {
                    console.log('❌ Search returned no results for ORD17517233654614104');
                }
            }
        } catch (error) {
            console.log('❌ Search test failed:', error.response?.status || error.message);
        }
        
        // Check delivery orders endpoint too
        console.log('\n🚚 Testing delivery orders endpoint...');
        try {
            const deliveryResponse = await axios.get('http://localhost:5000/api/delivery/orders');
            console.log('✅ Delivery endpoint exists');
            
            if (deliveryResponse.data.success) {
                console.log(`   Found ${deliveryResponse.data.data?.length || 0} delivery orders`);
                
                const deliveryOrder = deliveryResponse.data.data?.find(order => 
                    order.order_number === 'ORD17517233654614104'
                );
                
                if (deliveryOrder) {
                    console.log(`✅ Order ORD17517233654614104 found in delivery orders!`);
                } else {
                    console.log(`❌ Order ORD17517233654614104 NOT found in delivery orders`);
                }
            }
        } catch (error) {
            console.log('❌ Delivery endpoint error:', error.response?.status || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testConfirmedOrdersEndpoint();
