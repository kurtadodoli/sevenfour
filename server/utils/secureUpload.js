const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Secure file type validation
const fileFilter = (req, file, cb) => {
    // Whitelist of allowed MIME types
    const allowedTypes = new Set([
        'image/jpeg',
        'image/png',
        'image/gif'
    ]);

    if (!allowedTypes.has(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'), false);
    }

    // Additional magic number validation for images
    const magic = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46]
    };

    // Read first bytes of file
    const fileHeader = file.buffer.slice(0, 4);
    const magicNumbers = magic[file.mimetype];
    
    const isValid = magicNumbers.every((byte, i) => fileHeader[i] === byte);
    if (!isValid) {
        return cb(new Error('Invalid file content'), false);
    }

    cb(null, true);
};

// Configure multer storage
const storage = multer.memoryStorage();

// Configure upload limits
const limits = {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // Default 5MB
    files: 1 // Only allow one file at a time
};

// Create multer instance with security settings
const upload = multer({
    storage,
    limits,
    fileFilter
});

// Image optimization configuration
const optimizationConfig = {
    jpeg: {
        quality: 80,
        progressive: true,
        chromaSubsampling: '4:4:4'
    },
    png: {
        compressionLevel: 9,
        palette: true
    },
    webp: {
        quality: 80,
        lossless: false,
        nearLossless: false,
        smartSubsample: true
    }
};

// Generate secure random filename
const generateSecureFilename = (originalname) => {
    const ext = path.extname(originalname).toLowerCase();
    const randomName = crypto.randomBytes(32).toString('hex');
    return `${randomName}${ext}`;
};

// Process and optimize uploaded image
async function processImage(file, options = {}) {
    const { width, height, format } = options;
    
    try {
        // Read the uploaded file buffer
        const image = sharp(file.buffer);
        
        // Get image metadata
        const metadata = await image.metadata();
        
        // Determine output format
        const outputFormat = format || metadata.format;
        
        // Create transformer
        let transformer = image;
        
        // Resize if dimensions provided
        if (width || height) {
            transformer = transformer.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        
        // Apply format-specific optimizations
        switch (outputFormat.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                transformer = transformer.jpeg(optimizationConfig.jpeg);
                break;
            case 'png':
                transformer = transformer.png(optimizationConfig.png);
                break;
            case 'webp':
                transformer = transformer.webp(optimizationConfig.webp);
                break;
        }
        
        // Generate filename and process image
        const filename = generateSecureFilename(`image.${outputFormat}`);
        const outputPath = path.join(process.env.UPLOAD_DIR || 'public/uploads', filename);
        
        await transformer.toFile(outputPath);
        
        return {
            filename,
            path: outputPath,
            size: fs.statSync(outputPath).size,
            width: metadata.width,
            height: metadata.height,
            format: outputFormat
        };
    } catch (error) {
        throw new Error(`Image processing failed: ${error.message}`);
    }
}

// Create thumbnail
async function createThumbnail(file, options = { width: 200, height: 200 }) {
    try {
        const thumbnail = await processImage(file, {
            ...options,
            format: 'webp'
        });
        
        return thumbnail;
    } catch (error) {
        throw new Error(`Thumbnail generation failed: ${error.message}`);
    }
}

// Validate image dimensions
async function validateImageDimensions(file, minSize = 100, maxSize = 4096) {
    try {
        const metadata = await sharp(file.buffer).metadata();
        
        if (metadata.width < minSize || metadata.height < minSize) {
            throw new Error(`Image dimensions too small. Minimum size is ${minSize}x${minSize}px`);
        }
        
        if (metadata.width > maxSize || metadata.height > maxSize) {
            throw new Error(`Image dimensions too large. Maximum size is ${maxSize}x${maxSize}px`);
        }
        
        return true;
    } catch (error) {
        throw new Error(`Image validation failed: ${error.message}`);
    }
}

module.exports = {
    upload,
    generateSecureFilename,
    processImage,
    createThumbnail,
    validateImageDimensions
};
