const mysql = require('mysql2/promise');

async function addDeliveryStatusToCustomDesigns() {
    console.log('🚀 Adding delivery status support to custom_designs table...\n');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Check if delivery_status column already exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND TABLE_NAME = 'custom_designs' 
            AND COLUMN_NAME = 'delivery_status'
        `);
        
        if (columns.length > 0) {
            console.log('✅ delivery_status column already exists');
        } else {
            // Add delivery_status column
            console.log('📝 Adding delivery_status column...');
            await connection.execute(`
                ALTER TABLE custom_designs 
                ADD COLUMN delivery_status ENUM('pending', 'in_transit', 'delivered', 'delayed') 
                DEFAULT 'pending' 
                AFTER status
            `);
            console.log('✅ delivery_status column added successfully');
        }
        
        // Check if delivery_date column exists
        const [deliveryDateColumns] = await connection.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND TABLE_NAME = 'custom_designs' 
            AND COLUMN_NAME = 'delivery_date'
        `);
        
        if (deliveryDateColumns.length > 0) {
            console.log('✅ delivery_date column already exists');
        } else {
            // Add delivery_date column
            console.log('📝 Adding delivery_date column...');
            await connection.execute(`
                ALTER TABLE custom_designs 
                ADD COLUMN delivery_date DATE NULL 
                AFTER delivery_status
            `);
            console.log('✅ delivery_date column added successfully');
        }
        
        // Check if delivery_notes column exists
        const [deliveryNotesColumns] = await connection.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'seven_four_clothing' 
            AND TABLE_NAME = 'custom_designs' 
            AND COLUMN_NAME = 'delivery_notes'
        `);
        
        if (deliveryNotesColumns.length > 0) {
            console.log('✅ delivery_notes column already exists');
        } else {
            // Add delivery_notes column
            console.log('📝 Adding delivery_notes column...');
            await connection.execute(`
                ALTER TABLE custom_designs 
                ADD COLUMN delivery_notes TEXT NULL 
                AFTER delivery_date
            `);
            console.log('✅ delivery_notes column added successfully');
        }
        
        // Verify the changes
        console.log('\n🔍 Verifying updated table structure...');
        const [updatedStructure] = await connection.execute('DESCRIBE custom_designs');
        const deliveryFields = updatedStructure.filter(field => 
            field.Field.includes('delivery') || field.Field === 'status'
        );
        
        console.log('\n📋 Status and delivery related fields:');
        deliveryFields.forEach(field => {
            console.log(`  ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        // Set initial delivery status for approved designs
        console.log('\n📦 Setting initial delivery status for approved designs...');
        const [updateResult] = await connection.execute(`
            UPDATE custom_designs 
            SET delivery_status = 'pending' 
            WHERE status = 'approved' AND delivery_status IS NULL
        `);
        
        console.log(`✅ Updated ${updateResult.affectedRows} approved designs with pending delivery status`);
        
        console.log('\n🎉 Delivery status support successfully added to custom_designs table!');
        console.log('\nNew capabilities:');
        console.log('  - delivery_status: pending, in_transit, delivered, delayed');
        console.log('  - delivery_date: Scheduled/actual delivery date');
        console.log('  - delivery_notes: Additional delivery information');
        
    } catch (error) {
        console.error('❌ Error adding delivery status support:', error.message);
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ Columns may already exist - checking current structure...');
        }
    } finally {
        await connection.end();
    }
}

addDeliveryStatusToCustomDesigns();
