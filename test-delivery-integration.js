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

async function testDeliveryIntegration() {
    console.log('🧪 Testing Delivery Integration...');
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Test 1: Check if delivery tables exist
        console.log('\n📋 Test 1: Checking delivery tables...');
        const [tables] = await connection.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_name LIKE 'delivery_%'
        `, [dbConfig.database]);
        
        console.log('Delivery tables found:');
        tables.forEach(table => console.log(`- ${table.table_name}`));

        // Test 2: Check delivery schedules
        console.log('\n📅 Test 2: Checking delivery schedules...');
        const [schedules] = await connection.execute('SELECT * FROM delivery_schedules');
        console.log(`Found ${schedules.length} delivery schedules`);
        schedules.forEach(schedule => {
            console.log(`- ID: ${schedule.id} | Order: ${schedule.order_id} | Date: ${schedule.delivery_date} | Status: ${schedule.delivery_status}`);
        });

        // Test 3: Check sample API endpoint format
        console.log('\n🔌 Test 3: Sample API data format...');
        if (schedules.length > 0) {
            const sampleSchedule = schedules[0];
            const apiFormat = {
                id: sampleSchedule.id,
                order_id: sampleSchedule.order_id,
                order_type: sampleSchedule.order_type,
                customer_id: sampleSchedule.customer_id,
                delivery_date: sampleSchedule.delivery_date,
                delivery_time_slot: sampleSchedule.delivery_time_slot,
                delivery_status: sampleSchedule.delivery_status,
                delivery_address: sampleSchedule.delivery_address,
                delivery_city: sampleSchedule.delivery_city,
                delivery_notes: sampleSchedule.delivery_notes,
                priority_level: sampleSchedule.priority_level,
                delivery_fee: parseFloat(sampleSchedule.delivery_fee || 0),
                created_at: sampleSchedule.created_at,
                updated_at: sampleSchedule.updated_at
            };
            console.log('Sample API response format:');
            console.log(JSON.stringify(apiFormat, null, 2));
        }

        console.log('\n🎉 Delivery integration test completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('1. Start your server: cd server && npm start');
        console.log('2. Start your client: cd client && npm start');
        console.log('3. Go to DeliveryPage and schedule a delivery');
        console.log('4. Refresh the page to see if it persists');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDeliveryIntegration();
