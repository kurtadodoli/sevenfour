const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test user data
const testUsers = [
    {
        email: 'user1@test.com',
        password: 'TestPassword123!',
        username: 'testuser1',
        firstName: 'Test',
        lastName: 'User1'
    },
    {
        email: 'user2@test.com',
        password: 'TestPassword123!',
        username: 'testuser2',
        firstName: 'Test',
        lastName: 'User2'
    }
];

// Helper function to register or login user
async function getAuthToken(user) {
    try {
        // Try to register first
        await axios.post(`${API_BASE}/auth/register`, user);
        console.log(`✅ Registered user: ${user.email}`);
    } catch (error) {
        // If registration fails (user exists), that's okay
        if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
            console.log(`ℹ️  User already exists: ${user.email}`);
        } else {
            console.log(`⚠️  Registration error for ${user.email}:`, error.response?.data?.message || error.message);
        }
    }

    try {
        // Login to get token
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: user.email,
            password: user.password
        });
        
        const token = loginResponse.data.data.token;
        console.log(`✅ Logged in user: ${user.email}`);
        return token;
    } catch (error) {
        console.error(`❌ Login failed for ${user.email}:`, error.response?.data?.message || error.message);
        throw error;
    }
}

// Helper function to create a test order
async function createTestOrder(token, userEmail) {
    try {
        // First add item to cart
        const cartResponse = await axios.post(`${API_BASE}/cart/add`, {
            productId: 1, // Assuming product with ID 1 exists
            quantity: 1,
            size: 'M',
            color: 'Black'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Added item to cart for ${userEmail}`);

        // Create order from cart
        const orderResponse = await axios.post(`${API_BASE}/orders/create`, {
            shippingAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                country: 'Test Country'
            },
            paymentMethod: 'credit_card'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Created order for ${userEmail}, Order ID: ${orderResponse.data.data.orderId}`);
        return orderResponse.data.data.orderId;
    } catch (error) {
        console.error(`❌ Failed to create order for ${userEmail}:`, error.response?.data?.message || error.message);
        throw error;
    }
}

// Helper function to get user orders
async function getUserOrders(token, userEmail) {
    try {
        const response = await axios.get(`${API_BASE}/orders/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const orders = response.data.data.orders;
        console.log(`📋 Orders for ${userEmail}:`, orders.length);
        
        // Log order details for verification
        orders.forEach(order => {
            console.log(`  - Order ID: ${order.id}, Total: $${order.total_amount}, User ID: ${order.user_id}, Status: ${order.status}`);
        });
        
        return orders;
    } catch (error) {
        console.error(`❌ Failed to get orders for ${userEmail}:`, error.response?.data?.message || error.message);
        throw error;
    }
}

// Main test function
async function testUserOrderIsolation() {
    console.log('🧪 Starting User Order Isolation Test\n');

    try {
        // Step 1: Register/Login both users
        console.log('📝 Step 1: Setting up test users...');
        const token1 = await getAuthToken(testUsers[0]);
        const token2 = await getAuthToken(testUsers[1]);
        console.log('');

        // Step 2: Create orders for each user
        console.log('🛒 Step 2: Creating test orders...');
        const order1 = await createTestOrder(token1, testUsers[0].email);
        const order2 = await createTestOrder(token2, testUsers[1].email);
        console.log('');

        // Step 3: Verify each user can only see their own orders
        console.log('🔍 Step 3: Verifying order isolation...');
        console.log('\n--- User 1 Orders ---');
        const user1Orders = await getUserOrders(token1, testUsers[0].email);
        
        console.log('\n--- User 2 Orders ---');
        const user2Orders = await getUserOrders(token2, testUsers[1].email);

        // Step 4: Verify isolation
        console.log('\n🧾 Step 4: Isolation Test Results:');
        
        // Check if user 1 can see user 2's orders (shouldn't be able to)
        const user1HasUser2Orders = user1Orders.some(order => 
            user2Orders.some(user2Order => user2Order.id === order.id)
        );
        
        // Check if user 2 can see user 1's orders (shouldn't be able to)
        const user2HasUser1Orders = user2Orders.some(order => 
            user1Orders.some(user1Order => user1Order.id === order.id)
        );

        console.log(`  ✅ User 1 has ${user1Orders.length} orders`);
        console.log(`  ✅ User 2 has ${user2Orders.length} orders`);
        console.log(`  ${user1HasUser2Orders ? '❌' : '✅'} User 1 ${user1HasUser2Orders ? 'CAN' : 'CANNOT'} see User 2's orders`);
        console.log(`  ${user2HasUser1Orders ? '❌' : '✅'} User 2 ${user2HasUser1Orders ? 'CAN' : 'CANNOT'} see User 1's orders`);

        if (!user1HasUser2Orders && !user2HasUser1Orders) {
            console.log('\n🎉 SUCCESS: Order isolation is working correctly!');
        } else {
            console.log('\n🚨 FAILURE: Order isolation is NOT working correctly!');
        }

    } catch (error) {
        console.error('\n🚨 Test failed with error:', error.message);
    }
}

// Run the test
testUserOrderIsolation();
