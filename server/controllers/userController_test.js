// Test simple exports
console.log('Loading userController...');

exports.test = () => {
    return 'test works';
};

exports.register = async (req, res) => {
    res.json({ message: 'register endpoint works' });
};

exports.login = async (req, res) => {
    res.json({ message: 'login endpoint works' });
};

console.log('UserController loaded with exports:', Object.keys(exports));
