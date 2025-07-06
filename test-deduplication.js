const fetch = require('node-fetch');

async function testDeduplication() {
    try {
        console.log('🔍 Testing API endpoints for deduplication...\n');

        // Fetch delivery-enhanced orders
        const deliveryResponse = await fetch('http://localhost:5000/api/delivery-enhanced/orders');
        const deliveryData = await deliveryResponse.json();
        console.log('📦 Delivery Enhanced Orders:');
        console.log(`Found ${deliveryData.data.length} total orders`);
        
        // Look for custom orders in the full data array AND in the separated data
        const allDeliveryOrders = deliveryData.data;
        const separatedCustomOrders = deliveryData.separatedData ? deliveryData.separatedData.customOrders : [];
        
        console.log(`- ${separatedCustomOrders.length} custom orders from separatedData.customOrders`);
        
        // Extract custom order IDs from all delivery orders (including those with CUSTOM- order numbers)
        const deliveryCustomOrderIds = [];
        allDeliveryOrders.forEach(order => {
            if (order.order_number && order.order_number.startsWith('CUSTOM-')) {
                // Extract the original custom order ID from the order number or notes
                if (order.shipping_notes && order.shipping_notes.includes('Reference: CUSTOM-')) {
                    const match = order.shipping_notes.match(/Reference: (CUSTOM-[A-Z0-9\-]+)/);
                    if (match) {
                        deliveryCustomOrderIds.push(match[1]);
                    }
                } else {
                    // Try to map the delivery order number back to original custom order ID
                    // This is more complex since the delivery order number is truncated
                    deliveryCustomOrderIds.push(order.order_number); // Approximation
                }
            }
        });
        
        // Also add custom orders from separatedData
        separatedCustomOrders.forEach(order => {
            deliveryCustomOrderIds.push(order.order_number); // This should be the full custom order ID
        });
        
        console.log('Custom Order IDs found in delivery-enhanced response:', deliveryCustomOrderIds);
        console.log('');

        // Fetch custom orders
        const customResponse = await fetch('http://localhost:5000/api/custom-orders/confirmed');
        const customData = await customResponse.json();
        console.log('🎨 Custom Orders (Confirmed):');
        console.log(`Found ${customData.data.length} orders`);
        console.log('Custom Order IDs from custom-orders:', customData.data.map(o => o.custom_order_id));
        console.log('');

        // Check for potential duplicates
        const deliveryCustomOrderIdSet = new Set(deliveryCustomOrderIds);
        const customOrderIdSet = new Set(customData.data.map(o => o.custom_order_id));
        
        const intersection = [...customOrderIdSet].filter(id => deliveryCustomOrderIdSet.has(id));
        
        console.log('🔍 Deduplication Analysis:');
        console.log(`Custom orders in delivery-enhanced response: ${deliveryCustomOrderIds.length}`);
        console.log(`Custom orders in custom-orders endpoint: ${customData.data.length}`);
        console.log(`Orders that appear in both endpoints: ${intersection.length}`);
        
        if (intersection.length > 0) {
            console.log('⚠️  Overlapping custom order IDs:', intersection);
            console.log('🚨 WITHOUT deduplication, these would appear TWICE in the frontend!');
            console.log('✅ Frontend deduplication is CRITICAL and our fix should handle these cases');
        } else {
            console.log('✅ No overlapping custom orders found - no deduplication needed');
        }
        
        // Simulate frontend deduplication logic (based on actual implementation)
        console.log('\n🧪 Simulating Frontend Deduplication Logic (TransactionPage.js):');
        
        // Step 1: Add all delivery orders
        const allTransactions = [...allDeliveryOrders];
        console.log(`Step 1: Added ${allDeliveryOrders.length} delivery orders`);
        
        // Step 2: Track which custom orders are already included from delivery-enhanced
        const includedCustomOrderIds = new Set();
        
        // Check both direct custom orders in delivery data AND separated custom orders
        allDeliveryOrders.forEach(transaction => {
            if (transaction.shipping_notes && transaction.shipping_notes.includes('Reference: CUSTOM-')) {
                const match = transaction.shipping_notes.match(/Reference: (CUSTOM-[A-Z0-9\-]+)/);
                if (match) {
                    includedCustomOrderIds.add(match[1]);
                }
            }
        });
        
        separatedCustomOrders.forEach(customOrder => {
            includedCustomOrderIds.add(customOrder.order_number);
        });
        
        console.log(`Step 2: Found ${includedCustomOrderIds.size} custom orders already included from delivery-enhanced`);
        console.log('Already included custom order IDs:', Array.from(includedCustomOrderIds));
        
        // Step 3: Filter custom orders to only add those not already included
        const customOrdersToAdd = customData.data.filter(customOrder => {
            return !includedCustomOrderIds.has(customOrder.custom_order_id);
        });
        
        console.log(`Step 3: ${customOrdersToAdd.length} custom orders would be added after filtering`);
        
        // Step 4: Add non-duplicate custom orders
        allTransactions.push(...customOrdersToAdd);
        
        console.log(`\nFinal Results:`);
        console.log(`- Original delivery orders: ${allDeliveryOrders.length}`);
        console.log(`- Custom orders that would be added after deduplication: ${customOrdersToAdd.length}`);
        console.log(`- Total unique orders after deduplication: ${allTransactions.length}`);
        
        if (customOrdersToAdd.length < customData.data.length) {
            console.log('\n✅ SUCCESS! Deduplication successfully prevents duplicates!');
            console.log(`🎯 ${customData.data.length - customOrdersToAdd.length} duplicate(s) would be filtered out`);
            console.log('🎯 The TransactionPage should now show each custom order only once');
        } else {
            console.log('\nℹ️  No duplicates found to filter (this should not happen based on our analysis)');
        }

    } catch (error) {
        console.error('❌ Error testing deduplication:', error.message);
    }
}

testDeduplication();
