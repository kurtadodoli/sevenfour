console.log('Testing dependencies from controllers directory...');

try {
    console.log('1. Loading bcrypt...');
    const bcrypt = require('bcrypt');
    console.log('✓ bcrypt loaded');

    console.log('2. Loading db query...');
    const { query } = require('../config/db');
    console.log('✓ db query loaded');

    console.log('3. Loading path...');
    const path = require('path');
    console.log('✓ path loaded');

    console.log('4. Loading fs.promises...');
    const fs = require('fs').promises;
    console.log('✓ fs.promises loaded');

    console.log('5. Loading sharp...');
    const sharp = require('sharp');
    console.log('✓ sharp loaded');

    console.log('6. Loading crypto...');
    const crypto = require('crypto');
    console.log('✓ crypto loaded');

    console.log('7. Testing a simple export...');
    exports.test = () => 'test works';
    console.log('✓ export added');
    console.log('Available exports:', Object.keys(exports));

} catch (error) {
    console.error('Error loading dependencies:', error);
    console.error(error.stack);
}
