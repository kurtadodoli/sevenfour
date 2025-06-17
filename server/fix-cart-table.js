const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function fixCartTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 Fixing cart table user_id column type...');
    await connection.execute('ALTER TABLE carts MODIFY COLUMN user_id BIGINT NOT NULL');
    console.log('✅ Cart table user_id column updated to BIGINT');
    
    console.log('🔧 Fixing order tables user_id column types...');
    await connection.execute('ALTER TABLE sales_transactions MODIFY COLUMN user_id BIGINT NOT NULL');
    await connection.execute('ALTER TABLE order_invoices MODIFY COLUMN user_id BIGINT NOT NULL');
    await connection.execute('ALTER TABLE orders MODIFY COLUMN user_id BIGINT NOT NULL');
    console.log('✅ Order tables user_id columns updated to BIGINT');
    
    await connection.end();
    console.log('🎉 Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCartTable();
