// Simple profile controller for testing
exports.getProfile = (req, res) => {
    res.json({ test: 'getProfile works' });
};

exports.updateProfile = (req, res) => {
    res.json({ test: 'updateProfile works' });
};

exports.updatePreferences = (req, res) => {
    res.json({ test: 'updatePreferences works' });
};

exports.changePassword = (req, res) => {
    res.json({ test: 'changePassword works' });
};

exports.uploadProfilePicture = (req, res) => {
    res.json({ test: 'uploadProfilePicture works' });
};
