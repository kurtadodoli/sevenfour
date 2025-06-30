const jwt = require('jsonwebtoken');

// Test JWT token creation and verification
function testJWTProcess() {
  console.log('🧪 Testing JWT token creation and verification...');
  
  // Use the same secret as in the code
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  
  console.log('🔑 JWT_SECRET:', JWT_SECRET);
  console.log('⏰ JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
  
  // Create a test user payload
  const testUser = {
    user_id: 1,
    email: 'testadmin@example.com',
    role: 'admin'
  };
  
  // Generate token (same as generateToken function)
  console.log('\n🏗️ Creating token...');
  const token = jwt.sign(
    { 
      id: testUser.user_id,
      email: testUser.email,
      role: testUser.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  console.log('✅ Token created:', token.substring(0, 50) + '...');
  
  // Verify token (same as auth middleware)
  console.log('\n🔍 Verifying token...');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verification successful');
    console.log('📋 Decoded payload:', decoded);
    
    console.log('\n🎯 JWT process is working correctly!');
    console.log('💡 The issue must be somewhere else in the authentication flow.');
    
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    console.log('🔍 Error type:', error.name);
  }
}

testJWTProcess();
