#!/usr/bin/env node

/**
 * Quick test for the DELETE user endpoint
 */

async function testEndpoint() {
    console.log('🧪 Testing DELETE /api/admin/users/:userId endpoint...\n');
    
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Test the endpoint
        const response = await fetch('http://localhost:3001/api/admin/users/123', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Response status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        const responseText = await response.text();
        console.log(`Response body preview: ${responseText.substring(0, 200)}`);
        
        if (response.status === 404 && responseText.includes('<!DOCTYPE')) {
            console.log('\n❌ ISSUE CONFIRMED: Endpoint not found, returning HTML');
            console.log('🔧 This means the admin routes are not properly mounted or accessible');
            
            // Let's test a known endpoint
            console.log('\n🔍 Testing if /api/admin route base exists...');
            const baseTest = await fetch('http://localhost:3001/api/admin/user-logs-test');
            console.log(`Base admin route status: ${baseTest.status}`);
            
        } else if (response.status === 401 || response.status === 403) {
            console.log('\n✅ ENDPOINT EXISTS: Auth required (this is correct behavior)');
            console.log('🎉 The delete endpoint is working - the issue might be in the frontend call');
        } else {
            console.log(`\n📝 Unexpected response: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running:');
        console.log('   cd server && node app.js');
    }
}

testEndpoint();
