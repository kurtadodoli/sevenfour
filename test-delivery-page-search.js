const axios = require('axios');

async function testDeliveryPageSearch() {
    try {
        console.log('=== TESTING DELIVERY PAGE SEARCH LOGIC ===\n');
        
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        const orders = response.data.data;
        
        // Find our target orders
        const targetOrders = orders.filter(order => 
            order.order_number === 'CUSTOM-MCNQQ7NW-GQEOI' || 
            order.order_number === 'CUSTOM-MCNQFDBQ-YQPWJ'
        );
        
        console.log(`Found ${targetOrders.length} target orders in API response`);
        
        targetOrders.forEach(order => {
            console.log(`\n📦 Order: ${order.order_number}`);
            console.log(`   - id: ${order.id}`);
            console.log(`   - order_number: "${order.order_number}"`);
            console.log(`   - order_type: "${order.order_type}"`);
            console.log(`   - customer_name: "${order.customer_name}"`);
            console.log(`   - shipping_address: "${order.shipping_address}"`);
            console.log(`   - delivery_status: "${order.delivery_status}"`);
            console.log(`   - status: "${order.status}"`);
            console.log(`   - payment_status: "${order.payment_status}"`);
        });
        
        // Simulate DeliveryPage.js filtering logic
        console.log('\n=== SIMULATING DELIVERY PAGE FILTERING ===');
        
        // Step 1: Filter by order type
        const typeFilteredOrders = orders.filter(order => {
            return ['regular', 'custom_order', 'custom_design'].includes(order.order_type);
        });
        
        console.log(`Step 1 - Type filter: ${typeFilteredOrders.length} orders`);
        
        const customOrdersAfterTypeFilter = typeFilteredOrders.filter(order => 
            order.order_type === 'custom_order'
        );
        console.log(`Custom orders after type filter: ${customOrdersAfterTypeFilter.length}`);
        
        // Step 2: Simulate search for "CUSTOM-MCNQQ7NW-GQEOI"
        const searchQuery = 'CUSTOM-MCNQQ7NW-GQEOI';
        const query = searchQuery.toLowerCase();
        
        const searchFilteredOrders = typeFilteredOrders.filter(order => {
            return (
                (order.order_number && order.order_number.toString().toLowerCase().includes(query)) ||
                (order.id && order.id.toString().includes(query)) ||
                (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
                (order.shipping_address && order.shipping_address.toLowerCase().includes(query)) ||
                (order.delivery_status && order.delivery_status.toLowerCase().includes(query)) ||
                (order.order_type && order.order_type.toLowerCase().includes(query))
            );
        });
        
        console.log(`\nStep 2 - Search filter for "${searchQuery}": ${searchFilteredOrders.length} orders`);
        
        if (searchFilteredOrders.length > 0) {
            console.log('✅ Orders found by search:');
            searchFilteredOrders.forEach(order => {
                console.log(`   - ${order.order_number}: ${order.order_type}, ${order.delivery_status}`);
            });
        } else {
            console.log('❌ No orders found by search filter');
            
            // Debug why search failed
            const targetOrder = typeFilteredOrders.find(order => 
                order.order_number === 'CUSTOM-MCNQQ7NW-GQEOI'
            );
            
            if (targetOrder) {
                console.log('\n🔍 Debugging search failure for CUSTOM-MCNQQ7NW-GQEOI:');
                console.log(`   - order_number field: "${targetOrder.order_number}"`);
                console.log(`   - order_number type: ${typeof targetOrder.order_number}`);
                console.log(`   - includes check: ${targetOrder.order_number.toString().includes(query)}`);
                console.log(`   - search query: "${query}"`);
                console.log(`   - query length: ${query.length}`);
                console.log(`   - order_number length: ${targetOrder.order_number.length}`);
            }
        }
        
        // Step 3: Check pending orders (for scheduling)
        const pendingOrders = typeFilteredOrders.filter(order => 
            !order.delivery_status || 
            order.delivery_status === 'pending' || 
            order.delivery_status === 'delayed'
        );
        
        console.log(`\nStep 3 - Pending orders (eligible for scheduling): ${pendingOrders.length}`);
        
        const pendingCustomOrders = pendingOrders.filter(order => 
            order.order_type === 'custom_order'
        );
        
        console.log(`Pending custom orders: ${pendingCustomOrders.length}`);
        
        if (pendingCustomOrders.length > 0) {
            console.log('Pending custom orders:');
            pendingCustomOrders.forEach(order => {
                console.log(`   - ${order.order_number}: ${order.delivery_status || 'null'}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testDeliveryPageSearch();
