const axios = require('axios');

async function testCompleteOrderCancellationFlow() {
    try {
        console.log('🧪 Testing complete order → cancellation → stock restoration flow...\n');
        
        // Login as regular user first
        const userLoginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'testadmin@example.com',  // Using admin as user for simplicity
            password: 'admin123'
        });
        
        if (!userLoginResponse.data.success) {
            console.log('❌ User login failed');
            return;
        }
        
        const userToken = userLoginResponse.data.token;
        console.log('✅ User logged in');
        
        // Step 1: Check stock before order
        console.log('📊 STEP 1: Checking stock before order...');
        const stockResponse1 = await axios.get('http://localhost:5000/api/maintenance/products', {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        const product = stockResponse1.data.find(p => p.productname && p.productname.includes('Strive Forward'));
        if (!product) {
            console.log('❌ Strive Forward product not found');
            return;
        }
        
        const beforeSizes = JSON.parse(product.sizes);
        const beforeLBlack = beforeSizes.find(s => s.size === 'L')?.colorStocks.find(c => c.color === 'Black')?.stock;
        console.log(`Before order - L/Black stock: ${beforeLBlack}`);
        console.log(`Before order - Total available: ${product.total_available_stock}`);
        console.log(`Before order - Total reserved: ${product.total_reserved_stock}`);
        
        // Step 2: Add item to cart
        console.log('\n🛒 STEP 2: Adding item to cart...');
        const addToCartResponse = await axios.post('http://localhost:5000/api/cart/add', {
            product_id: product.product_id,
            quantity: 3,
            size: 'L',
            color: 'Black'
        }, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (!addToCartResponse.data.success) {
            console.log('❌ Failed to add to cart:', addToCartResponse.data.message);
            return;
        }
        console.log('✅ Added 3 x L/Black to cart');
        
        // Step 3: Create order
        console.log('\n📝 STEP 3: Creating order...');
        const orderData = {
            shippingAddress: {
                street_number: '123',
                barangay: 'Test Barangay',
                municipality: 'Test City',
                province: 'Test Province'
            },
            contactPhone: '09123456789',
            paymentMethod: 'Cash on Delivery',
            notes: 'Test order for cancellation testing'
        };
        
        const createOrderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (!createOrderResponse.data.success) {
            console.log('❌ Failed to create order:', createOrderResponse.data.message);
            return;
        }
        
        const orderId = createOrderResponse.data.data.orderId;
        const orderNumber = createOrderResponse.data.data.orderNumber;
        console.log(`✅ Order created: ${orderNumber} (ID: ${orderId})`);
        
        // Step 4: Confirm order (as admin)
        console.log('\n✅ STEP 4: Confirming order...');
        const confirmResponse = await axios.put(`http://localhost:5000/api/orders/${orderId}/confirm`, {}, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (!confirmResponse.data.success) {
            console.log('❌ Failed to confirm order:', confirmResponse.data.message);
            return;
        }
        console.log('✅ Order confirmed - stock should be reserved');
        
        // Step 5: Check stock after confirmation
        console.log('\n📊 STEP 5: Checking stock after confirmation...');
        const stockResponse2 = await axios.get('http://localhost:5000/api/maintenance/products', {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        const productAfterConfirm = stockResponse2.data.find(p => p.product_id === product.product_id);
        const afterConfirmSizes = JSON.parse(productAfterConfirm.sizes);
        const afterConfirmLBlack = afterConfirmSizes.find(s => s.size === 'L')?.colorStocks.find(c => c.color === 'Black')?.stock;
        
        console.log(`After confirmation - L/Black stock: ${afterConfirmLBlack} (was ${beforeLBlack})`);
        console.log(`After confirmation - Total available: ${productAfterConfirm.total_available_stock} (was ${product.total_available_stock})`);
        console.log(`After confirmation - Total reserved: ${productAfterConfirm.total_reserved_stock} (was ${product.total_reserved_stock})`);
        
        // Step 6: Request cancellation
        console.log('\n❌ STEP 6: Requesting cancellation...');
        const cancelRequestResponse = await axios.post(`http://localhost:5000/api/orders/${orderId}/cancel`, {
            reason: 'Testing cancellation flow - please approve'
        }, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (!cancelRequestResponse.data.success) {
            console.log('❌ Failed to request cancellation:', cancelRequestResponse.data.message);
            return;
        }
        
        const cancellationRequestId = cancelRequestResponse.data.data.cancellationRequestId;
        console.log(`✅ Cancellation requested (Request ID: ${cancellationRequestId})`);
        
        // Step 7: Approve cancellation (as admin)
        console.log('\n✅ STEP 7: Approving cancellation...');
        const approveResponse = await axios.put(`http://localhost:5000/api/orders/cancellation-requests/${cancellationRequestId}`, {
            action: 'approve',
            adminNotes: 'Approved for testing stock restoration'
        }, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (!approveResponse.data.success) {
            console.log('❌ Failed to approve cancellation:', approveResponse.data.message);
            return;
        }
        console.log('✅ Cancellation approved');
        
        if (approveResponse.data.data?.stockUpdateEvent) {
            const stockEvent = approveResponse.data.data.stockUpdateEvent;
            console.log(`Stock restored: ${stockEvent.stockRestored}`);
            if (stockEvent.stockRestorations) {
                stockEvent.stockRestorations.forEach(restoration => {
                    console.log(`  - ${restoration.product} (${restoration.size}/${restoration.color}): +${restoration.quantityRestored} → ${restoration.newAvailableStock} available`);
                });
            }
        }
        
        // Step 8: Check final stock
        console.log('\n📊 STEP 8: Checking final stock after cancellation...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for DB update
        
        const stockResponse3 = await axios.get('http://localhost:5000/api/maintenance/products', {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        const productFinal = stockResponse3.data.find(p => p.product_id === product.product_id);
        const finalSizes = JSON.parse(productFinal.sizes);
        const finalLBlack = finalSizes.find(s => s.size === 'L')?.colorStocks.find(c => c.color === 'Black')?.stock;
        
        console.log(`Final - L/Black stock: ${finalLBlack}`);
        console.log(`Final - Total available: ${productFinal.total_available_stock}`);
        console.log(`Final - Total reserved: ${productFinal.total_reserved_stock}`);
        
        // Summary
        console.log('\n📈 SUMMARY:');
        console.log(`L/Black Stock: ${beforeLBlack} → ${afterConfirmLBlack} → ${finalLBlack}`);
        console.log(`Total Available: ${product.total_available_stock} → ${productAfterConfirm.total_available_stock} → ${productFinal.total_available_stock}`);
        console.log(`Total Reserved: ${product.total_reserved_stock} → ${productAfterConfirm.total_reserved_stock} → ${productFinal.total_reserved_stock}`);
        
        const stockRestored = finalLBlack === beforeLBlack;
        console.log(`\n${stockRestored ? '✅ SUCCESS' : '❌ FAILED'}: Stock restoration ${stockRestored ? 'working correctly' : 'not working'}!`);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Run the test
testCompleteOrderCancellationFlow();
