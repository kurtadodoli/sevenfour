const axios = require('axios');

async function testAPIs() {
    try {
        console.log('=== TESTING API ENDPOINTS ===\n');

        // Test 1: confirmed orders
        console.log('1. Testing /api/custom-orders/confirmed');
        const confirmedResponse = await axios.get('http://localhost:5000/api/custom-orders/confirmed');
        console.log('Status:', confirmedResponse.status);
        console.log('Data type:', typeof confirmedResponse.data);
        console.log('Data length:', Array.isArray(confirmedResponse.data) ? confirmedResponse.data.length : 'Not an array');
        
        if (Array.isArray(confirmedResponse.data) && confirmedResponse.data.length > 0) {
            console.log('Sample order:', JSON.stringify(confirmedResponse.data[0], null, 2));
            
            // Look for our specific order
            const targetOrder = confirmedResponse.data.find(order => 
                order.custom_order_id === 'CUSTOM-MCNQQ7NW-GQEOI'
            );
            
            if (targetOrder) {
                console.log('✅ Found target order in confirmed orders API');
                console.log('Price:', targetOrder.final_price);
            } else {
                console.log('❌ Target order not found in confirmed orders API');
                console.log('Available order IDs:', confirmedResponse.data.map(o => o.custom_order_id));
            }
        } else {
            console.log('No confirmed orders found or invalid response');
            console.log('Response data:', confirmedResponse.data);
        }

        console.log('\n2. Testing /api/delivery-enhanced/orders');
        const deliveryResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        console.log('Status:', deliveryResponse.status);
        console.log('Data type:', typeof deliveryResponse.data);
        console.log('Data length:', Array.isArray(deliveryResponse.data) ? deliveryResponse.data.length : 'Not an array');
        
        if (Array.isArray(deliveryResponse.data) && deliveryResponse.data.length > 0) {
            console.log('Sample order:', JSON.stringify(deliveryResponse.data[0], null, 2));
            
            // Look for our specific order
            const targetOrder = deliveryResponse.data.find(order => 
                order.custom_order_id === 'CUSTOM-MCNQQ7NW-GQEOI'
            );
            
            if (targetOrder) {
                console.log('✅ Found target order in delivery enhanced API');
                console.log('Price:', targetOrder.final_price);
            } else {
                console.log('❌ Target order not found in delivery enhanced API');
                console.log('Available order IDs:', deliveryResponse.data.map(o => o.custom_order_id || 'NO_ID'));
            }
        } else {
            console.log('No delivery orders found or invalid response');
            console.log('Response data:', deliveryResponse.data);
        }

    } catch (error) {
        console.error('API Test Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPIs();
