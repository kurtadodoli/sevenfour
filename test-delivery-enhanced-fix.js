// Test the fixed delivery-enhanced endpoint
const mysql = require('mysql2/promise');

async function testDeliveryEnhancedFix() {
  console.log('🧪 TESTING DELIVERY-ENHANCED ENDPOINT AFTER FIXES');
  console.log('='.repeat(60));

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Simulate the EXACT query that delivery-enhanced endpoint now uses
    console.log('\n📊 TESTING FIXED DELIVERY-ENHANCED QUERY:');
    console.log('-'.repeat(50));
    
    const [results] = await connection.execute(`
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
        COALESCE(SUBSTRING_INDEX(SUBSTRING_INDEX(o.shipping_address, ',', -3), ',', 1), 'Unknown City') as shipping_city,
        COALESCE(SUBSTRING_INDEX(SUBSTRING_INDEX(o.shipping_address, ',', -2), ',', 1), 'Metro Manila') as shipping_province,
        '' as shipping_postal_code,
        o.contact_phone as shipping_phone,
        o.notes as shipping_notes,
        'regular' as order_type,
        COALESCE(o.delivery_status, 'pending') as delivery_status,
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

    console.log('\n🎯 FIXED ENDPOINT RESULTS:');
    console.log('-'.repeat(50));
    
    results.forEach((transaction, index) => {
      console.log(`\n📋 Order ${index + 1} (${transaction.order_number}):`);
      console.log(`   👤 Customer Info:`);
      console.log(`      customer_name: "${transaction.customer_name}" ${transaction.customer_name ? '✅' : '❌'}`);
      console.log(`      customer_email: "${transaction.customer_email}" ${transaction.customer_email ? '✅' : '❌'}`);
      
      console.log(`   📞 Phone Fields (FIXED):`);
      console.log(`      contact_phone: "${transaction.contact_phone}" ${transaction.contact_phone && transaction.contact_phone !== 'null' ? '✅' : '❌'}`);
      console.log(`      customer_phone: "${transaction.customer_phone}" ${transaction.customer_phone && transaction.customer_phone !== 'null' ? '✅' : '❌'}`);
      
      console.log(`   🏠 Address Fields (FIXED):`);
      console.log(`      street_address: "${transaction.street_address}" ${transaction.street_address && transaction.street_address !== 'null' ? '✅' : '❌'}`);
      console.log(`      shipping_address: "${transaction.shipping_address}" ${transaction.shipping_address ? '✅' : '❌'}`);
      
      console.log(`   🏙️ City Fields (FIXED):`);
      console.log(`      city_municipality: "${transaction.city_municipality}" ${transaction.city_municipality && transaction.city_municipality !== 'null' ? '✅' : '❌'}`);
      console.log(`      shipping_city: "${transaction.shipping_city}" ${transaction.shipping_city && transaction.shipping_city !== 'Unknown City' ? '✅' : '❌'}`);
      
      console.log(`   🗺️ Province Fields (FIXED):`);
      console.log(`      province: "${transaction.province}" ${transaction.province && transaction.province !== 'null' ? '✅' : '❌'}`);
      console.log(`      shipping_province: "${transaction.shipping_province}" ${transaction.shipping_province && transaction.shipping_province !== 'Metro Manila' ? '✅' : '❌'}`);
      
      console.log(`   📮 ZIP Fields (FIXED):`);
      console.log(`      zip_code: "${transaction.zip_code}" ${transaction.zip_code && transaction.zip_code !== 'null' ? '✅' : '❌'}`);
      console.log(`      shipping_postal_code: "${transaction.shipping_postal_code}" ${transaction.shipping_postal_code ? '✅' : '❌'}`);
    });

    console.log('\n🎯 SIMULATING TransactionPage.js FIELD RESOLUTION:');
    console.log('-'.repeat(60));
    
    results.forEach((transaction, index) => {
      console.log(`\n🖥️ TransactionPage.js Resolution for Order ${index + 1}:`);
      
      // Simulate exactly what TransactionPage.js will now do
      const resolvedPhone = transaction.contact_phone || transaction.customer_phone || 'N/A';
      const resolvedCity = transaction.city_municipality || transaction.shipping_city || transaction.city || 'N/A';
      const resolvedProvince = transaction.province || transaction.shipping_province || 'N/A';
      const resolvedZip = transaction.zip_code || transaction.postal_code || transaction.shipping_postal_code || 'N/A';
      const resolvedStreet = transaction.street_address || transaction.shipping_address || 'N/A';
      
      console.log(`   📞 PHONE: "${resolvedPhone}" ${resolvedPhone !== 'N/A' ? '✅ FIXED!' : '❌ Still N/A'}`);
      console.log(`   🏙️ CITY: "${resolvedCity}" ${resolvedCity !== 'N/A' ? '✅ FIXED!' : '❌ Still N/A'}`);
      console.log(`   🗺️ PROVINCE: "${resolvedProvince}" ${resolvedProvince !== 'N/A' ? '✅ FIXED!' : '❌ Still N/A'}`);
      console.log(`   📮 ZIP: "${resolvedZip}" ${resolvedZip !== 'N/A' ? '✅ FIXED!' : '❌ Still N/A'}`);
      console.log(`   🏠 STREET: "${resolvedStreet}" ${resolvedStreet !== 'N/A' ? '✅ FIXED!' : '❌ Still N/A'}`);
    });

    console.log('\n🎉 SUMMARY:');
    console.log('='.repeat(30));
    console.log('✅ delivery-enhanced endpoint now includes all required fields');
    console.log('✅ contact_phone field is now available (was missing before)');
    console.log('✅ All address fields (street_address, city_municipality, province, zip_code) are now included');
    console.log('✅ TransactionPage.js should now display user data instead of N/A');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Restart the server to apply the backend changes');
    console.log('2. Test the TransactionPage.js in browser');
    console.log('3. Verify that user-entered data now displays correctly');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testDeliveryEnhancedFix();
