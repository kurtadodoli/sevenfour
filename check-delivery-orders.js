const db = require('./server/config/db');

const query1 = `
SELECT co.custom_order_id, co.status, co.payment_status, co.updated_at, 
       o.id as delivery_order_id, o.order_number, o.notes
FROM custom_orders co
LEFT JOIN orders o ON o.notes LIKE CONCAT('%', co.custom_order_id, '%')
WHERE co.status = 'confirmed' AND co.payment_status = 'verified'
ORDER BY co.updated_at DESC;
`;

const query2 = `
SELECT co.custom_order_id, co.status, co.payment_status, co.updated_at, 
       o.id as delivery_order_id, o.order_number, o.notes
FROM custom_orders co
LEFT JOIN orders o ON o.notes LIKE CONCAT('%', co.custom_order_id, '%')
WHERE co.status = 'approved'
ORDER BY co.updated_at DESC;
`;

async function checkDeliveryOrders() {
  try {
    console.log('🔍 Checking CONFIRMED custom orders (shown in TransactionPage):');
    const confirmedResults = await db.query(query1);
    console.table(confirmedResults);
    
    const confirmedWithDelivery = confirmedResults.filter(r => r.delivery_order_id);
    const confirmedWithoutDelivery = confirmedResults.filter(r => !r.delivery_order_id);
    
    console.log(`\nConfirmed Orders Summary:`);
    console.log(`- Total confirmed custom orders: ${confirmedResults.length}`);
    console.log(`- With delivery orders: ${confirmedWithDelivery.length}`);
    console.log(`- Without delivery orders: ${confirmedWithoutDelivery.length}`);
    
    console.log('\n🔍 Checking APPROVED custom orders (should have delivery orders):');
    const approvedResults = await db.query(query2);
    console.table(approvedResults);
    
    const approvedWithDelivery = approvedResults.filter(r => r.delivery_order_id);
    const approvedWithoutDelivery = approvedResults.filter(r => !r.delivery_order_id);
    
    console.log(`\nApproved Orders Summary:`);
    console.log(`- Total approved custom orders: ${approvedResults.length}`);
    console.log(`- With delivery orders: ${approvedWithDelivery.length}`);
    console.log(`- Without delivery orders: ${approvedWithoutDelivery.length}`);
    
    if (confirmedWithDelivery.length > 0) {
      console.log('\n⚠️ POTENTIAL DUPLICATION ISSUE:');
      console.log('These confirmed custom orders also have delivery orders and may appear twice in TransactionPage:');
      confirmedWithDelivery.forEach(order => {
        console.log(`- ${order.custom_order_id} -> Delivery Order: ${order.order_number}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDeliveryOrders();
