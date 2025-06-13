console.log('Testing basic exports...');

// Test basic function export
exports.test = () => {
    console.log('Test function works');
};

console.log('Exports after test function:', Object.keys(exports));
