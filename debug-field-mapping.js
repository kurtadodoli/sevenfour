// Debug Field Mapping - Check what data is actually stored vs displayed
const mysql = require('mysql2/promise');

async function debugFieldMapping() {
  console.log('🔍 DEBUG: Analyzing field mapping between OrderPage.js input and TransactionPage.js display');
  console.log('='.repeat(80));

  // Create database connection
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Get the most recent order to analyze
    const [orders] = await connection.execute(`
      SELECT 
        id,
        customer_name,
        customer_email,
        contact_phone,
        customer_phone,
        street_address,
        shipping_address,
        city_municipality,
        city,
        province,
        zip_code,
        postal_code,
        created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('\n📊 FIELD MAPPING ANALYSIS:');
    console.log('-'.repeat(50));

    // What OrderPage.js sends (from FormData):
    console.log('\n🚀 OrderPage.js FormData Fields:');
    console.log('✓ customer_name         -> customer_name');
    console.log('✓ customer_email        -> customer_email');
    console.log('✓ contact_phone         -> contact_phone (NOT customer_phone)');
    console.log('✓ checkoutForm.city     -> city_municipality (NOT city)');
    console.log('✓ street_address        -> street_address');
    console.log('✓ province              -> province');
    console.log('✓ checkoutForm.postal_code -> zip_code (NOT postal_code)');

    console.log('\n📱 TransactionPage.js Display Logic:');
    console.log('❌ Phone: contact_phone || customer_phone || "N/A"');
    console.log('❌ City:  city_municipality || city || "N/A"');
    console.log('❌ ZIP:   zip_code || postal_code || "N/A"');

    console.log('\n📋 ACTUAL DATABASE RECORDS:');
    console.log('-'.repeat(50));

    orders.forEach((order, index) => {
      console.log(`\n🔢 Order ${index + 1} (ID: ${order.id}):`);
      console.log(`   Created: ${order.created_at}`);
      console.log(`   Name: "${order.customer_name}"`);
      console.log(`   Email: "${order.customer_email}"`);
      console.log(`   📞 Phone Fields:`);
      console.log(`      contact_phone: "${order.contact_phone}" ${order.contact_phone ? '✅' : '❌'}`);
      console.log(`      customer_phone: "${order.customer_phone}" ${order.customer_phone ? '✅' : '❌'}`);
      console.log(`   🏠 Address Fields:`);
      console.log(`      street_address: "${order.street_address}" ${order.street_address ? '✅' : '❌'}`);
      console.log(`      shipping_address: "${order.shipping_address}" ${order.shipping_address ? '✅' : '❌'}`);
      console.log(`   🏙️ City Fields:`);
      console.log(`      city_municipality: "${order.city_municipality}" ${order.city_municipality ? '✅' : '❌'}`);
      console.log(`      city: "${order.city}" ${order.city ? '✅' : '❌'}`);
      console.log(`   📮 ZIP Fields:`);
      console.log(`      zip_code: "${order.zip_code}" ${order.zip_code ? '✅' : '❌'}`);
      console.log(`      postal_code: "${order.postal_code}" ${order.postal_code ? '✅' : '❌'}`);
    });

    console.log('\n🎯 FINDINGS SUMMARY:');
    console.log('-'.repeat(50));
    
    const sampleOrder = orders[0];
    if (sampleOrder) {
      console.log('\n✅ Fields that SHOULD have data (from OrderPage.js):');
      console.log(`   • contact_phone: ${sampleOrder.contact_phone ? 'HAS DATA' : 'MISSING!'}`);
      console.log(`   • city_municipality: ${sampleOrder.city_municipality ? 'HAS DATA' : 'MISSING!'}`);
      console.log(`   • zip_code: ${sampleOrder.zip_code ? 'HAS DATA' : 'MISSING!'}`);
      
      console.log('\n❌ Fields that should be EMPTY (not used by OrderPage.js):');
      console.log(`   • customer_phone: ${sampleOrder.customer_phone ? 'UNEXPECTED DATA!' : 'Empty (correct)'}`);
      console.log(`   • city: ${sampleOrder.city ? 'UNEXPECTED DATA!' : 'Empty (correct)'}`);
      console.log(`   • postal_code: ${sampleOrder.postal_code ? 'UNEXPECTED DATA!' : 'Empty (correct)'}`);
    }

    console.log('\n🔧 FIXES NEEDED:');
    console.log('-'.repeat(50));
    console.log('TransactionPage.js should check fields in this priority order:');
    console.log('📞 Phone: contact_phone (PRIMARY) || customer_phone (fallback)');
    console.log('🏙️ City: city_municipality (PRIMARY) || city (fallback)');
    console.log('📮 ZIP: zip_code (PRIMARY) || postal_code (fallback)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugFieldMapping();
