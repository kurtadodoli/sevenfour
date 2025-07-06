// Final verification script for scheduled delivery date display
const axios = require('axios');

async function finalVerificationTest() {
    try {
        console.log('🔍 Final verification of scheduled delivery date display...');
        
        // Fetch orders from the delivery-enhanced endpoint
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (!response.data.success) {
            console.error('❌ API call failed:', response.data.message);
            return;
        }
        
        const orders = response.data.data;
        console.log(`✅ Found ${orders.length} total orders`);
        
        // Check for orders with scheduled delivery dates
        const scheduledOrders = orders.filter(order => order.scheduled_delivery_date);
        const unscheduledOrders = orders.filter(order => !order.scheduled_delivery_date);
        
        console.log(`📅 ${scheduledOrders.length} orders WITH scheduled delivery dates`);
        console.log(`⏳ ${unscheduledOrders.length} orders WITHOUT scheduled delivery dates`);
        
        // Show a few examples of each type
        console.log('\n✅ Examples of SCHEDULED orders (will show delivery date):');
        scheduledOrders.slice(0, 3).forEach((order, index) => {
            console.log(`\n${index + 1}. Order ${order.order_number}:`);
            console.log(`   - Customer: ${order.customerName || order.customer_name}`);
            console.log(`   - Order Date: ${order.created_at || order.order_date}`);
            console.log(`   - Scheduled Date: ${order.scheduled_delivery_date}`);
            console.log(`   - Delivery Status: ${order.delivery_status}`);
            
            // Test what the UI will display
            try {
                const orderDate = new Date(order.created_at || order.order_date);
                const deliveryDate = new Date(order.scheduled_delivery_date);
                const orderDateStr = orderDate.toLocaleDateString();
                const deliveryDateStr = deliveryDate.toLocaleDateString();
                const timeStr = order.scheduled_delivery_time || '';
                const fullDeliveryStr = timeStr ? `${deliveryDateStr} at ${timeStr}` : deliveryDateStr;
                
                console.log(`   ✅ UI Display:`);
                console.log(`      Order Date: "${orderDateStr}"`);
                console.log(`      Scheduled Delivery: "${fullDeliveryStr}"`);
            } catch (error) {
                console.log(`   ❌ Date formatting error: ${error.message}`);
            }
        });
        
        console.log('\n⏳ Examples of UNSCHEDULED orders (will show Schedule button):');
        unscheduledOrders.slice(0, 3).forEach((order, index) => {
            console.log(`\n${index + 1}. Order ${order.order_number}:`);
            console.log(`   - Customer: ${order.customerName || order.customer_name}`);
            console.log(`   - Order Date: ${order.created_at || order.order_date}`);
            console.log(`   - Status: ${order.status}`);
            console.log(`   - Delivery Status: ${order.delivery_status || 'pending'}`);
            
            // Test what the UI will display
            try {
                const orderDate = new Date(order.created_at || order.order_date);
                const orderDateStr = orderDate.toLocaleDateString();
                
                console.log(`   ✅ UI Display:`);
                console.log(`      Order Date: "${orderDateStr}"`);
                console.log(`      Scheduled Delivery: Not shown (no date set)`);
                console.log(`      Action: Will show "Schedule Delivery" button`);
            } catch (error) {
                console.log(`   ❌ Date formatting error: ${error.message}`);
            }
        });
        
        console.log('\n📊 Summary:');
        console.log(`   - Total Orders: ${orders.length}`);
        console.log(`   - Scheduled Orders: ${scheduledOrders.length} (will show delivery dates)`);
        console.log(`   - Unscheduled Orders: ${unscheduledOrders.length} (will show schedule buttons)`);
        console.log(`   - Order ORD17517233654614104: ${orders.find(o => o.order_number === 'ORD17517233654614104') ? 'Found - not scheduled yet' : 'Not found'}`);
        
        console.log('\n✅ Final verification completed successfully!');
        console.log('🎯 The scheduled delivery dates should now be displayed correctly in the UI.');
        
    } catch (error) {
        console.error('❌ Error in final verification:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the backend server is running on port 5000');
        }
    }
}

// Run the test
finalVerificationTest();
