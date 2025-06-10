const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const ImageOptimizer = require('../utils/imageOptimizer');

// Make fs.unlink return a promise
const unlink = promisify(fs.unlink);

// Configure multer storage
const storage = multer.memoryStorage();

// File filter function for security
const fileFilter = (req, file, cb) => {
    // Validate mime type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
    }

    // Get file extension and validate
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!validExts.includes(ext)) {
        return cb(new Error('Invalid file extension.'), false);
    }

    cb(null, true);
};

// Configure multer upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 10 // Max 10 files per upload
    }
});

// Secure image processing middleware
const processImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            if (req.file) {
                req.files = [req.file]; // Convert single file to array
            } else {
                return next();
            }
        }

        // Create uploads directories if they don't exist
        const uploadsDir = path.join(__dirname, '../public/uploads');
        const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        await fs.promises.mkdir(thumbnailsDir, { recursive: true });

        const processedFiles = [];

        for (const file of req.files) {
            // Get image metadata
            const metadata = await sharp(file.buffer).metadata();

            // Validate dimensions
            try {
                ImageOptimizer.validateDimensions(metadata, {
                    minWidth: 200,
                    minHeight: 200,
                    maxWidth: 4096,
                    maxHeight: 4096
                });
            } catch (error) {
                // Clean up any processed files
                for (const processed of processedFiles) {
                    if (processed.path) {
                        await unlink(processed.path);
                    }
                }
                return res.status(400).json({ error: error.message });
            }

            // Optimize image
            const processed = await ImageOptimizer.optimizeImage(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 80,
                format: 'jpeg',
                generateThumbnail: true
            });

            // Save files to disk
            const mainImagePath = path.join(__dirname, '../public/uploads', processed.mainImage.filename);
            const thumbnailPath = processed.thumbnail ? 
                path.join(__dirname, '../public/uploads/thumbnails', processed.thumbnail.filename) : 
                null;            await fs.promises.writeFile(mainImagePath, processed.mainImage.buffer);
            if (thumbnailPath) {
                await fs.promises.writeFile(thumbnailPath, processed.thumbnail.buffer);
            }

            // Generate WebP version for better performance
            const webpBuffer = await sharp(processed.mainImage.buffer)
                .webp({ quality: 80 })
                .toBuffer();
            const webpFilename = processed.mainImage.filename.replace(/\.[^.]+$/, '.webp');
            await fs.promises.writeFile(
                path.join(__dirname, '../public/uploads', webpFilename),
                webpBuffer
            );

            processedFiles.push({
                fieldname: file.fieldname,
                originalname: file.originalname,
                filename: processed.mainImage.filename,
                webpFilename: webpFilename,
                thumbnailFilename: processed.thumbnail?.filename,
                mimetype: 'image/jpeg',
                path: mainImagePath,
                thumbnailPath: thumbnailPath,
                size: processed.mainImage.buffer.length
            });
        }

        req.processedFiles = processedFiles;
        next();
    } catch (error) {
        next(error);
    }
};

// Error handling middleware
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({ error: err.message });
    }

    next(err);
};

module.exports = {
    upload,
    processImages,
    handleUploadErrors
};
