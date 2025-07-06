const mysql = require('mysql2/promise');

async function checkTableSchemas() {
    console.log('📊 CHECKING TABLE SCHEMAS');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // Check users table structure
        console.log('\n👥 USERS TABLE STRUCTURE:');
        const [userColumns] = await connection.execute('DESCRIBE users');
        userColumns.forEach(col => {
            console.log(`${col.Field} | ${col.Type} | Null: ${col.Null} | Default: ${col.Default}`);
        });
        
        // Check orders table structure again
        console.log('\n📦 ORDERS TABLE STRUCTURE:');
        const [orderColumns] = await connection.execute('DESCRIBE orders');
        orderColumns.forEach(col => {
            const indicator = col.Field === 'customer_fullname' ? '⚠️ ' : '   ';
            console.log(`${indicator}${col.Field} | ${col.Type} | Null: ${col.Null} | Default: ${col.Default}`);
        });
        
        // Look for any suspicious hidden columns or anything that might cause issues
        console.log('\n🔍 INFORMATION_SCHEMA CHECK FOR ORDERS:');
        const [infoSchema] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND TABLE_NAME = 'orders'
            AND COLUMN_NAME LIKE '%customer%'
            ORDER BY ORDINAL_POSITION
        `);
        
        if (infoSchema.length > 0) {
            console.log('Customer-related columns found:');
            infoSchema.forEach(col => {
                console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE}, Nullable: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT}`);
            });
        } else {
            console.log('✅ No customer-related columns found in orders table');
        }

    } catch (error) {
        console.error('❌ Error checking schemas:', error);
    } finally {
        await connection.end();
    }
}

checkTableSchemas().catch(console.error);
