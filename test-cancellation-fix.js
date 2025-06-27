const axios = require('axios');

async function testCancellationStockFix() {
    try {
        console.log('🧪 Testing cancellation stock restoration fix...\n');
        
        // Login as admin
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Admin logged in successfully\n');
        
        // Step 1: Check current stock before test
        console.log('📊 STEP 1: Checking current stock levels...');
        const stockResponse1 = await axios.get('http://localhost:5000/api/maintenance/products', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const striveProduct1 = stockResponse1.data.find(p => 
            p.productname && p.productname.toLowerCase().includes('strive forward')
        );
        
        if (striveProduct1) {
            console.log('Current Strive Forward stock:');
            console.log(`  Total Available: ${striveProduct1.total_available_stock}`);
            console.log(`  Total Reserved: ${striveProduct1.total_reserved_stock}`);
            
            if (striveProduct1.sizes) {
                const sizesData = JSON.parse(striveProduct1.sizes);
                const largeBlack = sizesData.find(s => s.size === 'L')?.colorStocks.find(c => c.color === 'Black');
                console.log(`  L/Black in sizes JSON: ${largeBlack ? largeBlack.stock : 'NOT FOUND'}`);
            }
        }
        
        // Step 2: Get pending cancellation requests
        console.log('\n📋 STEP 2: Finding pending cancellation requests...');
        const cancellationResponse = await axios.get('http://localhost:5000/api/orders/cancellation-requests?status=pending', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const pendingRequests = cancellationResponse.data.data || [];
        console.log(`Found ${pendingRequests.length} pending cancellation requests`);
        
        if (pendingRequests.length === 0) {
            console.log('❌ No pending cancellation requests to test with');
            return;
        }
        
        // Find a request for Strive Forward if possible
        const striveRequest = pendingRequests.find(req => 
            req.order_items && req.order_items.some(item => 
                item.product_name && item.product_name.toLowerCase().includes('strive forward')
            )
        );
        
        const testRequest = striveRequest || pendingRequests[0];
        console.log(`Selected request: Order ${testRequest.order_number} (ID: ${testRequest.id})`);
        
        if (testRequest.order_items && testRequest.order_items.length > 0) {
            console.log('Order items:');
            testRequest.order_items.forEach(item => {
                console.log(`  - ${item.product_name} (${item.size}/${item.color}) x${item.quantity}`);
            });
        }
        
        // Step 3: Approve the cancellation
        console.log('\n✅ STEP 3: Approving cancellation request...');
        const approvalResponse = await axios.put(`http://localhost:5000/api/orders/cancellation-requests/${testRequest.id}`, {
            action: 'approve',
            adminNotes: 'Test cancellation for stock restoration verification'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (approvalResponse.data.success) {
            console.log('✅ Cancellation approved successfully');
            
            if (approvalResponse.data.data?.stockUpdateEvent) {
                const stockEvent = approvalResponse.data.data.stockUpdateEvent;
                console.log(`Stock restored: ${stockEvent.stockRestored}`);
                
                if (stockEvent.stockRestorations) {
                    console.log('Stock restorations:');
                    stockEvent.stockRestorations.forEach(restoration => {
                        console.log(`  - ${restoration.product} (${restoration.size}/${restoration.color}): +${restoration.quantityRestored} → ${restoration.newAvailableStock} available`);
                    });
                }
            }
        } else {
            console.log('❌ Cancellation approval failed:', approvalResponse.data.message);
            return;
        }
        
        // Step 4: Check stock after cancellation
        console.log('\n📊 STEP 4: Checking stock levels after cancellation...');
        
        // Wait a moment for the database to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const stockResponse2 = await axios.get('http://localhost:5000/api/maintenance/products', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const striveProduct2 = stockResponse2.data.find(p => 
            p.productname && p.productname.toLowerCase().includes('strive forward')
        );
        
        if (striveProduct2) {
            console.log('Updated Strive Forward stock:');
            console.log(`  Total Available: ${striveProduct2.total_available_stock}`);
            console.log(`  Total Reserved: ${striveProduct2.total_reserved_stock}`);
            console.log(`  Last Update: ${striveProduct2.last_stock_update}`);
            
            if (striveProduct2.sizes) {
                const sizesData = JSON.parse(striveProduct2.sizes);
                const largeBlack = sizesData.find(s => s.size === 'L')?.colorStocks.find(c => c.color === 'Black');
                console.log(`  L/Black in sizes JSON: ${largeBlack ? largeBlack.stock : 'NOT FOUND'}`);
            }
            
            // Compare before and after
            if (striveProduct1 && striveProduct2) {
                const availableChange = striveProduct2.total_available_stock - striveProduct1.total_available_stock;
                const reservedChange = striveProduct2.total_reserved_stock - striveProduct1.total_reserved_stock;
                
                console.log('\n📈 Stock Changes:');
                console.log(`  Available: ${striveProduct1.total_available_stock} → ${striveProduct2.total_available_stock} (${availableChange >= 0 ? '+' : ''}${availableChange})`);
                console.log(`  Reserved: ${striveProduct1.total_reserved_stock} → ${striveProduct2.total_reserved_stock} (${reservedChange >= 0 ? '+' : ''}${reservedChange})`);
                
                if (availableChange > 0 && reservedChange < 0) {
                    console.log('✅ SUCCESS: Stock restoration working correctly!');
                } else {
                    console.log('⚠️ WARNING: Expected available stock to increase and reserved stock to decrease');
                }
            }
        }
        
        console.log('\n🎯 Test completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Wait for servers to start, then run test
setTimeout(() => {
    testCancellationStockFix();
}, 5000);
