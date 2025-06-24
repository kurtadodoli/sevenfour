const mysql = require('mysql2/promise');

async function checkItemTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  const [tables] = await connection.execute("SHOW TABLES LIKE '%item%'");
  console.log('Tables with "item" in name:');
  tables.forEach(table => console.log('  -', Object.values(table)[0]));
  
  console.log('\nAll tables:');
  const [allTables] = await connection.execute('SHOW TABLES');
  allTables.forEach(table => console.log('  -', Object.values(table)[0]));
  
  await connection.end();
}

checkItemTables().catch(console.error);
