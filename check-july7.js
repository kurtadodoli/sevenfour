const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkJuly7() {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check what the exact query returns for July 7, 2025
    const today = '2025-07-07';
    
    console.log('🔍 Checking for July 7, 2025 specifically...');
    
    const [schedules] = await connection.execute(`
        SELECT 
            ds.*,
            c.name as courier_name
        FROM delivery_schedules_enhanced ds
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE DATE(ds.delivery_date) = ?
    `, [today]);
    
    console.log(`July 7 schedules: ${schedules.length}`);
    schedules.forEach(s => {
        console.log(`- Order ${s.order_number}, Date: ${s.delivery_date}, Status: ${s.delivery_status}`);
    });
    
    // Check the calendar API query range  
    const startDate = '2025-07-01';
    const endDate = '2025-08-01';
    
    const [apiSchedules] = await connection.execute(`
        SELECT 
            ds.*,
            c.name as courier_name
        FROM delivery_schedules_enhanced ds
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE ds.delivery_date >= ? AND ds.delivery_date < ?
        ORDER BY ds.delivery_date
    `, [startDate, endDate]);
    
    console.log(`\n📅 API query results for July 2025: ${apiSchedules.length}`);
    apiSchedules.forEach(s => {
        const date = new Date(s.delivery_date);
        console.log(`- Order ${s.order_number}, Date: ${date.toISOString().split('T')[0]}, Status: ${s.delivery_status}`);
    });
    
    // Check all delivery_schedules_enhanced entries
    const [allSchedules] = await connection.execute(`
        SELECT id, order_id, order_number, delivery_date, delivery_status
        FROM delivery_schedules_enhanced
        ORDER BY delivery_date DESC
    `);
    
    console.log(`\n📋 All delivery schedules in table: ${allSchedules.length}`);
    allSchedules.forEach(s => {
        const date = new Date(s.delivery_date);
        console.log(`- ID ${s.id}: Order ${s.order_number} (Order ID: ${s.order_id}), Date: ${date.toISOString().split('T')[0]}, Status: ${s.delivery_status}`);
    });
    
    await connection.end();
}

checkJuly7().catch(console.error);
