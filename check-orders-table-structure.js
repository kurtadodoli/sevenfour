const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkOrdersTableStructure() {
    console.log('🔍 Checking Orders Table Structure');
    console.log('==================================');

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Check if orders table exists and its structure
        console.log('📋 Describing orders table structure...');
        
        try {
            const [columns] = await connection.execute('DESCRIBE orders');
            
            console.log('✅ Orders table structure:');
            columns.forEach((col, index) => {
                console.log(`   ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'Nullable' : 'Not Null'}`);
            });
            
            // Check for user-related columns
            const userColumns = columns.filter(col => 
                col.Field.toLowerCase().includes('user') || 
                col.Field.toLowerCase().includes('customer')
            );
            
            console.log('\n🔍 User/Customer related columns:');
            if (userColumns.length === 0) {
                console.log('   ❌ No user/customer columns found');
            } else {
                userColumns.forEach(col => {
                    console.log(`   ✅ ${col.Field} (${col.Type})`);
                });
            }
            
        } catch (tableError) {
            console.log('❌ Orders table does not exist or cannot be accessed');
            console.log('Error:', tableError.message);
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error checking table structure:', error.message);
    }
}

checkOrdersTableStructure();
