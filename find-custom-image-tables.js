const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function findCustomOrderImageTables() {
    try {
        console.log('🔍 Searching for custom order image tables...');
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check for tables related to custom orders and images
        const [tables] = await connection.execute("SHOW TABLES");
        
        console.log('\n📋 All tables in database:');
        const allTables = tables.map(table => Object.values(table)[0]);
        allTables.forEach(table => {
            if (table.toLowerCase().includes('custom') || table.toLowerCase().includes('image')) {
                console.log(`  📊 ${table} (relevant for custom/images)`);
            } else {
                console.log(`  - ${table}`);
            }
        });
        
        // Check for custom order image table specifically
        const customImageTables = allTables.filter(table => 
            table.toLowerCase().includes('custom') && table.toLowerCase().includes('image')
        );
        
        if (customImageTables.length > 0) {
            for (const tableName of customImageTables) {
                console.log(`\n🖼️ Checking ${tableName} table structure:`);
                const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
                columns.forEach(column => {
                    console.log(`  - ${column.Field}: ${column.Type}`);
                });
                
                // Get sample data
                const [samples] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
                console.log(`\n📊 Sample data from ${tableName}:`);
                samples.forEach((row, index) => {
                    console.log(`   Row ${index + 1}:`, row);
                });
            }
        } else {
            console.log('\n❌ No custom order image tables found');
            
            // Check if there are any custom_orders referenced in cancellation_requests
            console.log('\n🔍 Checking cancellation requests for custom orders:');
            const [cancellations] = await connection.execute(`
                SELECT cr.id, o.order_number 
                FROM cancellation_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                WHERE o.order_number LIKE 'CUSTOM%'
                LIMIT 5
            `);
            
            console.log(`Found ${cancellations.length} custom order cancellation requests:`);
            cancellations.forEach(req => {
                console.log(`  - ID: ${req.id}, Order: ${req.order_number}`);
            });
        }
        
        await connection.end();
        console.log('\n✅ Search completed!');
        
    } catch (error) {
        console.error('❌ Error searching for custom order image tables:', error);
    }
}

findCustomOrderImageTables();
