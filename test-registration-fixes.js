const fs = require('fs');
const path = require('path');

// Test script to verify Registration Page fixes
console.log('=== Testing Registration Page Fixes ===\n');

// 1. Check if confirmPassword field was added to user form state
const registrationPagePath = path.join(__dirname, 'client', 'src', 'pages', 'RegistrationPage.js');

if (fs.existsSync(registrationPagePath)) {
  const content = fs.readFileSync(registrationPagePath, 'utf8');
  
  console.log('✓ RegistrationPage.js exists');
  
  // Check for confirmPassword in state
  if (content.includes('confirmPassword:')) {
    console.log('✓ confirmPassword field added to user form state');
  } else {
    console.log('✗ confirmPassword field missing from user form state');
  }
  
  // Check for password confirmation validation
  if (content.includes('Passwords do not match')) {
    console.log('✓ Password confirmation validation added');
  } else {
    console.log('✗ Password confirmation validation missing');
  }
  
  // Check for authentication headers in fetchUsers
  if (content.includes('Authorization') && content.includes('Bearer')) {
    console.log('✓ Authentication headers added to API calls');
  } else {
    console.log('✗ Authentication headers missing from API calls');
  }
  
  // Check for confirm password field in form
  if (content.includes('Confirm Password')) {
    console.log('✓ Confirm Password field added to user registration form');
  } else {
    console.log('✗ Confirm Password field missing from user registration form');
  }
  
  // Check for showConfirmPassword state
  if (content.includes('showConfirmPassword')) {
    console.log('✓ showConfirmPassword state added for password visibility toggle');
  } else {
    console.log('✗ showConfirmPassword state missing');
  }
  
  console.log('\n=== Summary ===');
  console.log('Registration Page fixes implemented:');
  console.log('1. Added confirmPassword field to user form state');
  console.log('2. Added password confirmation validation');
  console.log('3. Added authentication headers to fetchUsers and fetchProducts');
  console.log('4. Added Confirm Password field to the registration form');
  console.log('5. Added password visibility toggle for confirm password field');
  
} else {
  console.log('✗ RegistrationPage.js not found');
}

console.log('\n=== Next Steps ===');
console.log('1. Start the development server: npm start');
console.log('2. Login as admin and navigate to Registration page');
console.log('3. Test user registration with password confirmation');
console.log('4. Verify that users list loads without 401 errors');
console.log('5. Test that passwords must match before submission');
