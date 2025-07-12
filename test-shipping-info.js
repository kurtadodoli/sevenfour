const axios = require('axios');

async function testShippingInformation() {
    try {
        console.log('🧪 Testing shipping information display...\n');
        
        // Test the delivery-enhanced API to see what shipping fields are available
        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        
        if (response.data.success && response.data.data.length > 0) {
            console.log('✅ Got order data, checking shipping information fields...\n');
            
            // Check the first few orders for shipping information
            response.data.data.slice(0, 3).forEach((order, index) => {
                console.log(`=== ORDER ${index + 1}: ${order.order_number} ===`);
                console.log(`Order Type: ${order.order_type}`);
                
                // Check all possible shipping fields
                const shippingFields = {
                    'Address': order.street_address || order.shipping_address,
                    'City': order.city_municipality || order.shipping_city,
                    'Province': order.province || order.shipping_province,
                    'Postal Code': order.zip_code || order.postal_code || order.shipping_postal_code,
                    'Contact Phone': order.contact_phone || order.shipping_phone || order.customer_phone
                };
                
                console.log('Shipping Information:');
                Object.entries(shippingFields).forEach(([label, value]) => {
                    const displayValue = value || 'N/A';
                    const available = value ? '✅' : '❌';
                    console.log(`  ${available} ${label}: ${displayValue}`);
                });
                
                console.log('Raw shipping fields:');
                console.log(`  - street_address: ${order.street_address}`);
                console.log(`  - shipping_address: ${order.shipping_address}`);
                console.log(`  - city_municipality: ${order.city_municipality}`);
                console.log(`  - shipping_city: ${order.shipping_city}`);
                console.log(`  - province: ${order.province}`);
                console.log(`  - shipping_province: ${order.shipping_province}`);
                console.log(`  - zip_code: ${order.zip_code}`);
                console.log(`  - postal_code: ${order.postal_code}`);
                console.log(`  - shipping_postal_code: ${order.shipping_postal_code}`);
                console.log(`  - contact_phone: ${order.contact_phone}`);
                console.log(`  - shipping_phone: ${order.shipping_phone}`);
                console.log(`  - customer_phone: ${order.customer_phone}`);
                console.log('');
            });
            
            // Check summary
            const ordersWithComplete = response.data.data.filter(order => {
                return (order.street_address || order.shipping_address) &&
                       (order.city_municipality || order.shipping_city) &&
                       (order.province || order.shipping_province);
            });
            
            console.log('=== SUMMARY ===');
            console.log(`Total Orders: ${response.data.data.length}`);
            console.log(`Orders with Complete Address Info: ${ordersWithComplete.length}`);
            console.log(`Percentage Complete: ${((ordersWithComplete.length / response.data.data.length) * 100).toFixed(1)}%`);
            
        } else {
            console.log('❌ No order data available');
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.response?.data || error.message);
    }
}

testShippingInformation();
