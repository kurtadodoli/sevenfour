// Track phone number from OrderPage.js to TransactionPage.js
const mysql = require('mysql2/promise');

async function trackPhoneNumber() {
  console.log('📞 TRACKING PHONE NUMBER FLOW FROM OrderPage.js TO TransactionPage.js');
  console.log('='.repeat(70));

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('\n🔍 STEP 1: Check what OrderPage.js sends');
    console.log('-'.repeat(50));
    console.log('OrderPage.js Form Field: checkoutForm.contact_phone');
    console.log('FormData: formData.append("contact_phone", checkoutForm.contact_phone)');
    console.log('Expected Database Field: orders.contact_phone');

    console.log('\n🔍 STEP 2: Check actual database storage');
    console.log('-'.repeat(50));
    
    const [rawOrders] = await connection.execute(`
      SELECT 
        id,
        order_number,
        contact_phone,
        created_at
      FROM orders 
      WHERE contact_phone IS NOT NULL 
      AND contact_phone != ''
      AND contact_phone != 'null'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('\nDirect database check (orders table):');
    rawOrders.forEach((order, index) => {
      console.log(`📱 Order ${index + 1} (${order.order_number}):`);
      console.log(`   contact_phone: "${order.contact_phone}" ${order.contact_phone ? '✅' : '❌'}`);
      console.log(`   Type: ${typeof order.contact_phone}`);
      console.log(`   Length: ${order.contact_phone ? order.contact_phone.length : 0}`);
      console.log(`   Created: ${order.created_at}`);
    });

    console.log('\n🔍 STEP 3: Check delivery-enhanced endpoint result');
    console.log('-'.repeat(50));

    const [deliveryResults] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        oi.customer_name,
        oi.customer_email,
        o.contact_phone,
        o.contact_phone as customer_phone,
        o.total_amount,
        o.status,
        o.order_date,
        o.shipping_address,
        o.street_address,
        o.city_municipality,
        o.province,
        o.zip_code
      FROM orders o
      LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
      WHERE o.status IN ('confirmed', 'processing', 'Order Received')
      AND (
        o.confirmed_by IS NOT NULL 
        OR o.status = 'Order Received'
        OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
      )
      AND NOT (o.order_number LIKE '%CUSTOM%' OR o.notes LIKE '%Custom Order%')
      ORDER BY o.order_date DESC
      LIMIT 3
    `);

    console.log('\nDelivery-enhanced endpoint results:');
    deliveryResults.forEach((transaction, index) => {
      console.log(`\n📱 Transaction ${index + 1} (${transaction.order_number}):`);
      console.log(`   Raw contact_phone: "${transaction.contact_phone}"`);
      console.log(`   Type: ${typeof transaction.contact_phone}`);
      console.log(`   Is truthy: ${!!transaction.contact_phone}`);
      console.log(`   Is "null" string: ${transaction.contact_phone === 'null'}`);
      console.log(`   Is "undefined" string: ${transaction.contact_phone === 'undefined'}`);
      console.log(`   Is empty string: ${transaction.contact_phone === ''}`);
      console.log(`   customer_phone alias: "${transaction.customer_phone}"`);
      
      // Simulate TransactionPage.js logic
      const resolvedPhone = transaction.contact_phone || transaction.customer_phone || 'N/A';
      console.log(`   🎯 TransactionPage.js result: "${resolvedPhone}" ${resolvedPhone !== 'N/A' ? '✅' : '❌'}`);
    });

    console.log('\n🔍 STEP 4: Check for problematic phone values');
    console.log('-'.repeat(50));

    const [problemCheck] = await connection.execute(`
      SELECT 
        contact_phone,
        COUNT(*) as count
      FROM orders 
      GROUP BY contact_phone
      ORDER BY count DESC
      LIMIT 10
    `);

    console.log('\nPhone value distribution in database:');
    problemCheck.forEach((row) => {
      const phoneValue = row.contact_phone;
      const isProblematic = !phoneValue || phoneValue === 'null' || phoneValue === 'undefined' || phoneValue === '';
      console.log(`   "${phoneValue}": ${row.count} orders ${isProblematic ? '❌ PROBLEMATIC' : '✅ GOOD'}`);
    });

    console.log('\n🔧 DIAGNOSIS:');
    console.log('-'.repeat(30));
    
    const latestOrder = deliveryResults[0];
    if (latestOrder) {
      if (!latestOrder.contact_phone || latestOrder.contact_phone === 'null' || latestOrder.contact_phone === 'undefined') {
        console.log('❌ ISSUE FOUND: contact_phone is not being stored properly from OrderPage.js');
        console.log('   This suggests an issue in the order creation process or validation');
      } else {
        console.log('✅ Phone storage looks correct');
        console.log('   If N/A still appears, check TransactionPage.js logic');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

trackPhoneNumber();
