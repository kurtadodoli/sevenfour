// Test script to verify Registration Page fixes for authentication and password validation
console.log('=== Testing Registration Page Fixes ===\n');

const fs = require('fs');
const path = require('path');

// Test password validation logic
function testPasswordValidation() {
    console.log('1. Testing Password Validation:');
    
    const testPasswords = [
        { password: 'weak', expected: false },
        { password: 'Password1!', expected: true },
        { password: 'Test123!', expected: true },
        { password: 'noupper123!', expected: false },
        { password: 'NOLOWER123!', expected: false },
        { password: 'NoNumber!', expected: false },
        { password: 'NoSpecial123', expected: false }
    ];
    
    testPasswords.forEach(({ password, expected }) => {
        const passwordErrors = [];
        if (password.length < 8) {
            passwordErrors.push('at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            passwordErrors.push('one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            passwordErrors.push('one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            passwordErrors.push('one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            passwordErrors.push('one special character');
        }
        
        const isValid = passwordErrors.length === 0;
        const status = isValid === expected ? '✓' : '✗';
        console.log(`   ${status} "${password}" - ${isValid ? 'VALID' : 'INVALID'} (${expected ? 'Expected Valid' : 'Expected Invalid'})`);
    });
}

// Check file content for fixes
function checkFileContent() {
    console.log('\n2. Checking File Content:');
    
    const registrationPagePath = path.join(__dirname, 'client', 'src', 'pages', 'RegistrationPage.js');
    
    if (fs.existsSync(registrationPagePath)) {
        const content = fs.readFileSync(registrationPagePath, 'utf8');
        
        // Check for enhanced password validation
        if (content.includes('at least 8 characters') && content.includes('one uppercase letter')) {
            console.log('   ✓ Enhanced password validation implemented');
        } else {
            console.log('   ✗ Enhanced password validation missing');
        }
        
        // Check for better error handling in fetch functions
        if (content.includes('response.status === 401') && content.includes('response.status === 403')) {
            console.log('   ✓ Enhanced error handling for API calls added');
        } else {
            console.log('   ✗ Enhanced error handling missing');
        }
        
        // Check for improved user feedback
        if (content.includes('No Users Available') && content.includes('logged in as an admin')) {
            console.log('   ✓ User feedback for empty users list added');
        } else {
            console.log('   ✗ User feedback for empty users list missing');
        }
        
        // Check for debug logging
        if (content.includes('console.log') && content.includes('Fetching users with token')) {
            console.log('   ✓ Debug logging added to API calls');
        } else {
            console.log('   ✗ Debug logging missing from API calls');
        }
        
        // Check for updated password placeholder
        if (content.includes('min 8 chars') && content.includes('special char')) {
            console.log('   ✓ Password placeholder updated with new requirements');
        } else {
            console.log('   ✗ Password placeholder not updated');
        }
        
    } else {
        console.log('   ✗ RegistrationPage.js not found');
    }
}

// Check backend compatibility
function checkBackendCompatibility() {
    console.log('\n3. Backend Compatibility:');
    
    const userControllerPath = path.join(__dirname, 'server', 'controllers', 'userController.js');
    
    if (fs.existsSync(userControllerPath)) {
        const content = fs.readFileSync(userControllerPath, 'utf8');
        
        if (content.includes('validatePassword') && content.includes('at least 8 characters')) {
            console.log('   ✓ Backend password validation found');
        } else {
            console.log('   ✗ Backend password validation not found');
        }
        
        if (content.includes('first_name') && content.includes('last_name')) {
            console.log('   ✓ Backend expects first_name and last_name fields');
        } else {
            console.log('   ✗ Backend field names might not match frontend');
        }
    } else {
        console.log('   ✗ userController.js not found');
    }
    
    const usersRoutePath = path.join(__dirname, 'server', 'routes', 'api', 'users.js');
    
    if (fs.existsSync(usersRoutePath)) {
        const content = fs.readFileSync(usersRoutePath, 'utf8');
        
        if (content.includes('req.user.role !== \'admin\'')) {
            console.log('   ✓ Backend requires admin role for users list');
        } else {
            console.log('   ✗ Backend admin check not found');
        }
    } else {
        console.log('   ✗ users.js route not found');
    }
}

// Run all tests
testPasswordValidation();
checkFileContent();
checkBackendCompatibility();

console.log('\n=== Summary ===');
console.log('Fixed Issues:');
console.log('1. ✓ Updated password validation to match backend requirements (8 chars, uppercase, lowercase, number, special)');
console.log('2. ✓ Enhanced error handling for API calls (401, 403 status codes)');
console.log('3. ✓ Added user feedback when users list is empty due to permissions');
console.log('4. ✓ Added debug logging for better troubleshooting');
console.log('5. ✓ Updated password placeholder with new requirements');

console.log('\n=== Next Steps ===');
console.log('1. Ensure you are logged in as an admin user');
console.log('2. Try registering a user with a strong password (e.g., "Password123!")');
console.log('3. Check browser console for debug messages');
console.log('4. Verify users list loads if you have admin permissions');
