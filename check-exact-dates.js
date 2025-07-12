const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkExactDates() {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check ALL delivery schedules for July 2025 with exact dates
    const [schedules] = await connection.execute(`
        SELECT 
            id, order_number, delivery_date, delivery_status,
            DATE(delivery_date) as date_only,
            delivery_date >= '2025-07-01' AND delivery_date < '2025-08-01' as in_range
        FROM delivery_schedules_enhanced
        WHERE YEAR(delivery_date) = 2025 AND MONTH(delivery_date) = 7
        ORDER BY delivery_date
    `);
    
    console.log('📅 All July 2025 delivery schedules:');
    schedules.forEach(s => {
        console.log(`- Order ${s.order_number}: ${s.date_only} (${s.delivery_date}), In Range: ${s.in_range}, Status: ${s.delivery_status}`);
    });
    
    // Test the exact same query that the API uses
    const startDate = '2025-07-01';
    const endDate = '2025-08-01';
    
    console.log(`\n🔍 Testing API query with startDate=${startDate}, endDate=${endDate}:`);
    
    const [apiQuery] = await connection.execute(`
        SELECT 
            ds.*,
            c.name as courier_name
        FROM delivery_schedules_enhanced ds
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE ds.delivery_date >= ? AND ds.delivery_date < ?
        ORDER BY ds.delivery_date, ds.delivery_time_slot
    `, [startDate, endDate]);
    
    console.log(`API query results: ${apiQuery.length}`);
    apiQuery.forEach(s => {
        const date = new Date(s.delivery_date);
        console.log(`- Order ${s.order_number}: ${date.toISOString().split('T')[0]}, Status: ${s.delivery_status}`);
    });
    
    await connection.end();
}

checkExactDates().catch(console.error);
