// utils/email.js
async function sendResetCode(email, code) {
    console.log(`Sending reset code ${code} to ${email}`);
    return true; // Simulate success
}

module.exports = { sendResetCode };
