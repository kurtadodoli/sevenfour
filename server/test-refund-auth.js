const http = require('http');
const querystring = require('querystring');

async function testRefundRequestsWithAuth() {
    console.log('Testing refund requests API with authentication...\n');

    // Step 1: Login as admin
    const loginData = querystring.stringify({
        email: 'test@admin.com',
        password: 'admin123'
    });

    const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    return new Promise((resolve, reject) => {
        const loginReq = http.request(loginOptions, (loginRes) => {
            let loginResponseData = '';
            loginRes.on('data', (chunk) => { loginResponseData += chunk; });
            loginRes.on('end', () => {
                try {
                    const loginResult = JSON.parse(loginResponseData);
                    if (loginResult.success && loginResult.data && loginResult.data.token) {
                        console.log('✅ Login successful');
                        
                        // Step 2: Test refund requests endpoint
                        const refundOptions = {
                            hostname: 'localhost',
                            port: 5000,
                            path: '/api/orders/refund-requests',
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${loginResult.data.token}`
                            }
                        };

                        const refundReq = http.request(refundOptions, (refundRes) => {
                            let refundData = '';
                            refundRes.on('data', (chunk) => { refundData += chunk; });
                            refundRes.on('end', () => {
                                try {
                                    const refundResult = JSON.parse(refundData);
                                    console.log('✅ Refund requests API response:');
                                    console.log(`📊 Status: ${refundRes.statusCode}`);
                                    console.log(`📊 Success: ${refundResult.success}`);
                                    console.log(`📊 Total refund requests: ${refundResult.data?.length || 0}`);
                                    
                                    if (refundResult.data && refundResult.data.length > 0) {
                                        const first = refundResult.data[0];
                                        console.log('\n📋 First refund request:');
                                        console.log(`   ID: ${first.id}`);
                                        console.log(`   Customer: ${first.customer_name}`);
                                        console.log(`   Reason: ${first.reason?.substring(0, 60)}...`);
                                        console.log(`   Product: ${first.product_name}`);
                                        console.log(`   Product Image: ${first.product_image}`);
                                        console.log(`   Amount: ₱${first.amount}`);
                                    }
                                    resolve();
                                } catch (e) {
                                    console.log('❌ Failed to parse refund response:', refundData);
                                    reject(e);
                                }
                            });
                        });

                        refundReq.on('error', (e) => {
                            console.error('❌ Refund request error:', e.message);
                            reject(e);
                        });

                        refundReq.end();
                    } else {
                        console.log('❌ Login failed:', loginResult);
                        reject(new Error('Login failed'));
                    }
                } catch (e) {
                    console.log('❌ Failed to parse login response:', loginResponseData);
                    reject(e);
                }
            });
        });

        loginReq.on('error', (e) => {
            console.error('❌ Login request error:', e.message);
            reject(e);
        });

        loginReq.write(loginData);
        loginReq.end();
    });
}

testRefundRequestsWithAuth().then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
});
