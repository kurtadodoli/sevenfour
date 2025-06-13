// This file is used to debug the client-side registration process
// Add this to the RegisterPage.js to get more detailed error information

const debugRegistration = async (userData) => {
  try {
    console.log('Debugging registration request...');
    console.log('Registration data:', userData);
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const responseData = await response.json();
    
    console.log('Registration response status:', response.status);
    console.log('Registration response data:', responseData);
    
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error('Error in debug registration:', error);
    return { error: error.toString() };
  }
};

// To use this function:
// 1. Import it in RegisterPage.js
// 2. Call it before the normal register function with the same data
// 3. Check browser console for detailed logs
// Example:
// await debugRegistration(registerData);
// await register(registerData);

export default debugRegistration;
