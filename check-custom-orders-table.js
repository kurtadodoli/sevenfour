const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkAndFixCustomOrdersTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('\n🔍 Checking custom_orders table structure...');
    
    // Get current table structure
    const [columns] = await connection.execute(`SHOW COLUMNS FROM custom_orders`);
    
    console.log('📋 Current columns in custom_orders table:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Check if delivery_status column exists
    const hasDeliveryStatus = columns.some(col => col.Field === 'delivery_status');
    console.log(`\n🔍 delivery_status column exists: ${hasDeliveryStatus}`);

    if (!hasDeliveryStatus) {
      console.log('\n⚠️ delivery_status column is missing! Adding it...');
      await connection.execute(`
        ALTER TABLE custom_orders 
        ADD COLUMN delivery_status ENUM('pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled') DEFAULT 'pending'
      `);
      console.log('✅ Added delivery_status column');
    }

    // Check if delivery_notes column exists
    const hasDeliveryNotes = columns.some(col => col.Field === 'delivery_notes');
    console.log(`🔍 delivery_notes column exists: ${hasDeliveryNotes}`);

    if (!hasDeliveryNotes) {
      console.log('\n⚠️ delivery_notes column is missing! Adding it...');
      await connection.execute(`
        ALTER TABLE custom_orders 
        ADD COLUMN delivery_notes TEXT
      `);
      console.log('✅ Added delivery_notes column');
    }

    // Check if delivery_date column exists
    const hasDeliveryDate = columns.some(col => col.Field === 'delivery_date');
    console.log(`🔍 delivery_date column exists: ${hasDeliveryDate}`);

    if (!hasDeliveryDate) {
      console.log('\n⚠️ delivery_date column is missing! Adding it...');
      await connection.execute(`
        ALTER TABLE custom_orders 
        ADD COLUMN delivery_date DATE
      `);
      console.log('✅ Added delivery_date column');
    }

    console.log('\n🔍 Verifying table structure after changes...');
    const [updatedColumns] = await connection.execute(`SHOW COLUMNS FROM custom_orders`);
    
    console.log('📋 Updated columns in custom_orders table:');
    updatedColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    console.log('\n✅ Database structure check and fix completed!');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndFixCustomOrdersTable();
