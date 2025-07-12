const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testStockDeduction() {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🧪 === TESTING STOCK DEDUCTION LOGIC ===');
    
    // Get current state of Lightning Mesh Shorts
    const productId = '554415049535';
    const size = 'S';
    const color = 'Blue';
    const testQuantity = 2;
    
    console.log(`\n📊 BEFORE TEST - Product ${productId} ${size} ${color}:`);
    
    // Check current variant stock
    const [beforeVariant] = await connection.execute(`
        SELECT available_quantity, stock_quantity, reserved_quantity
        FROM product_variants 
        WHERE product_id = ? AND size = ? AND color = ?
    `, [productId, size, color]);
    
    if (beforeVariant.length > 0) {
        console.log(`Variant stock: Available=${beforeVariant[0].available_quantity}, Stock=${beforeVariant[0].stock_quantity}, Reserved=${beforeVariant[0].reserved_quantity}`);
    } else {
        console.log('❌ No variant found');
        await connection.end();
        return;
    }
    
    // Check current sizes JSON
    const [beforeProduct] = await connection.execute('SELECT sizes, total_available_stock FROM products WHERE product_id = ?', [productId]);
    
    if (beforeProduct.length > 0) {
        console.log(`Total available stock: ${beforeProduct[0].total_available_stock}`);
        if (beforeProduct[0].sizes) {
            const sizes = JSON.parse(beforeProduct[0].sizes);
            const sizeObj = sizes.find(s => s.size === size);
            if (sizeObj) {
                const colorStock = sizeObj.colorStocks.find(c => c.color === color);
                if (colorStock) {
                    console.log(`Sizes JSON stock: ${colorStock.stock}`);
                }
            }
        }
    }
    
    console.log(`\n🔄 SIMULATING STOCK DEDUCTION OF ${testQuantity} UNITS...`);
    
    await connection.beginTransaction();
    
    try {
        // 1. Deduct from variant stock
        const [variantResult] = await connection.execute(`
            UPDATE product_variants 
            SET available_quantity = available_quantity - ?,
                stock_quantity = stock_quantity - ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE product_id = ? AND size = ? AND color = ? AND available_quantity >= ?
        `, [testQuantity, testQuantity, productId, size, color, testQuantity]);
        
        console.log(`✅ Variant deduction affected ${variantResult.affectedRows} rows`);
        
        if (variantResult.affectedRows > 0) {
            // 2. Update sizes JSON
            const [productData] = await connection.execute('SELECT sizes FROM products WHERE product_id = ?', [productId]);
            
            if (productData.length > 0 && productData[0].sizes) {
                try {
                    const sizesData = JSON.parse(productData[0].sizes);
                    console.log('📝 Current sizes JSON:', JSON.stringify(sizesData, null, 2));
                    
                    // Find and update the specific size/color stock
                    let updated = false;
                    for (let sizeObj of sizesData) {
                        console.log(`🔍 Checking size: ${sizeObj.size} vs ${size}`);
                        if (sizeObj.size === size) {
                            for (let colorStock of sizeObj.colorStocks) {
                                console.log(`🔍 Checking color: ${colorStock.color} vs ${color}`);
                                if (colorStock.color === color) {
                                    const oldStock = colorStock.stock;
                                    colorStock.stock = Math.max(0, colorStock.stock - testQuantity);
                                    console.log(`📉 Updated ${size} ${color}: ${oldStock} → ${colorStock.stock}`);
                                    updated = true;
                                    break;
                                }
                            }
                            if (updated) break;
                        }
                    }
                    
                    if (updated) {
                        // Update the sizes JSON in products table
                        await connection.execute(
                            'UPDATE products SET sizes = ? WHERE product_id = ?',
                            [JSON.stringify(sizesData), productId]
                        );
                        console.log(`✅ Updated sizes JSON for product ${productId}`);
                    } else {
                        console.log('❌ Could not find matching size/color in sizes JSON');
                    }
                } catch (jsonError) {
                    console.error('❌ Error updating sizes JSON:', jsonError);
                }
            }
            
            // 3. Update total available stock
            const [totalUpdate] = await connection.execute(`
                UPDATE products 
                SET total_available_stock = (
                    SELECT COALESCE(SUM(available_quantity), 0) 
                    FROM product_variants 
                    WHERE product_id = ?
                )
                WHERE product_id = ?
            `, [productId, productId]);
            
            console.log(`✅ Updated total stock, affected ${totalUpdate.affectedRows} rows`);
        }
        
        console.log(`\n📊 AFTER TEST - Product ${productId} ${size} ${color}:`);
        
        // Check updated variant stock
        const [afterVariant] = await connection.execute(`
            SELECT available_quantity, stock_quantity, reserved_quantity
            FROM product_variants 
            WHERE product_id = ? AND size = ? AND color = ?
        `, [productId, size, color]);
        
        if (afterVariant.length > 0) {
            console.log(`Variant stock: Available=${afterVariant[0].available_quantity}, Stock=${afterVariant[0].stock_quantity}, Reserved=${afterVariant[0].reserved_quantity}`);
        }
        
        // Check updated sizes JSON
        const [afterProduct] = await connection.execute('SELECT sizes, total_available_stock FROM products WHERE product_id = ?', [productId]);
        
        if (afterProduct.length > 0) {
            console.log(`Total available stock: ${afterProduct[0].total_available_stock}`);
            if (afterProduct[0].sizes) {
                const sizes = JSON.parse(afterProduct[0].sizes);
                const sizeObj = sizes.find(s => s.size === size);
                if (sizeObj) {
                    const colorStock = sizeObj.colorStocks.find(c => c.color === color);
                    if (colorStock) {
                        console.log(`Sizes JSON stock: ${colorStock.stock}`);
                    }
                }
            }
        }
        
        // Rollback the test transaction
        await connection.rollback();
        console.log('\n🔄 Transaction rolled back (this was just a test)');
        
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error during test:', error);
    }
    
    await connection.end();
}

testStockDeduction().catch(console.error);
