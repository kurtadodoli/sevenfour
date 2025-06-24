const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting server for delete user endpoint test...\n');

// Start server in background
const serverPath = path.join(__dirname, 'server', 'app.js');
const serverProcess = exec(`node "${serverPath}"`, { cwd: path.join(__dirname, 'server') });

let serverStarted = false;

serverProcess.stdout.on('data', (data) => {
    console.log('[SERVER]', data.toString().trim());
    if (data.includes('listening on port') || data.includes('Server running on port')) {
        serverStarted = true;
        setTimeout(testEndpoint, 2000); // Wait 2 seconds then test
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error('[SERVER ERROR]', data.toString().trim());
});

async function testEndpoint() {
    if (!serverStarted) {
        console.log('❌ Server failed to start');
        process.exit(1);
    }
    
    console.log('\n🧪 Testing DELETE /api/admin/users/:userId endpoint...');
    
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
        console.log(`Response body preview: ${responseText.substring(0, 100)}...`);
        
        if (response.status === 404 && responseText.includes('<!DOCTYPE')) {
            console.log('❌ ISSUE CONFIRMED: Endpoint not found, returning HTML');
            console.log('🔧 This means the admin routes are not properly mounted');
        } else if (response.status === 401 || response.status === 403) {
            console.log('✅ ENDPOINT EXISTS: Auth required (as expected)');
        } else {
            console.log(`📝 Unexpected response: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    
    // Clean up
    serverProcess.kill();
    process.exit(0);
}

// Handle process cleanup
process.on('SIGINT', () => {
    serverProcess.kill();
    process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('⏱️ Test timeout - stopping server');
    serverProcess.kill();
    process.exit(1);
}, 10000);
