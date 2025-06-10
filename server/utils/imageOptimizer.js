const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');

class ImageOptimizer {
    static async optimizeImage(file, options = {}) {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 80,
            format = 'jpeg',
            generateThumbnail = true,
            thumbnailSize = 200
        } = options;

        // Generate secure filename
        const randomBytes = crypto.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        const ext = format;
        const secureFilename = `${timestamp}-${randomBytes}.${ext}`;

        // Create image transformer
        const transformer = sharp(file.buffer)
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } }); // Convert transparent to white background

        // Set format-specific options
        switch (format) {
            case 'jpeg':
                transformer.jpeg({ quality });
                break;
            case 'webp':
                transformer.webp({ quality });
                break;
            case 'png':
                transformer.png({ compressionLevel: Math.floor((100 - quality) / 10) });
                break;
            default:
                throw new Error('Unsupported format');
        }

        // Process main image
        const mainImageBuffer = await transformer.toBuffer();

        // Generate thumbnail if requested
        let thumbnailBuffer = null;
        if (generateThumbnail) {
            thumbnailBuffer = await sharp(file.buffer)
                .resize(thumbnailSize, thumbnailSize, {
                    fit: 'cover',
                    position: 'centre'
                })
                [format]({ quality })
                .toBuffer();
        }

        return {
            mainImage: {
                buffer: mainImageBuffer,
                filename: secureFilename
            },
            thumbnail: thumbnailBuffer ? {
                buffer: thumbnailBuffer,
                filename: `thumb-${secureFilename}`
            } : null
        };
    }

    static validateDimensions(metadata, constraints = {}) {
        const {
            minWidth = 200,
            minHeight = 200,
            maxWidth = 5000,
            maxHeight = 5000,
            aspectRatio = null
        } = constraints;

        const { width, height } = metadata;

        if (width < minWidth || height < minHeight) {
            throw new Error(`Image dimensions too small. Minimum size is ${minWidth}x${minHeight}px`);
        }

        if (width > maxWidth || height > maxHeight) {
            throw new Error(`Image dimensions too large. Maximum size is ${maxWidth}x${maxHeight}px`);
        }

        if (aspectRatio) {
            const imageRatio = width / height;
            const [targetWidth, targetHeight] = aspectRatio.split(':').map(Number);
            const targetRatio = targetWidth / targetHeight;

            const tolerance = 0.01; // 1% tolerance for aspect ratio
            if (Math.abs(imageRatio - targetRatio) > tolerance) {
                throw new Error(`Invalid aspect ratio. Required ratio is ${aspectRatio}`);
            }
        }

        return true;
    }
}

module.exports = ImageOptimizer;
