const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();
const { dbConfig } = require('../config/db');

// GET inventory data with proper stock from product_stock table
router.get('/inventory', async (req, res) => {
    try {
        console.log('🔍 Getting inventory data with product_stock join...');
        const connection = await mysql.createConnection(dbConfig);
        
        // Get products with their actual stock from product_stock table
        const [products] = await connection.execute(`
            SELECT 
                p.product_id,
                p.productname,
                p.productcolor,
                p.productprice,
                p.product_type,
                p.status,
                p.total_stock,
                p.productimage,
                GROUP_CONCAT(
                    CONCAT('{"size":"', ps.size, '","stock":', ps.stock_quantity, ',"reserved":', ps.reserved_quantity, '}')
                    ORDER BY 
                        CASE ps.size
                            WHEN 'XS' THEN 1
                            WHEN 'S' THEN 2
                            WHEN 'M' THEN 3
                            WHEN 'L' THEN 4
                            WHEN 'XL' THEN 5
                            WHEN 'XXL' THEN 6
                            WHEN 'One Size' THEN 7
                            ELSE 8
                        END
                    SEPARATOR ','
                ) as size_stock_data,
                SUM(ps.stock_quantity) as calculated_total_stock
            FROM products p
            LEFT JOIN product_stock ps ON p.product_id = ps.product_id
            WHERE p.status = 'active'
            GROUP BY p.product_id, p.productname, p.productcolor, p.productprice, p.product_type, p.status, p.total_stock, p.productimage
            ORDER BY p.productname
        `);
        
        console.log(`✅ Found ${products.length} products with stock data`);
        
        // Process the results
        const processedProducts = products.map(product => {
            let sizes = [];
            let actualTotalStock = product.calculated_total_stock || 0;
            
            if (product.size_stock_data) {
                try {
                    const sizeArray = `[${product.size_stock_data}]`;
                    sizes = JSON.parse(sizeArray);
                } catch (error) {
                    console.error('Error parsing sizes for product', product.product_id, error);
                    sizes = [];
                }
            }
            
            // Determine stock level based on actual calculated stock
            let stockLevel = 'normal';
            if (actualTotalStock === 0) {
                stockLevel = 'critical';
            } else if (actualTotalStock <= 10) {
                stockLevel = 'low';
            }
            
            return {
                product_id: product.product_id,
                productname: product.productname,
                productcolor: product.productcolor,
                productprice: product.productprice,
                product_type: product.product_type,
                status: product.status,
                productimage: product.productimage,
                totalStock: actualTotalStock,
                stockLevel: stockLevel,
                sizes: JSON.stringify(sizes), // Size breakdown for modal
                db_total_stock: product.total_stock, // Original DB value for comparison
                last_updated: new Date().toISOString()
            };
        });
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Inventory data retrieved successfully',
            data: processedProducts,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error getting inventory data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve inventory data',
            error: error.message
        });
    }
});

// GET all product variants with size/color combinations
router.get('/variants', async (req, res) => {
    try {
        console.log('🔍 Getting all product variants...');
        const connection = await mysql.createConnection(dbConfig);
        
        // Get all variants with product information
        const [variants] = await connection.execute(`
            SELECT 
                pv.product_id,
                pv.size,
                pv.color,
                pv.stock_quantity,
                pv.available_quantity,
                pv.reserved_quantity,
                pv.created_at,
                p.productname,
                p.productprice,
                p.productcolor as primary_color,
                p.product_type,
                p.status
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.product_id
            WHERE p.status = 'active'
            ORDER BY p.productname, pv.size, pv.color
        `);
        
        console.log(`✅ Found ${variants.length} product variants`);
        
        // Group variants by product
        const groupedVariants = variants.reduce((acc, variant) => {
            if (!acc[variant.product_id]) {
                acc[variant.product_id] = {
                    product_id: variant.product_id,
                    productname: variant.productname,
                    productprice: variant.productprice,
                    primary_color: variant.primary_color,
                    product_type: variant.product_type,
                    status: variant.status,
                    variants: []
                };
            }
            
            acc[variant.product_id].variants.push({
                size: variant.size,
                color: variant.color,
                stock_quantity: variant.stock_quantity,
                available_quantity: variant.available_quantity,
                reserved_quantity: variant.reserved_quantity,
                stock_level: variant.stock_quantity === 0 ? 'critical' : 
                           variant.stock_quantity <= 5 ? 'low' : 'normal',
                created_at: variant.created_at
            });
            
            return acc;
        }, {});
        
        await connection.end();
        
        res.json({
            success: true,
            message: 'Product variants retrieved successfully',
            data: Object.values(groupedVariants),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error getting variants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve variants',
            error: error.message
        });
    }
});

module.exports = router;
