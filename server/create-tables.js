const mysql = require('mysql2/promise');
const fs = require('fs');
const { dbConfig } = require('./config/db');

async function createTables() {
  try {
    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    const sql = fs.readFileSync('./sql/create_order_tables.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Executed:', statement.substring(0, 80).replace(/\n/g, ' ') + '...');
        } catch (err) {
          console.error('❌ Error executing statement:', err.message);
          console.error('Statement:', statement.substring(0, 100));
        }
      }
    }
    
    await connection.end();
    console.log('🎉 All order tables creation completed!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

createTables();
