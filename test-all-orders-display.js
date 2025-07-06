const axios = require('axios');

async function testAllOrdersDisplay() {
    try {
        console.log('=== TESTING ALL ORDERS DISPLAY (NO SEARCH) ===\n');
        
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        const orders = response.data.data;
        
        // Simulate DeliveryPage.js filtering with no search query
        const filteredOrders = orders.filter(order => {
            // Show all order types (regular, custom_order, custom_design)
            return ['regular', 'custom_order', 'custom_design'].includes(order.order_type);
        });
        
        console.log(`Total orders after type filter: ${filteredOrders.length}`);
        
        const customOrders = filteredOrders.filter(order => order.order_type === 'custom_order');
        console.log(`Custom orders: ${customOrders.length}`);
        
        console.log('\nVerified custom orders ready for delivery:');
        const verifiedCustomOrders = customOrders.filter(order => 
            order.payment_status === 'verified' && 
            order.delivery_status === 'pending'
        );
        
        console.log(`Verified & pending custom orders: ${verifiedCustomOrders.length}`);
        
        verifiedCustomOrders.forEach(order => {
            console.log(`✅ ${order.order_number}: ₱${order.total_amount} - ${order.customer_name}`);
        });
        
        console.log(`\n🎯 Target orders should now be visible in DeliveryPage.js!`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAllOrdersDisplay();
