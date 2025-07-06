// Comprehensive test for both duplicate fix and status update fix
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function comprehensiveTest() {
  console.log('🔍 COMPREHENSIVE TEST: Duplicate Fix + Status Update Fix\n');
  
  try {
    // Test 1: Check if duplicates are fixed
    console.log('🧪 TEST 1: Checking for duplicate custom orders...');
    const ordersResponse = await api.get('/delivery-enhanced/orders');
    
    if (ordersResponse.data.success) {
      const ordersData = ordersResponse.data.data;
      console.log(`📦 Received ${ordersData.length} orders from API`);
      
      // Apply deduplication logic
      const orderMap = new Map();
      const duplicates = [];
      
      ordersData.forEach((order, index) => {
        const key = `${order.order_number}_${order.order_type}`;
        if (orderMap.has(key)) {
          duplicates.push({ key, order });
        } else {
          orderMap.set(key, order);
        }
      });
      
      if (duplicates.length > 0) {
        console.log(`❌ TEST 1 FAILED: Found ${duplicates.length} duplicates`);
        duplicates.forEach(dup => console.log(`   - ${dup.key}`));
      } else {
        console.log('✅ TEST 1 PASSED: No duplicates found');
      }
      
      // Check specific order
      const customOrders = ordersData.filter(o => o.order_type === 'custom_order' && o.order_number === 'CUSTOM-MCNQQ7NW-GQEOI');
      console.log(`🔍 CUSTOM-MCNQQ7NW-GQEOI instances: ${customOrders.length}`);
      
      if (customOrders.length === 1) {
        console.log('✅ Specific order test PASSED: Only one instance found');
        
        // Test 2: Check if status update works
        console.log('\n🧪 TEST 2: Testing delivery status update...');
        const order = customOrders[0];
        const originalStatus = order.delivery_status;
        console.log(`📊 Current status: ${originalStatus}`);
        
        // Try to update status
        try {
          const updateResponse = await api.put(`/delivery-status/orders/${order.id}/status`, {
            delivery_status: 'in_transit',
            order_type: 'custom_order',
            delivery_notes: 'Status updated via comprehensive test'
          });
          
          if (updateResponse.data.success) {
            console.log('✅ TEST 2 PASSED: Status update successful');
            console.log(`📊 Status changed to: in_transit`);
            
            // Test 3: Verify the status was actually updated
            console.log('\n🧪 TEST 3: Verifying status update persistence...');
            const verifyResponse = await api.get('/delivery-enhanced/orders');
            
            if (verifyResponse.data.success) {
              const updatedOrders = verifyResponse.data.data.filter(o => 
                o.order_type === 'custom_order' && o.order_number === 'CUSTOM-MCNQQ7NW-GQEOI'
              );
              
              if (updatedOrders.length === 1 && updatedOrders[0].delivery_status === 'in_transit') {
                console.log('✅ TEST 3 PASSED: Status update persisted correctly');
                console.log(`📊 Verified status: ${updatedOrders[0].delivery_status}`);
                
                // Restore original status
                console.log('\n🔄 Restoring original status...');
                await api.put(`/delivery-status/orders/${order.id}/status`, {
                  delivery_status: originalStatus,
                  order_type: 'custom_order',
                  delivery_notes: 'Status restored after test'
                });
                console.log(`✅ Status restored to: ${originalStatus}`);
                
                console.log('\n🎉 ALL TESTS PASSED! Both issues are fixed:');
                console.log('   ✅ Duplicate custom orders issue: RESOLVED');
                console.log('   ✅ Delivery status update issue: RESOLVED');
                
              } else {
                console.log('❌ TEST 3 FAILED: Status update did not persist');
              }
            }
            
          } else {
            console.log('❌ TEST 2 FAILED: Status update API returned error');
            console.log('Error:', updateResponse.data.message);
          }
          
        } catch (updateError) {
          console.log('❌ TEST 2 FAILED: Status update request failed');
          console.log('Error:', updateError.response?.data?.message || updateError.message);
        }
        
      } else if (customOrders.length > 1) {
        console.log('❌ Specific order test FAILED: Still finding duplicates');
      } else {
        console.log('⚠️ Specific order test: Order not found in results');
      }
      
    } else {
      console.log('❌ TEST 1 FAILED: API returned error');
      console.log('Error:', ordersResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ COMPREHENSIVE TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

comprehensiveTest();
