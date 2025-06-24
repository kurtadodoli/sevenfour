const mysql = require('mysql2/promise');

async function checkCustomDesignsStructure() {
    console.log('🔍 Checking custom_designs table structure for delivery status...\n');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Check table structure
        const [structure] = await connection.execute('DESCRIBE custom_designs');
        console.log('🗃️ Custom_designs table structure:');
        console.table(structure);
        
        // Check for delivery status related fields
        const deliveryFields = structure.filter(field => 
            field.Field.includes('delivery') || 
            field.Field.includes('status')
        );
        
        console.log('\n📋 Status/Delivery related fields:');
        console.table(deliveryFields);
        
        // Check what status values are currently used
        const [statusValues] = await connection.execute(`
            SELECT DISTINCT status FROM custom_designs ORDER BY status
        `);
        
        console.log('\n📊 Current status values in use:');
        statusValues.forEach(row => {
            console.log(`  - ${row.status}`);
        });
        
        // Check sample data
        const [sampleData] = await connection.execute(`
            SELECT design_id, status, created_at FROM custom_designs 
            ORDER BY created_at DESC LIMIT 5
        `);
        
        console.log('\n📄 Sample custom design data:');
        console.table(sampleData);
        
    } catch (error) {
        console.error('❌ Error checking custom_designs structure:', error.message);
    } finally {
        await connection.end();
    }
}

checkCustomDesignsStructure();
