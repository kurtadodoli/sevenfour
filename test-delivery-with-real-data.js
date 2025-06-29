const axios = require('axios');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function testDeliverySchedulingWithRealData() {
    console.log('🚀 Testing delivery scheduling with real order data...');
    
    let connection;
    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        
        // Get a valid order
        const [orders] = await connection.execute(
            'SELECT * FROM orders WHERE status = "confirmed" AND id = 1 LIMIT 1'
        );
        
        if (orders.length === 0) {
            console.log('❌ No confirmed orders found');
            return;
        }
        
        const order = orders[0];
        console.log('📦 Using order:', {
            id: order.id,
            order_number: order.order_number,
            user_id: order.user_id,
            status: order.status,
            delivery_status: order.delivery_status
        });
        
        // Get customer information
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE user_id = ?',
            [order.user_id]
        );
        
        if (users.length === 0) {
            console.log('❌ Customer not found for order');
            return;
        }
        
        const customer = users[0];
        console.log('👤 Customer:', {
            user_id: customer.user_id,
            email: customer.email,
            first_name: customer.first_name,
            last_name: customer.last_name
        });
        
        // First, test authentication with a valid admin
        console.log('\n🔐 Testing authentication...');
        let authToken;
        try {
            const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'testadmin@example.com',
                password: 'admin123'
            });
            
            authToken = authResponse.data.token;
            console.log('✅ Authentication successful');
        } catch (authError) {
            console.log('❌ Authentication failed:', authError.response?.data || authError.message);
            return;
        }
        
        // Now test delivery scheduling with real data
        console.log('\n📅 Testing delivery scheduling...');
        
        const deliveryData = {
            order_id: order.id,
            order_number: order.order_number,
            order_type: 'regular', // Default since not in database
            customer_id: customer.user_id,
            customer_name: `${customer.first_name} ${customer.last_name}`,
            customer_email: customer.email,
            customer_phone: order.contact_phone || '09123456789',
            delivery_date: '2024-12-25',
            delivery_time_slot: '10:00-12:00',
            delivery_address: order.shipping_address,
            delivery_city: 'Quezon City',
            delivery_province: 'Metro Manila',
            delivery_postal_code: '1102',
            delivery_contact_phone: order.contact_phone || '09123456789',
            delivery_notes: order.delivery_notes || 'Test delivery with real data',
            priority_level: 'normal',
            delivery_fee: 100.00,
            calendar_color: '#4CAF50',
            display_icon: '📦'
        };
        
        console.log('📋 Delivery data to send:', JSON.stringify(deliveryData, null, 2));
        
        try {
            const deliveryResponse = await axios.post(
                'http://localhost:5000/api/delivery-enhanced/schedule',
                deliveryData,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Delivery scheduling successful!');
            console.log('📋 Response:', JSON.stringify(deliveryResponse.data, null, 2));
            
        } catch (deliveryError) {
            console.log('❌ Delivery scheduling failed:');
            console.log('Status:', deliveryError.response?.status);
            console.log('Data:', JSON.stringify(deliveryError.response?.data, null, 2));
            
            if (deliveryError.response?.data?.error) {
                console.log('Error details:', deliveryError.response.data.error);
            }
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the test
testDeliverySchedulingWithRealData().catch(console.error);
