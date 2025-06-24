#!/usr/bin/env node

/**
 * Debug script to test authentication for user deletion
 */

async function debugAuth() {
    console.log('🔍 Debugging Authentication for User Deletion...\n');
    
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Test with a dummy token first
        console.log('1. Testing endpoint with no token...');
        let response = await fetch('http://localhost:3001/api/admin/users/123', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Status: ${response.status}`);
        let responseData = await response.json();
        console.log(`   Message: ${responseData.message}`);
        
        // Test with invalid token
        console.log('\n2. Testing endpoint with invalid token...');
        response = await fetch('http://localhost:3001/api/admin/users/123', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token_here'
            }
        });
        
        console.log(`   Status: ${response.status}`);
        responseData = await response.json();
        console.log(`   Message: ${responseData.message}`);
        
        // Test login to get a valid token
        console.log('\n3. Testing admin login to get valid token...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@sevenfour.com',
                password: 'admin123' // Default admin password
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log(`   Login Status: ${loginResponse.status} - SUCCESS`);
            console.log(`   User Role: ${loginData.user?.role || 'Unknown'}`);
            
            const token = loginData.token;
            if (token) {
                console.log(`   Token received: ${token.substring(0, 50)}...`);
                
                // Test delete with valid admin token
                console.log('\n4. Testing endpoint with valid admin token...');
                response = await fetch('http://localhost:3001/api/admin/users/999999', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log(`   Status: ${response.status}`);
                responseData = await response.json();
                console.log(`   Message: ${responseData.message}`);
                
                if (response.status === 404) {
                    console.log('\n✅ SUCCESS: Endpoint is working! 404 means user not found (expected for test ID)');
                    console.log('🔧 SOLUTION: Make sure you are logged in as admin in the browser');
                    console.log('   1. Go to login page');
                    console.log('   2. Login with admin credentials');
                    console.log('   3. Navigate to Dashboard → User Logs');
                    console.log('   4. Try deleting a user');
                } else if (response.status === 200) {
                    console.log('\n✅ SUCCESS: Endpoint is working correctly!');
                } else {
                    console.log(`\n⚠️ Unexpected status: ${response.status}`);
                }
            }
        } else {
            console.log(`   Login failed: ${loginResponse.status}`);
            const loginError = await loginResponse.json();
            console.log(`   Error: ${loginError.message}`);
            console.log('\n🔧 Try creating an admin user first:');
            console.log('   cd server && node scripts/create-admin.js');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugAuth();
