// Test script to check if scheduled delivery dates are properly displayed
const axios = require('axios');

async function testDeliveryDateDisplay() {
    try {
        console.log('🔍 Testing delivery date display...');
        
        // Fetch orders from the delivery-enhanced endpoint
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (!response.data.success) {
            console.error('❌ API call failed:', response.data.message);
            return;
        }
        
        const orders = response.data.data;
        console.log(`✅ Found ${orders.length} orders`);
        
        // Check for orders with scheduled delivery dates
        const scheduledOrders = orders.filter(order => order.scheduled_delivery_date);
        console.log(`📅 Found ${scheduledOrders.length} orders with scheduled delivery dates`);
        
        if (scheduledOrders.length === 0) {
            console.log('⚠️ No orders have scheduled delivery dates set');
            
            // Show some sample orders to see available data
            console.log('\n📋 Sample orders (first 3):');
            orders.slice(0, 3).forEach((order, index) => {
                console.log(`\n${index + 1}. Order ${order.order_number}:`);
                console.log(`   - Customer: ${order.customerName || order.customer_name}`);
                console.log(`   - Type: ${order.order_type}`);
                console.log(`   - Status: ${order.status}`);
                console.log(`   - Delivery Status: ${order.delivery_status || 'None'}`);
                console.log(`   - Scheduled Date: ${order.scheduled_delivery_date || 'None'}`);
                console.log(`   - Scheduled Time: ${order.scheduled_delivery_time || 'None'}`);
            });
        } else {
            console.log('\n📅 Orders with scheduled delivery dates:');
            scheduledOrders.forEach((order, index) => {
                console.log(`\n${index + 1}. Order ${order.order_number}:`);
                console.log(`   - Customer: ${order.customerName || order.customer_name}`);
                console.log(`   - Scheduled Date: ${order.scheduled_delivery_date}`);
                console.log(`   - Scheduled Time: ${order.scheduled_delivery_time || 'No time specified'}`);
                console.log(`   - Delivery Status: ${order.delivery_status}`);
                
                // Test date formatting
                try {
                    const deliveryDate = new Date(order.scheduled_delivery_date);
                    const dateStr = deliveryDate.toLocaleDateString();
                    const timeStr = order.scheduled_delivery_time || '';
                    const displayStr = timeStr ? `${dateStr} at ${timeStr}` : dateStr;
                    console.log(`   - Formatted Display: "${displayStr}"`);
                } catch (error) {
                    console.log(`   - ❌ Date formatting error: ${error.message}`);
                }
            });
        }
        
        console.log('\n✅ Test completed successfully');
        
    } catch (error) {
        console.error('❌ Error testing delivery date display:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the backend server is running on port 5000');
        }
    }
}

// Run the test
testDeliveryDateDisplay();
