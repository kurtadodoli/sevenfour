const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function addSaleColumns() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('Adding sale columns to products table...');
        
        // Check if columns already exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME IN ('is_on_sale', 'sale_discount_percentage', 'sale_start_date', 'sale_end_date')
        `, [dbConfig.database]);
        
        const existingColumns = columns.map(row => row.COLUMN_NAME);
        console.log('Existing sale columns:', existingColumns);
        
        // Add missing columns
        if (!existingColumns.includes('is_on_sale')) {
            await connection.execute('ALTER TABLE products ADD COLUMN is_on_sale BOOLEAN DEFAULT FALSE');
            console.log('✅ Added is_on_sale column');
        } else {
            console.log('ℹ️ is_on_sale column already exists');
        }
        
        if (!existingColumns.includes('sale_discount_percentage')) {
            await connection.execute('ALTER TABLE products ADD COLUMN sale_discount_percentage DECIMAL(5,2) NULL');
            console.log('✅ Added sale_discount_percentage column');
        } else {
            console.log('ℹ️ sale_discount_percentage column already exists');
        }
        
        if (!existingColumns.includes('sale_start_date')) {
            await connection.execute('ALTER TABLE products ADD COLUMN sale_start_date DATE NULL');
            console.log('✅ Added sale_start_date column');
        } else {
            console.log('ℹ️ sale_start_date column already exists');
        }
        
        if (!existingColumns.includes('sale_end_date')) {
            await connection.execute('ALTER TABLE products ADD COLUMN sale_end_date DATE NULL');
            console.log('✅ Added sale_end_date column');
        } else {
            console.log('ℹ️ sale_end_date column already exists');
        }
        
        // Create index if it doesn't exist
        try {
            await connection.execute('CREATE INDEX idx_products_sale ON products(is_on_sale, sale_start_date, sale_end_date)');
            console.log('✅ Created sale index');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ Sale index already exists');
            } else {
                console.error('Error creating index:', error.message);
            }
        }
        
        await connection.end();
        console.log('✅ Database schema updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating database schema:', error);
        process.exit(1);
    }
}

addSaleColumns();
