// Test if dependencies are available
console.log('Testing dependencies...');

try {
    const express = require('express');
    console.log('✅ Express is available');
} catch (e) {
    console.log('❌ Express not available:', e.message);
}

try {
    const cors = require('cors');
    console.log('✅ CORS is available');
} catch (e) {
    console.log('❌ CORS not available:', e.message);
}

try {
    const path = require('path');
    console.log('✅ Path is available');
} catch (e) {
    console.log('❌ Path not available:', e.message);
}

console.log('✅ Dependency check complete');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
