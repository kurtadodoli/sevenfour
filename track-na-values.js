// COMPREHENSIVE N/A TRACKING - Find exactly what's causing N/A values
const mysql = require('mysql2/promise');

async function trackNAValues() {
  console.log('🔍 COMPREHENSIVE N/A TRACKING - Finding the real cause of N/A values');
  console.log('='.repeat(80));

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // First, let's see exactly what the deliveryEnhanced endpoint returns vs orders table
    console.log('\n🎯 STEP 1: Check what delivery-enhanced endpoint ACTUALLY returns');
    console.log('-'.repeat(60));
    
    // This is the EXACT query that delivery-enhanced endpoint uses for regular orders
    const [deliveryEnhancedResults] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        oi.customer_name,
        oi.customer_email,
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
      LIMIT 5
    `);

    console.log('\n📊 DELIVERY-ENHANCED ENDPOINT RESULTS:');
    console.log('-'.repeat(50));
    
    deliveryEnhancedResults.forEach((order, index) => {
      console.log(`\n🔢 Order ${index + 1} (${order.order_number}):`);
      console.log(`   📋 Raw Database Fields:`);
      console.log(`      contact_phone: "${order.contact_phone}" ${order.contact_phone && order.contact_phone !== 'null' ? '✅' : '❌'}`);
      console.log(`      street_address: "${order.street_address}" ${order.street_address && order.street_address !== 'null' ? '✅' : '❌'}`);
      console.log(`      city_municipality: "${order.city_municipality}" ${order.city_municipality && order.city_municipality !== 'null' ? '✅' : '❌'}`);
      console.log(`      province: "${order.province}" ${order.province && order.province !== 'null' ? '✅' : '❌'}`);
      console.log(`      zip_code: "${order.zip_code}" ${order.zip_code && order.zip_code !== 'null' ? '✅' : '❌'}`);
      
      console.log(`   🔄 Computed Fields (what delivery-enhanced returns):`);
      console.log(`      customer_phone: "${order.customer_phone}" ${order.customer_phone && order.customer_phone !== 'null' ? '✅' : '❌'}`);
      console.log(`      shipping_city: "${order.shipping_city}" ${order.shipping_city && order.shipping_city !== 'Unknown City' ? '✅' : '❌'}`);
      console.log(`      shipping_province: "${order.shipping_province}" ${order.shipping_province && order.shipping_province !== 'Metro Manila' ? '✅' : '❌'}`);
      console.log(`      shipping_postal_code: "${order.shipping_postal_code}" ${order.shipping_postal_code ? '✅' : '❌'}`);
      console.log(`      shipping_address: "${order.shipping_address}"`);
    });

    console.log('\n🎯 STEP 2: Check order_invoices table (where customer_name/email comes from)');
    console.log('-'.repeat(60));
    
    const [invoiceData] = await connection.execute(`
      SELECT 
        oi.invoice_id,
        oi.customer_name,
        oi.customer_email,
        o.order_number,
        o.contact_phone,
        o.street_address,
        o.city_municipality,
        o.province,
        o.zip_code
      FROM order_invoices oi
      LEFT JOIN orders o ON oi.invoice_id = o.invoice_id
      WHERE o.id IN (${deliveryEnhancedResults.map(r => r.id).join(',')})
    `);

    console.log('\n📋 ORDER_INVOICES DATA:');
    invoiceData.forEach((invoice, index) => {
      console.log(`\n📄 Invoice ${index + 1} (${invoice.order_number}):`);
      console.log(`   customer_name: "${invoice.customer_name}" ${invoice.customer_name ? '✅' : '❌'}`);
      console.log(`   customer_email: "${invoice.customer_email}" ${invoice.customer_email ? '✅' : '❌'}`);
      console.log(`   📞 contact_phone (from orders): "${invoice.contact_phone}" ${invoice.contact_phone && invoice.contact_phone !== 'null' ? '✅' : '❌'}`);
      console.log(`   🏠 street_address (from orders): "${invoice.street_address}" ${invoice.street_address && invoice.street_address !== 'null' ? '✅' : '❌'}`);
      console.log(`   🏙️ city_municipality (from orders): "${invoice.city_municipality}" ${invoice.city_municipality && invoice.city_municipality !== 'null' ? '✅' : '❌'}`);
      console.log(`   🗺️ province (from orders): "${invoice.province}" ${invoice.province && invoice.province !== 'null' ? '✅' : '❌'}`);
      console.log(`   📮 zip_code (from orders): "${invoice.zip_code}" ${invoice.zip_code && invoice.zip_code !== 'null' ? '✅' : '❌'}`);
    });

    console.log('\n🎯 STEP 3: SIMULATE TransactionPage.js field logic');
    console.log('-'.repeat(60));
    
    deliveryEnhancedResults.forEach((transaction, index) => {
      console.log(`\n🖥️ TransactionPage.js Field Resolution for Order ${index + 1}:`);
      console.log(`   Original Order: ${transaction.order_number}`);
      
      // Simulate exactly what TransactionPage.js does
      const resolvedPhone = transaction.contact_phone || transaction.customer_phone || 'N/A';
      const resolvedCity = transaction.city_municipality || transaction.shipping_city || transaction.city || 'N/A';
      const resolvedProvince = transaction.province || transaction.shipping_province || 'N/A';
      const resolvedZip = transaction.zip_code || transaction.postal_code || transaction.shipping_postal_code || 'N/A';
      const resolvedStreet = transaction.street_address || transaction.shipping_address || 'N/A';
      
      console.log(`   📞 Phone Resolution:`);
      console.log(`      contact_phone: "${transaction.contact_phone}" → ${transaction.contact_phone && transaction.contact_phone !== 'null' ? 'VALID' : 'INVALID'}`);
      console.log(`      customer_phone: "${transaction.customer_phone}" → ${transaction.customer_phone && transaction.customer_phone !== 'null' ? 'VALID' : 'INVALID'}`);
      console.log(`      RESULT: "${resolvedPhone}" ${resolvedPhone !== 'N/A' ? '✅' : '❌ N/A!'}`);
      
      console.log(`   🏙️ City Resolution:`);
      console.log(`      city_municipality: "${transaction.city_municipality}" → ${transaction.city_municipality && transaction.city_municipality !== 'null' ? 'VALID' : 'INVALID'}`);
      console.log(`      shipping_city: "${transaction.shipping_city}" → ${transaction.shipping_city && transaction.shipping_city !== 'Unknown City' ? 'VALID' : 'INVALID'}`);
      console.log(`      RESULT: "${resolvedCity}" ${resolvedCity !== 'N/A' ? '✅' : '❌ N/A!'}`);
      
      console.log(`   🗺️ Province Resolution:`);
      console.log(`      province: "${transaction.province}" → ${transaction.province && transaction.province !== 'null' ? 'VALID' : 'INVALID'}`);
      console.log(`      shipping_province: "${transaction.shipping_province}" → ${transaction.shipping_province && transaction.shipping_province !== 'Metro Manila' ? 'VALID' : 'INVALID'}`);
      console.log(`      RESULT: "${resolvedProvince}" ${resolvedProvince !== 'N/A' ? '✅' : '❌ N/A!'}`);
      
      console.log(`   📮 ZIP Resolution:`);
      console.log(`      zip_code: "${transaction.zip_code}" → ${transaction.zip_code && transaction.zip_code !== 'null' ? 'VALID' : 'INVALID'}`);
      console.log(`      shipping_postal_code: "${transaction.shipping_postal_code}" → ${transaction.shipping_postal_code ? 'VALID' : 'INVALID'}`);
      console.log(`      RESULT: "${resolvedZip}" ${resolvedZip !== 'N/A' ? '✅' : '❌ N/A!'}`);
    });

    console.log('\n🚨 THE SMOKING GUN - EXACTLY WHY N/A APPEARS:');
    console.log('='.repeat(60));
    
    const problemOrder = deliveryEnhancedResults[0];
    if (problemOrder) {
      console.log('\n💡 ROOT CAUSE ANALYSIS:');
      
      if (problemOrder.contact_phone === 'null' || !problemOrder.contact_phone) {
        console.log('❌ PHONE N/A because: contact_phone is stored as STRING "null" or empty in database');
      }
      
      if (problemOrder.city_municipality === 'null' || !problemOrder.city_municipality) {
        console.log('❌ CITY N/A because: city_municipality is stored as STRING "null" or empty in database');
      }
      
      if (problemOrder.province === 'null' || !problemOrder.province) {
        console.log('❌ PROVINCE N/A because: province is stored as STRING "null" or empty in database');
      }
      
      if (problemOrder.zip_code === 'null' || !problemOrder.zip_code) {
        console.log('❌ ZIP N/A because: zip_code is stored as STRING "null" or empty in database');
      }
      
      console.log('\n🔧 SOLUTION NEEDED:');
      console.log('   • Fix NULL handling in OrderPage.js form submission');
      console.log('   • Fix NULL handling in TransactionPage.js field resolution');
      console.log('   • Check if data is being stored as STRING "null" instead of actual NULL');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

trackNAValues();
