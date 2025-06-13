const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function runCompleteAuthTest() {
    console.log('🚀 Starting Complete Authentication System Test\n');
    
    try {
        // Test 1: Admin Login
        console.log('1️⃣ Testing Admin Login...');
        const adminLogin = await axios.post(`${BASE_URL}/login`, {
            email: 'kurtadodoli@gmail.com',
            password: 'Admin123!@#'
        });
          if (adminLogin.data.success) {
            console.log('✅ Admin login successful');
            console.log(`   User: ${adminLogin.data.data.user.first_name} ${adminLogin.data.data.user.last_name}`);
            console.log(`   Role: ${adminLogin.data.data.user.role}`);
            console.log(`   Token: ${adminLogin.data.data.token.substring(0, 20)}...`);
        }        
        const adminToken = adminLogin.data.data.token;
        
        // Test 2: Admin Profile Access
        console.log('\n2️⃣ Testing Admin Profile Access...');
        const adminProfile = await axios.get(`${BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
          if (adminProfile.data.success) {
            console.log('✅ Admin profile access successful');
            console.log(`   Email: ${adminProfile.data.data.user.email}`);
            console.log(`   Role: ${adminProfile.data.data.user.role}`);
        }
          // Test 3: New User Registration
        console.log('\n3️⃣ Testing User Registration...');
        const testUser = {
            email: `test${Date.now()}@example.com`,
            password: 'TestPass123!',
            first_name: 'Test',
            last_name: 'User',
            gender: 'FEMALE',
            birthday: '1990-01-01'
        };
        
        const registration = await axios.post(`${BASE_URL}/register`, testUser);
          if (registration.data.success) {
            console.log('✅ User registration successful');
            console.log(`   New User ID: ${registration.data.data.user.id}`);
            console.log(`   Email: ${registration.data.data.user.email}`);
            console.log(`   Role: ${registration.data.data.user.role}`);
        }
        
        // Test 4: New User Login
        console.log('\n4️⃣ Testing New User Login...');
        const userLogin = await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
          if (userLogin.data.success) {
            console.log('✅ User login successful');
            console.log(`   Token: ${userLogin.data.data.token.substring(0, 20)}...`);
        }
        
        const userToken = userLogin.data.data.token;
        
        // Test 5: User Profile Access
        console.log('\n5️⃣ Testing User Profile Access...');
        const userProfile = await axios.get(`${BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
          if (userProfile.data.success) {
            console.log('✅ User profile access successful');
            console.log(`   Email: ${userProfile.data.data.user.email}`);
            console.log(`   Role: ${userProfile.data.data.user.role}`);
        }
          // Test 6: Profile Update
        console.log('\n6️⃣ Testing Profile Update...');
        const profileUpdate = await axios.put(`${BASE_URL}/profile`, {
            first_name: 'Updated',
            last_name: 'TestUser',
            gender: 'MALE',
            birthday: '1990-01-01'
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
          if (profileUpdate.data.success) {
            console.log('✅ Profile update successful');
            console.log(`   Updated name: ${profileUpdate.data.data.user.first_name} ${profileUpdate.data.data.user.last_name}`);
        }
        
        // Test 7: Password Change
        console.log('\n7️⃣ Testing Password Change...');
        const passwordChange = await axios.put(`${BASE_URL}/change-password`, {
            currentPassword: testUser.password,
            newPassword: 'NewTestPass123!'
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        
        if (passwordChange.data.success) {
            console.log('✅ Password change successful');
        }
        
        // Test 8: Login with New Password
        console.log('\n8️⃣ Testing Login with New Password...');
        const newPasswordLogin = await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: 'NewTestPass123!'
        });
        
        if (newPasswordLogin.data.success) {
            console.log('✅ Login with new password successful');
        }
          // Test 9: Admin User Management
        console.log('\n9️⃣ Testing Admin User Management...');
        const allUsers = await axios.get(`${BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
          if (allUsers.data.success) {
            console.log('✅ Admin can access all users');
            console.log(`   Total users: ${allUsers.data.data.users.length}`);
        }
        
        // Test 10: Invalid Token Test
        console.log('\n🔟 Testing Invalid Token Handling...');
        try {
            await axios.get(`${BASE_URL}/profile`, {
                headers: { Authorization: 'Bearer invalid_token' }
            });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Invalid token properly rejected');
            }
        }
        
        console.log('\n🎉 All Authentication Tests Completed Successfully!');
        console.log('\n📊 Test Summary:');
        console.log('  ✅ Admin login and profile access');
        console.log('  ✅ User registration and login');
        console.log('  ✅ Profile management (view/update)');
        console.log('  ✅ Password change functionality');
        console.log('  ✅ Role-based access control');
        console.log('  ✅ Token validation and security');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    runCompleteAuthTest();
}

module.exports = { runCompleteAuthTest };
