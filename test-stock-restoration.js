const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function testStockRestoration() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🔍 Testing stock restoration after order cancellation...');
        
        // Get the "Strive Forward" product
        const [products] = await connection.execute(`
            SELECT product_id, productname, total_available_stock, total_reserved_stock, total_stock
            FROM products 
            WHERE productname LIKE '%Strive Forward%' OR productname LIKE '%SF%'
            LIMIT 1
        `);
        
        if (products.length === 0) {
            console.log('❌ No Strive Forward product found');
            await connection.end();
            return;
        }
        
        const product = products[0];
        console.log('📦 Product found:', {
            id: product.product_id,
            name: product.productname,
            total_stock: product.total_stock,
            available: product.total_available_stock,
            reserved: product.total_reserved_stock
        });
        
        // Get the variant stock for Large/Black
        const [variants] = await connection.execute(`
            SELECT size, color, stock_quantity, available_quantity, reserved_quantity
            FROM product_variants 
            WHERE product_id = ?
            ORDER BY size, color
        `, [product.product_id]);
        
        console.log('🎨 Current variants:');
        variants.forEach(variant => {
            console.log(`  ${variant.size}/${variant.color}: Stock: ${variant.stock_quantity}, Available: ${variant.available_quantity}, Reserved: ${variant.reserved_quantity}`);
        });
        
        // Check recent stock movements
        const [movements] = await connection.execute(`
            SELECT movement_type, quantity, size, reason, reference_number, notes, created_at
            FROM stock_movements 
            WHERE product_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [product.product_id]);
        
        console.log('📊 Recent stock movements:');
        movements.forEach(movement => {
            console.log(`  ${movement.created_at}: ${movement.movement_type} ${movement.quantity} (${movement.size}) - ${movement.reason} (Ref: ${movement.reference_number})`);
            if (movement.notes) console.log(`    Note: ${movement.notes}`);
        });
        
        // Check recent cancellation approvals
        const [cancellations] = await connection.execute(`
            SELECT cr.*, o.order_number, o.status as order_status
            FROM cancellation_requests cr
            JOIN orders o ON cr.order_id = o.id
            WHERE cr.status = 'approved'
            ORDER BY cr.processed_at DESC
            LIMIT 5
        `);
        
        console.log('✅ Recent approved cancellations:');
        cancellations.forEach(cancel => {
            console.log(`  Order ${cancel.order_number}: Approved at ${cancel.processed_at} (Order status: ${cancel.order_status})`);
        });
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testStockRestoration();
