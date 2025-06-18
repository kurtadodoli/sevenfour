import axios from 'axios';

const testLogin = async () => {
    console.clear(); // Clear previous console output
    
    console.log('%c🔍 Starting Login Test', 'color: blue; font-size: 16px');

    try {
        const response = await axios.post(
            'http://localhost:5001/api/auth/login',
            {
                email: 'test@example.com',
                password: 'Test123!@#'
            }
        );

        console.log('%c📝 Response Data:', 'color: green; font-size: 14px', {
            success: response.data.success,
            hasToken: !!response.data.token,
            hasUser: !!response.data.user
        });

    } catch (error) {
        console.log('%c❌ Test Failed:', 'color: red; font-size: 14px', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
};

export default testLogin;