const mysql = require('mysql2/promise');

// Add detailed logging to the orders route to see exactly what's happening
async function monitorOrderCreation() {
    console.log('🔍 MONITORING ORDER CREATION ENDPOINT');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // Enable MySQL general log to see all queries
        console.log('\n📝 Checking MySQL general log status...');
        const [logStatus] = await connection.execute('SHOW VARIABLES LIKE "general_log"');
        console.log('General log status:', logStatus);
        
        // Check if there are any triggers on the orders table
        console.log('\n🔍 Checking for triggers on orders table...');
        const [triggers] = await connection.execute(`
            SELECT 
                TRIGGER_NAME, 
                EVENT_MANIPULATION, 
                ACTION_TIMING, 
                ACTION_STATEMENT
            FROM INFORMATION_SCHEMA.TRIGGERS 
            WHERE EVENT_OBJECT_TABLE = 'orders' 
            AND EVENT_OBJECT_SCHEMA = 'seven_four_clothing'
        `);
        
        if (triggers.length > 0) {
            console.log('⚠️ FOUND TRIGGERS ON ORDERS TABLE:');
            triggers.forEach(trigger => {
                console.log(`- ${trigger.TRIGGER_NAME} (${trigger.ACTION_TIMING} ${trigger.EVENT_MANIPULATION})`);
                console.log(`  Statement: ${trigger.ACTION_STATEMENT}`);
            });
        } else {
            console.log('✅ No triggers found on orders table');
        }
        
        // Check for any stored procedures that might be called
        console.log('\n🔍 Checking for stored procedures...');
        const [procedures] = await connection.execute(`
            SELECT 
                ROUTINE_NAME, 
                ROUTINE_TYPE,
                ROUTINE_DEFINITION
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_SCHEMA = 'seven_four_clothing'
        `);
        
        if (procedures.length > 0) {
            console.log('⚠️ FOUND STORED PROCEDURES:');
            procedures.forEach(proc => {
                console.log(`- ${proc.ROUTINE_NAME} (${proc.ROUTINE_TYPE})`);
                if (proc.ROUTINE_DEFINITION && proc.ROUTINE_DEFINITION.includes('customer_fullname')) {
                    console.log(`  ⚠️ Contains customer_fullname: ${proc.ROUTINE_DEFINITION.substring(0, 200)}...`);
                }
            });
        } else {
            console.log('✅ No stored procedures found');
        }
        
        // Check for any foreign key constraints that might have ON UPDATE triggers
        console.log('\n🔍 Checking for complex foreign key constraints...');
        const [fks] = await connection.execute(`
            SELECT 
                CONSTRAINT_NAME,
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME,
                UPDATE_RULE,
                DELETE_RULE
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = 'seven_four_clothing'
            AND (REFERENCED_TABLE_NAME = 'orders' OR TABLE_NAME = 'orders')
        `);
        
        if (fks.length > 0) {
            console.log('📋 Foreign key constraints involving orders table:');
            fks.forEach(fk => {
                console.log(`- ${fk.CONSTRAINT_NAME}: ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
                console.log(`  Update: ${fk.UPDATE_RULE}, Delete: ${fk.DELETE_RULE}`);
            });
        }
        
        // Check for any views that might be involved
        console.log('\n🔍 Checking for views involving orders...');
        const [views] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                VIEW_DEFINITION
            FROM INFORMATION_SCHEMA.VIEWS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing'
            AND VIEW_DEFINITION LIKE '%orders%'
        `);
        
        if (views.length > 0) {
            console.log('📊 Views involving orders:');
            views.forEach(view => {
                console.log(`- ${view.TABLE_NAME}`);
                if (view.VIEW_DEFINITION.includes('customer_fullname')) {
                    console.log(`  ⚠️ Contains customer_fullname reference`);
                }
            });
        }

        console.log('\n🎯 RECOMMENDATION:');
        console.log('Start the server and try to create an order while monitoring the console output.');
        console.log('The error should show up in the server logs with the exact SQL statement that is failing.');

    } catch (error) {
        console.error('❌ Monitoring failed:', error);
    } finally {
        await connection.end();
    }
}

monitorOrderCreation().catch(console.error);
