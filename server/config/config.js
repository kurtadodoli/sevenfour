// server/config/config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: '24h',
  bcryptSaltRounds: 10,
  uploadDir: process.env.UPLOAD_DIR || 'uploads/'
};