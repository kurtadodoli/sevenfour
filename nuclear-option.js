// NUCLEAR OPTION: Remove customer_fullname column completely
const mysql = require('mysql2/promise');

async function removeCustomerFullnameColumn() {
    console.log('💥 NUCLEAR OPTION: Removing customer_fullname column completely\n');
    
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*', 
            database: 'seven_four_clothing'
        });
        
        console.log('✅ Connected to database');
        
        // Check if column exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND TABLE_NAME = 'orders' 
            AND COLUMN_NAME = 'customer_fullname'
        `);
        
        if (columns.length > 0) {
            console.log('⚠️ customer_fullname column found. REMOVING IT...');
            
            await connection.execute('ALTER TABLE orders DROP COLUMN customer_fullname');
            console.log('✅ customer_fullname column REMOVED!');
            
        } else {
            console.log('✅ customer_fullname column does not exist - nothing to remove');
        }
        
        // Verify removal
        const [finalCheck] = await connection.execute('DESCRIBE orders');
        const stillExists = finalCheck.find(col => col.Field === 'customer_fullname');
        
        if (stillExists) {
            console.log('❌ Column still exists after removal attempt');
        } else {
            console.log('✅ CONFIRMED: customer_fullname column is GONE');
        }
        
        // Test insert
        console.log('\n🧪 Testing order creation...');
        const testId = `NUCLEAR_TEST_${Date.now()}`;
        
        try {
            await connection.execute(`
                INSERT INTO orders (order_number, user_id, total_amount, status, created_at) 
                VALUES (?, 1, 100.00, 'pending', NOW())
            `, [testId]);
            
            console.log('✅ ORDER CREATION WORKS!');
            
            // Clean up
            await connection.execute('DELETE FROM orders WHERE order_number = ?', [testId]);
            
        } catch (testError) {
            console.log('❌ Order creation still fails:', testError.message);
        }
        
        await connection.end();
        
        console.log('\n🎉 NUCLEAR OPTION COMPLETE!');
        console.log('The customer_fullname column has been eliminated.');
        console.log('Restart your server and try creating an order.');
        
    } catch (error) {
        console.error('❌ Nuclear option failed:', error.message);
    }
}

removeCustomerFullnameColumn();
