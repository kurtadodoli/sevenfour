const mysql = require('mysql2/promise');

async function fixDatabaseSchema() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('Connected to database successfully');

    // Check current schema of orders table
    console.log('\n--- Current orders table schema ---');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'orders'
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME}: ${col.DATA_TYPE}, Nullable: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT}, Extra: ${col.EXTRA}`);
    });

    // Check if customer_fullname column exists
    const customerFullnameColumn = columns.find(col => col.COLUMN_NAME === 'customer_fullname');
    
    if (!customerFullnameColumn) {
      console.log('\n--- Adding customer_fullname column ---');
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN customer_fullname VARCHAR(255) NOT NULL DEFAULT 'Guest Customer'
      `);
      console.log('Added customer_fullname column with default value');
    } else {
      console.log('\n--- Updating customer_fullname column ---');
      // Drop and recreate the column with proper default
      await connection.execute(`
        ALTER TABLE orders 
        MODIFY COLUMN customer_fullname VARCHAR(255) NOT NULL DEFAULT 'Guest Customer'
      `);
      console.log('Updated customer_fullname column with default value');
    }

    // Verify the change
    console.log('\n--- Updated orders table schema ---');
    const [newColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'customer_fullname'
    `);
    
    if (newColumns.length > 0) {
      const col = newColumns[0];
      console.log(`customer_fullname: ${col.DATA_TYPE}, Nullable: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT}`);
    }

    // Test insert without customer_fullname to verify default works
    console.log('\n--- Testing default value ---');
    try {
      await connection.execute(`
        INSERT INTO orders (order_id, customer_name, customer_email, total_amount, status, created_at)
        VALUES ('TEST_' + UNIX_TIMESTAMP(), 'Test Customer', 'test@example.com', 100.00, 'pending', NOW())
      `);
      console.log('✓ Test insert successful - default value works');
      
      // Clean up test record
      await connection.execute(`DELETE FROM orders WHERE customer_name = 'Test Customer'`);
    } catch (error) {
      console.log('✗ Test insert failed:', error.message);
    }

    console.log('\n--- Database schema fix completed ---');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDatabaseSchema();
