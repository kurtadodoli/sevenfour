const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });
    
    console.log('🔍 Checking existing users...');
    
    const [users] = await connection.execute('SELECT user_id, email, role FROM users');
    
    console.log('👥 Found users:');
    users.forEach(user => {
      console.log(`- ID: ${user.user_id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Check custom order cancellation requests
    console.log('\n🔍 Checking custom order cancellation requests...');
    const [requests] = await connection.execute(`
      SELECT 
        cor.id,
        cor.custom_order_id,
        cor.reason,
        cor.status,
        co.customer_name,
        co.customer_email,
        co.product_type
      FROM custom_order_cancellation_requests cor
      JOIN custom_orders co ON cor.custom_order_id = co.custom_order_id
      LIMIT 5
    `);
    
    console.log('📋 Found cancellation requests:');
    requests.forEach(req => {
      console.log(`- ID: ${req.id}, Order: ${req.custom_order_id}, Customer: ${req.customer_name}, Status: ${req.status}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkUsers();
