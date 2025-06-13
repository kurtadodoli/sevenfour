const axios = require('axios');
const chalk = require('chalk');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

// Test configuration
const tests = {
    login: {
        validAdmin: {
            email: 'admin@sevenfour.com',
            password: 'Admin@123'
        },
        invalidCredentials: {
            email: 'wrong@email.com',
            password: 'WrongPass123'
        }
    },
    register: {
        validUser: {
            email: `test.user.${Date.now()}@sevenfour.com`,
            password: 'Test@123',
            firstName: 'Test',
            lastName: 'User',
            birthday: '1990-01-01',
            gender: 'other',
            province: 'Test Province',
            city: 'Test City',
            newsletter: false
        },
        invalidUser: {
            email: 'invalid-email',
            password: '123'
        }
    }
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    validateStatus: null
});

async function runTest(name, testFn) {
    console.log(chalk.blue(`\n📋 Running test: ${name}`));
    console.log(chalk.gray('----------------------------------------'));
    try {
        await testFn();
        console.log(chalk.green(`✅ Test passed: ${name}`));
    } catch (error) {
        console.log(chalk.red(`❌ Test failed: ${name}`));
        console.log(chalk.yellow('Error details:'));
        if (error.response) {
            console.log(chalk.gray('Status:'), error.response.status);
            console.log(chalk.gray('Response:'), error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

async function loginTest() {
    // Test valid admin login
    const response = await api.post('/api/auth/login', tests.login.validAdmin);
    if (!response.data?.token) {
        throw new Error('No token received from valid login');
    }
    console.log(chalk.green('✓ Received valid token'));
    return response.data.token;
}

async function invalidLoginTest() {
    const response = await api.post('/api/auth/login', tests.login.invalidCredentials);
    if (response.status !== 401) {
        throw new Error(`Expected 401, got ${response.status}`);
    }
    console.log(chalk.green('✓ Invalid login properly rejected'));
}

async function registerTest() {
    const response = await api.post('/api/auth/register', tests.register.validUser);
    if (!response.data?.token) {
        throw new Error('No token received from valid registration');
    }
    console.log(chalk.green('✓ Successfully registered new user'));
    return response.data.token;
}

async function invalidRegisterTest() {
    const response = await api.post('/api/auth/register', tests.register.invalidUser);
    if (response.status !== 400) {
        throw new Error(`Expected 400, got ${response.status}`);
    }
    console.log(chalk.green('✓ Invalid registration properly rejected'));
}

async function verifyAuthTest(token) {
    const response = await api.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.data?.user) {
        throw new Error('Token verification failed');
    }
    console.log(chalk.green('✓ Token verification successful'));
}

async function runAllTests() {
    console.log(chalk.blue.bold('\n🔍 Starting Authentication Tests'));
    console.log(chalk.gray('========================================'));

    await runTest('Valid Admin Login', loginTest);
    await runTest('Invalid Login Credentials', invalidLoginTest);
    await runTest('New User Registration', registerTest);
    await runTest('Invalid Registration', invalidRegisterTest);

    // Get a token for verification test
    const token = await loginTest();
    await runTest('Token Verification', () => verifyAuthTest(token));
}

// Install chalk if not already installed
try {
    require.resolve('chalk');
} catch (e) {
    console.log('Installing required dependencies...');
    require('child_process').execSync('npm install chalk', { stdio: 'inherit' });
}

// Run the test suite
runAllTests().catch(console.error);
