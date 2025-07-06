const mysql = require('mysql2/promise');

async function finalDebugOrdersTable() {
    console.log('🔍 FINAL DEBUG - Orders Table Analysis');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // Check orders table structure in detail
        console.log('\n📊 ORDERS TABLE STRUCTURE:');
        const [columns] = await connection.execute('DESCRIBE orders');
        columns.forEach(col => {
            console.log(`${col.Field} | Type: ${col.Type} | Null: ${col.Null} | Default: ${col.Default}`);
        });

        // Check if there are any customer-related columns
        console.log('\n🔍 CUSTOMER-RELATED COLUMNS:');
        const customerCols = columns.filter(col => 
            col.Field.toLowerCase().includes('customer') || 
            col.Field.toLowerCase().includes('name') ||
            col.Field.toLowerCase().includes('fullname')
        );
        
        if (customerCols.length === 0) {
            console.log('❌ NO customer-related columns found in orders table!');
        } else {
            customerCols.forEach(col => console.log(`Found: ${col.Field}`));
        }

        // Test a simple INSERT with only required fields
        console.log('\n🧪 TESTING MINIMAL INSERT:');
        try {
            const testOrderNumber = `TEST_${Date.now()}`;
            await connection.execute(`
                INSERT INTO orders (
                    order_number, user_id, total_amount
                ) VALUES (?, ?, ?)
            `, [testOrderNumber, 1, 100.00]);
            
            console.log('✅ Minimal INSERT successful!');
            
            // Clean up test record
            await connection.execute('DELETE FROM orders WHERE order_number = ?', [testOrderNumber]);
            console.log('🧹 Test record cleaned up');
            
        } catch (insertError) {
            console.log('❌ Minimal INSERT failed:', insertError.message);
        }

        // Let's also check what the actual INSERT statements look like in the server code
        console.log('\n📝 Analyzing what fields are actually needed for order creation...');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

finalDebugOrdersTable().catch(console.error);
