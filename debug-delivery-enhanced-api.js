const axios = require('axios');

async function debugDeliveryEnhancedAPI() {
    try {
        console.log('=== DEBUGGING DELIVERY-ENHANCED API ===\n');
        
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (response.data && response.data.success) {
            const orders = response.data.data;
            
            console.log(`Total orders returned: ${orders.length}`);
            
            // Filter for our specific custom orders
            const customOrders = orders.filter(order => 
                order.order_type === 'custom_order' || order.order_number?.startsWith('CUSTOM-')
            );
            
            console.log(`\nCustom orders found: ${customOrders.length}`);
            
            // Look for our specific verified orders
            const targetOrders = [
                'CUSTOM-MCNQQ7NW-GQEOI', // Jersey ₱1,000
                'CUSTOM-MCNQFDBQ-YQPWJ'  // Shorts ₱850
            ];
            
            targetOrders.forEach(orderId => {
                const order = orders.find(o => 
                    o.order_number === orderId || o.custom_order_id === orderId
                );
                
                if (order) {
                    console.log(`\n✅ Found ${orderId}:`);
                    console.log(`   - Order Type: ${order.order_type}`);
                    console.log(`   - Status: ${order.status}`);
                    console.log(`   - Payment Status: ${order.payment_status}`);
                    console.log(`   - Delivery Status: ${order.delivery_status}`);
                    console.log(`   - Total Amount: ₱${order.total_amount}`);
                    console.log(`   - Payment Verified At: ${order.payment_verified_at}`);
                    console.log(`   - Order Date: ${order.order_date}`);
                } else {
                    console.log(`\n❌ Order ${orderId} NOT FOUND in delivery-enhanced API`);
                }
            });
            
            // Show all custom orders for debugging
            if (customOrders.length > 0) {
                console.log(`\n=== ALL CUSTOM ORDERS IN DELIVERY-ENHANCED API ===`);
                customOrders.forEach((order, index) => {
                    console.log(`${index + 1}. ${order.order_number || order.custom_order_id || 'NO_ID'}`);
                    console.log(`   - Type: ${order.order_type}`);
                    console.log(`   - Status: ${order.status}`);
                    console.log(`   - Payment Status: ${order.payment_status || 'N/A'}`);
                    console.log(`   - Delivery Status: ${order.delivery_status || 'N/A'}`);
                    console.log(`   - Amount: ₱${order.total_amount || 'N/A'}`);
                    console.log('');
                });
            }
            
            // Check what criteria DeliveryPage.js uses for filtering
            console.log('=== DELIVERY PAGE FILTERING ANALYSIS ===');
            const deliveryPageEligible = orders.filter(order => {
                // DeliveryPage.js filters:
                // 1. order_type must be 'regular', 'custom_order', or 'custom_design'
                const validType = ['regular', 'custom_order', 'custom_design'].includes(order.order_type);
                
                // 2. For scheduling, delivery_status should be null, 'pending', or 'delayed'
                const validDeliveryStatus = !order.delivery_status || 
                    order.delivery_status === 'pending' || 
                    order.delivery_status === 'delayed';
                
                return validType && validDeliveryStatus;
            });
            
            console.log(`Orders eligible for DeliveryPage: ${deliveryPageEligible.length}`);
            
            const customOrdersEligible = deliveryPageEligible.filter(order => 
                order.order_type === 'custom_order'
            );
            
            console.log(`Custom orders eligible for delivery scheduling: ${customOrdersEligible.length}`);
            
            if (customOrdersEligible.length > 0) {
                console.log('\nEligible custom orders:');
                customOrdersEligible.forEach(order => {
                    console.log(`- ${order.order_number}: ${order.delivery_status || 'null'} status`);
                });
            }
            
        } else {
            console.log('API returned unsuccessful response or no data');
            console.log('Response:', response.data);
        }
        
    } catch (error) {
        console.error('Error debugging API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

debugDeliveryEnhancedAPI();
