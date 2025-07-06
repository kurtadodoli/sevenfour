const db = require('./server/config/db');

async function verifyFix() {
  try {
    console.log('✅ Verifying the customer_fullname fix...\n');
    
    const result = await db.query('DESCRIBE orders');
    
    console.log('📋 Orders table columns:');
    const customerFullnameColumn = result.find(col => col.Field === 'customer_fullname');
    
    if (customerFullnameColumn) {
      console.log(`✅ customer_fullname column found!`);
      console.log(`   Type: ${customerFullnameColumn.Type}`);
      console.log(`   Null: ${customerFullnameColumn.Null}`);
      console.log(`   Default: ${customerFullnameColumn.Default}`);
      console.log(`   Extra: ${customerFullnameColumn.Extra}`);
      
      console.log('\n🎉 SUCCESS: The database fix has been applied!');
      console.log('🚀 You can now try placing your order again.');
      console.log('💡 The server should also be restarted with the updated code.');
      
    } else {
      console.log('❌ customer_fullname column not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyFix();
