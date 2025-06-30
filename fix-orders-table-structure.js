const mysql = require('mysql2/promise');

async function fixOrdersTable() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== CHECKING ORDERS TABLE STRUCTURE ===\n');

        const [columns] = await connection.execute('DESCRIBE orders');
        console.log('Orders table columns:');
        columns.forEach(col => {
            console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Default}`);
        });

        console.log('\n=== ADDING MISSING COLUMNS ===\n');

        // Check if delivery_status column exists
        const hasDeliveryStatus = columns.some(col => col.Field === 'delivery_status');
        const hasScheduledDeliveryDate = columns.some(col => col.Field === 'scheduled_delivery_date');
        const hasDeliveryNotes = columns.some(col => col.Field === 'delivery_notes');

        if (!hasDeliveryStatus) {
            console.log('Adding delivery_status column...');
            await connection.execute(`
                ALTER TABLE orders 
                ADD COLUMN delivery_status VARCHAR(50) DEFAULT NULL 
                AFTER status
            `);
            console.log('✅ delivery_status column added');
        } else {
            console.log('✅ delivery_status column already exists');
        }

        if (!hasScheduledDeliveryDate) {
            console.log('Adding scheduled_delivery_date column...');
            await connection.execute(`
                ALTER TABLE orders 
                ADD COLUMN scheduled_delivery_date DATE DEFAULT NULL 
                AFTER delivery_status
            `);
            console.log('✅ scheduled_delivery_date column added');
        } else {
            console.log('✅ scheduled_delivery_date column already exists');
        }

        if (!hasDeliveryNotes) {
            console.log('Adding delivery_notes column...');
            await connection.execute(`
                ALTER TABLE orders 
                ADD COLUMN delivery_notes TEXT DEFAULT NULL 
                AFTER scheduled_delivery_date
            `);
            console.log('✅ delivery_notes column added');
        } else {
            console.log('✅ delivery_notes column already exists');
        }

        // Verify final structure
        console.log('\n=== FINAL TABLE STRUCTURE ===\n');
        const [finalColumns] = await connection.execute('DESCRIBE orders');
        finalColumns.forEach(col => {
            console.log(`  ${col.Field} - ${col.Type}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

fixOrdersTable();
