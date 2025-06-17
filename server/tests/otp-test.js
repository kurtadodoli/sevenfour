// Test script for OTP system
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/auth';
const TEST_EMAIL = 'test@example.com'; // Change this to a real email for testing

class OTPSystemTest {
    constructor() {
        this.testResults = [];
    }

    async log(message, success = true) {
        const timestamp = new Date().toISOString();
        const status = success ? '✅' : '❌';
        const logMessage = `${status} [${timestamp}] ${message}`;
        console.log(logMessage);
        this.testResults.push({ message, success, timestamp });
    }

    async testForgotPassword() {
        try {
            console.log('\n🧪 Testing Forgot Password Endpoint...');
            
            const response = await axios.post(`${API_BASE}/forgot-password`, {
                email: TEST_EMAIL
            });

            if (response.data.success) {
                await this.log('Forgot password request successful');
                return true;
            } else {
                await this.log('Forgot password request failed', false);
                return false;
            }
        } catch (error) {
            await this.log(`Forgot password error: ${error.response?.data?.message || error.message}`, false);
            return false;
        }
    }

    async testVerifyOTP(otp) {
        try {
            console.log('\n🧪 Testing OTP Verification...');
            
            const response = await axios.post(`${API_BASE}/verify-otp`, {
                email: TEST_EMAIL,
                otp: otp
            });

            if (response.data.success) {
                await this.log('OTP verification successful');
                return true;
            } else {
                await this.log('OTP verification failed', false);
                return false;
            }
        } catch (error) {
            await this.log(`OTP verification error: ${error.response?.data?.message || error.message}`, false);
            return false;
        }
    }

    async testResetPassword(otp, newPassword) {
        try {
            console.log('\n🧪 Testing Password Reset...');
            
            const response = await axios.post(`${API_BASE}/reset-password`, {
                email: TEST_EMAIL,
                otp: otp,
                newPassword: newPassword
            });

            if (response.data.success) {
                await this.log('Password reset successful');
                return true;
            } else {
                await this.log('Password reset failed', false);
                return false;
            }
        } catch (error) {
            await this.log(`Password reset error: ${error.response?.data?.message || error.message}`, false);
            return false;
        }
    }

    async testRateLimit() {
        try {
            console.log('\n🧪 Testing Rate Limiting...');
            
            const requests = [];
            for (let i = 0; i < 4; i++) {
                requests.push(
                    axios.post(`${API_BASE}/forgot-password`, {
                        email: TEST_EMAIL
                    }).catch(err => err.response)
                );
            }

            const responses = await Promise.all(requests);
            const successCount = responses.filter(r => r.data?.success).length;
            const rateLimitedCount = responses.filter(r => r.status === 429).length;

            if (rateLimitedCount > 0) {
                await this.log(`Rate limiting working: ${rateLimitedCount} requests blocked`);
                return true;
            } else {
                await this.log('Rate limiting may not be working properly', false);
                return false;
            }
        } catch (error) {
            await this.log(`Rate limiting test error: ${error.message}`, false);
            return false;
        }
    }

    async testInvalidOTP() {
        try {
            console.log('\n🧪 Testing Invalid OTP...');
            
            const response = await axios.post(`${API_BASE}/verify-otp`, {
                email: TEST_EMAIL,
                otp: '000000' // Invalid OTP
            });

            // This should fail
            await this.log('Invalid OTP was accepted (this should not happen)', false);
            return false;
        } catch (error) {
            if (error.response?.status === 400) {
                await this.log('Invalid OTP correctly rejected');
                return true;
            } else {
                await this.log(`Unexpected error testing invalid OTP: ${error.message}`, false);
                return false;
            }
        }
    }

    async testEmailValidation() {
        try {
            console.log('\n🧪 Testing Email Validation...');
            
            // Test with invalid email format
            const response = await axios.post(`${API_BASE}/forgot-password`, {
                email: 'invalid-email'
            });

            await this.log('Invalid email was accepted (this should not happen)', false);
            return false;
        } catch (error) {
            if (error.response?.status === 400) {
                await this.log('Invalid email format correctly rejected');
                return true;
            } else {
                await this.log(`Unexpected error testing email validation: ${error.message}`, false);
                return false;
            }
        }
    }

    async runAllTests() {
        console.log('🚀 Starting OTP System Tests...');
        console.log(`📧 Test email: ${TEST_EMAIL}`);
        console.log('⚠️  Make sure to update TEST_EMAIL to a real email address for complete testing');
        
        const tests = [
            { name: 'Email Validation', test: () => this.testEmailValidation() },
            { name: 'Forgot Password', test: () => this.testForgotPassword() },
            { name: 'Invalid OTP', test: () => this.testInvalidOTP() },
            { name: 'Rate Limiting', test: () => this.testRateLimit() }
        ];

        const results = [];
        for (const { name, test } of tests) {
            try {
                const result = await test();
                results.push({ name, success: result });
            } catch (error) {
                results.push({ name, success: false, error: error.message });
            }
        }

        // Print summary
        console.log('\n📊 Test Summary:');
        console.log('================');
        const passedTests = results.filter(r => r.success).length;
        const totalTests = results.length;
        
        results.forEach(({ name, success, error }) => {
            const status = success ? '✅' : '❌';
            console.log(`${status} ${name}${error ? ` - ${error}` : ''}`);
        });
        
        console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All tests passed! OTP system is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please check the implementation.');
        }

        console.log('\n📝 Manual Testing Required:');
        console.log('1. Set TEST_EMAIL to a real email address you can access');
        console.log('2. Run: node server/tests/otp-test.js');
        console.log('3. Check your email for the OTP code');
        console.log('4. Test the complete flow in the browser');
        
        return { passedTests, totalTests, results };
    }
}

// Helper function to get user input (for manual testing)
const getUserInput = (question) => {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// Main execution
if (require.main === module) {
    const tester = new OTPSystemTest();
    
    tester.runAllTests().then(async (summary) => {
        console.log('\n🔍 Would you like to test with a real OTP? (y/n)');
        console.log('Make sure TEST_EMAIL is set to a real email address first.');
        
        // Uncomment the lines below for interactive testing
        /*
        const answer = await getUserInput('Continue with manual OTP test? (y/n): ');
        if (answer.toLowerCase() === 'y') {
            console.log('Sending OTP to', TEST_EMAIL);
            await tester.testForgotPassword();
            
            const otp = await getUserInput('Enter the OTP you received: ');
            await tester.testVerifyOTP(otp);
            
            const newPassword = 'TestPassword123!';
            await tester.testResetPassword(otp, newPassword);
        }
        */
    }).catch(console.error);
}

module.exports = OTPSystemTest;
