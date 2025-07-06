// Test phone display with regular orders (not custom orders)
const mysql = require('mysql2/promise');

async function testRegularOrderPhones() {
  console.log('📞 TESTING PHONE DISPLAY WITH REGULAR ORDERS');
  console.log('='.repeat(50));

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Get REGULAR orders (not custom orders) with phone data
    const [regularOrders] = await connection.execute(`
      SELECT 
        order_number,
        contact_phone,
        contact_phone as customer_phone,
        status,
        created_at,
        CASE 
          WHEN contact_phone IS NULL THEN 'NULL_VALUE'
          WHEN contact_phone = '' THEN 'EMPTY_STRING'
          WHEN contact_phone = 'null' THEN 'NULL_STRING'
          WHEN contact_phone = 'undefined' THEN 'UNDEFINED_STRING'
          ELSE 'VALID_PHONE'
        END as phone_type
      FROM orders
      WHERE status IN ('confirmed', 'processing', 'Order Received')
      AND NOT (order_number LIKE '%CUSTOM%' OR notes LIKE '%Custom Order%')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n🧪 REGULAR ORDER PHONE TESTS:');
    console.log('-'.repeat(40));

    regularOrders.forEach((order, index) => {
      const transaction = order; // Simulate transaction object
      
      // Apply the NEW logic from TransactionPage.js
      const resolvedPhone = (transaction.contact_phone && transaction.contact_phone !== 'null' && transaction.contact_phone !== 'undefined') 
        ? transaction.contact_phone 
        : (transaction.customer_phone && transaction.customer_phone !== 'null' && transaction.customer_phone !== 'undefined') 
          ? transaction.customer_phone 
          : 'N/A';

      console.log(`\n📱 Order ${index + 1} (${order.order_number}):`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Phone Type: ${order.phone_type}`);
      console.log(`   Raw contact_phone: "${order.contact_phone}"`);
      console.log(`   🎯 DISPLAY RESULT: "${resolvedPhone}" ${resolvedPhone !== 'N/A' ? '✅ SHOWS PHONE' : '❌ SHOWS N/A'}`);
      console.log(`   Created: ${order.created_at}`);
    });

    // Check the specific order from the screenshot (ORD17517351080342534)
    console.log('\n🔍 CHECKING SPECIFIC ORDER FROM SCREENSHOT:');
    console.log('-'.repeat(50));
    
    const [specificOrder] = await connection.execute(`
      SELECT 
        order_number,
        contact_phone,
        status,
        shipping_address,
        street_address,
        city_municipality,
        province,
        zip_code
      FROM orders
      WHERE order_number = 'ORD17517351080342534'
    `);

    if (specificOrder.length > 0) {
      const order = specificOrder[0];
      console.log(`📋 Order ORD17517351080342534:`);
      console.log(`   contact_phone: "${order.contact_phone}"`);
      console.log(`   status: ${order.status}`);
      console.log(`   shipping_address: "${order.shipping_address}"`);
      console.log(`   street_address: "${order.street_address}"`);
      console.log(`   city_municipality: "${order.city_municipality}"`);
      console.log(`   province: "${order.province}"`);
      console.log(`   zip_code: "${order.zip_code}"`);
      
      // Test phone resolution for this specific order
      const resolvedPhone = (order.contact_phone && order.contact_phone !== 'null' && order.contact_phone !== 'undefined') 
        ? order.contact_phone 
        : 'N/A';
      
      console.log(`   🎯 Should display phone as: "${resolvedPhone}"`);
      
      if (resolvedPhone === 'N/A' && order.contact_phone) {
        console.log(`   ⚠️  WARNING: Phone exists but resolves to N/A!`);
        console.log(`   ⚠️  Raw value: "${order.contact_phone}"`);
        console.log(`   ⚠️  Type: ${typeof order.contact_phone}`);
        console.log(`   ⚠️  Length: ${order.contact_phone.length}`);
      }
    } else {
      console.log('❌ Order ORD17517351080342534 not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testRegularOrderPhones();
