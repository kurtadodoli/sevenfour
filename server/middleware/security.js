const crypto = require('crypto');

// Generate nonce for CSP
const generateNonce = () => {
    return crypto.randomBytes(16).toString('base64');
};

// Security middleware
const security = (req, res, next) => {
    // Generate nonce for inline scripts if needed
    const nonce = generateNonce();
    res.locals.nonce = nonce;

    // Content Security Policy
    res.setHeader('Content-Security-Policy', `
        default-src 'self';
        img-src 'self' data: blob: ${process.env.UPLOAD_URL || 'http://localhost:5000/uploads/'};
        style-src 'self' 'unsafe-inline';
        script-src 'self' 'nonce-${nonce}';
        connect-src 'self' ${process.env.API_URL || 'http://localhost:5000'};
        frame-ancestors 'none';
        object-src 'none';
        base-uri 'self';
    `.replace(/\s+/g, ' ').trim());

    // Other security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // HSTS in production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
};

module.exports = security;
