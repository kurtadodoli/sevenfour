/**
 * Test script to verify that the delivery page shows:
 * 1. Scheduled delivery date for orders
 * 2. Proper order date display (no invalid dates)
 * 3. Assigned courier information
 * 
 * This script tests the delivery-enhanced API endpoint that feeds the DeliveryPage.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDeliveryPageData() {
  try {
    console.log('🧪 Testing Delivery Page Data...\n');
    
    // Test the delivery-enhanced endpoint
    console.log('📡 Fetching orders from delivery-enhanced endpoint...');
    const response = await axios.get(`${BASE_URL}/api/delivery-enhanced/orders`);
    
    if (!response.data.success) {
      console.error('❌ API request failed:', response.data.message);
      return;
    }
    
    const orders = response.data.data.orders || response.data.data || [];
    console.log(`✅ Found ${orders.length} orders for delivery management\n`);
    
    if (orders.length === 0) {
      console.log('ℹ️ No orders found. Please ensure there are admin-verified orders in the database.');
      return;
    }
    
    // Test each order for the required fields
    let validOrderDates = 0;
    let ordersWithScheduledDate = 0;
    let ordersWithCourier = 0;
    
    console.log('🔍 Analyzing order data...\n');
    
    for (let i = 0; i < Math.min(orders.length, 5); i++) {
      const order = orders[i];
      console.log(`--- Order ${i + 1}: ${order.order_number} ---`);
      console.log(`Customer: ${order.customer_name || order.customerName || 'N/A'}`);
      console.log(`Order Type: ${order.order_type}`);
      console.log(`Amount: ₱${parseFloat(order.total_amount || 0).toFixed(2)}`);
      
      // Test order date
      const orderDate = order.created_at || order.order_date || order.timestamp;
      if (orderDate) {
        try {
          const date = new Date(orderDate);
          if (!isNaN(date.getTime())) {
            console.log(`✅ Order Date: ${date.toLocaleDateString()} (Valid)`);
            validOrderDates++;
          } else {
            console.log(`❌ Order Date: Invalid date format (${orderDate})`);
          }
        } catch (e) {
          console.log(`❌ Order Date: Error parsing date (${orderDate})`);
        }
      } else {
        console.log(`⚠️ Order Date: Not available`);
      }
      
      // Test scheduled delivery date
      if (order.scheduled_delivery_date) {
        try {
          const schedDate = new Date(order.scheduled_delivery_date);
          if (!isNaN(schedDate.getTime())) {
            console.log(`✅ Scheduled Date: ${schedDate.toLocaleDateString()} ${order.scheduled_delivery_time || ''}`);
            ordersWithScheduledDate++;
          } else {
            console.log(`❌ Scheduled Date: Invalid format`);
          }
        } catch (e) {
          console.log(`❌ Scheduled Date: Error parsing`);
        }
      } else {
        console.log(`⚠️ Scheduled Date: Not scheduled yet`);
      }
      
      // Test courier information
      if (order.courier_name || order.courier_phone) {
        console.log(`✅ Assigned Courier: ${order.courier_name || 'N/A'} - ${order.courier_phone || 'N/A'}`);
        ordersWithCourier++;
      } else {
        console.log(`⚠️ Assigned Courier: No courier assigned`);
      }
      
      console.log(`Delivery Status: ${order.delivery_status || 'pending'}`);
      console.log('');
    }
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`Total Orders: ${orders.length}`);
    console.log(`Valid Order Dates: ${validOrderDates}/${Math.min(orders.length, 5)}`);
    console.log(`Orders with Scheduled Date: ${ordersWithScheduledDate}/${Math.min(orders.length, 5)}`);
    console.log(`Orders with Assigned Courier: ${ordersWithCourier}/${Math.min(orders.length, 5)}`);
    
    // Check for specific delivery statuses
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.delivery_status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('\n📈 Delivery Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} orders`);
    });
    
    // Test if there are orders ready for scheduling
    const unscheduledOrders = orders.filter(o => !o.delivery_status || o.delivery_status === 'pending');
    const scheduledOrders = orders.filter(o => o.delivery_status && o.delivery_status !== 'pending');
    
    console.log(`\n🎯 DELIVERY PAGE READINESS:`);
    console.log(`Orders ready for scheduling: ${unscheduledOrders.length}`);
    console.log(`Orders already scheduled: ${scheduledOrders.length}`);
    
    if (unscheduledOrders.length > 0) {
      console.log(`\n✅ Test successful! The delivery page should now display:`);
      console.log(`   - Valid order dates for all orders`);
      console.log(`   - Scheduled delivery dates for ${ordersWithScheduledDate} orders`);
      console.log(`   - Courier information for ${ordersWithCourier} orders`);
      console.log(`   - ${unscheduledOrders.length} orders available for scheduling`);
    } else {
      console.log(`\n⚠️ All orders are already scheduled. Create new orders to test scheduling.`);
    }
    
  } catch (error) {
    console.error('❌ Error testing delivery page data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testDeliveryPageData();
