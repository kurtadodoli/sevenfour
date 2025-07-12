const axios = require('axios');

async function testClientDataTransformation() {
    try {
        console.log('🧪 Testing client-side data transformation...\n');
        
        // Simulate what the TransactionPage.js fetchTransactions function does
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (response.data.success && response.data.data.length > 0) {
            console.log('✅ Got delivery-enhanced data, testing client-side transformation...\n');
            
            // Get the first order
            const order = response.data.data[0];
            
            console.log('=== RAW ORDER DATA ===');
            console.log(`Order Number: ${order.order_number}`);
            console.log(`Payment Reference: ${order.payment_reference}`);
            console.log(`GCash Reference Number: ${order.gcash_reference_number}`);
            console.log(`GCash Reference: ${order.gcash_reference}`);
            console.log(`Items Count: ${order.items ? order.items.length : 'No items array'}`);
            
            if (order.items && order.items.length > 0) {
                console.log('\n--- ITEMS DATA ---');
                order.items.forEach((item, index) => {
                    console.log(`Item ${index + 1}: ${item.productname}`);
                    console.log(`  - GCash Ref Number: ${item.gcash_reference_number}`);
                    console.log(`  - GCash Ref: ${item.gcash_reference}`);
                });
            }
            
            // Test the client-side fallback logic
            console.log('\n=== CLIENT-SIDE FALLBACK LOGIC TEST ===');
            const gcashRef = order.gcash_reference_number || 
                           order.gcash_reference || 
                           order.payment_reference ||
                           (order.items && order.items[0] && order.items[0].gcash_reference_number) ||
                           'N/A';
            
            console.log(`Final GCash Reference (after client fallback): ${gcashRef}`);
            
            // Test multiple orders
            console.log('\n=== MULTIPLE ORDERS TEST ===');
            response.data.data.slice(0, 5).forEach((testOrder, index) => {
                const testGcashRef = testOrder.gcash_reference_number || 
                                   testOrder.gcash_reference || 
                                   testOrder.payment_reference ||
                                   (testOrder.items && testOrder.items[0] && testOrder.items[0].gcash_reference_number) ||
                                   'N/A';
                console.log(`${index + 1}. ${testOrder.order_number}: ${testGcashRef}`);
            });
            
        } else {
            console.log('❌ No data from delivery-enhanced endpoint');
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.response?.data || error.message);
    }
}

testClientDataTransformation();
