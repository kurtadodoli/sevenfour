// Fix "undefined" string issue in database
const mysql = require('mysql2/promise');

async function fixUndefinedStrings() {
  console.log('🔧 FIXING "undefined" STRING ISSUE IN DATABASE');
  console.log('='.repeat(60));

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // First, check how many records have "undefined" strings
    console.log('\n📊 BEFORE: Checking for "undefined" strings...');
    const [beforeCheck] = await connection.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN contact_phone = 'undefined' THEN 1 ELSE 0 END) as undefined_phones,
        SUM(CASE WHEN street_address = 'undefined' THEN 1 ELSE 0 END) as undefined_streets,
        SUM(CASE WHEN city_municipality = 'undefined' THEN 1 ELSE 0 END) as undefined_cities,
        SUM(CASE WHEN province = 'undefined' THEN 1 ELSE 0 END) as undefined_provinces,
        SUM(CASE WHEN zip_code = 'undefined' THEN 1 ELSE 0 END) as undefined_zips
      FROM orders
    `);
    
    console.log('\nCurrent "undefined" strings in database:');
    console.log(`📞 Phone (contact_phone): ${beforeCheck[0].undefined_phones} out of ${beforeCheck[0].total_orders}`);
    console.log(`🏠 Street: ${beforeCheck[0].undefined_streets} out of ${beforeCheck[0].total_orders}`);
    console.log(`🏙️ City: ${beforeCheck[0].undefined_cities} out of ${beforeCheck[0].total_orders}`);
    console.log(`🗺️ Province: ${beforeCheck[0].undefined_provinces} out of ${beforeCheck[0].total_orders}`);
    console.log(`📮 ZIP: ${beforeCheck[0].undefined_zips} out of ${beforeCheck[0].total_orders}`);

    // Show specific examples of "undefined" strings
    console.log('\n🔍 EXAMPLES OF "undefined" STRINGS:');
    const [examples] = await connection.execute(`
      SELECT 
        id,
        order_number,
        contact_phone,
        street_address,
        city_municipality,
        province,
        zip_code,
        created_at
      FROM orders 
      WHERE contact_phone = 'undefined' 
         OR street_address = 'undefined'
         OR city_municipality = 'undefined' 
         OR province = 'undefined'
         OR zip_code = 'undefined'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    examples.forEach((order, index) => {
      console.log(`\n❌ Order ${index + 1} (${order.order_number}):`);
      console.log(`   contact_phone: "${order.contact_phone}"`);
      console.log(`   street_address: "${order.street_address}"`);
      console.log(`   city_municipality: "${order.city_municipality}"`);
      console.log(`   province: "${order.province}"`);
      console.log(`   zip_code: "${order.zip_code}"`);
      console.log(`   created_at: ${order.created_at}`);
    });

    console.log('\n🔧 SOLUTION OPTIONS:');
    console.log('Option 1: Update TransactionPage.js to handle "undefined" strings (DONE)');
    console.log('Option 2: Fix the root cause in OrderPage.js form submission');
    console.log('Option 3: Clean up existing "undefined" strings in database');
    
    console.log('\n⚠️  WARNING: Do NOT automatically clean database without understanding the impact!');
    console.log('The fix in TransactionPage.js should resolve the N/A display issue.');

    // Let's also check where the actual phone data is stored
    console.log('\n🔍 CHECKING WHERE REAL PHONE DATA IS STORED:');
    const [phoneCheck] = await connection.execute(`
      SELECT DISTINCT
        o.contact_phone,
        oi.customer_name,
        oi.customer_email
      FROM orders o
      LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
      WHERE o.contact_phone = 'undefined'
      AND oi.customer_name IS NOT NULL
      LIMIT 3
    `);

    phoneCheck.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`   contact_phone in orders table: "${order.contact_phone}"`);
      console.log(`   customer_name: "${order.customer_name}"`);
      console.log(`   customer_email: "${order.customer_email}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixUndefinedStrings();
