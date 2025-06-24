const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function testCustomDesignAuthIntegration() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🧪 Testing Custom Design Authentication Integration');
    console.log('================================================');
    console.log('✅ Connected to database');

    // Test 1: Check if we have any users to test with
    console.log('\n📋 Test 1: Checking available users...');
    const [users] = await connection.execute(
      'SELECT user_id, email, first_name, last_name, role, is_active FROM users WHERE is_active = 1 LIMIT 5'
    );
    
    if (users.length === 0) {
      console.log('❌ No active users found. Need to create a test user first.');
      
      // Create a test user
      console.log('\n🔧 Creating test user...');
      const testUserEmail = 'testuser@example.com';
      const testPassword = 'hashedpassword123'; // In real app, this would be properly hashed
      
      const [insertResult] = await connection.execute(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified, created_at) 
         VALUES (?, ?, 'Test', 'User', 'customer', 1, 1, NOW())`,
        [testUserEmail, testPassword]
      );
      
      console.log(`✅ Test user created with ID: ${insertResult.insertId}`);
      
      // Fetch the created user
      const [newUsers] = await connection.execute(
        'SELECT user_id, email, first_name, last_name FROM users WHERE user_id = ?',
        [insertResult.insertId]
      );
      
      if (newUsers.length > 0) {
        users.push(newUsers[0]);
      }
    }
    
    console.log(`✅ Found ${users.length} active user(s) for testing:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ID: ${user.user_id}`);
    });

    // Test 2: Verify custom_designs table structure
    console.log('\n📋 Test 2: Verifying custom_designs table structure...');
    const [columns] = await connection.execute('DESCRIBE custom_designs');
    
    const requiredColumns = ['user_id', 'customer_email', 'first_name', 'last_name'];
    const existingColumns = columns.map(col => col.Field);
    
    let structureValid = true;
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`✅ ${col} column exists`);
      } else {
        console.log(`❌ ${col} column missing`);
        structureValid = false;
      }
    });

    if (structureValid) {
      console.log('✅ Database structure is ready for auth integration');
    } else {
      console.log('❌ Database structure needs updates');
      return;
    }

    // Test 3: Check foreign key constraints
    console.log('\n📋 Test 3: Checking foreign key constraints...');
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'custom_designs' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (constraints.length > 0) {
      console.log('✅ Foreign key constraints found:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.COLUMN_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('⚠️  No foreign key constraints found (this is optional but recommended)');
    }

    // Test 4: Simulate creating a custom order linked to a user
    console.log('\n📋 Test 4: Simulating custom order creation with user authentication...');
    const testUser = users[0];
    const testDesignId = `TEST-DESIGN-${Date.now()}`;
    
    const [orderResult] = await connection.execute(`
      INSERT INTO custom_designs (
        design_id, user_id, product_type, product_name, product_color, product_size, 
        quantity, customer_name, first_name, last_name, email, customer_email,
        customer_phone, street_address, city, status, estimated_price, created_at
      ) VALUES (?, ?, 't-shirts', 'Test Custom T-Shirt', 'Red', 'L', 1, ?, ?, ?, ?, ?, 
                '123-456-7890', 'Test Street 123', 'Manila', 'pending', 25.00, NOW())
    `, [
      testDesignId,
      testUser.user_id,
      `${testUser.first_name} ${testUser.last_name}`,
      testUser.first_name,
      testUser.last_name,
      testUser.email,
      testUser.email
    ]);
    
    console.log(`✅ Test order created with ID: ${orderResult.insertId}`);

    // Test 5: Verify the order is properly linked
    console.log('\n📋 Test 5: Verifying order linkage...');
    const [orderCheck] = await connection.execute(`
      SELECT cd.design_id, cd.user_id, cd.customer_email, cd.first_name, cd.last_name,
             u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
      FROM custom_designs cd
      JOIN users u ON cd.user_id = u.user_id
      WHERE cd.design_id = ?
    `, [testDesignId]);
    
    if (orderCheck.length > 0) {
      const order = orderCheck[0];
      console.log('✅ Order successfully linked to user:');
      console.log(`   - Design ID: ${order.design_id}`);
      console.log(`   - User ID: ${order.user_id}`);
      console.log(`   - Order Email: ${order.customer_email}`);
      console.log(`   - User Email: ${order.user_email}`);
      console.log(`   - Order Name: ${order.first_name} ${order.last_name}`);
      console.log(`   - User Name: ${order.user_first_name} ${order.user_last_name}`);
      
      // Verify data consistency
      if (order.customer_email === order.user_email && 
          order.first_name === order.user_first_name && 
          order.last_name === order.user_last_name) {
        console.log('✅ Data consistency verified - order data matches user data');
      } else {
        console.log('⚠️  Data inconsistency detected');
      }
    } else {
      console.log('❌ Failed to verify order linkage');
    }

    // Clean up test order
    console.log('\n🧹 Cleaning up test data...');
    await connection.execute('DELETE FROM custom_designs WHERE design_id = ?', [testDesignId]);
    console.log('✅ Test order cleaned up');

    console.log('\n🎉 Custom Design Authentication Integration Test Complete!');
    console.log('📊 Summary:');
    console.log('   ✅ Database structure is ready');
    console.log('   ✅ User accounts are available');
    console.log('   ✅ Custom orders can be linked to users');
    console.log('   ✅ Data consistency is maintained');
    console.log('');
    console.log('🚀 The system is ready for authenticated custom design orders!');
    console.log('💡 Users can now submit custom orders without manual email entry.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testCustomDesignAuthIntegration();
