// Manual Order Placement Test Script
// This script will help us test the order placement manually

const axios = require('axios');

async function manualOrderTest() {
    console.log('🧪 Manual Order Test Setup');
    console.log('==========================');
    
    try {
        // Check current stock first
        console.log('📦 Checking current stock...');
        const stockResponse = await axios.get('http://localhost:5000/api/maintenance/products');
        const product = stockResponse.data.find(p => p.product_id === 554415049535);
        
        console.log(`📊 Current Stock for ${product.productname}:`);
        console.log(`   Total Available: ${product.total_available_stock}`);
        console.log(`   Product ID: ${product.product_id}`);
        
        // Show variant details
        if (product.sizes) {
            const sizes = JSON.parse(product.sizes);
            console.log('   Variant Details:');
            sizes.forEach(sizeData => {
                sizeData.colorStocks.forEach(colorStock => {
                    console.log(`     ${sizeData.size} ${colorStock.color}: ${colorStock.stock} units`);
                });
            });
        }
        
        console.log('\n📝 Manual Test Instructions:');
        console.log('=============================');
        console.log('1. Open http://localhost:3000 in your browser');
        console.log('2. Go to Products page');
        console.log('3. Click on "Lightning Mesh Shorts"');
        console.log('4. Add 5 units (Size S, Blue) to cart');
        console.log('5. Go to Cart page');
        console.log('6. Click "Proceed to Checkout"');
        console.log('7. Fill out the checkout form:');
        console.log('   - Email: test@example.com');
        console.log('   - First Name: Test');
        console.log('   - Last Name: User');
        console.log('   - Address: 123 Test Street');
        console.log('   - City: Test City');
        console.log('   - Postal Code: 12345');
        console.log('   - Phone: 09123456789');
        console.log('   - Card Number: 4111111111111111');
        console.log('   - Expiry: 12/25');
        console.log('   - CVV: 123');
        console.log('   - Name on Card: Test User');
        console.log('8. Click "Place Order"');
        console.log('9. Check if stock decreases');
        
        console.log('\n📊 Expected Results:');
        console.log('====================');
        console.log(`Current Available Stock: ${product.total_available_stock}`);
        console.log(`Expected After Order: ${product.total_available_stock - 5}`);
        console.log('Expected Size S Blue Stock: 45 (down from 50)');
        
        console.log('\n🔧 To check results after placing order, run:');
        console.log('node -e "const axios=require(\'axios\'); axios.get(\'http://localhost:5000/api/maintenance/products\').then(r => { const p = r.data.find(p => p.product_id === 554415049535); console.log(\'New stock:\', p.total_available_stock); });"');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

manualOrderTest();
