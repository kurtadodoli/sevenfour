// Simple test script to verify stock deduction
const axios = require('axios');

async function testStockDeduction() {
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
        
        // Step 2: Register a test user
        console.log('\n👤 Step 2: Creating test user...');
        try {
            const registerResponse = await axios.post('http://localhost:5000/api/users/register', {
                first_name: 'Test',
                last_name: 'User',
                email: 'testuser@gmail.com',
                password: 'testpassword123',
                confirmPassword: 'testpassword123',
                gender: 'other',
                birthday: '1990-01-01'
            });
            console.log('✅ Test user created');
        } catch (regError) {
            // User might already exist, that's okay
            console.log('ℹ️ User might already exist, proceeding...');
        }
        
        // Step 3: Login
        console.log('\n🔐 Step 3: Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'testuser@gmail.com',
            password: 'testpassword123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Failed to login:', loginResponse.data.message);
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Logged in successfully');
        
        // Step 4: Add item to cart
        console.log('\n🛒 Step 4: Adding item to cart...');
        const cartResponse = await axios.post('http://localhost:5000/api/cart/add', {
            product_id: product.product_id,
            quantity: 3,
            size: 'S',
            color: 'Blue'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!cartResponse.data.success) {
            console.log('❌ Failed to add item to cart:', cartResponse.data.message);
            return;
        }
        
        console.log('✅ Added 3 Small Blue Lightning Mesh Shorts to cart');
        
        // Step 5: Get cart to verify
        console.log('\n📋 Step 5: Verifying cart contents...');
        const getCartResponse = await axios.get('http://localhost:5000/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Cart items:', getCartResponse.data.items?.length || 0);
        
        console.log('\n✅ Test setup complete! Now you can manually test order placement through the frontend.');
        console.log('📝 Instructions:');
        console.log('   1. Go to http://localhost:3000/cart in your browser');
        console.log('   2. Login with testuser@gmail.com / testpassword123');
        console.log('   3. Proceed to checkout');
        console.log('   4. Complete the order');
        console.log('   5. Check if stock decreases from 145 to 142');
        
    } catch (error) {
        console.error('❌ Error during test:', error.response?.data || error.message);
    }
}

testStockDeduction();
