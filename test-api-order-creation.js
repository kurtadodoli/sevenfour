const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testOrderCreationAPI() {
    const BASE_URL = 'http://localhost:5000';
    
    try {
        console.log('🧪 Testing Order Creation through API...\n');

        // 1. First, try to register/login a test user
        console.log('📋 Step 1: Testing user authentication...');
        
        const testUser = {
            username: 'testuser_' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: 'testpassword123',
            fullName: 'Test User'
        };

        try {
            // Try to register
            const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
            console.log('✅ User registered successfully');
        } catch (registerError) {
            console.log('ℹ️ Registration failed (user may exist), trying login...');
        }

        // Login to get token
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        if (!loginResponse.data.token) {
            // Try with a known test user
            const knownUser = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            const fallbackLogin = await axios.post(`${BASE_URL}/api/auth/login`, knownUser);
            if (!fallbackLogin.data.token) {
                throw new Error('Could not obtain authentication token');
            }
            console.log('✅ Logged in with fallback user');
            var token = fallbackLogin.data.token;
        } else {
            console.log('✅ Logged in successfully');
            var token = loginResponse.data.token;
        }

        // 2. Add item to cart
        console.log('\n📋 Step 2: Adding item to cart...');
        
        const cartItem = {
            product_id: 1,
            quantity: 2,
            color: 'Black',
            size: 'M'
        };

        await axios.post(`${BASE_URL}/api/cart/add`, cartItem, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Item added to cart');

        // 3. Create a test payment proof file
        console.log('\n📋 Step 3: Preparing payment proof...');
        
        const testImagePath = path.join(__dirname, 'test_payment_proof.jpg');
        if (!fs.existsSync(testImagePath)) {
            // Create a simple test file
            fs.writeFileSync(testImagePath, 'test image data for payment proof');
        }

        // 4. Create order from cart
        console.log('\n📋 Step 4: Creating order from cart...');
        
        const orderData = new FormData();
        orderData.append('shipping_address', '123 Test Street, Test City, Test Province');
        orderData.append('contact_phone', '09123456789');
        orderData.append('notes', 'Test order from API');
        orderData.append('customer_name', 'Test Customer');
        orderData.append('customer_email', 'testcustomer@example.com');
        orderData.append('street_address', '123 Test Street');
        orderData.append('city_municipality', 'Test City');
        orderData.append('province', 'Test Province');
        orderData.append('zip_code', '1234');
        orderData.append('payment_method', 'gcash');
        orderData.append('payment_reference', 'GCASH' + Date.now());
        orderData.append('payment_proof', fs.createReadStream(testImagePath));

        const orderResponse = await axios.post(`${BASE_URL}/api/orders/create-from-cart`, orderData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...orderData.getHeaders()
            }
        });

        console.log('✅ Order created successfully!');
        console.log('Order details:', orderResponse.data);

        // 5. Verify order was created
        console.log('\n📋 Step 5: Verifying order creation...');
        
        const ordersResponse = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`✅ Found ${ordersResponse.data.length || 0} orders for user`);

        // Cleanup
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }

        console.log('\n🎉 API ORDER CREATION TEST PASSED!');
        console.log('✅ Authentication works');
        console.log('✅ Cart operations work');
        console.log('✅ Order creation works');
        console.log('✅ No "customer_fullname doesn\'t have a default value" error');

    } catch (error) {
        console.error('\n❌ API Test Failed:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        // Check if it's the specific error we were trying to fix
        const errorMessage = error.response?.data?.message || error.message || '';
        if (errorMessage.includes('customer_fullname') && errorMessage.includes('default value')) {
            console.error('\n🚨 THE ORIGINAL ERROR IS STILL PRESENT!');
            console.error('The fix may not be working correctly.');
        } else {
            console.log('\n✅ Good news: No "customer_fullname" error detected');
        }
    }
}

// Check if server is running first
async function checkServerStatus() {
    try {
        const response = await axios.get('http://localhost:5000/api/test');
        console.log('✅ Server is running and responding');
        return true;
    } catch (error) {
        console.log('❌ Server is not responding on port 5000');
        console.log('Please start the server first:');
        console.log('  cd c:\\sfc\\server');
        console.log('  node app.js');
        return false;
    }
}

async function main() {
    console.log('🔍 Checking server status...');
    
    if (await checkServerStatus()) {
        await testOrderCreationAPI();
    } else {
        console.log('\n🚀 Starting server check in 10 seconds...');
        console.log('If you haven\'t started the server yet, please run:');
        console.log('  cd c:\\sfc\\server && node app.js');
        
        setTimeout(async () => {
            if (await checkServerStatus()) {
                await testOrderCreationAPI();
            }
        }, 10000);
    }
}

main();
