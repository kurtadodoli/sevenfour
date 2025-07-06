const mysql = require('mysql2/promise');

async function forceDatabaseSchemaFix() {
    console.log('=== FORCE DATABASE SCHEMA FIX ===');
    
    let connection;
    
    try {
        // Try multiple common MySQL configurations
        const configs = [
            {
                host: 'localhost',
                user: 'root',
                password: 's3v3n-f0ur-cl0thing*',
                database: 'seven_four_clothing',
                port: 3306
            },
            {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'seven_four_clothing',
                port: 3306
            },
            {
                host: '127.0.0.1',
                user: 'root',
                password: 's3v3n-f0ur-cl0thing*',
                database: 'seven_four_clothing',
                port: 3306
            }
        ];
        
        for (const config of configs) {
            try {
                console.log(`Trying to connect with: ${config.user}@${config.host}:${config.port}/${config.database}`);
                connection = await mysql.createConnection(config);
                console.log('✅ Connected successfully!');
                break;
            } catch (err) {
                console.log(`❌ Failed: ${err.message}`);
                continue;
            }
        }
        
        if (!connection) {
            throw new Error('Could not connect to database with any configuration');
        }
        
        // Check if orders table exists
        console.log('\n--- Checking orders table ---');
        const [tables] = await connection.execute(`SHOW TABLES LIKE 'orders'`);
        
        if (tables.length === 0) {
            throw new Error('Orders table does not exist');
        }
        
        console.log('✅ Orders table exists');
        
        // Get current table structure
        console.log('\n--- Current table structure ---');
        const [columns] = await connection.execute(`DESCRIBE orders`);
        
        console.log('Current columns:');
        columns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type}, Null: ${col.Null}, Default: ${col.Default}`);
        });
        
        // Check if customer_fullname exists
        const customerFullnameExists = columns.find(col => col.Field === 'customer_fullname');
        
        if (!customerFullnameExists) {
            console.log('\n--- Adding customer_fullname column ---');
            await connection.execute(`
                ALTER TABLE orders 
                ADD COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer'
            `);
            console.log('✅ Added customer_fullname column');
        } else {
            console.log('\n--- Updating customer_fullname column ---');
            await connection.execute(`
                ALTER TABLE orders 
                MODIFY COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer'
            `);
            console.log('✅ Updated customer_fullname column');
        }
        
        // Double-check the fix
        console.log('\n--- Verifying fix ---');
        const [newColumns] = await connection.execute(`DESCRIBE orders`);
        const customerCol = newColumns.find(col => col.Field === 'customer_fullname');
        
        if (customerCol) {
            console.log(`✅ customer_fullname: ${customerCol.Type}, Null: ${customerCol.Null}, Default: ${customerCol.Default}`);
        } else {
            console.log('❌ customer_fullname column still missing');
        }
        
        // Test insert to ensure it works
        console.log('\n--- Testing insert ---');
        try {
            const testOrderId = `TEST_${Date.now()}`;
            await connection.execute(`
                INSERT INTO orders (order_number, user_id, total_amount, status) 
                VALUES (?, 1, 100.00, 'pending')
            `, [testOrderId]);
            console.log('✅ Test insert successful');
            
            // Clean up
            await connection.execute(`DELETE FROM orders WHERE order_number = ?`, [testOrderId]);
            console.log('✅ Test record cleaned up');
        } catch (testError) {
            console.log('❌ Test insert failed:', testError.message);
        }
        
        console.log('\n=== DATABASE SCHEMA FIX COMPLETE ===');
        
    } catch (error) {
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 MySQL is not running. Please start MySQL first:');
            console.log('   - Open Services (services.msc)');
            console.log('   - Find MySQL service and start it');
            console.log('   - Or run: net start mysql');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Database credentials are incorrect.');
            console.log('   Check the password in server/.env');
        }
        
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

forceDatabaseSchemaFix();
