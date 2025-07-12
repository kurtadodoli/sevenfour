const axios = require('axios');

async function testDeliveryEnhancedAPI() {
    try {
        console.log('🧪 Testing delivery-enhanced/orders API endpoint...\n');
        
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (response.data.success) {
            console.log(`✅ API Success! Found ${response.data.data.length} orders\n`);
            
            if (response.data.data.length > 0) {
                console.log('=== FIRST ORDER SAMPLE ===');
                const firstOrder = response.data.data[0];
                console.log(`Order Number: ${firstOrder.order_number}`);
                console.log(`Order Type: ${firstOrder.order_type}`);
                console.log(`Customer: ${firstOrder.customer_name}`);
                console.log(`Payment Reference: ${firstOrder.payment_reference}`);
                console.log(`GCash Reference Number: ${firstOrder.gcash_reference_number}`);
                console.log(`GCash Reference: ${firstOrder.gcash_reference}`);
                console.log(`Payment Proof Path: ${firstOrder.payment_proof_image_path}`);
                console.log(`Items Count: ${firstOrder.item_count || 'N/A'}`);
                
                if (firstOrder.items && firstOrder.items.length > 0) {
                    console.log('\n--- ORDER ITEMS ---');
                    firstOrder.items.forEach((item, index) => {
                        console.log(`Item ${index + 1}: ${item.productname}`);
                        console.log(`  - GCash Ref: ${item.gcash_reference_number || 'N/A'}`);
                        console.log(`  - Proof Path: ${item.payment_proof_image_path || 'N/A'}`);
                    });
                }
                
                // Check a few more orders
                console.log('\n=== OTHER ORDERS GCASH INFO ===');
                response.data.data.slice(0, 5).forEach((order, index) => {
                    console.log(`${index + 1}. ${order.order_number} (${order.order_type}): ${order.gcash_reference_number || order.gcash_reference || 'N/A'}`);
                });
            }
        } else {
            console.log('❌ API Error:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Request Error:', error.response?.data || error.message);
    }
}

testDeliveryEnhancedAPI();
