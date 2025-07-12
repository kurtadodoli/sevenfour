// Test custom order cancellation flow
const axios = require('axios');

async function testCancellationFlow() {
    console.log('🧪 Testing Custom Order Cancellation Flow...');
    
    // Use a real JWT token for testing
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTY3NTAyMzIxMzM1MjI2LCJlbWFpbCI6InRlc3RAYWRtaW4uY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUyMTA3ODIwLCJleHAiOjE3NTIxOTQyMjB9.2FUlsD_2AeqDFZibP9z3lgy888bIYqJx85GlDO_xTaas';
    
    try {
        // Step 1: Create cancellation request
        console.log('\n📝 Step 1: Creating cancellation request...');
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
        
        // Step 2: Check if request appears in admin endpoint
        console.log('\n📋 Step 2: Checking admin cancellation requests...');
        const adminResponse = await axios.get(
            'http://localhost:5000/api/custom-orders/cancellation-requests',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Admin cancellation requests fetched successfully!');
        console.log('Pending requests:', adminResponse.data.filter(req => req.status === 'pending').length);
        
        // Step 3: Check if custom order status shows pending cancellation
        console.log('\n🔍 Step 3: Checking custom order status...');
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
    }
}

testCancellationFlow();
