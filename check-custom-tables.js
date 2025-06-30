// Check custom tables structure
const mysql = require('mysql2/promise');

require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkCustomTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const tables = ['custom_designs', 'custom_orders'];
    
    for (const table of tables) {
      try {
        const [result] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (result.length > 0) {
          console.log(`✅ Table '${table}' exists`);
          
          // Get structure
          const [columns] = await connection.execute(`DESCRIBE ${table}`);
          console.log(`📋 ${table} columns:`);
          columns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type}`);
          });
          
          // Get count
          const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`   📊 Records: ${count[0].count}\n`);
        } else {
          console.log(`❌ Table '${table}' does not exist\n`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}':`, error.message, '\n');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkCustomTables();
