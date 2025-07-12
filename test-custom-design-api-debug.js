const axios = require('axios');

// Test the custom design requests API with authentication
async function testAPI() {
  try {
    // First, let's test the database directly
    const { Pool } = require('pg');
    
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost', 
      database: 'sfc',
      password: 'admin',
      port: 5432,
    });
    
    console.log('🔍 Testing custom orders data structure...');
    
    const result = await pool.query(`
      SELECT 
        id,
        custom_order_id,
        customer_name,
        estimated_price,
        final_price,
        images,
        created_at,
        status
      FROM custom_orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('📊 Database results:');
    console.log('Total records:', result.rows.length);
    
    if (result.rows.length > 0) {
      const firstRecord = result.rows[0];
      console.log('\n🔍 First record structure:');
      console.log('- id:', firstRecord.id);
      console.log('- custom_order_id:', firstRecord.custom_order_id);
      console.log('- customer_name:', firstRecord.customer_name);
      console.log('- estimated_price:', firstRecord.estimated_price);
      console.log('- final_price:', firstRecord.final_price);
      console.log('- images:', firstRecord.images);
      console.log('- images type:', typeof firstRecord.images);
      console.log('- status:', firstRecord.status);
      
      if (firstRecord.images) {
        if (typeof firstRecord.images === 'string') {
          try {
            const parsedImages = JSON.parse(firstRecord.images);
            console.log('- parsed images:', parsedImages);
            console.log('- parsed images length:', parsedImages.length);
            if (parsedImages.length > 0) {
              console.log('- first image structure:', parsedImages[0]);
            }
          } catch (e) {
            console.log('- images is string but not JSON:', firstRecord.images);
          }
        } else {
          console.log('- images is not a string:', firstRecord.images);
        }
      }
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error testing:', error.message);
  }
}

testAPI();
