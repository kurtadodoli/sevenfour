const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

async function testRefundEndpoint() {
    console.log('=== TESTING REFUND ENDPOINT ===');
    
    // Start the server
    console.log('Starting server...');
    const serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: __dirname
    });
    
    let serverOutput = '';
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        serverOutput += output;
        console.log('Server:', output.trim());
    });
    
    serverProcess.stderr.on('data', (data) => {
        console.log('Server Error:', data.toString().trim());
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
        // First login to get token
        console.log('\\n1. Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'testadmin123'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token:', token.substring(0, 50) + '...');
        
        // Test refund request creation
        console.log('\\n2. Creating refund request...');
        const refundData = {
            product_name: 'Test Product API',
            price: 199.99,
            quantity: 2,
            size: 'L',
            color: 'Red',
            phone_number: '09987654321',
            street_address: '456 API Test Street',
            city_municipality: 'API Test City',
            province: 'API Test Province',
            reason: 'Product defective - API test'
        };
        
        console.log('Sending request with token:', token.substring(0, 50) + '...');
        
        const refundResponse = await axios.post('http://localhost:5000/api/orders/refund-request', refundData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Refund Response Status:', refundResponse.status);
        console.log('📋 Refund Response:', refundResponse.data);
        
        if (refundResponse.data.success) {
            console.log('✅ Refund request created successfully!');
        } else {
            console.log('❌ Refund request failed:', refundResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.response?.data || error.message);
    } finally {
        // Kill the server
        console.log('\\nStopping server...');
        serverProcess.kill('SIGTERM');
        process.exit(0);
    }
}

testRefundEndpoint().catch(console.error);
