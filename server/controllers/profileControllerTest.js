const path = require('path');

// Simple test function
exports.uploadProfilePicture = async (req, res) => {
    console.log('uploadProfilePicture called!');
    res.json({
        success: true,
        message: 'Test upload function working',
        data: {
            test: true
        }
    });
};
