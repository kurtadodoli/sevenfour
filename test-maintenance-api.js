const axios = require('axios');

async function testMaintenanceAPI() {
    try {
        console.log('🔄 Testing /maintenance/products API...');
        
        // First login as admin
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            const token = loginResponse.data.token;
            
            // Test the maintenance/products endpoint
            const response = await axios.get('http://localhost:5000/api/maintenance/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('📤 API Response success:', response.data.length > 0);
            
            // Find Strive Forward product
            const striveProduct = response.data.find(p => 
                p.productname && p.productname.toLowerCase().includes('strive forward')
            );
            
            if (striveProduct) {
                console.log('📦 Strive Forward product data:');
                console.log({
                    product_id: striveProduct.product_id,
                    productname: striveProduct.productname,
                    total_stock: striveProduct.total_stock,
                    total_available_stock: striveProduct.total_available_stock,
                    total_reserved_stock: striveProduct.total_reserved_stock,
                    stock_status: striveProduct.stock_status,
                    last_stock_update: striveProduct.last_stock_update
                });
                
                console.log('🎨 Size/Color variants:');
                if (striveProduct.sizeColorVariants && striveProduct.sizeColorVariants.length > 0) {
                    striveProduct.sizeColorVariants.forEach(variant => {
                        console.log(`  ${variant.size}/${variant.color}: Available: ${variant.available_quantity}, Reserved: ${variant.reserved_quantity}, Stock: ${variant.stock_quantity}`);
                    });
                } else {
                    console.log('  No sizeColorVariants found');
                }
                
                // Also check sizes JSON
                if (striveProduct.sizes) {
                    console.log('📋 Sizes JSON:');
                    try {
                        const sizesData = JSON.parse(striveProduct.sizes);
                        sizesData.forEach(size => {
                            console.log(`  Size ${size.size}:`);
                            size.colorStocks.forEach(colorStock => {
                                console.log(`    ${colorStock.color}: ${colorStock.stock} units`);
                            });
                        });
                    } catch (e) {
                        console.log('  Could not parse sizes JSON:', striveProduct.sizes);
                    }
                }
            } else {
                console.log('❌ Strive Forward product not found in API response');
                console.log('Available products:', response.data.map(p => p.productname));
            }
        } else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.response?.data || error.message);
    }
}

testMaintenanceAPI();
