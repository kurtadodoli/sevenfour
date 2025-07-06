// Test phone number display logic after fix
const mysql = require('mysql2/promise');

async function testPhoneDisplayFix() {
  console.log('📞 TESTING PHONE DISPLAY LOGIC AFTER FIX');
  console.log('='.repeat(50));

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Get orders with different phone scenarios
    const [testCases] = await connection.execute(`
      SELECT 
        order_number,
        contact_phone,
        contact_phone as customer_phone,
        CASE 
          WHEN contact_phone IS NULL THEN 'NULL_VALUE'
          WHEN contact_phone = '' THEN 'EMPTY_STRING'
          WHEN contact_phone = 'null' THEN 'NULL_STRING'
          WHEN contact_phone = 'undefined' THEN 'UNDEFINED_STRING'
          ELSE 'VALID_PHONE'
        END as phone_type
      FROM orders
      WHERE status IN ('confirmed', 'processing', 'Order Received')
      ORDER BY 
        CASE 
          WHEN contact_phone IS NULL THEN 1
          WHEN contact_phone = '' THEN 2
          WHEN contact_phone = 'null' THEN 3
          WHEN contact_phone = 'undefined' THEN 4
          ELSE 5
        END,
        created_at DESC
      LIMIT 10
    `);

    console.log('\n🧪 TEST CASES FOR PHONE DISPLAY:');
    console.log('-'.repeat(40));

    testCases.forEach((testCase, index) => {
      const transaction = testCase; // Simulate transaction object
      
      // Apply the NEW logic from TransactionPage.js
      const resolvedPhone = (transaction.contact_phone && transaction.contact_phone !== 'null' && transaction.contact_phone !== 'undefined') 
        ? transaction.contact_phone 
        : (transaction.customer_phone && transaction.customer_phone !== 'null' && transaction.customer_phone !== 'undefined') 
          ? transaction.customer_phone 
          : 'N/A';

      console.log(`\n📱 Test ${index + 1} (${testCase.order_number}):`);
      console.log(`   Phone Type: ${testCase.phone_type}`);
      console.log(`   Raw contact_phone: "${testCase.contact_phone}"`);
      console.log(`   Raw customer_phone: "${testCase.customer_phone}"`);
      console.log(`   🎯 NEW LOGIC RESULT: "${resolvedPhone}" ${resolvedPhone !== 'N/A' ? '✅ SHOWS PHONE' : '❌ SHOWS N/A'}`);
      
      // Compare with OLD logic
      const oldResult = transaction.contact_phone || transaction.customer_phone || 'N/A';
      console.log(`   🔄 OLD LOGIC RESULT: "${oldResult}" ${oldResult !== 'N/A' ? '✅ SHOWS PHONE' : '❌ SHOWS N/A'}`);
      
      if (resolvedPhone !== oldResult) {
        console.log(`   🔧 IMPROVEMENT: Changed from "${oldResult}" to "${resolvedPhone}"`);
      }
    });

    console.log('\n📊 SUMMARY:');
    console.log('-'.repeat(30));
    
    const validPhones = testCases.filter(t => t.phone_type === 'VALID_PHONE').length;
    const nullStrings = testCases.filter(t => t.phone_type === 'NULL_STRING').length;
    const undefinedStrings = testCases.filter(t => t.phone_type === 'UNDEFINED_STRING').length;
    const nullValues = testCases.filter(t => t.phone_type === 'NULL_VALUE').length;
    const emptyStrings = testCases.filter(t => t.phone_type === 'EMPTY_STRING').length;

    console.log(`✅ Valid phones: ${validPhones} (will display correctly)`);
    console.log(`🔧 "null" strings: ${nullStrings} (now fixed to show N/A instead of "null")`);
    console.log(`🔧 "undefined" strings: ${undefinedStrings} (now fixed to show N/A instead of "undefined")`);
    console.log(`❌ NULL values: ${nullValues} (will show N/A - expected)`);
    console.log(`❌ Empty strings: ${emptyStrings} (will show N/A - expected)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testPhoneDisplayFix();
