const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function testDeliveryAPI() {
    let connection;
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');

        // Check if delivery_schedules table exists
        console.log('\n📋 Checking delivery_schedules table...');
        const [tableCheck] = await connection.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = 'delivery_schedules'
        `, [dbConfig.database]);

        if (tableCheck[0].count === 0) {
            console.log('❌ delivery_schedules table does not exist');
            return;
        }

        console.log('✅ delivery_schedules table exists');

        // Check existing schedules
        const [schedules] = await connection.execute('SELECT * FROM delivery_schedules ORDER BY created_at DESC LIMIT 5');
        console.log(`📊 Found ${schedules.length} delivery schedules in database`);

        if (schedules.length > 0) {
            console.log('\n📝 Sample delivery schedule:');
            const sample = schedules[0];
            console.log(`  ID: ${sample.id}`);
            console.log(`  Order ID: ${sample.order_id}`);
            console.log(`  Customer ID: ${sample.customer_id}`);
            console.log(`  Delivery Date: ${sample.delivery_date}`);
            console.log(`  Status: ${sample.delivery_status}`);
            console.log(`  Address: ${sample.delivery_address}`);
        }

        // Test API endpoint locally
        console.log('\n🌐 Testing API endpoint...');
        const axios = require('axios');
        
        try {
            const response = await axios.get('http://localhost:3001/api/delivery/schedules');
            console.log(`✅ API Response Status: ${response.status}`);
            console.log(`✅ API Response: ${response.data.length} schedules returned`);
            
            if (response.data.length > 0) {
                console.log('✅ Sample API response item:');
                console.log(JSON.stringify(response.data[0], null, 2));
            }
        } catch (apiError) {
            console.log('❌ API Error:', apiError.response?.status || apiError.message);
            if (apiError.response?.data) {
                console.log('Error details:', apiError.response.data);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDeliveryAPI();
