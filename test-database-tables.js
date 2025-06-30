// Test script to check database tables used by confirmed-test endpoint
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function testDatabaseTables() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Check if required tables exist
    const tables = ['orders', 'users', 'order_invoices', 'sales_transactions', 'order_items', 'products'];
    
    for (const table of tables) {
      try {
        const [result] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (result.length > 0) {
          console.log(`✅ Table '${table}' exists`);
          
          // Get row count
          const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`   📊 Rows: ${count[0].count}`);
        } else {
          console.log(`❌ Table '${table}' does not exist`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}':`, error.message);
      }
    }
    
    // Test the specific query from confirmed-test endpoint
    console.log('\n🧪 Testing confirmed-test endpoint query...');
    try {
      const [orders] = await connection.execute(`
        SELECT 
            o.*,
            u.first_name,
            u.last_name,
            u.email as user_email,
            oi.customer_name,
            oi.customer_email,
            oi.total_amount as invoice_total,
            st.transaction_id,
            st.payment_method,
            st.transaction_status
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
        LEFT JOIN sales_transactions st ON o.transaction_id = st.transaction_id
        WHERE o.status = 'confirmed'
        ORDER BY o.created_at DESC
        LIMIT 5
      `);
      
      console.log(`✅ Query executed successfully. Found ${orders.length} confirmed orders`);
      
      if (orders.length > 0) {
        console.log('📋 Sample order data:');
        console.log('   Order ID:', orders[0].id);
        console.log('   Order Number:', orders[0].order_number);
        console.log('   Customer:', orders[0].customer_name);
        console.log('   Status:', orders[0].status);
      }
      
    } catch (error) {
      console.log('❌ Query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 Database connection closed');
    }
  }
}

// Run the test
testDatabaseTables()
  .then(() => {
    console.log('\n✅ Database test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database test failed:', error.message);
    process.exit(1);
  });
