const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkDatabaseTriggers() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        console.log('\n🔍 CHECKING FOR DATABASE TRIGGERS:');
        console.log('='.repeat(50));
        
        // Check for triggers on custom_orders table
        const [triggers] = await connection.execute(`
            SHOW TRIGGERS WHERE \`Table\` = 'custom_orders'
        `);
        
        if (triggers.length > 0) {
            console.log(`Found ${triggers.length} trigger(s) on custom_orders table:`);
            triggers.forEach((trigger, index) => {
                console.log(`\n${index + 1}. Trigger: ${trigger.Trigger}`);
                console.log(`   Event: ${trigger.Event}`);
                console.log(`   Timing: ${trigger.Timing}`);
                console.log(`   Statement: ${trigger.Statement}`);
            });
        } else {
            console.log('✅ No triggers found on custom_orders table');
        }
        
        // Check for triggers on orders table
        const [orderTriggers] = await connection.execute(`
            SHOW TRIGGERS WHERE \`Table\` = 'orders'
        `);
        
        if (orderTriggers.length > 0) {
            console.log(`\nFound ${orderTriggers.length} trigger(s) on orders table:`);
            orderTriggers.forEach((trigger, index) => {
                console.log(`\n${index + 1}. Trigger: ${trigger.Trigger}`);
                console.log(`   Event: ${trigger.Event}`);
                console.log(`   Timing: ${trigger.Timing}`);
                console.log(`   Statement: ${trigger.Statement}`);
            });
        } else {
            console.log('✅ No triggers found on orders table');
        }
        
        // Check for stored procedures
        console.log('\n🔍 CHECKING FOR STORED PROCEDURES:');
        console.log('='.repeat(50));
        
        const [procedures] = await connection.execute(`
            SHOW PROCEDURE STATUS WHERE Db = ?
        `, [dbConfig.database]);
        
        if (procedures.length > 0) {
            console.log(`Found ${procedures.length} stored procedure(s):`);
            procedures.forEach((proc, index) => {
                console.log(`${index + 1}. ${proc.Name} (Created: ${proc.Created})`);
            });
        } else {
            console.log('✅ No stored procedures found');
        }
        
        // Check for functions
        const [functions] = await connection.execute(`
            SHOW FUNCTION STATUS WHERE Db = ?
        `, [dbConfig.database]);
        
        if (functions.length > 0) {
            console.log(`\nFound ${functions.length} function(s):`);
            functions.forEach((func, index) => {
                console.log(`${index + 1}. ${func.Name} (Created: ${func.Created})`);
            });
        } else {
            console.log('✅ No functions found');
        }
        
        console.log('\n📊 SUMMARY:');
        console.log('='.repeat(30));
        console.log(`Database: ${dbConfig.database}`);
        console.log(`Triggers on custom_orders: ${triggers.length}`);
        console.log(`Triggers on orders: ${orderTriggers.length}`);
        console.log(`Stored procedures: ${procedures.length}`);
        console.log(`Functions: ${functions.length}`);
        
        if (triggers.length === 0 && orderTriggers.length === 0 && procedures.length === 0) {
            console.log('\n✅ NO DATABASE-LEVEL AUTOMATION FOUND');
            console.log('   The duplicate order creation is happening in application code.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDatabaseTriggers();
