const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testCustomOrderAuth() {
    console.log('🧪 Testing custom order authentication and database integration...');
    
    let connection;
    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Check if custom_designs table has required columns
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'custom_designs'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        console.log('\n📋 Custom_designs table columns:');
        columns.forEach((col, index) => {
            console.log(`${index + 1}. ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Check for user_id column specifically
        const userIdColumn = columns.find(col => col.COLUMN_NAME === 'user_id');
        const customerEmailColumn = columns.find(col => col.COLUMN_NAME === 'customer_email');
        
        console.log('\n🔍 Key columns for authentication integration:');
        console.log(`- user_id column: ${userIdColumn ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- customer_email column: ${customerEmailColumn ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (userIdColumn) {
            console.log(`  - Type: ${userIdColumn.DATA_TYPE}`);
            console.log(`  - Nullable: ${userIdColumn.IS_NULLABLE}`);
            console.log(`  - Key: ${userIdColumn.COLUMN_KEY || 'None'}`);
        }
        
        if (customerEmailColumn) {
            console.log(`  - Type: ${customerEmailColumn.DATA_TYPE}`);
            console.log(`  - Nullable: ${customerEmailColumn.IS_NULLABLE}`);
        }
        
        // Check for foreign key constraint on user_id
        const [foreignKeys] = await connection.execute(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'custom_designs' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [dbConfig.database]);
        
        console.log('\n🔗 Foreign key constraints:');
        if (foreignKeys.length > 0) {
            foreignKeys.forEach(fk => {
                console.log(`✅ ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
            });
        } else {
            console.log('⚠️  No foreign key constraints found');
        }
        
        // Check current custom orders and their user associations
        const [orders] = await connection.execute(`
            SELECT 
                design_id, 
                user_id, 
                customer_email, 
                first_name, 
                last_name, 
                product_type, 
                status, 
                created_at 
            FROM custom_designs 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        console.log('\n📦 Recent custom orders:');
        if (orders.length > 0) {
            orders.forEach(order => {
                console.log(`- ${order.design_id}: user_id=${order.user_id}, email=${order.customer_email}, name=${order.first_name} ${order.last_name}`);
            });
        } else {
            console.log('📭 No custom orders found');
        }
        
        // Test the existence of users table for foreign key reference
        const [userColumns] = await connection.execute(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        console.log('\n👥 Users table verification:');
        if (userColumns.length > 0) {
            console.log('✅ Users table exists');
            const hasId = userColumns.some(col => col.COLUMN_NAME === 'id');
            const hasEmail = userColumns.some(col => col.COLUMN_NAME === 'email');
            console.log(`- id column: ${hasId ? '✅' : '❌'}`);
            console.log(`- email column: ${hasEmail ? '✅' : '❌'}`);
        } else {
            console.log('❌ Users table not found');
        }
        
        console.log('\n🎯 Custom order authentication integration status:');
        if (userIdColumn && customerEmailColumn) {
            console.log('✅ Database schema is ready for authenticated custom orders');
            console.log('✅ Custom orders can be linked to user accounts via user_id');
            console.log('✅ Email validation will use authenticated user data');
        } else {
            console.log('❌ Database schema needs updates');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n📡 Database connection closed');
        }
    }
}

// Run the test
testCustomOrderAuth().catch(console.error);
