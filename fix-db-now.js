const mysql = require('mysql2/promise');

async function fixDatabase() {
    console.log('🔧 FIXING DATABASE SCHEMA...\n');
    
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });
        
        console.log('✅ Connected to MySQL database');
        
        // Check current table structure
        console.log('\n📋 Current orders table structure:');
        const [columns] = await connection.execute('DESCRIBE orders');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} | Null: ${col.Null} | Default: ${col.Default}`);
        });
        
        // Check if customer_fullname exists
        const hasCustomerFullname = columns.some(col => col.Field === 'customer_fullname');
        
        if (hasCustomerFullname) {
            console.log('\n⚠️ customer_fullname column already exists, updating it...');
            await connection.execute(`
                ALTER TABLE orders 
                MODIFY COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer'
            `);
            console.log('✅ Updated customer_fullname column');
        } else {
            console.log('\n➕ Adding customer_fullname column...');
            await connection.execute(`
                ALTER TABLE orders 
                ADD COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer'
            `);
            console.log('✅ Added customer_fullname column');
        }
        
        // Verify the fix
        console.log('\n🔍 Verifying fix...');
        const [newColumns] = await connection.execute('DESCRIBE orders');
        const customerCol = newColumns.find(col => col.Field === 'customer_fullname');
        
        if (customerCol) {
            console.log(`✅ customer_fullname: ${customerCol.Type} | Null: ${customerCol.Null} | Default: ${customerCol.Default}`);
        }
        
        // Test insert
        console.log('\n🧪 Testing insert...');
        const testOrderId = `TEST_${Date.now()}`;
        await connection.execute(`
            INSERT INTO orders (order_number, user_id, total_amount, status) 
            VALUES (?, 1, 100.00, 'pending')
        `, [testOrderId]);
        
        console.log('✅ Test insert successful');
        
        // Clean up test
        await connection.execute('DELETE FROM orders WHERE order_number = ?', [testOrderId]);
        console.log('✅ Test record cleaned up');
        
        await connection.end();
        console.log('\n🎉 DATABASE FIX COMPLETE!');
        console.log('Now restart your server and try creating an order.');
        
    } catch (error) {
        console.error('❌ Database fix failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 MySQL server is not running. Try:');
            console.log('   - net start mysql');
            console.log('   - net start mysql80');
            console.log('   - Or start MySQL from Services');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Access denied. Check:');
            console.log('   - Username: root');
            console.log('   - Password: s3v3n-f0ur-cl0thing*');
        }
    }
}

fixDatabase();
