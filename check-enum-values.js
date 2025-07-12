const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function getStatusEnumValues() {
    console.log('=== CHECKING STATUS ENUM VALUES ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Get the ENUM values for status column
        const [columns] = await connection.execute(`
            SHOW COLUMNS FROM custom_orders LIKE 'status'
        `);
        
        if (columns.length > 0) {
            console.log('📋 Status column details:');
            console.log('Type:', columns[0].Type);
            
            // Extract ENUM values
            const enumMatch = columns[0].Type.match(/enum\((.+)\)/);
            if (enumMatch) {
                const enumValues = enumMatch[1].split(',').map(v => v.replace(/'/g, '').trim());
                console.log('\n✅ Valid status values:');
                enumValues.forEach((value, index) => {
                    console.log(`${index + 1}. "${value}"`);
                });
                
                console.log('\n🔍 Analysis:');
                console.log('- "received" is included:', enumValues.includes('received') ? 'YES' : 'NO');
                console.log('- "delivered" is included:', enumValues.includes('delivered') ? 'YES' : 'NO');
                
                if (!enumValues.includes('received')) {
                    console.log('\n💡 Recommendation:');
                    console.log('Since "received" is not a valid status, we should:');
                    console.log('1. Keep status as "delivered" (no change needed)');
                    console.log('2. Only update delivery_status to "received" or similar');
                    console.log('3. Or use a different status like "completed"');
                }
            }
        }
        
        // Also check delivery_status enum values
        const [deliveryColumns] = await connection.execute(`
            SHOW COLUMNS FROM custom_orders LIKE 'delivery_status'
        `);
        
        if (deliveryColumns.length > 0) {
            console.log('\n📦 Delivery status column details:');
            console.log('Type:', deliveryColumns[0].Type);
            
            const enumMatch = deliveryColumns[0].Type.match(/enum\((.+)\)/);
            if (enumMatch) {
                const enumValues = enumMatch[1].split(',').map(v => v.replace(/'/g, '').trim());
                console.log('\n✅ Valid delivery_status values:');
                enumValues.forEach((value, index) => {
                    console.log(`${index + 1}. "${value}"`);
                });
                
                console.log('\n🔍 Analysis:');
                console.log('- "received" is included:', enumValues.includes('received') ? 'YES' : 'NO');
                console.log('- "delivered" is included:', enumValues.includes('delivered') ? 'YES' : 'NO');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

getStatusEnumValues();
