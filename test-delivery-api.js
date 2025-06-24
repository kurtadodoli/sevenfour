const express = require('express');
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
    console.log('🧪 Testing Delivery API Connection...');
    
    let connection;
    try {
        // Test database connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful');

        // Test delivery schedules query
        console.log('\n📅 Testing delivery schedules query...');
        const [schedules] = await connection.execute('SELECT * FROM delivery_schedules');
        console.log(`Found ${schedules.length} delivery schedules in database:`);
        
        schedules.forEach(schedule => {
            console.log(`- ID: ${schedule.id}`);
            console.log(`  Order ID: ${schedule.order_id}`);
            console.log(`  Order Type: ${schedule.order_type}`);
            console.log(`  Customer ID: ${schedule.customer_id}`);
            console.log(`  Delivery Date: ${schedule.delivery_date}`);
            console.log(`  Time Slot: ${schedule.delivery_time_slot}`);
            console.log(`  Status: ${schedule.delivery_status}`);
            console.log(`  Address: ${schedule.delivery_address}`);
            console.log(`  City: ${schedule.delivery_city}`);
            console.log(`  Notes: ${schedule.delivery_notes}`);
            console.log(`  Created: ${schedule.created_at}`);
            console.log('  ---');
        });

        // Test the exact query that the API uses
        console.log('\n🔍 Testing API-style query...');
        const formatDeliverySchedule = (schedule) => {
            return {
                id: schedule.id,
                order_id: schedule.order_id,
                order_type: schedule.order_type,
                customer_id: schedule.customer_id,
                delivery_date: schedule.delivery_date,
                delivery_time_slot: schedule.delivery_time_slot,
                delivery_status: schedule.delivery_status,
                delivery_address: schedule.delivery_address,
                delivery_city: schedule.delivery_city,
                delivery_postal_code: schedule.delivery_postal_code,
                delivery_province: schedule.delivery_province,
                delivery_contact_phone: schedule.delivery_contact_phone,
                delivery_notes: schedule.delivery_notes,
                tracking_number: schedule.tracking_number,
                courier_name: schedule.courier_name,
                estimated_delivery_time: schedule.estimated_delivery_time,
                actual_delivery_time: schedule.actual_delivery_time,
                priority_level: schedule.priority_level,
                delivery_fee: parseFloat(schedule.delivery_fee || 0),
                created_at: schedule.created_at,
                updated_at: schedule.updated_at
            };
        };

        const formattedSchedules = schedules.map(formatDeliverySchedule);
        console.log('API Response format:');
        console.log(JSON.stringify(formattedSchedules, null, 2));

        // Test creating a new delivery schedule
        console.log('\n➕ Testing delivery schedule creation...');
        const testDelivery = {
            order_id: 9999,
            order_type: 'regular',
            customer_id: 967502321335185, // Use existing customer ID
            delivery_date: '2025-06-25',
            delivery_time_slot: '2:00-5:00',
            delivery_address: 'Test Address 123',
            delivery_city: 'Manila',
            delivery_postal_code: '1000',
            delivery_province: 'Metro Manila',
            delivery_contact_phone: '+63-999-999-9999',
            delivery_notes: 'Test delivery created by debug script',
            priority_level: 'normal',
            delivery_fee: 150.00
        };

        const [insertResult] = await connection.execute(`
            INSERT INTO delivery_schedules (
                order_id, order_type, customer_id, delivery_date, delivery_time_slot,
                delivery_address, delivery_city, delivery_postal_code, delivery_province,
                delivery_contact_phone, delivery_notes, priority_level, delivery_fee,
                delivery_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `, [
            testDelivery.order_id,
            testDelivery.order_type,
            testDelivery.customer_id,
            testDelivery.delivery_date,
            testDelivery.delivery_time_slot,
            testDelivery.delivery_address,
            testDelivery.delivery_city,
            testDelivery.delivery_postal_code,
            testDelivery.delivery_province,
            testDelivery.delivery_contact_phone,
            testDelivery.delivery_notes,
            testDelivery.priority_level,
            testDelivery.delivery_fee
        ]);

        console.log(`✅ Test delivery created with ID: ${insertResult.insertId}`);

        // Clean up test data
        await connection.execute('DELETE FROM delivery_schedules WHERE order_id = 9999');
        console.log('🧹 Test data cleaned up');

        console.log('\n🎉 All delivery API tests passed!');
        console.log('\n📝 Diagnosis:');
        console.log('- Database connection: ✅ Working');
        console.log('- Delivery schedules table: ✅ Accessible');
        console.log('- INSERT operations: ✅ Working');
        console.log('- Data formatting: ✅ Working');

    } catch (error) {
        console.error('❌ API Test failed:', error);
        console.log('\n🔍 Error Details:');
        console.log('- Error Code:', error.code);
        console.log('- Error Message:', error.message);
        console.log('- SQL State:', error.sqlState);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDeliveryAPI();
