const axios = require('axios');

async function testFrontendAPI() {
    try {
        console.log('=== TESTING FRONTEND API ENDPOINTS ===\n');

        // Test the delivery-enhanced/orders endpoint that the frontend uses
        console.log('📡 Testing GET /delivery-enhanced/orders...');
        const ordersResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (ordersResponse.data && ordersResponse.data.success) {
            console.log(`✅ API call successful`);
            console.log(`📦 Found ${ordersResponse.data.data.orders.length} total orders`);
            
            // Check for regular orders with scheduling data
            const regularOrders = ordersResponse.data.data.orders.filter(order => order.order_type === 'regular');
            console.log(`🛍️ Found ${regularOrders.length} regular orders`);
            
            // Show details of first few regular orders
            regularOrders.slice(0, 3).forEach((order, index) => {
                console.log(`\n📋 Regular Order ${index + 1}:`);
                console.log(`   - ID: ${order.id}`);
                console.log(`   - Number: ${order.order_number}`);
                console.log(`   - Customer: ${order.customerName}`);
                console.log(`   - Order Type: ${order.order_type}`);
                console.log(`   - Delivery Status: ${order.delivery_status || 'null'}`);
                console.log(`   - Scheduled Date: ${order.scheduled_delivery_date || 'null'}`);
                console.log(`   - Schedule ID: ${order.delivery_schedule_id || 'null'}`);
            });
            
            // Test calendar endpoint
            console.log('\n📅 Testing GET /delivery-enhanced/calendar...');
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const calendarResponse = await axios.get(`http://localhost:5000/api/delivery-enhanced/calendar?year=${year}&month=${month}`);
            
            if (calendarResponse.data && calendarResponse.data.success) {
                console.log(`✅ Calendar API call successful`);
                console.log(`📅 Calendar data: ${calendarResponse.data.data.calendar.length} days`);
                console.log(`📊 Total deliveries: ${calendarResponse.data.data.summary.totalDeliveries}`);
                
                // Check for scheduled deliveries
                const daysWithDeliveries = calendarResponse.data.data.calendar.filter(day => day.deliveries.length > 0);
                console.log(`🚚 Days with deliveries: ${daysWithDeliveries.length}`);
                
                if (daysWithDeliveries.length > 0) {
                    console.log('\n📦 Sample scheduled deliveries:');
                    daysWithDeliveries.slice(0, 2).forEach(day => {
                        console.log(`   - Date: ${day.calendar_date}`);
                        console.log(`   - Deliveries: ${day.deliveries.length}`);
                        day.deliveries.forEach(delivery => {
                            console.log(`     * Order: ${delivery.order_number} - Status: ${delivery.delivery_status}`);
                        });
                    });
                }
            } else {
                console.log('❌ Calendar API call failed');
            }
            
        } else {
            console.log('❌ Orders API call failed');
            console.log('Response:', ordersResponse.data);
        }

    } catch (error) {
        console.error('❌ API Test Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testFrontendAPI();
