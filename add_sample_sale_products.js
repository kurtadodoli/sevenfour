const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function addSampleSaleProducts() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🏷️ Adding sample sale products...');
        
        // Sample sale products
        const saleProducts = [
            {
                product_id: Math.floor(100000000000 + Math.random() * 899999999999),
                productname: 'Seven Four Premium T-Shirt',
                productdescription: 'Premium cotton t-shirt with Seven Four logo. Limited time sale!',
                productprice: 899.00,
                productcolor: 'Black',
                product_type: 't-shirts', // Use enum value
                is_on_sale: true,
                sale_discount_percentage: 25.00,
                sale_start_date: '2025-07-19',
                sale_end_date: '2025-07-31',
                sizes: JSON.stringify([
                    { size: 'S', colorStocks: [{ color: 'Black', stock: 15 }, { color: 'White', stock: 10 }] },
                    { size: 'M', colorStocks: [{ color: 'Black', stock: 20 }, { color: 'White', stock: 15 }] },
                    { size: 'L', colorStocks: [{ color: 'Black', stock: 18 }, { color: 'White', stock: 12 }] },
                    { size: 'XL', colorStocks: [{ color: 'Black', stock: 12 }, { color: 'White', stock: 8 }] }
                ]),
                total_stock: 110,
                productstatus: 'active'
            },
            {
                product_id: Math.floor(100000000000 + Math.random() * 899999999999),
                productname: 'Seven Four Streetwear Hoodie',
                productdescription: 'Comfortable hoodie perfect for casual wear. Flash sale - limited time!',
                productprice: 1299.00,
                productcolor: 'Gray',
                product_type: 'hoodies', // Use enum value
                is_on_sale: true,
                sale_discount_percentage: 30.00,
                sale_start_date: '2025-07-19',
                sale_end_date: '2025-08-15',
                sizes: JSON.stringify([
                    { size: 'S', colorStocks: [{ color: 'Gray', stock: 8 }, { color: 'Navy', stock: 6 }] },
                    { size: 'M', colorStocks: [{ color: 'Gray', stock: 12 }, { color: 'Navy', stock: 10 }] },
                    { size: 'L', colorStocks: [{ color: 'Gray', stock: 15 }, { color: 'Navy', stock: 12 }] },
                    { size: 'XL', colorStocks: [{ color: 'Gray', stock: 10 }, { color: 'Navy', stock: 8 }] }
                ]),
                total_stock: 81,
                productstatus: 'active'
            },
            {
                product_id: Math.floor(100000000000 + Math.random() * 899999999999),
                productname: 'Seven Four Classic Shorts',
                productdescription: 'Comfortable summer shorts for everyday wear.',
                productprice: 599.00,
                productcolor: 'Khaki',
                product_type: 'shorts', // Use enum value
                is_on_sale: true,
                sale_discount_percentage: 15.00,
                sale_start_date: null, // No start date - sale is always active
                sale_end_date: null,   // No end date - sale continues until disabled
                sizes: JSON.stringify([
                    { size: 'S', colorStocks: [{ color: 'Khaki', stock: 20 }, { color: 'Black', stock: 15 }] },
                    { size: 'M', colorStocks: [{ color: 'Khaki', stock: 25 }, { color: 'Black', stock: 20 }] },
                    { size: 'L', colorStocks: [{ color: 'Khaki', stock: 22 }, { color: 'Black', stock: 18 }] },
                    { size: 'XL', colorStocks: [{ color: 'Khaki', stock: 15 }, { color: 'Black', stock: 12 }] }
                ]),
                total_stock: 147,
                productstatus: 'active'
            },
            {
                product_id: Math.floor(100000000000 + Math.random() * 899999999999),
                productname: 'Seven Four Regular Polo',
                productdescription: 'Classic polo shirt for professional and casual wear. Not on sale.',
                productprice: 799.00,
                productcolor: 'White',
                product_type: 't-shirts', // Use enum value - no polo in enum, using t-shirts
                is_on_sale: false, // Regular price product for comparison
                sale_discount_percentage: null,
                sale_start_date: null,
                sale_end_date: null,
                sizes: JSON.stringify([
                    { size: 'S', colorStocks: [{ color: 'White', stock: 12 }, { color: 'Blue', stock: 10 }] },
                    { size: 'M', colorStocks: [{ color: 'White', stock: 18 }, { color: 'Blue', stock: 15 }] },
                    { size: 'L', colorStocks: [{ color: 'White', stock: 16 }, { color: 'Blue', stock: 14 }] },
                    { size: 'XL', colorStocks: [{ color: 'White', stock: 10 }, { color: 'Blue', stock: 8 }] }
                ]),
                total_stock: 103,
                productstatus: 'active'
            }
        ];
        
        // Insert each product
        for (let i = 0; i < saleProducts.length; i++) {
            const product = saleProducts[i];
            
            const insertQuery = `
                INSERT INTO products 
                (product_id, productname, productdescription, productprice, productcolor, product_type, sizes, total_stock, productquantity, productstatus, is_on_sale, sale_discount_percentage, sale_start_date, sale_end_date, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const insertParams = [
                product.product_id,
                product.productname,
                product.productdescription,
                product.productprice,
                product.productcolor,
                product.product_type,
                product.sizes,
                product.total_stock,
                product.total_stock, // Use total_stock for productquantity as well
                product.productstatus,
                product.is_on_sale,
                product.sale_discount_percentage,
                product.sale_start_date,
                product.sale_end_date
            ];
            
            await connection.execute(insertQuery, insertParams);
            
            if (product.is_on_sale) {
                const salePrice = (product.productprice * (1 - product.sale_discount_percentage / 100)).toFixed(2);
                console.log(`✅ Added SALE product: ${product.productname}`);
                console.log(`   Original: ₱${product.productprice} → Sale: ₱${salePrice} (${product.sale_discount_percentage}% OFF)`);
                if (product.sale_start_date && product.sale_end_date) {
                    console.log(`   Sale Period: ${product.sale_start_date} to ${product.sale_end_date}`);
                } else {
                    console.log(`   Sale Period: Always active`);
                }
            } else {
                console.log(`✅ Added regular product: ${product.productname} (₱${product.productprice})`);
            }
        }
        
        await connection.end();
        
        console.log('🎉 Sample sale products added successfully!');
        console.log('\nNow you can test the sale system:');
        console.log('1. Visit the Products page to see sale indicators');
        console.log('2. Click on sale products to see detailed sale info');
        console.log('3. Use Maintenance page to manage sales');
        console.log('4. Test filtering and sorting with sale prices');
        
    } catch (error) {
        console.error('❌ Error adding sample products:', error);
        process.exit(1);
    }
}

// Check if we should run this script
if (require.main === module) {
    addSampleSaleProducts();
}

module.exports = { addSampleSaleProducts };
