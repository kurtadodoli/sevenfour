// Test script to simulate order placement and verify stock deduction
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testOrderPlacement() {
    console.log('🧪 Testing Order Placement and Stock Deduction');
    console.log('================================================');
    
    try {
        // Step 1: Check initial stock
        console.log('📦 Step 1: Checking initial stock...');
        const stockResponse = await axios.get('http://localhost:5000/api/maintenance/products');
        const product = stockResponse.data.find(p => p.product_id === 554415049535);
        
        if (!product) {
            console.log('❌ Lightning Mesh Shorts not found');
            return;
        }
        
        console.log(`📊 Initial Stock for ${product.productname}:`);
        console.log(`   Total Available: ${product.total_available_stock}`);
        console.log(`   Total Stock: ${product.total_stock}`);
        console.log(`   Reserved: ${product.total_reserved_stock}`);
        
        // Step 2: Create a test user session (simulate login)
        console.log('\n👤 Step 2: Creating test user session...');
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'testuser@gmail.com',
            password: 'testpassword123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Failed to login test user');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Test user logged in successfully');
        
        // Step 3: Add item to cart
        console.log('\n🛒 Step 3: Adding item to cart...');
        const cartResponse = await axios.post('http://localhost:5000/api/cart/add', {
            product_id: product.product_id,
            quantity: 5,
            size: 'S',
            color: 'Blue'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!cartResponse.data.success) {
            console.log('❌ Failed to add item to cart:', cartResponse.data.message);
            return;
        }
        
        console.log('✅ Added 5 Small Blue Lightning Mesh Shorts to cart');
        
        // Step 4: Create order from cart
        console.log('\n📝 Step 4: Creating order from cart...');
        
        // Create a dummy payment proof image
        const canvas = require('canvas').createCanvas(200, 100);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 100);
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText('Test Payment Proof', 50, 50);
        ctx.fillText(new Date().toISOString(), 30, 70);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('/tmp/test-payment-proof.png', buffer);
        
        const formData = new FormData();
        formData.append('customer_name', 'Test Customer');
        formData.append('customer_email', 'testuser@gmail.com');
        formData.append('shipping_address', '123 Test Street, Test City');
        formData.append('street_address', '123 Test Street');
        formData.append('city_municipality', 'Test City');
        formData.append('province', 'Metro Manila');
        formData.append('zip_code', '12345');
        formData.append('contact_phone', '09123456789');
        formData.append('payment_method', 'gcash');
        formData.append('payment_reference', `TEST-${Date.now()}`);
        formData.append('notes', 'Test order for stock deduction verification');
        formData.append('payment_proof', fs.createReadStream('/tmp/test-payment-proof.png'));
        
        const orderResponse = await axios.post('http://localhost:5000/api/orders', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        
        if (!orderResponse.data.success) {
            console.log('❌ Failed to create order:', orderResponse.data.message);
            return;
        }
        
        console.log('✅ Order created successfully!');
        console.log(`   Order Number: ${orderResponse.data.order.order_number}`);
        console.log(`   Stock Updates:`, orderResponse.data.stockUpdates);
        
        // Step 5: Check stock after order
        console.log('\n📦 Step 5: Checking stock after order...');
        const finalStockResponse = await axios.get('http://localhost:5000/api/maintenance/products');
        const finalProduct = finalStockResponse.data.find(p => p.product_id === 554415049535);
        
        console.log(`📊 Final Stock for ${finalProduct.productname}:`);
        console.log(`   Total Available: ${finalProduct.total_available_stock}`);
        console.log(`   Total Stock: ${finalProduct.total_stock}`);
        console.log(`   Reserved: ${finalProduct.total_reserved_stock}`);
        
        // Calculate expected values
        const expectedAvailableStock = product.total_available_stock - 5;
        const stockDeductionWorked = finalProduct.total_available_stock === expectedAvailableStock;
        
        console.log('\n🔍 Results:');
        console.log(`   Expected Available Stock: ${expectedAvailableStock}`);
        console.log(`   Actual Available Stock: ${finalProduct.total_available_stock}`);
        console.log(`   Stock Deduction Worked: ${stockDeductionWorked ? '✅ YES' : '❌ NO'}`);
        
        if (stockDeductionWorked) {
            console.log('\n🎉 SUCCESS: Stock deduction is working correctly!');
        } else {
            console.log('\n❌ FAILURE: Stock deduction is not working as expected.');
        }
        
    } catch (error) {
        console.error('❌ Error during test:', error.response?.data || error.message);
    }
}

// Run the test
testOrderPlacement();
