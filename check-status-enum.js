const mysql = require('mysql2/promise');

async function checkStatusEnum() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  console.log('Checking status column constraints:');
  const [columns] = await connection.execute("SHOW COLUMNS FROM custom_orders LIKE 'status'");
  console.log('Status column definition:', JSON.stringify(columns[0], null, 2));
  
  console.log('\nChecking current status values:');
  const [statuses] = await connection.execute('SELECT DISTINCT status FROM custom_orders');
  statuses.forEach(s => console.log(`- ${s.status}`));
  
  await connection.end();
}

checkStatusEnum().catch(console.error);
