// Test script to debug profileController issues
console.log('Testing profileController...');

try {
    console.log('1. Loading bcrypt...');
    const bcrypt = require('bcrypt');
    console.log('✓ bcrypt loaded');

    console.log('2. Loading db config...');
    const { query } = require('./config/db');
    console.log('✓ db config loaded');

    console.log('3. Loading other dependencies...');
    const path = require('path');
    const fs = require('fs').promises;
    const sharp = require('sharp');
    const crypto = require('crypto');
    console.log('✓ all dependencies loaded');

    console.log('4. Testing profileController require...');
    const profileController = require('./controllers/profileController');
    console.log('✓ profileController loaded');
    console.log('Available exports:', Object.keys(profileController));

    if (Object.keys(profileController).length === 0) {
        console.log('⚠️ No exports found - there might be an execution issue');
    }

} catch (error) {
    console.error('Error during test:', error);
    console.error(error.stack);
}
