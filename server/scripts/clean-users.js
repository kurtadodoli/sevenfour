// Script to delete all user accounts except for kurtadodoli@gmail.com
const { query } = require('../config/db');
require('dotenv').config();

const cleanUsers = async () => {
  try {
    console.log('Starting user cleanup...');
    
    // Get user email for verification
    const preserveEmail = 'kurtadodoli@gmail.com';
    
    // First, get total count of users
    const totalUsers = await query('SELECT COUNT(*) as count FROM users');
    console.log(`Total users before cleanup: ${totalUsers[0].count}`);
    
    // Check if the user to preserve exists
    const preserveUser = await query(
      'SELECT user_id, email, role FROM users WHERE email = ?',
      [preserveEmail]
    );
    
    if (preserveUser.length === 0) {
      console.log(`Warning: User with email ${preserveEmail} not found in database.`);
      console.log('Will still proceed with cleaning other accounts.');
    } else {
      console.log(`Found user to preserve: ${preserveEmail} (ID: ${preserveUser[0].user_id}, Role: ${preserveUser[0].role})`);
    }

    // Delete all users except the specified one
    console.log('Deleting other user accounts...');
    const deleteResult = await query(
      'DELETE FROM users WHERE email != ?',
      [preserveEmail]
    );
    
    console.log(`Deleted ${deleteResult.affectedRows} user accounts.`);
    console.log('User cleanup completed successfully.');
    
    // List remaining users
    const remainingUsers = await query('SELECT user_id, email, role FROM users');
    console.log('\nRemaining users:');
    console.table(remainingUsers);
    
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning users:', error);
    process.exit(1);
  }
};

// Run the cleanup function
cleanUsers();
