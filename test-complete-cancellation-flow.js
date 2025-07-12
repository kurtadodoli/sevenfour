// Complete cancellation flow test with fresh token
const axios = require('axios');

async function testCancellationFlowComplete() {
    console.log('🧪 Testing Complete Custom Order Cancellation Flow...');
    
    try {
        // Step 1: Get fresh token
        console.log('🔐 Getting fresh JWT token...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@admin.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Fresh token obtained');
        
        // Step 2: Create cancellation request
        console.log('\n📝 Creating cancellation request...');
        const orderIdToCancel = 'CUSTOM-MCSS0ZFM-7LW55';
        
        const response = await axios.post(
            'http://localhost:5000/api/custom-orders/cancellation-requests',
            {
                customOrderId: orderIdToCancel,
                reason: 'Testing cancellation flow after clearing duplicate requests'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cancellation request created successfully!');
        console.log('Response:', response.data);
        
        // Step 3: Check if request appears in admin endpoint
        console.log('\n📋 Checking admin cancellation requests...');
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
        console.log('Pending requests:', adminResponse.data.filter(req => req.status === 'pending').length);
        
        if (adminResponse.data.length > 0) {
            console.log('\nSample request:', adminResponse.data[0]);
        }
        
        // Step 4: Check if custom order status shows pending cancellation
        console.log('\n🔍 Checking custom order status...');
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
        console.error('❌ Error in cancellation flow test:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testCancellationFlowComplete();
