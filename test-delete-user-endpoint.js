#!/usr/bin/env node

/**
 * Test script to verify user deletion endpoint is working
 */

async function testUserDeletion() {
    console.log('🧪 Testing User Deletion Endpoint...\n');
    
    const baseUrl = 'http://localhost:3001';
    
    // Dynamic import for fetch
    const fetch = (await import('node-fetch')).default;
    
    try {
        // First, let's test if the server is running by trying the admin endpoint
        console.log('1. Testing server connectivity...');
        const healthCheck = await fetch(`${baseUrl}/api/admin/users/test`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Response status: ${healthCheck.status}`);
        
        if (healthCheck.status === 401 || healthCheck.status === 403) {
            console.log('✅ Server is running and endpoint exists (auth required as expected)');
        } else if (healthCheck.status === 404) {
            console.log('❌ Endpoint not found - this is the issue we need to fix');
        } else {
            console.log(`📝 Unexpected response status: ${healthCheck.status}`);
        }
        
        const responseText = await healthCheck.text();
        console.log('Response content type:', healthCheck.headers.get('content-type'));
        console.log('Response preview:', responseText.substring(0, 150));
        
        if (responseText.includes('<!DOCTYPE')) {
            console.log('❌ Server is returning HTML instead of JSON (route not found)');
        } else {
            console.log('✅ Server is returning JSON response');
        }
        
    } catch (error) {
        console.log('❌ Server is not accessible:', error.message);
        console.log('\n🔧 Make sure to start the server first:');
        console.log('   cd server');
        console.log('   node app.js');
        return;
    }
    
    console.log('\n📋 Expected Behavior:');
    console.log('   - Status 401/403: Authentication required (good)');
    console.log('   - Status 404: Endpoint not found (bad - needs fix)');
    console.log('   - HTML response: Wrong content type (bad - needs fix)');
    
    console.log('\n🔧 To fix the original issue:');
    console.log('   1. Ensure server is running: cd server && node app.js');
    console.log('   2. Check admin routes are properly mounted in app.js');
    console.log('   3. Verify auth middleware is working');
    console.log('   4. Test with proper authentication token');
}

// Only run if called directly
if (require.main === module) {
    testUserDeletion();
}

module.exports = { testUserDeletion };
