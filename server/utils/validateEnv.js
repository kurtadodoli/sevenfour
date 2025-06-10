const requiredEnvVars = {
    // Database Configuration
    DB_HOST: { type: 'string' },
    DB_USER: { type: 'string' },
    DB_PASSWORD: { type: 'string' },
    DB_NAME: { type: 'string' },
    DB_PORT: { type: 'number', min: 1, max: 65535 },

    // JWT Configuration
    JWT_SECRET: { type: 'string', minLength: 32 },
    JWT_EXPIRES_IN: { type: 'string', pattern: /^\d+[hdwm]$/ }, // e.g., 24h, 7d, 1w, 1m

    // Server Configuration
    PORT: { type: 'number', min: 1, max: 65535 },

    // Email Configuration (if using email features)
    EMAIL_USER: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    EMAIL_PASSWORD: { type: 'string', minLength: 8 },

    // Upload Configuration
    UPLOAD_URL: { type: 'string', pattern: /^https?:\/\// },
    MAX_FILE_SIZE: { type: 'number', min: 1 }
};

const validateEnv = () => {
    const errors = [];

    for (const [key, rules] of Object.entries(requiredEnvVars)) {
        const value = process.env[key];

        // Check if required variable exists
        if (!value) {
            errors.push(`Missing required environment variable: ${key}`);
            continue;
        }

        // Type validation
        if (rules.type === 'number') {
            const num = Number(value);
            if (isNaN(num)) {
                errors.push(`${key} must be a number`);
                continue;
            }
            if (rules.min !== undefined && num < rules.min) {
                errors.push(`${key} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && num > rules.max) {
                errors.push(`${key} must be no more than ${rules.max}`);
            }
        }

        // String validations
        if (rules.type === 'string') {
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${key} must be at least ${rules.minLength} characters long`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${key} has invalid format`);
            }
        }
    }

    if (errors.length > 0) {
        console.error('Environment validation failed:');
        errors.forEach(error => console.error(`- ${error}`));
        process.exit(1);
    }

    return true;
};

module.exports = validateEnv;
