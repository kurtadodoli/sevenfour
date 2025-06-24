// Quick test to verify password validation
console.log('Testing password validation...');

// Mock passwords to test
const testPasswords = [
    'weak',                    // Too short, no uppercase, no number, no special
    'password',               // No uppercase, no number, no special
    'Password',               // No number, no special
    'Password1',              // No special character
    'Password1!',             // Valid
    'Myp@ssw0rd',            // Valid
    'Test123!',              // Valid
];

testPasswords.forEach(password => {
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
    
    console.log(`Password: "${password}" - ${passwordErrors.length === 0 ? 'VALID' : 'INVALID: ' + passwordErrors.join(', ')}`);
});

console.log('\nPassword validation test complete.');
