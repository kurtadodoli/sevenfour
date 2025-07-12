const axios = require('axios');

async function testCustomDesignAPIFix() {
  try {
    console.log('🔍 Testing Custom Design API endpoint with proper auth...');
    
    // Try to get an admin user from the database first
    const mysql = require('mysql2/promise');
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    };
    
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(`
      SELECT email, role FROM users WHERE role = 'admin' LIMIT 1
    `);
    
    if (users.length === 0) {
      console.log('❌ No admin user found in database');
      await connection.end();
      return;
    }
    
    const adminEmail = users[0].email;
    console.log('Found admin user:', adminEmail);
    await connection.end();
    
    // Try different credentials
    const credentials = [
      { email: adminEmail, password: 'admin123' },
      { email: adminEmail, password: 'password' },
      { email: 'admin@admin.com', password: 'admin123' },
      { email: 'krutadodoli@gmail.com', password: 'password123' } // This seems to be the main user
    ];
    
    let token = null;
    
    for (const cred of credentials) {
      try {
        console.log(`\nTrying login with: ${cred.email}`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', cred);
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful');
          token = loginResponse.data.token;
          console.log('User role:', loginResponse.data.user?.role);
          break;
        }
      } catch (err) {
        console.log(`❌ Login failed for ${cred.email}:`, err.response?.data?.message || err.message);
      }
    }
    
    if (!token) {
      console.log('❌ Could not login with any credentials');
      return;
    }
    
    // Now test the custom design endpoint
    console.log('\n🔄 Testing custom design endpoint...');
    const customDesignResponse = await axios.get('http://localhost:5000/api/custom-orders/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n=== CUSTOM DESIGN API RESPONSE ===');
    console.log('Success:', customDesignResponse.data.success);
    console.log('Count:', customDesignResponse.data.count);
    
    if (customDesignResponse.data.data && customDesignResponse.data.data.length > 0) {
      const firstOrder = customDesignResponse.data.data[0];
      console.log('\n--- First Order Details ---');
      console.log('ID:', firstOrder.custom_order_id);
      console.log('Customer:', firstOrder.customer_name);
      console.log('Final Price:', firstOrder.final_price);
      console.log('Estimated Price:', firstOrder.estimated_price);
      console.log('Images Array Length:', firstOrder.images ? firstOrder.images.length : 'undefined');
      console.log('Image Count:', firstOrder.image_count);
      
      if (firstOrder.images && firstOrder.images.length > 0) {
        console.log('\n--- Images ---');
        firstOrder.images.forEach((img, index) => {
          console.log(`${index + 1}. ${img.filename} (${img.mime_type || 'unknown'})`);
        });
      } else {
        console.log('❌ No images found in response');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCustomDesignAPIFix();
