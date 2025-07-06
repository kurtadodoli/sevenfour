// Test script to schedule an order with a courier to test courier display
const axios = require('axios');

async function testScheduleOrderWithCourier() {
    try {
        console.log('🔍 Testing scheduling an order with courier assignment...');
        
        // First, get available orders
        const ordersResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        if (!ordersResponse.data.success) {
            console.error('❌ Failed to fetch orders:', ordersResponse.data.message);
            return;
        }
        
        const orders = ordersResponse.data.data;
        const unscheduledOrders = orders.filter(order => !order.scheduled_delivery_date);
        
        if (unscheduledOrders.length === 0) {
            console.log('⚠️ No unscheduled orders available for testing');
            return;
        }
        
        const testOrder = unscheduledOrders[0];
        console.log(`📦 Selected order for testing: ${testOrder.order_number}`);
        console.log(`   Customer: ${testOrder.customerName || testOrder.customer_name}`);
        
        // Get available couriers
        const couriersResponse = await axios.get('http://localhost:5000/api/couriers');
        const couriers = couriersResponse.data;
        
        if (!couriers || couriers.length === 0) {
            console.log('⚠️ No couriers available for assignment');
            return;
        }
        
        const testCourier = couriers[0];
        console.log(`👤 Selected courier: ${testCourier.name} (${testCourier.phone_number})`);
        
        // Schedule the order with courier
        const scheduleData = {
            order_id: testOrder.id,
            order_number: testOrder.order_number,
            order_type: testOrder.order_type || 'regular',
            customer_name: testOrder.customer_name || testOrder.customerName,
            customer_email: testOrder.customer_email,
            customer_phone: testOrder.customer_phone,
            delivery_date: '2025-07-10', // Tomorrow
            delivery_time_slot: '2:00 PM - 4:00 PM',
            delivery_address: testOrder.shipping_address,
            delivery_city: testOrder.shipping_city,
            delivery_province: testOrder.shipping_province,
            delivery_postal_code: testOrder.shipping_postal_code,
            courier_id: testCourier.id,
            delivery_notes: `Test scheduling with courier assignment - ${new Date().toLocaleString()}`,
            special_instructions: 'Test order - handle with care'
        };
        
        console.log('📅 Scheduling order with courier...');
        const scheduleResponse = await axios.post('http://localhost:5000/api/delivery-enhanced/schedule', scheduleData);
        
        if (scheduleResponse.data.success) {
            console.log('✅ Order scheduled successfully with courier!');
            console.log(`   Order: ${testOrder.order_number}`);
            console.log(`   Delivery Date: 2025-07-10`);
            console.log(`   Time Slot: 2:00 PM - 4:00 PM`);
            console.log(`   Courier: ${testCourier.name} (${testCourier.phone_number})`);
            
            // Fetch the updated order to verify courier assignment
            console.log('\n🔍 Verifying courier assignment...');
            const updatedOrdersResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
            const updatedOrders = updatedOrdersResponse.data.data;
            const updatedOrder = updatedOrders.find(o => o.order_number === testOrder.order_number);
            
            if (updatedOrder) {
                console.log('✅ Updated order details:');
                console.log(`   Order Number: ${updatedOrder.order_number}`);
                console.log(`   Customer: ${updatedOrder.customerName || updatedOrder.customer_name}`);
                console.log(`   Delivery Status: ${updatedOrder.delivery_status}`);
                console.log(`   Scheduled Date: ${updatedOrder.scheduled_delivery_date}`);
                console.log(`   Courier Name: ${updatedOrder.courier_name || 'Not assigned'}`);
                console.log(`   Courier Phone: ${updatedOrder.courier_phone || 'Not assigned'}`);
                
                // Test the UI display format
                if (updatedOrder.courier_name || updatedOrder.courier_phone) {
                    const courierName = updatedOrder.courier_name || 'Unknown';
                    const courierPhone = updatedOrder.courier_phone || '';
                    const displayText = courierPhone ? `${courierName} (${courierPhone})` : courierName;
                    console.log(`   UI Display: "Courier: ${displayText}"`);
                } else {
                    console.log(`   UI Display: No courier line shown`);
                }
            }
            
        } else {
            console.error('❌ Failed to schedule order:', scheduleResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing courier assignment:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

// Run the test
testScheduleOrderWithCourier();
