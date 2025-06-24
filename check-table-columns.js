const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkTableColumns() {
    console.log('🔍 Checking Table Columns for User Relations');
    console.log('============================================');

    try {
        const connection = await mysql.createConnection(dbConfig);

        const tablesToCheck = ['orders', 'custom_orders', 'custom_designs', 'user_addresses', 'user_sessions'];

        for (const tableName of tablesToCheck) {
            try {
                console.log(`\n📋 Checking ${tableName} table...`);
                const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
                
                const userColumns = columns.filter(col => 
                    col.Field.toLowerCase().includes('user') || 
                    col.Field.toLowerCase().includes('customer')
                );
                
                if (userColumns.length === 0) {
                    console.log(`   ❌ No user/customer columns found in ${tableName}`);
                } else {
                    userColumns.forEach(col => {
                        console.log(`   ✅ ${col.Field} (${col.Type})`);
                    });
                }
                
            } catch (tableError) {
                console.log(`   ❌ Table ${tableName} does not exist`);
            }
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error checking tables:', error.message);
    }
}

checkTableColumns();
