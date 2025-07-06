const db = require('./server/config/db');

async function fixCustomerFullnameField() {
  try {
    console.log('🔧 Fixing customer_fullname field...\n');
    
    // Add default value to customer_fullname field to prevent the error
    const result = await db.query(`
      ALTER TABLE orders 
      MODIFY COLUMN customer_fullname VARCHAR(255) DEFAULT 'Customer' NULL
    `);
    
    console.log('✅ Successfully added default value to customer_fullname field');
    console.log('🎉 Orders can now be created without this error!');
    console.log('\nThe customer_fullname field now has a default value of "Customer"');
    console.log('This will allow order creation to work immediately.');
    
  } catch (error) {
    console.error('❌ Error fixing field:', error.message);
    
    // Try alternative approach - make the field nullable with default
    try {
      console.log('\n🔄 Trying alternative approach...');
      
      const altResult = await db.query(`
        ALTER TABLE orders 
        MODIFY COLUMN customer_fullname VARCHAR(255) DEFAULT NULL
      `);
      
      console.log('✅ Successfully made customer_fullname nullable with NULL default');
      console.log('🎉 Orders should now work!');
      
    } catch (altError) {
      console.error('❌ Alternative approach failed:', altError.message);
      
      // Last resort - add the column if it doesn't exist
      try {
        console.log('\n🔄 Trying to add column...');
        
        const addResult = await db.query(`
          ALTER TABLE orders 
          ADD COLUMN customer_fullname VARCHAR(255) DEFAULT 'Customer' NULL
        `);
        
        console.log('✅ Successfully added customer_fullname column');
        
      } catch (addError) {
        console.error('❌ Failed to add column:', addError.message);
      }
    }
  }
}

fixCustomerFullnameField();
