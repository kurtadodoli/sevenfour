// Test script to check courier data in orders
const axios = require('axios');

async function testCourierData() {
    try {
        console.log('🔍 Testing courier data in orders...');
        
        // Fetch orders from the delivery-enhanced endpoint
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (!response.data.success) {
            console.error('❌ API call failed:', response.data.message);
            return;
        }
        
        const orders = response.data.data;
        console.log(`✅ Found ${orders.length} total orders`);
        
        // Check for orders with courier information
        const ordersWithCouriers = orders.filter(order => order.courier_name || order.courier_phone);
        const ordersWithoutCouriers = orders.filter(order => !order.courier_name && !order.courier_phone);
        
        console.log(`👤 ${ordersWithCouriers.length} orders WITH courier assigned`);
        console.log(`⏳ ${ordersWithoutCouriers.length} orders WITHOUT courier assigned`);
        
        // Show examples of orders with couriers
        if (ordersWithCouriers.length > 0) {
            console.log('\n👤 Examples of orders WITH courier assigned:');
            ordersWithCouriers.slice(0, 5).forEach((order, index) => {
                console.log(`\n${index + 1}. Order ${order.order_number}:`);
                console.log(`   - Customer: ${order.customerName || order.customer_name}`);
                console.log(`   - Delivery Status: ${order.delivery_status || 'pending'}`);
                console.log(`   - Courier Name: ${order.courier_name || 'N/A'}`);
                console.log(`   - Courier Phone: ${order.courier_phone || 'N/A'}`);
                console.log(`   - Scheduled Date: ${order.scheduled_delivery_date || 'Not scheduled'}`);
            });
        }
        
        // Show examples of orders without couriers
        if (ordersWithoutCouriers.length > 0) {
            console.log('\n⏳ Examples of orders WITHOUT courier assigned:');
            ordersWithoutCouriers.slice(0, 5).forEach((order, index) => {
                console.log(`\n${index + 1}. Order ${order.order_number}:`);
                console.log(`   - Customer: ${order.customerName || order.customer_name}`);
                console.log(`   - Delivery Status: ${order.delivery_status || 'pending'}`);
                console.log(`   - Courier Name: ${order.courier_name || 'N/A'}`);
                console.log(`   - Courier Phone: ${order.courier_phone || 'N/A'}`);
                console.log(`   - Scheduled Date: ${order.scheduled_delivery_date || 'Not scheduled'}`);
            });
        }
        
        // Check available courier fields in the data
        console.log('\n🔍 Available courier fields in order data:');
        if (orders.length > 0) {
            const sampleOrder = orders[0];
            const courierFields = Object.keys(sampleOrder).filter(key => 
                key.toLowerCase().includes('courier') || 
                key.toLowerCase().includes('driver') ||
                key.toLowerCase().includes('delivery_person')
            );
            console.log('   Courier-related fields:', courierFields);
        }
        
        console.log('\n📊 Summary:');
        console.log(`   - Total Orders: ${orders.length}`);
        console.log(`   - Orders with Courier: ${ordersWithCouriers.length}`);
        console.log(`   - Orders without Courier: ${ordersWithoutCouriers.length}`);
        
        console.log('\n✅ Courier data test completed!');
        
    } catch (error) {
        console.error('❌ Error testing courier data:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the backend server is running on port 5000');
        }
    }
}

// Run the test
testCourierData();
