const db = require('./server/config/db');

async function checkCustomOrderPricing() {
  try {
    const customOrderId = 'CUSTOM-MCNQQ7NW-GQEOI';
    
    console.log(`🔍 Investigating pricing issue for ${customOrderId}...\n`);
    
    // Check the custom order details
    const customOrder = await db.query('SELECT * FROM custom_orders WHERE custom_order_id = ?', [customOrderId]);
    console.log('📝 Custom Order Details:');
    if (customOrder.length > 0) {
      const order = customOrder[0];
      console.log(`- Order ID: ${order.custom_order_id}`);
      console.log(`- Product: ${order.product_type} (${order.product_name})`);
      console.log(`- Size: ${order.size}, Color: ${order.color}, Quantity: ${order.quantity}`);
      console.log(`- Estimated Price: ₱${order.estimated_price}`);
      console.log(`- Status: ${order.status}`);
      console.log(`- Payment Status: ${order.payment_status}`);
      console.log(`- Created: ${order.created_at}`);
      console.log(`- Updated: ${order.updated_at}`);
    } else {
      console.log('❌ Custom order not found!');
    }
    
    // Check if there's a delivery order created for this
    const deliveryOrder = await db.query(`SELECT * FROM orders WHERE notes LIKE '%${customOrderId}%'`);
    console.log('\n🚚 Delivery Order Details:');
    if (deliveryOrder.length > 0) {
      const order = deliveryOrder[0];
      console.log(`- Order Number: ${order.order_number}`);
      console.log(`- Total Amount: ₱${order.total_amount}`);
      console.log(`- Status: ${order.status}`);
      console.log(`- Notes: ${order.notes}`);
      console.log(`- Created: ${order.created_at}`);
    } else {
      console.log('❌ No delivery order found for this custom order!');
    }
    
    // Check payment details
    const payments = await db.query('SELECT * FROM custom_order_payments WHERE custom_order_id = ?', [customOrderId]);
    console.log('\n💰 Payment Details:');
    if (payments.length > 0) {
      payments.forEach((payment, index) => {
        console.log(`Payment ${index + 1}:`);
        console.log(`- Amount: ₱${payment.payment_amount}`);
        console.log(`- Status: ${payment.payment_status}`);
        console.log(`- GCash Reference: ${payment.gcash_reference}`);
        console.log(`- Verified At: ${payment.verified_at}`);
        console.log(`- Admin Notes: ${payment.admin_notes}`);
      });
    } else {
      console.log('❌ No payment records found!');
    }
    
    // Check order items if delivery order exists
    if (deliveryOrder.length > 0) {
      const orderItems = await db.query('SELECT * FROM order_items WHERE order_id = ?', [deliveryOrder[0].id]);
      console.log('\n📦 Order Items:');
      if (orderItems.length > 0) {
        orderItems.forEach((item, index) => {
          console.log(`Item ${index + 1}:`);
          console.log(`- Product Name: ${item.product_name}`);
          console.log(`- Price: ₱${item.product_price}`);
          console.log(`- Quantity: ${item.quantity}`);
          console.log(`- Subtotal: ₱${item.subtotal}`);
          console.log(`- Color: ${item.color}, Size: ${item.size}`);
        });
      } else {
        console.log('❌ No order items found!');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkCustomOrderPricing();
