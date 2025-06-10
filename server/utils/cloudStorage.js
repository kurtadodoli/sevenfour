const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize storage
const storage = new Storage({
    keyFilename: path.join(__dirname, '../config/cloud-storage-key.json'),
    projectId: process.env.GOOGLE_CLOUD_PROJECT
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);

// Upload file to cloud storage
const uploadToCloud = async (file) => {
    try {
        // Create a unique filename
        const filename = `${uuidv4()}${path.extname(file.originalname)}`;
        const blob = bucket.file(`profile-pictures/${filename}`);
        
        // Create write stream
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
            resumable: false,
        });

        // Handle errors and success
        return new Promise((resolve, reject) => {
            blobStream.on('error', (err) => {
                reject(new Error(`Unable to upload image, error: ${err}`));
            });

            blobStream.on('finish', async () => {
                // Make the file public
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            });

            blobStream.end(file.buffer);
        });
    } catch (err) {
        console.error('Upload to cloud storage error:', err);
        throw new Error('Failed to upload file');
    }
};

module.exports = {
    uploadToCloud
};
