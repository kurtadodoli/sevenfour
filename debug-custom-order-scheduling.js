const axios = require('axios');

async function debugCustomOrderScheduling() {
    try {
        console.log('=== DEBUGGING CUSTOM ORDER SCHEDULING ===\n');
        
        // Get current orders
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        const orders = response.data.data;
        
        // Find our target custom order
        const targetOrder = orders.find(order => 
            order.order_number === 'CUSTOM-MCNQQ7NW-GQEOI'
        );
        
        if (!targetOrder) {
            console.log('❌ Target order CUSTOM-MCNQQ7NW-GQEOI not found');
            return;
        }
        
        console.log('📦 Current Order State:');
        console.log(`   - Order Number: ${targetOrder.order_number}`);
        console.log(`   - Order ID: ${targetOrder.id}`);
        console.log(`   - Order Type: ${targetOrder.order_type}`);
        console.log(`   - Status: ${targetOrder.status}`);
        console.log(`   - Delivery Status: ${targetOrder.delivery_status || 'null'}`);
        console.log(`   - Scheduled Date: ${targetOrder.scheduled_delivery_date || 'null'}`);
        console.log(`   - Schedule ID: ${targetOrder.delivery_schedule_id || 'null'}`);
        
        // Test the DeliveryPage logic
        const hasDeliveryStatus = targetOrder.delivery_status && 
                                targetOrder.delivery_status !== 'pending' && 
                                targetOrder.delivery_status !== null;
        
        const isScheduled = hasDeliveryStatus;
        
        console.log('\n🔍 DeliveryPage Logic Check:');
        console.log(`   - Has Delivery Status: ${hasDeliveryStatus}`);
        console.log(`   - Is Scheduled: ${isScheduled}`);
        
        if (isScheduled) {
            console.log('   ✅ Should show action buttons (In Transit, Delivered, etc.)');
            
            // Check which buttons should be visible
            const status = targetOrder.delivery_status;
            console.log('\n🎯 Button Visibility:');
            console.log(`   - Delivered Button: ${(status === 'scheduled' || status === 'in_transit') ? '✅ YES' : '❌ NO'}`);
            console.log(`   - In Transit Button: ${status === 'scheduled' ? '✅ YES' : '❌ NO'}`);
            console.log(`   - Delay Button: ${(status === 'scheduled' || status === 'in_transit') ? '✅ YES' : '❌ NO'}`);
            console.log(`   - Cancel Button: ${(status === 'scheduled' || status === 'in_transit') ? '✅ YES' : '❌ NO'}`);
            console.log(`   - Remove Button: ${(status !== 'delivered' && status !== 'cancelled') ? '✅ YES' : '❌ NO'}`);
            
        } else {
            console.log('   ❌ Should show "Schedule Delivery" button only');
        }
        
        // Check all custom orders scheduling status
        console.log('\n📋 All Custom Orders Status:');
        const customOrders = orders.filter(o => o.order_type === 'custom_order');
        
        customOrders.forEach(order => {
            const hasStatus = order.delivery_status && 
                            order.delivery_status !== 'pending' && 
                            order.delivery_status !== null;
            
            console.log(`${order.order_number}:`);
            console.log(`   - Delivery Status: ${order.delivery_status || 'pending'}`);
            console.log(`   - Shows Action Buttons: ${hasStatus ? 'YES' : 'NO'}`);
        });
        
        // Test scheduling API
        console.log('\n🧪 TESTING SCHEDULE API');
        console.log('This would normally schedule the order, but we\'ll just show the payload:');
        
        const scheduleData = {
            order_id: targetOrder.id,
            order_number: targetOrder.order_number,
            order_type: targetOrder.order_type,
            customer_name: targetOrder.customer_name,
            customer_email: targetOrder.customer_email,
            customer_phone: targetOrder.customer_phone,
            delivery_date: '2025-07-07T16:00:00.000Z', // Example date
            delivery_time_slot: null,
            delivery_address: targetOrder.shipping_address,
            delivery_city: targetOrder.shipping_city,
            delivery_province: targetOrder.shipping_province,
            delivery_postal_code: targetOrder.shipping_postal_code,
            delivery_contact_phone: targetOrder.shipping_phone,
            delivery_notes: `Scheduled delivery for order ${targetOrder.order_number}`,
            priority_level: 'normal'
        };
        
        console.log('Schedule API Payload:');
        console.log(JSON.stringify(scheduleData, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

debugCustomOrderScheduling();
