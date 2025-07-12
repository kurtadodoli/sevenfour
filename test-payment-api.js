const axios = require('axios');

async function testPaymentProofAPI() {
    console.log('🔍 Testing payment proof API...');
    
    try {
        // Test the pending verification endpoint
        const response = await axios.get('http://localhost:5000/api/orders/pending-verification');
        
        console.log('✅ API Response received');
        console.log('📋 Response structure:', {
            success: response.data.success,
            dataLength: response.data.data?.length || 0
        });
        
        if (response.data.success && response.data.data && response.data.data.length > 0) {
            const firstOrder = response.data.data[0];
            console.log('\n🔍 First order details:');
            console.log('  - Order Number:', firstOrder.order_number);
            console.log('  - Customer Name:', firstOrder.customer_name);
            console.log('  - GCash Reference:', firstOrder.gcash_reference_number);
            console.log('  - Payment Proof Path:', firstOrder.payment_proof_image_path);
            console.log('  - Payment Status:', firstOrder.payment_status);
            
            // Test if payment proof URL is accessible
            if (firstOrder.payment_proof_image_path) {
                const imageUrl = `http://localhost:5000${firstOrder.payment_proof_image_path}`;
                console.log('  - Testing image URL:', imageUrl);
                
                try {
                    const imageResponse = await axios.get(imageUrl);
                    console.log('  ✅ Payment proof image accessible:', imageResponse.status);
                } catch (imageError) {
                    console.log('  ❌ Payment proof image not accessible:', imageError.response?.status || imageError.message);
                }
            }
        } else {
            console.log('❌ No orders found in API response');
        }
        
        // Test custom orders too
        try {
            const customResponse = await axios.get('http://localhost:5000/api/custom-orders/admin/pending-verification');
            console.log('\n📋 Custom orders response:', {
                success: customResponse.data.success,
                dataLength: customResponse.data.data?.length || 0
            });
            
            if (customResponse.data.success && customResponse.data.data && customResponse.data.data.length > 0) {
                const firstCustomOrder = customResponse.data.data[0];
                console.log('\n🔍 First custom order details:');
                console.log('  - Order ID:', firstCustomOrder.custom_order_id);
                console.log('  - Customer Name:', firstCustomOrder.payment_full_name);
                console.log('  - GCash Reference:', firstCustomOrder.gcash_reference);
                console.log('  - Payment Proof:', firstCustomOrder.payment_proof_filename);
            }
        } catch (customError) {
            console.log('❌ Custom orders API error:', customError.response?.status || customError.message);
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.response?.status || error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

testPaymentProofAPI();
