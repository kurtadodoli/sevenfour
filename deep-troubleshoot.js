const mysql = require('mysql2/promise');

async function deepTroubleshoot() {
    console.log('🔍 DEEP TROUBLESHOOTING - Finding the source of customer_fullname error');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // 1. Check current table structure
        console.log('\n1. Current orders table structure:');
        const [columns] = await connection.execute('DESCRIBE orders');
        console.log(columns.map(col => `${col.Field} (${col.Type}) - Default: ${col.Default}, Null: ${col.Null}`));
        
        // 2. Check for triggers
        console.log('\n2. Checking for triggers on orders table:');
        const [triggers] = await connection.execute(`
            SELECT TRIGGER_NAME, EVENT_MANIPULATION, ACTION_TIMING, ACTION_STATEMENT 
            FROM information_schema.TRIGGERS 
            WHERE EVENT_OBJECT_TABLE = 'orders' 
            AND EVENT_OBJECT_SCHEMA = DATABASE()
        `);
        console.log('Triggers found:', triggers);
        
        // 3. Check for views
        console.log('\n3. Checking for views involving orders table:');
        const [views] = await connection.execute(`
            SELECT TABLE_NAME, VIEW_DEFINITION 
            FROM information_schema.VIEWS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND VIEW_DEFINITION LIKE '%orders%'
        `);
        console.log('Views found:', views);
        
        // 4. Check for foreign key constraints
        console.log('\n4. Checking foreign key constraints:');
        const [fks] = await connection.execute(`
            SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND (TABLE_NAME = 'orders' OR REFERENCED_TABLE_NAME = 'orders')
        `);
        console.log('Foreign keys found:', fks);
        
        // 5. Try a simple INSERT to see exact error
        console.log('\n5. Testing simple INSERT:');
        try {
            const testInsert = `
                INSERT INTO orders (
                    customer_name, customer_phone, customer_address, 
                    product_id, quantity, unit_price, total_price, 
                    delivery_date, delivery_time, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await connection.execute(testInsert, [
                'Test Customer',
                '1234567890',
                'Test Address',
                1,
                1,
                10.00,
                10.00,
                '2025-07-05',
                '10:00',
                'pending',
                new Date()
            ]);
            console.log('✅ Test INSERT successful');
            
            // Clean up test record
            await connection.execute('DELETE FROM orders WHERE customer_name = ?', ['Test Customer']);
            
        } catch (insertError) {
            console.log('❌ Test INSERT failed:', insertError.message);
            console.log('Full error:', insertError);
        }
        
        // 6. Check if there are any stored procedures
        console.log('\n6. Checking for stored procedures:');
        const [procedures] = await connection.execute(`
            SELECT ROUTINE_NAME, ROUTINE_DEFINITION 
            FROM information_schema.ROUTINES 
            WHERE ROUTINE_SCHEMA = DATABASE() 
            AND ROUTINE_TYPE = 'PROCEDURE'
        `);
        console.log('Stored procedures found:', procedures);
        
        // 7. Check current database name
        console.log('\n7. Current database context:');
        const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
        console.log('Current database:', dbResult[0].current_db);
        
        // 8. List all tables to make sure we're looking at the right place
        console.log('\n8. All tables in current database:');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables:', tables);

    } catch (error) {
        console.error('❌ Error during troubleshooting:', error);
    } finally {
        await connection.end();
    }
}

deepTroubleshoot().catch(console.error);
