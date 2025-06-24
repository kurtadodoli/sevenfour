const mysql = require('mysql2/promise');

async function checkDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  console.log('Checking for tables with image data:');
  const [tables] = await connection.execute('SHOW TABLES');
  for (const table of tables) {
    const tableName = Object.values(table)[0];
    if (tableName.includes('custom') || tableName.includes('design')) {
      console.log(`\nTable: ${tableName}`);
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        if (col.Field.includes('image') || col.Field.includes('design') || col.Field.includes('file')) {
          console.log(`  - ${col.Field}: ${col.Type}`);
        }
      });
      
      // Show all columns for custom tables
      console.log(`All columns in ${tableName}:`);
      columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
    }
  }
  
  await connection.end();
}

checkDB().catch(console.error);
