// Script to test database connectivity and registration
const { query } = require('../config/db');
require('dotenv').config();

const testDbRegistration = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test basic query to ensure connection is working
    const result = await query('SELECT 1 as test');
    console.log('Database connection successful:', result);
    
    // Test user insertion logic directly
    const testUser = {
      first_name: 'TestDB',
      last_name: 'User',
      email: `testdb_${Date.now()}@example.com`,
      password: '$2b$12$1234567890123456789012.1234567890123456789012345678901234', // Pre-hashed dummy password
      gender: 'other',
      birthday: '1990-01-01',
      role: 'customer'
    };
    
    console.log('Attempting direct user insertion...');
    try {
      const insertResult = await query(
        `INSERT INTO users (first_name, last_name, email, password, gender, birthday, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [testUser.first_name, testUser.last_name, testUser.email, testUser.password, testUser.gender, testUser.birthday, testUser.role]
      );
      
      console.log('User inserted successfully:', insertResult);
      console.log('User ID:', insertResult.insertId);
      
      // Try to retrieve the inserted user
      const users = await query('SELECT user_id, email FROM users WHERE email = ?', [testUser.email]);
      console.log('Retrieved user:', users);
      
      // Clean up - delete the test user
      const deleteResult = await query('DELETE FROM users WHERE email = ?', [testUser.email]);
      console.log('Test user deleted:', deleteResult);
      
    } catch (dbError) {
      console.error('Database insertion error:', dbError);
    }
    
    console.log('Database testing completed.');
    
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    process.exit(0);
  }
};

// Run the test
testDbRegistration();
