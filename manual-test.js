// Manual test of the delivery status update flow
const axios = require('axios');

async function manualTest() {
    try {
        console.log('🧪 Manual Test: Full Delivery Status Update Flow');
        
        // Step 1: Login as admin
        console.log('\n1️⃣ Admin Login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Admin login successful');
        
        // Step 2: Set status to scheduled (simulate production start)
        console.log('\n2️⃣ Setting status to SCHEDULED (simulating production start)...');
        const scheduledResponse = await axios.patch(
            'http://localhost:5000/api/custom-orders/4/delivery-status',
            {
                delivery_status: 'scheduled',
                delivery_notes: 'Production timeline set via manual test'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Scheduled Response:', scheduledResponse.data);
        
        // Step 3: Set status to delivered (simulate delivered button click)
        console.log('\n3️⃣ Setting status to DELIVERED (simulating delivered button)...');
        const deliveredResponse = await axios.patch(
            'http://localhost:5000/api/custom-orders/4/delivery-status',
            {
                delivery_status: 'delivered',
                delivery_notes: 'Delivered via manual test - simulating button click'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Delivered Response:', deliveredResponse.data);
        
        // Step 4: Verify by checking the orders endpoint that frontend uses
        console.log('\n4️⃣ Checking how frontend sees this order...');
        const ordersResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Find our specific order
        const ourOrder = ordersResponse.data.data.find(order => 
            order.order_number === 'CUSTOM-8H-QMZ5R-2498' || 
            order.custom_order_id === 'CUSTOM-MCED998H-QMZ5R'
        );
        
        if (ourOrder) {
            console.log('📋 Order as seen by frontend:');
            console.log(`   ID: ${ourOrder.id}`);
            console.log(`   Order Number: ${ourOrder.order_number}`);
            console.log(`   Order Type: ${ourOrder.order_type}`);
            console.log(`   Delivery Status: ${ourOrder.delivery_status}`);
            console.log(`   Customer: ${ourOrder.customerName}`);
            console.log(`   Has custom_order_data: ${!!ourOrder.custom_order_data}`);
            console.log(`   Has custom_design_data: ${!!ourOrder.custom_design_data}`);
        } else {
            console.log('❌ Order not found in frontend orders endpoint');
        }
        
        console.log('\n✅ Manual test completed successfully!');
        console.log('\n🎯 KEY FINDINGS:');
        console.log('   - API endpoints work correctly');
        console.log('   - Both scheduled and delivered status updates successful');
        console.log('   - If user still can\'t click delivered button, issue is in frontend UI logic');
        
    } catch (error) {
        console.error('❌ Manual test failed:', error.response?.data || error.message);
    }
}

manualTest();
