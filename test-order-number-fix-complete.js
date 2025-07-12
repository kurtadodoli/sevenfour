// Comprehensive test to verify the order number fix
require('dotenv').config({ path: './server/.env' });
const axios = require('axios');

const testOrderNumberFix = async () => {
    try {
        console.log('🔍 Testing complete order number fix...');
        console.log('🔧 Backend + Frontend integration test\n');
        
        // Test the API endpoint directly
        const API_BASE_URL = 'http://localhost:5000/api';
        
        console.log('1. Testing backend API directly...');
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/cancellation-requests`);
            console.log('✅ Backend API response received');
            console.log('Status:', response.status);
            console.log('Success:', response.data.success);
            console.log('Data count:', response.data.data ? response.data.data.length : 0);
            
            if (response.data.success && response.data.data) {
                console.log('\n📋 Order numbers from backend:');
                response.data.data.forEach((request, index) => {
                    console.log(`   ${index + 1}. ID: ${request.id}, Order Number: "${request.order_number}", Type: ${request.order_type || 'unknown'}`);
                });
                
                // Check for blank order numbers
                const blankOrderNumbers = response.data.data.filter(req => !req.order_number || req.order_number.trim() === '');
                if (blankOrderNumbers.length > 0) {
                    console.log('\n❌ Found blank order numbers:');
                    blankOrderNumbers.forEach(req => {
                        console.log(`   - Request ID: ${req.id}, Order Number: "${req.order_number}"`);
                    });
                } else {
                    console.log('\n✅ All order numbers are properly populated');
                }
                
                // Test the frontend mapping logic
                console.log('\n2. Testing frontend mapping logic...');
                const processedRequests = response.data.data.map(request => ({
                    ...request,
                    order_type: 'regular',
                    request_type: 'regular_order_cancellation',
                    
                    // This is the exact mapping from TransactionPage.js
                    order_number: request.order_number || request.order_id || request.transaction_id || request.id,
                    
                    customer_name: request.customer_name || request.user_name || request.full_name,
                    customer_email: request.customer_email || request.user_email || request.email,
                    customer_phone: request.customer_phone || request.phone || request.contact_phone,
                    
                    product_type: request.product_type || request.product_name || 'Regular Order',
                    total_amount: request.total_amount || request.amount || request.order_total || 0
                }));
                
                console.log('📋 After frontend mapping:');
                processedRequests.forEach((request, index) => {
                    console.log(`   ${index + 1}. ID: ${request.id}, Mapped Order Number: "${request.order_number}"`);
                });
                
                // Test safeDisplayValue function
                console.log('\n3. Testing safeDisplayValue function...');
                const safeDisplayValue = (value, fallback = '') => {
                    if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
                        return fallback;
                    }
                    return value;
                };
                
                processedRequests.forEach((request, index) => {
                    const displayValue = safeDisplayValue(request.order_number || request.custom_order_id, 'No Order Number');
                    console.log(`   ${index + 1}. ID: ${request.id}, Display Value: "${displayValue}"`);
                });
                
                console.log('\n✅ Order number fix verification complete!');
            }
            
        } catch (error) {
            console.error('❌ Backend API test failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testOrderNumberFix();
