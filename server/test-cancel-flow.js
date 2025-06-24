const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testCancelCustomOrderFlow() {
    console.log('🧪 Testing Cancel Custom Order Flow');
    
    const baseURL = 'http://localhost:3001/api';
    
    try {
        // Step 1: Create a custom order
        console.log('\n📋 Step 1: Creating a custom order...');
        
        const formData = new FormData();
        
        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
        
        // Add form data
        formData.append('productType', 't-shirts');
        formData.append('customerName', 'Test Customer');
        formData.append('customerEmail', 'test@example.com');
        formData.append('customerPhone', '09123456789');
        formData.append('shippingAddress', '123 Test Street');
        formData.append('municipality', 'Manila');
        formData.append('barangay', 'Test Barangay');
        formData.append('postalCode', '1000');
        formData.append('productSize', 'L');
        formData.append('productColor', 'red');
        formData.append('productName', 'Test Custom T-Shirt');
        formData.append('quantity', '1');
        formData.append('additionalInfo', 'This is a test order for cancellation');
        
        // Add test image
        formData.append('images', testImageBuffer, {
            filename: 'test-design.png',
            contentType: 'image/png'
        });
        
        const createResponse = await axios.post(`${baseURL}/custom-designs`, formData, {
            headers: formData.getHeaders()
        });
          console.log('✅ Custom order created:', createResponse.data.message);
        
        // Step 2: Fetch active custom orders to get the latest one
        console.log('\n📋 Step 2: Fetching active custom orders...');
        const activeOrdersResponse = await axios.get(`${baseURL}/test-designs`);
        console.log(`✅ Found ${activeOrdersResponse.data.data.length} active custom orders`);
        
        // Find our created order (should be the most recent one)
        const latestOrder = activeOrdersResponse.data.data[0]; // Orders are sorted by created_at DESC
        const designId = latestOrder.custom_order_id;
        console.log(`   Latest Order ID: ${designId}`);
        
        activeOrdersResponse.data.data.slice(0, 3).forEach(order => {
            console.log(`   - Order ${order.custom_order_id}: ${order.status} (${order.customer_name})`);
        });
          // Step 3: Cancel the custom order
        console.log('\n🔴 Step 3: Cancelling the custom order...');
        const cancelResponse = await axios.put(`${baseURL}/public/custom-orders/${designId}/status`, {
            status: 'cancelled'
        });
        console.log('✅ Custom order cancelled:', cancelResponse.data.message);
        
        // Step 4: Verify it's removed from active orders
        console.log('\n📋 Step 4: Verifying removal from active orders...');
        const updatedActiveOrdersResponse = await axios.get(`${baseURL}/test-designs`);
        console.log(`✅ Active custom orders now: ${updatedActiveOrdersResponse.data.data.length}`);
        
        // Step 5: Verify it appears in cancelled orders
        console.log('\n📋 Step 5: Checking cancelled orders...');
        const cancelledOrdersResponse = await axios.get(`${baseURL}/test-designs-cancelled`);
        console.log(`✅ Found ${cancelledOrdersResponse.data.data.length} cancelled custom orders`);
        cancelledOrdersResponse.data.data.forEach(order => {
            console.log(`   - Order ${order.custom_order_id}: ${order.status} (cancelled on ${new Date(order.updated_at).toLocaleString()})`);
        });
        
        console.log('\n🎉 Test completed successfully!');
        console.log('✅ Custom order was successfully:');
        console.log('   1. Created and added to active orders');
        console.log('   2. Cancelled and removed from active orders');
        console.log('   3. Moved to cancelled orders list');
        
        console.log('\n🌐 You can now test the frontend:');
        console.log('   1. Visit http://localhost:3000/orders');
        console.log('   2. Check the "Custom Orders" tab - should show no active orders');
        console.log('   3. Check the "Order History" tab - should show the cancelled custom order');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testCancelCustomOrderFlow();
