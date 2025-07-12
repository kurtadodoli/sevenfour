const axios = require('axios');

async function testShippingFix() {
    try {
        console.log('🧪 Testing shipping information fix...\n');
        
        // Test the delivery-enhanced API to see what shipping fields are available
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (response.data.success && response.data.data.length > 0) {
            console.log('✅ Got order data, checking shipping information fields...\n');
            
            // Check the first few orders for shipping information
            response.data.data.slice(0, 3).forEach((order, index) => {
                console.log(`=== ORDER ${index + 1}: ${order.order_number} ===`);
                console.log(`Order Type: ${order.order_type || 'regular'}`);
                
                // Check shipping fields as they're used in OrderPage.js
                const shippingFields = {
                    'Street Address': order.street_address,
                    'City Municipality': order.city_municipality,
                    'Province': order.province,
                    'Zip Code': order.zip_code,
                    'Contact Phone': order.contact_phone,
                    // Also check other possible fields
                    'Shipping Address': order.shipping_address,
                    'City': order.city,
                    'Postal Code': order.postal_code
                };
                
                console.log('Expected Shipping Information (from OrderPage.js mapping):');
                Object.entries(shippingFields).forEach(([label, value]) => {
                    const displayValue = value || 'N/A';
                    const available = value ? '✅' : '❌';
                    console.log(`  ${available} ${label}: ${displayValue}`);
                });
                
                // Test the new address construction logic
                const constructedAddress = order.shipping_address || 
                    [
                        order.street_address,        // From OrderPage.js: street_address
                        order.city_municipality,     // From OrderPage.js: city mapped to city_municipality
                        order.province,              // From OrderPage.js: province
                        order.zip_code              // From OrderPage.js: postal_code mapped to zip_code
                    ].filter(Boolean).join(', ') ||
                    // Fallback to other possible field variations
                    [
                        order.address,
                        order.city,
                        order.area,
                        order.postal_code
                    ].filter(Boolean).join(', ') ||
                    'Address not provided';
                
                console.log(`📍 Constructed Address: ${constructedAddress}`);
                console.log('');
            });
            
            // Summary
            const ordersWithComplete = response.data.data.filter(order => {
                return (order.street_address || order.shipping_address) &&
                       (order.city_municipality || order.city) &&
                       (order.province);
            });
            
            console.log('=== SUMMARY ===');
            console.log(`Total Orders: ${response.data.data.length}`);
            console.log(`Orders with Complete Address Info: ${ordersWithComplete.length}`);
            console.log(`Success Rate: ${((ordersWithComplete.length / response.data.data.length) * 100).toFixed(1)}%`);
            
            if (ordersWithComplete.length < response.data.data.length) {
                console.log('\n⚠️  Some orders still missing address information. This could be due to:');
                console.log('   - Orders placed before the field mapping was implemented');
                console.log('   - Backend not saving the correct field names');
                console.log('   - Data corruption during order processing');
            } else {
                console.log('\n✅ All orders have complete address information!');
            }
        } else {
            console.log('❌ No orders found or API error');
        }
        
    } catch (error) {
        console.error('❌ Error testing shipping fix:', error.message);
    }
}

// Run the test
testShippingFix();
