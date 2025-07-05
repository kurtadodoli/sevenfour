const http = require('http');
const querystring = require('querystring');

async function testRefundRequestCreation() {
    console.log('Testing refund request creation...\n');

    // Step 1: Login to get token
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
                        
                        // Step 2: Test refund request creation (matching frontend format)
                        const refundData = JSON.stringify({
                            order_id: 1,
                            custom_order_id: null,
                            product_name: 'Test Product',
                            product_image: 'test-image.jpg',
                            price: 1500.00,
                            quantity: 1,
                            size: 'M',
                            color: 'Red',
                            phone_number: '09123456789',
                            street_address: '123 Test Street',
                            city_municipality: 'Test City',
                            province: 'Test Province',
                            reason: 'Product was damaged during delivery'
                        });

                        const refundOptions = {
                            hostname: 'localhost',
                            port: 5000,
                            path: '/api/orders/refund-request',
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${loginResult.data.token}`,
                                'Content-Type': 'application/json',
                                'Content-Length': Buffer.byteLength(refundData)
                            }
                        };

                        const refundReq = http.request(refundOptions, (refundRes) => {
                            let refundResponseData = '';
                            refundRes.on('data', (chunk) => { refundResponseData += chunk; });
                            refundRes.on('end', () => {
                                console.log(`📊 Status: ${refundRes.statusCode}`);
                                try {
                                    const refundResult = JSON.parse(refundResponseData);
                                    console.log('📋 Response:', refundResult);
                                } catch (e) {
                                    console.log('📋 Raw response:', refundResponseData);
                                }
                                resolve();
                            });
                        });

                        refundReq.on('error', (e) => {
                            console.error('❌ Refund request error:', e.message);
                            reject(e);
                        });

                        refundReq.write(refundData);
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

testRefundRequestCreation().then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
});
