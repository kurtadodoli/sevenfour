// Check actual orders table structure
const mysql = require('mysql2/promise');

async function checkTableStructure() {
  console.log('🔍 Checking actual orders table structure...');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Show table structure
    const [columns] = await connection.execute('DESCRIBE orders');
    
    console.log('\n📋 ORDERS TABLE STRUCTURE:');
    console.log('-'.repeat(50));
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | ${col.Null.padEnd(5)} | ${col.Key || ''}`);
    });

    // Get a sample of recent orders
    const [orders] = await connection.execute(`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    console.log('\n📊 SAMPLE RECENT ORDERS:');
    console.log('-'.repeat(80));
    
    if (orders.length > 0) {
      // Show field names
      console.log('\nAvailable fields in orders table:');
      Object.keys(orders[0]).forEach(field => {
        console.log(`  • ${field}`);
      });

      // Show sample data
      orders.forEach((order, index) => {
        console.log(`\n🔢 Order ${index + 1} (ID: ${order.id}):`);
        console.log(`   Created: ${order.created_at}`);
        
        // Check phone fields
        const phoneFields = ['contact_phone', 'customer_phone', 'phone'];
        phoneFields.forEach(field => {
          if (order[field] !== undefined) {
            console.log(`   📞 ${field}: "${order[field]}" ${order[field] ? '✅' : '❌'}`);
          }
        });

        // Check address fields
        const addressFields = ['street_address', 'shipping_address', 'address'];
        addressFields.forEach(field => {
          if (order[field] !== undefined) {
            console.log(`   🏠 ${field}: "${order[field]}" ${order[field] ? '✅' : '❌'}`);
          }
        });

        // Check city fields  
        const cityFields = ['city_municipality', 'city'];
        cityFields.forEach(field => {
          if (order[field] !== undefined) {
            console.log(`   🏙️ ${field}: "${order[field]}" ${order[field] ? '✅' : '❌'}`);
          }
        });

        // Check ZIP fields
        const zipFields = ['zip_code', 'postal_code'];
        zipFields.forEach(field => {
          if (order[field] !== undefined) {
            console.log(`   📮 ${field}: "${order[field]}" ${order[field] ? '✅' : '❌'}`);
          }
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructure();
