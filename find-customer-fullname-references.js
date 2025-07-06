const mysql = require('mysql2/promise');

async function findCustomerFullnameReferences() {
    console.log('🕵️ SEARCHING FOR ALL customer_fullname REFERENCES IN DATABASE');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // Check ALL tables for any customer_fullname column
        console.log('\n1. 🔍 Searching ALL tables for customer_fullname column...');
        const [allTables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'seven_four_clothing'
        `);
        
        for (const table of allTables) {
            const tableName = table.TABLE_NAME;
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'seven_four_clothing' 
                AND TABLE_NAME = '${tableName}'
                AND COLUMN_NAME = 'customer_fullname'
            `);
            
            if (columns.length > 0) {
                console.log(`🚨 FOUND customer_fullname in table: ${tableName}`);
                columns.forEach(col => {
                    console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}, Nullable: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT}`);
                });
            }
        }
        
        // Check for any tables with similar column names
        console.log('\n2. 🔍 Searching for similar customer-related columns...');
        const [customerColumns] = await connection.execute(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND (COLUMN_NAME LIKE '%customer%' OR COLUMN_NAME LIKE '%fullname%' OR COLUMN_NAME LIKE '%full_name%')
            ORDER BY TABLE_NAME, COLUMN_NAME
        `);
        
        if (customerColumns.length > 0) {
            console.log('Customer/fullname related columns found:');
            customerColumns.forEach(col => {
                console.log(`- ${col.TABLE_NAME}.${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
            });
        }
        
        // Check if we're connected to the right database
        console.log('\n3. 🔍 Database connection verification...');
        const [currentDb] = await connection.execute('SELECT DATABASE() as current_database');
        console.log(`Current database: ${currentDb[0].current_database}`);
        
        // List all databases to make sure we're not connecting to a different one
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('Available databases:');
        databases.forEach(db => {
            const indicator = db.Database === currentDb[0].current_database ? '👈 ' : '   ';
            console.log(`${indicator}${db.Database}`);
        });

        // Final conclusion
        console.log('\n🎯 CONCLUSION:');
        if (customerColumns.filter(col => col.COLUMN_NAME === 'customer_fullname').length === 0) {
            console.log('✅ NO customer_fullname column exists in ANY table in this database');
            console.log('📝 This means the error is coming from:');
            console.log('   1. A different database connection');
            console.log('   2. Code that is trying to INSERT/UPDATE a non-existent column');
            console.log('   3. Cached code or a background process');
            console.log('   4. A different server instance running old code');
        }

    } catch (error) {
        console.error('❌ Error searching database:', error);
    } finally {
        await connection.end();
    }
}

findCustomerFullnameReferences().catch(console.error);
