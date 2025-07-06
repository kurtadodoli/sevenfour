// Test script to check specific order ORD17517233654614104 delivery date
const axios = require('axios');

async function testSpecificOrderDeliveryDate() {
    try {
        console.log('🔍 Testing specific order ORD17517233654614104...');
        
        // Fetch orders from the delivery-enhanced endpoint
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (!response.data.success) {
            console.error('❌ API call failed:', response.data.message);
            return;
        }
        
        const orders = response.data.data;
        console.log(`✅ Found ${orders.length} total orders`);
        
        // Find the specific order
        const targetOrder = orders.find(order => order.order_number === 'ORD17517233654614104');
        
        if (!targetOrder) {
            console.log('❌ Order ORD17517233654614104 not found');
            console.log('Available orders:');
            orders.slice(0, 10).forEach(order => {
                console.log(`  - ${order.order_number} (${order.order_type})`);
            });
            return;
        }
        
        console.log('\n📋 Order ORD17517233654614104 Details:');
        console.log(`   - Customer: ${targetOrder.customerName || targetOrder.customer_name}`);
        console.log(`   - Type: ${targetOrder.order_type}`);
        console.log(`   - Status: ${targetOrder.status}`);
        console.log(`   - Delivery Status: ${targetOrder.delivery_status || 'None'}`);
        console.log(`   - Order Date: ${targetOrder.created_at || targetOrder.order_date}`);
        console.log(`   - Scheduled Date: ${targetOrder.scheduled_delivery_date || 'None'}`);
        console.log(`   - Scheduled Time: ${targetOrder.scheduled_delivery_time || 'None'}`);
        
        // Test date formatting
        console.log('\n📅 Date Formatting Tests:');
        
        // Order Date
        try {
            const orderDate = new Date(targetOrder.created_at || targetOrder.order_date);
            console.log(`   - Order Date Formatted: "${orderDate.toLocaleDateString()}"`);
        } catch (error) {
            console.log(`   - ❌ Order Date formatting error: ${error.message}`);
        }
        
        // Scheduled Delivery Date
        if (targetOrder.scheduled_delivery_date) {
            try {
                const deliveryDate = new Date(targetOrder.scheduled_delivery_date);
                const dateStr = deliveryDate.toLocaleDateString();
                const timeStr = targetOrder.scheduled_delivery_time || '';
                const displayStr = timeStr ? `${dateStr} at ${timeStr}` : dateStr;
                console.log(`   - Scheduled Delivery Formatted: "${displayStr}"`);
            } catch (error) {
                console.log(`   - ❌ Scheduled Date formatting error: ${error.message}`);
            }
        } else {
            console.log(`   - No scheduled delivery date set`);
        }
        
        console.log('\n✅ Test completed successfully');
        
    } catch (error) {
        console.error('❌ Error testing specific order:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the backend server is running on port 5000');
        }
    }
}

// Run the test
testSpecificOrderDeliveryDate();
