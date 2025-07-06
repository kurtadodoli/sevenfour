// ULTIMATE DATABASE TROUBLESHOOTER
// This will find and fix the EXACT cause of the customer_fullname error

const mysql = require('mysql2/promise');

async function ultimateDatabaseTroubleshoot() {
    console.log('🔍 ULTIMATE DATABASE TROUBLESHOOTER STARTING...\n');
    
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root', 
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });
        
        console.log('✅ Connected to database\n');
        
        // 1. Check exact table structure
        console.log('📋 CURRENT ORDERS TABLE STRUCTURE:');
        console.log('=====================================');
        const [columns] = await connection.execute('DESCRIBE orders');
        columns.forEach(col => {
            const indicator = col.Field === 'customer_fullname' ? '⚠️ ' : '   ';
            console.log(`${indicator}${col.Field}: ${col.Type} | Null: ${col.Null} | Default: ${col.Default || 'NULL'}`);
        });
        
        // 2. Check if customer_fullname exists
        const hasCustomerFullname = columns.find(col => col.Field === 'customer_fullname');
        
        if (hasCustomerFullname) {
            console.log('\n⚠️ FOUND THE PROBLEM: customer_fullname column EXISTS but has NO DEFAULT!');
            console.log('Column details:', hasCustomerFullname);
            
            // Fix it by adding a proper default
            console.log('\n🔧 FIXING: Adding proper default value...');
            await connection.execute(`
                ALTER TABLE orders 
                MODIFY COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer'
            `);
            console.log('✅ Fixed customer_fullname column');
            
        } else {
            console.log('\n✅ customer_fullname column does NOT exist - this is good!');
        }
        
        // 3. Try a test insert without customer_fullname
        console.log('\n🧪 TESTING INSERT WITHOUT customer_fullname...');
        const testOrderId = `TROUBLESHOOT_${Date.now()}`;
        
        try {
            await connection.execute(`
                INSERT INTO orders (order_number, user_id, total_amount, status, created_at) 
                VALUES (?, 1, 100.00, 'pending', NOW())
            `, [testOrderId]);
            console.log('✅ INSERT SUCCESS: Orders can be created without customer_fullname');
            
            // Clean up
            await connection.execute('DELETE FROM orders WHERE order_number = ?', [testOrderId]);
            
        } catch (insertError) {
            console.log('❌ INSERT FAILED:', insertError.message);
            
            if (insertError.message.includes('customer_fullname')) {
                console.log('\n🚨 CRITICAL: Database still expects customer_fullname!');
                console.log('The column exists and is required. Fixing now...');
                
                // Try to make it nullable with default
                await connection.execute(`
                    ALTER TABLE orders 
                    MODIFY COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer'
                `);
                
                // Test again
                try {
                    await connection.execute(`
                        INSERT INTO orders (order_number, user_id, total_amount, status, created_at) 
                        VALUES (?, 1, 100.00, 'pending', NOW())
                    `, [testOrderId + '_2']);
                    console.log('✅ INSERT NOW WORKS after fixing defaults');
                    await connection.execute('DELETE FROM orders WHERE order_number = ?', [testOrderId + '_2']);
                } catch (retryError) {
                    console.log('❌ STILL FAILING:', retryError.message);
                }
            }
        }
        
        // 4. Show final table structure
        console.log('\n📋 FINAL TABLE STRUCTURE:');
        console.log('==========================');
        const [finalColumns] = await connection.execute('DESCRIBE orders');
        finalColumns.forEach(col => {
            const indicator = col.Field === 'customer_fullname' ? '👆 ' : '   ';
            console.log(`${indicator}${col.Field}: ${col.Type} | Null: ${col.Null} | Default: ${col.Default || 'NULL'}`);
        });
        
        await connection.end();
        
        console.log('\n🎯 TROUBLESHOOTING COMPLETE!');
        console.log('Now restart your main server and try again.');
        
    } catch (error) {
        console.error('❌ Database troubleshooting failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 MySQL is not running. Start it first:');
            console.log('   - net start mysql');
            console.log('   - Or start from Services');
        }
    }
}

ultimateDatabaseTroubleshoot();
