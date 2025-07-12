// Test custom order cancellation flow with fresh token
const axios = require('axios');

async function testCancellationFlowWithFreshToken() {
    console.log('🧪 Testing Custom Order Cancellation Flow with Fresh Token...');
    
    try {
        // Step 1: Login to get fresh token
        console.log('\n🔑 Step 1: Logging in to get fresh token...');
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'krutadodoli@gmail.com',
            password: 'NewAdmin123!'
        });
        
        console.log('Login response status:', loginResponse.status);
        console.log('Login response data:', JSON.stringify(loginResponse.data, null, 2));
        
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Login successful!');
        console.log('User:', user.first_name, user.last_name, '(Role:', user.role, ')');
        console.log('Full login response:', JSON.stringify(loginResponse.data, null, 2));
        
        // Step 2: Create cancellation request
        console.log('\n📝 Step 2: Creating cancellation request...');
        const orderIdToCancel = 'CUSTOM-MCSS0ZFM-7LW55';
        
        const cancellationResponse = await axios.post(
            'http://localhost:5000/api/custom-orders/cancellation-requests',
            {
                customOrderId: orderIdToCancel,
                reason: 'Testing cancellation flow with admin account - changed my mind'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cancellation request created successfully!');
        console.log('Response:', cancellationResponse.data);
        
        // Step 3: Check if request appears in admin endpoint
        console.log('\n📋 Step 3: Checking admin cancellation requests...');
        const adminResponse = await axios.get(
            'http://localhost:5000/api/custom-orders/cancellation-requests',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Admin cancellation requests fetched successfully!');
        console.log('Total requests:', adminResponse.data.length);
        const pendingRequests = adminResponse.data.filter(req => req.status === 'pending');
        console.log('Pending requests:', pendingRequests.length);
        
        if (pendingRequests.length > 0) {
            console.log('Latest pending request:', {
                id: pendingRequests[0].id,
                customOrderId: pendingRequests[0].customOrderId,
                reason: pendingRequests[0].reason,
                customerName: pendingRequests[0].customerName
            });
        }
        
        // Step 4: Check if custom order status shows pending cancellation
        console.log('\n🔍 Step 4: Checking custom order status...');
        const customOrdersResponse = await axios.get(
            'http://localhost:5000/api/custom-orders/admin/all',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        const orderWithCancellation = customOrdersResponse.data.find(order => 
            order.customOrderId === orderIdToCancel
        );
        
        if (orderWithCancellation) {
            console.log('✅ Custom order found!');
            console.log('Order ID:', orderWithCancellation.customOrderId);
            console.log('Status:', orderWithCancellation.status);
            console.log('Has pending cancellation:', orderWithCancellation.hasPendingCancellation);
        } else {
            console.log('❌ Custom order not found');
        }
        
        console.log('\n🎉 Cancellation flow test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in cancellation flow test:');
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testCancellationFlowWithFreshToken();
