const mysql = require('mysql2/promise');

async function comprehensiveFix() {
  let connection;
  
  try {
    console.log('=== COMPREHENSIVE DATABASE AND SERVER FIX ===\n');
    
    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });
    console.log('✓ Database connection successful\n');

    // Step 2: Check and create orders table if needed
    console.log('Step 2: Checking orders table...');
    const [tables] = await connection.execute(`SHOW TABLES LIKE 'orders'`);
    
    if (tables.length === 0) {
      console.log('Creating orders table...');
      await connection.execute(`
        CREATE TABLE orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(255) UNIQUE NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_fullname VARCHAR(255) NOT NULL DEFAULT 'Guest Customer',
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(20),
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          delivery_date DATE,
          delivery_address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ Orders table created with proper schema\n');
    } else {
      console.log('✓ Orders table exists\n');
    }

    // Step 3: Check current schema
    console.log('Step 3: Analyzing current schema...');
    const [columns] = await connection.execute(`DESCRIBE orders`);
    console.log('Current columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}, Null: ${col.Null}, Default: ${col.Default}, Key: ${col.Key}`);
    });

    // Step 4: Fix customer_fullname column
    console.log('\nStep 4: Fixing customer_fullname column...');
    const customerFullnameCol = columns.find(col => col.Field === 'customer_fullname');
    
    if (!customerFullnameCol) {
      console.log('Adding customer_fullname column...');
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN customer_fullname VARCHAR(255) NOT NULL DEFAULT 'Guest Customer'
      `);
      console.log('✓ Added customer_fullname column');
    } else if (customerFullnameCol.Null === 'YES' || customerFullnameCol.Default === null) {
      console.log('Updating customer_fullname column to have proper default...');
      await connection.execute(`
        ALTER TABLE orders 
        MODIFY COLUMN customer_fullname VARCHAR(255) NOT NULL DEFAULT 'Guest Customer'
      `);
      console.log('✓ Updated customer_fullname column');
    } else {
      console.log('✓ customer_fullname column is properly configured');
    }

    // Step 5: Test insertion without customer_fullname
    console.log('\nStep 5: Testing default value with sample insert...');
    const testOrderId = 'TEST_' + Date.now();
    
    try {
      await connection.execute(`
        INSERT INTO orders (order_id, customer_name, customer_email, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [testOrderId, 'Test Customer', 'test@example.com', 100.00, 'pending']);
      
      console.log('✓ Test insert successful - default value working');
      
      // Verify the inserted record
      const [testRecord] = await connection.execute(`
        SELECT customer_fullname FROM orders WHERE order_id = ?
      `, [testOrderId]);
      
      if (testRecord.length > 0) {
        console.log(`✓ Default value applied: "${testRecord[0].customer_fullname}"`);
      }
      
      // Clean up test record
      await connection.execute(`DELETE FROM orders WHERE order_id = ?`, [testOrderId]);
      console.log('✓ Test record cleaned up');
      
    } catch (error) {
      console.log('✗ Test insert failed:', error.message);
    }

    // Step 6: Check delivery_schedule table for calendar fix
    console.log('\nStep 6: Checking delivery_schedule table...');
    const [deliveryTables] = await connection.execute(`SHOW TABLES LIKE 'delivery_schedule'`);
    
    if (deliveryTables.length > 0) {
      // Check for duplicates
      const [duplicates] = await connection.execute(`
        SELECT delivery_date, order_id, COUNT(*) as count
        FROM delivery_schedule
        GROUP BY delivery_date, order_id
        HAVING COUNT(*) > 1
      `);
      
      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicate delivery schedule entries`);
        console.log('Removing duplicates...');
        
        // Remove duplicates keeping only the first occurrence
        await connection.execute(`
          DELETE t1 FROM delivery_schedule t1
          INNER JOIN delivery_schedule t2
          WHERE t1.id > t2.id 
          AND t1.delivery_date = t2.delivery_date 
          AND t1.order_id = t2.order_id
        `);
        console.log('✓ Duplicates removed');
      } else {
        console.log('✓ No duplicate delivery schedules found');
      }
    }

    console.log('\n=== COMPREHENSIVE FIX COMPLETED SUCCESSFULLY ===');
    console.log('\nNext steps:');
    console.log('1. Start the server: cd server && npm start');
    console.log('2. Test order creation in the frontend');
    console.log('3. Check delivery calendar badge counts');

  } catch (error) {
    console.error('\n✗ Error during fix:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure MySQL is running');
    console.log('2. Check database credentials in server/.env');
    console.log('3. Verify database "seven_four_clothing" exists');
    console.log('4. Check MySQL error logs');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

comprehensiveFix();
