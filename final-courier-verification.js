// Final verification script for courier display
const axios = require('axios');

async function finalCourierVerification() {
    try {
        console.log('🔍 Final verification of courier display...');
        
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
            console.log('\n👤 Orders WITH courier assigned (will show courier info):');
            ordersWithCouriers.forEach((order, index) => {
                console.log(`\n${index + 1}. Order ${order.order_number}:`);
                console.log(`   - Customer: ${order.customerName || order.customer_name}`);
                console.log(`   - Delivery Status: ${order.delivery_status || 'pending'}`);
                
                // Test Order Date formatting
                try {
                    const orderDate = new Date(order.created_at || order.order_date);
                    console.log(`   - Order Date: ${orderDate.toLocaleDateString()}`);
                } catch (error) {
                    console.log(`   - Order Date: Date unavailable`);
                }
                
                // Test Scheduled Delivery formatting
                if (order.scheduled_delivery_date) {
                    try {
                        const deliveryDate = new Date(order.scheduled_delivery_date);
                        const dateStr = deliveryDate.toLocaleDateString();
                        const timeStr = order.scheduled_delivery_time || '';
                        const fullDeliveryStr = timeStr ? `${dateStr} at ${timeStr}` : dateStr;
                        console.log(`   - Scheduled Delivery: ${fullDeliveryStr}`);
                    } catch (error) {
                        console.log(`   - Scheduled Delivery: Date formatting error`);
                    }
                } else {
                    console.log(`   - Scheduled Delivery: Not scheduled`);
                }
                
                // Test Courier formatting
                const courierName = order.courier_name || 'Unknown';
                const courierPhone = order.courier_phone || '';
                const courierDisplay = courierPhone ? `${courierName} (${courierPhone})` : courierName;
                console.log(`   - Courier: ${courierDisplay}`);
                
                console.log(`   ✅ UI Will Display:`);
                console.log(`      "Customer: ${order.customerName || order.customer_name}"`);
                try {
                    const orderDate = new Date(order.created_at || order.order_date);
                    console.log(`      "Order Date: ${orderDate.toLocaleDateString()}"`);
                } catch (error) {
                    console.log(`      "Order Date: Date unavailable"`);
                }
                if (order.scheduled_delivery_date) {
                    try {
                        const deliveryDate = new Date(order.scheduled_delivery_date);
                        const dateStr = deliveryDate.toLocaleDateString();
                        const timeStr = order.scheduled_delivery_time || '';
                        const fullDeliveryStr = timeStr ? `${dateStr} at ${timeStr}` : dateStr;
                        console.log(`      "Scheduled Delivery: ${fullDeliveryStr}"`);
                    } catch (error) {
                        console.log(`      "Scheduled Delivery: Date formatting error"`);
                    }
                }
                console.log(`      "Courier: ${courierDisplay}"`);
            });
        }
        
        // Show a few examples of orders without couriers
        if (ordersWithoutCouriers.length > 0) {
            console.log(`\n⏳ Sample orders WITHOUT courier (will not show courier line):`);
            ordersWithoutCouriers.slice(0, 3).forEach((order, index) => {
                console.log(`\n${index + 1}. Order ${order.order_number}:`);
                console.log(`   - Customer: ${order.customerName || order.customer_name}`);
                console.log(`   - Delivery Status: ${order.delivery_status || 'pending'}`);
                console.log(`   - Courier: Not assigned`);
                console.log(`   ✅ UI Will Display: No courier line shown`);
            });
        }
        
        console.log('\n📊 Summary:');
        console.log(`   - Total Orders: ${orders.length}`);
        console.log(`   - Orders with Courier: ${ordersWithCouriers.length} (will show courier info)`);
        console.log(`   - Orders without Courier: ${ordersWithoutCouriers.length} (no courier line)`);
        console.log(`   - Target Order ORD17517233654614104: ${ordersWithCouriers.find(o => o.order_number === 'ORD17517233654614104') ? '✅ Has courier assigned' : '❌ No courier'}`);
        
        console.log('\n✅ Final courier verification completed!');
        console.log('🎯 Courier information should now be displayed correctly in the UI.');
        
    } catch (error) {
        console.error('❌ Error in final courier verification:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the backend server is running on port 5000');
        }
    }
}

// Run the test
finalCourierVerification();
