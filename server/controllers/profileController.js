// Placeholder controller stubs for profile routes
exports.getProfile = (req, res) => {
  res.json({ message: 'getProfile placeholder' });
};

exports.updateProfile = (req, res) => {
  res.json({ message: 'updateProfile placeholder' });
};

exports.updatePreferences = (req, res) => {
  res.json({ message: 'updatePreferences placeholder' });
};

exports.changePassword = (req, res) => {
  res.json({ message: 'changePassword placeholder' });
};

exports.uploadProfilePicture = (req, res) => {
  res.json({ message: 'uploadProfilePicture placeholder' });
};

// Validation helpers
const validateName = (name, fieldName) => {
    if (name && (
        name.length < VALIDATION.NAME.MIN_LENGTH || 
        name.length > VALIDATION.NAME.MAX_LENGTH || 
        !VALIDATION.NAME.PATTERN.test(name)
    )) {
        const error = new Error(`${fieldName} must be ${VALIDATION.NAME.MIN_LENGTH}-${VALIDATION.NAME.MAX_LENGTH} characters long and contain only letters`);
        error.statusCode = 400;
        throw error;
    }
};

const validatePhone = (phone) => {
    if (phone && !VALIDATION.PHONE.PATTERN.test(phone)) {
        const error = new Error('Please enter a valid phone number');
        error.statusCode = 400;
        throw error;
    }
};

const validatePostalCode = (postalCode) => {
    if (postalCode && !VALIDATION.POSTAL_CODE.PATTERN.test(postalCode)) {
        const error = new Error('Please enter a valid postal code');
        error.statusCode = 400;
        throw error;
    }
};

const validatePassword = (password) => {
    if (!password || password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
        const error = new Error('Password must be at least 8 characters long');
        error.statusCode = 400;
        throw error;
    }

    const checks = Object.entries(VALIDATION.PASSWORD.PATTERNS).every(([type, pattern]) => pattern.test(password));
    if (!checks) {
        const error = new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        error.statusCode = 400;
        throw error;
    }
};

const validateFile = (file) => {
    if (!file) {
        const error = new Error('No file uploaded');
        error.statusCode = 400;
        throw error;
    }

    if (!VALIDATION.FILE.ALLOWED_TYPES.includes(file.mimetype)) {
        const error = new Error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
        error.statusCode = 400;
        throw error;
    }

    if (file.size > VALIDATION.FILE.MAX_SIZE) {
        const error = new Error('File too large. Maximum size is 5MB.');
        error.statusCode = 400;
        throw error;
    }
};

// Error handling utility
const handleServerError = (res, error, operation) => {
    console.error(`Error ${operation}:`, error);
    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : `Error ${operation.toLowerCase()}`;
    res.status(statusCode).json({
        success: false,
        message
    });
};

// Get user profile including preferences
exports.getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.*, up.*
            FROM users u
            LEFT JOIN user_preferences up ON u.id = up.user_id
            WHERE u.id = ?
        `, [req.user.id]);

        if (users.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const user = users[0];
        delete user.password;

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        handleServerError(res, error, 'fetching profile');
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        validateFile(req.file);

        const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
        await fs.mkdir(uploadDir, { recursive: true });        // Delete old profile picture if it exists
        const [oldPicture] = await pool.query(
            'SELECT profile_picture_url FROM users WHERE id = ?',
            [req.user.id]
        );

        if (oldPicture[0]?.profile_picture_url) {
            const oldPath = path.join(__dirname, '..', 'public', oldPicture[0].profile_picture_url);
            try {
                await fs.unlink(oldPath);
            } catch (err) {
                console.warn('Could not delete old profile picture:', err);
            }
        }        // Generate secure filename with user ID and timestamp
        const timestamp = Date.now();
        const randomBytes = crypto.randomBytes(8).toString('hex');
        const fileName = `profile-${req.user.id}-${timestamp}-${randomBytes}.jpg`;
        const filePath = path.join(uploadDir, fileName);

        // Process and optimize the image
        await sharp(req.file.buffer)
            .resize(VALIDATION.FILE.IMAGE.WIDTH, VALIDATION.FILE.IMAGE.HEIGHT, { // Resize to reasonable profile picture dimensions
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ // Convert to JPEG format for consistency
                quality: VALIDATION.FILE.IMAGE.QUALITY, // Good balance between quality and file size
                chromaSubsampling: '4:4:4' // Better quality for text/sharp edges
            })
            .toFile(filePath);

        const profilePictureUrl = `/uploads/profiles/${fileName}`;
        
        await pool.query(
            'UPDATE users SET profile_picture_url = ? WHERE id = ?',
            [profilePictureUrl, req.user.id]
        );

        res.json({
            success: true,
            data: {
                url: profilePictureUrl
            },
            message: 'Profile picture uploaded successfully'
        });    } catch (error) {
        handleServerError(res, error, 'uploading profile picture');
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            phone,
            street_address,
            apartment_suite,
            city,
            state_province,
            postal_code,
            country
        } = req.body;

        // Input validation
        validateName(first_name, 'First name');
        validateName(last_name, 'Last name');
        validatePhone(phone);
        validatePostalCode(postal_code);

        // Sanitize input by trimming whitespace
        const sanitizedData = {
            first_name: first_name?.trim(),
            last_name: last_name?.trim(),
            phone: phone?.trim(),
            street_address: street_address?.trim(),
            apartment_suite: apartment_suite?.trim(),
            city: city?.trim(),
            state_province: state_province?.trim(),
            postal_code: postal_code?.trim(),
            country: country?.trim()
        };        await pool.query(`
            UPDATE users 
            SET 
                first_name = ?,
                last_name = ?,
                phone = ?,
                street_address = ?,
                apartment_suite = ?,
                city = ?,
                state_province = ?,
                postal_code = ?,
                country = ?
            WHERE id = ?
        `, [
            sanitizedData.first_name,
            sanitizedData.last_name,
            sanitizedData.phone,
            sanitizedData.street_address,
            sanitizedData.apartment_suite,
            sanitizedData.city,
            sanitizedData.state_province,
            sanitizedData.postal_code,
            sanitizedData.country,
            req.user.id
        ]);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });    } catch (error) {
        handleServerError(res, error, 'updating profile');
    }
};

// Validation helpers for preferences
const validatePreferences = (preferences) => {
    const {
        email_notifications,
        order_updates,
        promotional_emails,
        newsletter_subscription,
        theme_preference,
        language_preference
    } = preferences;

    // Validate boolean fields
    const booleanFields = {
        email_notifications,
        order_updates,
        promotional_emails,
        newsletter_subscription
    };

    for (const [key, value] of Object.entries(booleanFields)) {
        if (value !== undefined && typeof value !== 'boolean') {
            const error = new Error(`${key.replace(/_/g, ' ')} must be a boolean value`);
            error.statusCode = 400;
            throw error;
        }
    }

    // Validate theme preference
    const validThemes = ['light', 'dark', 'system'];
    if (theme_preference && !validThemes.includes(theme_preference)) {
        const error = new Error('Invalid theme preference');
        error.statusCode = 400;
        throw error;
    }

    // Validate language preference
    const validLanguages = ['en', 'es', 'fr', 'de'];  // Add more as needed
    if (language_preference && !validLanguages.includes(language_preference)) {
        const error = new Error('Invalid language preference');
        error.statusCode = 400;
        throw error;
    }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
    try {
        const preferences = {
            email_notifications,
            order_updates,
            promotional_emails,
            newsletter_subscription,
            theme_preference,
            language_preference
        } = req.body;

        validatePreferences(preferences);

        await pool.query(`
            INSERT INTO user_preferences (
                user_id,
                email_notifications,
                order_updates,
                promotional_emails,
                newsletter_subscription,
                theme_preference,
                language_preference
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                email_notifications = VALUES(email_notifications),
                order_updates = VALUES(order_updates),
                promotional_emails = VALUES(promotional_emails),
                newsletter_subscription = VALUES(newsletter_subscription),
                theme_preference = VALUES(theme_preference),
                language_preference = VALUES(language_preference)
        `, [
            req.user.id,
            email_notifications,
            order_updates,
            promotional_emails,
            newsletter_subscription,
            theme_preference,
            language_preference
        ]);

        res.json({
            success: true,
            message: 'Preferences updated successfully'
        });
    } catch (error) {
        handleServerError(res, error, 'updating preferences');
    }
};

// Change password
exports.changePassword = async (req, res) => {    try {
        const { currentPassword, newPassword } = req.body;

        validatePassword(newPassword);

        // Get user's current password
        const [users] = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });    } catch (error) {
        handleServerError(res, error, 'changing password');
    }
};

// Add automatic cleanup of old profile pictures
const cleanupOldProfilePictures = async () => {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
    try {
        const files = await fs.readdir(uploadDir);
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

        for (const file of files) {
            const filePath = path.join(uploadDir, file);
            const stats = await fs.stat(filePath);
            
            // Get user ID from filename
            const match = file.match(/profile-(\d+)-/);
            if (!match) continue;
            
            const userId = match[1];
            
            // Check if this is an old unused profile picture
            const [users] = await pool.query(
                'SELECT profile_picture_url FROM users WHERE id = ?',
                [userId]
            );
            
            const isCurrentProfilePicture = users[0]?.profile_picture_url?.includes(file);
            const isOlderThanOneWeek = now - stats.mtimeMs > oneWeek;
            
            if (!isCurrentProfilePicture && isOlderThanOneWeek) {
                await fs.unlink(filePath);
                console.log(`Cleaned up old profile picture: ${file}`);
            }
        }
    } catch (error) {
        console.error('Error cleaning up old profile pictures:', error);
    }
};

// Schedule cleanup to run daily
setInterval(cleanupOldProfilePictures, 24 * 60 * 60 * 1000);
