/**
 * Check if order appears in delivery-enhanced endpoint
 */

const axios = require('axios');

async function checkDeliveryEnhancedEndpoint() {
    try {
        console.log('🚚 Checking Delivery Enhanced Endpoint...\n');
        
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (response.data.success) {
            console.log(`✅ Delivery-enhanced endpoint returned ${response.data.data.length} orders`);
            
            // Look for our specific order
            const specificOrder = response.data.data.find(order => 
                order.order_number === 'ORD17517233654614104'
            );
            
            if (specificOrder) {
                console.log(`✅ Order ORD17517233654614104 FOUND in delivery-enhanced endpoint!`);
                console.log(`   Order Status: ${specificOrder.order_status || specificOrder.status}`);
                console.log(`   Delivery Status: ${specificOrder.delivery_status}`);
                console.log(`   Payment Status: ${specificOrder.payment_status}`);
                console.log(`   Transaction Status: ${specificOrder.transaction_status}`);
                console.log(`   Total: ₱${specificOrder.total_amount}`);
                console.log(`   Order Type: ${specificOrder.order_type || 'regular'}`);
                
                // Check if it meets the frontend filtering criteria
                const isConfirmed = specificOrder.status === 'confirmed' || 
                                  specificOrder.order_status === 'confirmed' ||
                                  specificOrder.status === 'Order Received';
                
                if (isConfirmed) {
                    console.log('✅ Order meets frontend confirmed filter criteria');
                } else {
                    console.log('❌ Order does NOT meet frontend confirmed filter criteria');
                    console.log(`   Needs: status='confirmed' OR order_status='confirmed' OR status='Order Received'`);
                    console.log(`   Has: status='${specificOrder.status}', order_status='${specificOrder.order_status}'`);
                }
                
            } else {
                console.log(`❌ Order ORD17517233654614104 NOT FOUND in delivery-enhanced endpoint`);
                
                // Show first few orders for reference
                console.log('\n📋 First 5 orders in delivery-enhanced response:');
                response.data.data.slice(0, 5).forEach(order => {
                    console.log(`   - ${order.order_number}: ${order.status || order.order_status} - ₱${order.total_amount}`);
                });
                
                // Check if there are any orders with confirmed status
                const confirmedOrders = response.data.data.filter(order => 
                    order.status === 'confirmed' || 
                    order.order_status === 'confirmed' ||
                    order.status === 'Order Received'
                );
                
                console.log(`\n📊 Orders with confirmed status: ${confirmedOrders.length}`);
                if (confirmedOrders.length > 0) {
                    console.log('   Examples:');
                    confirmedOrders.slice(0, 3).forEach(order => {
                        console.log(`   - ${order.order_number}: ${order.status || order.order_status}`);
                    });
                }
            }
            
        } else {
            console.log('❌ Delivery-enhanced endpoint returned error:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Error checking delivery-enhanced endpoint:', error.message);
        
        if (error.response?.status === 404) {
            console.log('ℹ️  Endpoint /api/delivery-enhanced/orders not found');
        } else if (error.response?.status === 401) {
            console.log('ℹ️  Endpoint requires authentication');
        }
    }
}

checkDeliveryEnhancedEndpoint();
