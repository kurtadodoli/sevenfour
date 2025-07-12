const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testStockDeduction() {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== TESTING STOCK DEDUCTION LOGIC ===');
    
    // Test values
    const productId = '554415049535'; // Lightning Mesh Shorts
    const size = 'S';
    const color = 'Blue';
    const quantity = 1;
    
    try {
        await connection.beginTransaction();
        
        console.log(`Testing deduction: ${quantity} unit of ${size} ${color}`);
        
        // 1. Check current variant stock
        const [variantStock] = await connection.execute(`
            SELECT available_quantity, stock_quantity
            FROM product_variants 
            WHERE product_id = ? AND size = ? AND color = ?
        `, [productId, size, color]);
        
        if (variantStock.length === 0) {
            throw new Error('Variant not found');
        }
        
        console.log(`Current variant stock: available=${variantStock[0].available_quantity}, total=${variantStock[0].stock_quantity}`);
        
        // 2. Deduct from variant
        const [variantResult] = await connection.execute(`
            UPDATE product_variants 
            SET available_quantity = available_quantity - ?,
                stock_quantity = stock_quantity - ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE product_id = ? AND size = ? AND color = ? AND available_quantity >= ?
        `, [quantity, quantity, productId, size, color, quantity]);
        
        console.log(`Variant update affected rows: ${variantResult.affectedRows}`);
        
        // 3. Update sizes JSON
        const [productData] = await connection.execute(
            'SELECT sizes FROM products WHERE product_id = ?',
            [productId]
        );
        
        if (productData.length > 0 && productData[0].sizes) {
            const sizesData = JSON.parse(productData[0].sizes);
            console.log('Current sizes JSON:', JSON.stringify(sizesData, null, 2));
            
            // Find and update the specific size/color stock
            let updated = false;
            for (let sizeObj of sizesData) {
                console.log(`Checking size: ${sizeObj.size} vs ${size}`);
                if (sizeObj.size === size) {
                    for (let colorStock of sizeObj.colorStocks) {
                        console.log(`Checking color: ${colorStock.color} vs ${color}`);
                        if (colorStock.color === color) {
                            const oldStock = colorStock.stock;
                            colorStock.stock = Math.max(0, colorStock.stock - quantity);
                            console.log(`📉 Updated ${size} ${color}: ${oldStock} → ${colorStock.stock}`);
                            updated = true;
                            break;
                        }
                    }
                    if (updated) break;
                }
            }
            
            if (updated) {
                const newSizesJSON = JSON.stringify(sizesData);
                console.log('New sizes JSON:', newSizesJSON);
                
                // Update the sizes JSON in products table
                const [sizesResult] = await connection.execute(
                    'UPDATE products SET sizes = ? WHERE product_id = ?',
                    [newSizesJSON, productId]
                );
                console.log(`✅ Updated sizes JSON - affected rows: ${sizesResult.affectedRows}`);
            } else {
                console.log('❌ No matching size/color found in JSON');
            }
        }
        
        // 4. Update total stock
        await connection.execute(`
            UPDATE products 
            SET total_available_stock = (
                SELECT COALESCE(SUM(available_quantity), 0) 
                FROM product_variants 
                WHERE product_id = ?
            )
            WHERE product_id = ?
        `, [productId, productId]);
        
        await connection.commit();
        console.log('✅ Transaction committed');
        
        // 5. Verify the final state
        const [finalVariant] = await connection.execute(`
            SELECT available_quantity, stock_quantity
            FROM product_variants 
            WHERE product_id = ? AND size = ? AND color = ?
        `, [productId, size, color]);
        
        const [finalProduct] = await connection.execute(
            'SELECT sizes, total_available_stock FROM products WHERE product_id = ?',
            [productId]
        );
        
        console.log('=== FINAL STATE ===');
        console.log(`Variant: available=${finalVariant[0].available_quantity}, total=${finalVariant[0].stock_quantity}`);
        console.log(`Product total stock: ${finalProduct[0].total_available_stock}`);
        
        const finalSizes = JSON.parse(finalProduct[0].sizes);
        const targetSize = finalSizes.find(s => s.size === size);
        const targetColor = targetSize ? targetSize.colorStocks.find(c => c.color === color) : null;
        console.log(`Sizes JSON for ${size} ${color}: ${targetColor ? targetColor.stock : 'not found'}`);
        
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

testStockDeduction().catch(console.error);
