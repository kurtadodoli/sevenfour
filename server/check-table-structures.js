const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function checkTables() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('=== USERS TABLE STRUCTURE ===');
        const [usersResult] = await connection.execute('DESCRIBE users');
        usersResult.forEach(col => console.log(`${col.Field}: ${col.Type}`));
        
        console.log('\n=== ORDERS TABLE STRUCTURE ===');
        const [ordersResult] = await connection.execute('DESCRIBE orders');
        ordersResult.forEach(col => console.log(`${col.Field}: ${col.Type}`));
        
        console.log('\n=== ORDER_ITEMS TABLE STRUCTURE ===');
        const [orderItemsResult] = await connection.execute('DESCRIBE order_items');
        orderItemsResult.forEach(col => console.log(`${col.Field}: ${col.Type}`));
        
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTables();
