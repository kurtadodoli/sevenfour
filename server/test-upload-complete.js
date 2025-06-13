const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function testProfilePictureUpload() {
    try {
        console.log('🧪 Testing Profile Picture Upload End-to-End');
        console.log('================================================');

        // Step 1: Login
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'Adminjohnjoshandre@gmail.com',
            password: 'Admin@123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');

        // Step 2: Get current profile
        console.log('2. Getting current profile...');
        const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Current profile picture URL:', profileResponse.data.data.user.profile_picture_url);

        // Step 3: Create a test image file (simple 1x1 pixel PNG)
        console.log('3. Creating test image...');
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 image
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // RGB color
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
            0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // Image data
            0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // ...
            0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, // IEND chunk
            0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        // Step 4: Upload the test image
        console.log('4. Uploading profile picture...');
        const formData = new FormData();
        formData.append('profilePicture', testImageBuffer, {
            filename: 'test-profile.png',
            contentType: 'image/png'
        });

        const uploadResponse = await axios.post(`${BASE_URL}/api/auth/upload-profile-picture`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        console.log('Upload response:', JSON.stringify(uploadResponse.data, null, 2));

        if (uploadResponse.data.success) {
            console.log('✅ Profile picture uploaded successfully!');
            console.log('New picture URL:', uploadResponse.data.data.profile_picture_url);
        } else {
            console.log('❌ Upload failed:', uploadResponse.data.message);
        }

        // Step 5: Verify the updated profile
        console.log('5. Verifying updated profile...');
        const updatedProfileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Updated profile picture URL:', updatedProfileResponse.data.data.user.profile_picture_url);

        // Step 6: Test accessing the uploaded file
        if (updatedProfileResponse.data.data.user.profile_picture_url) {
            console.log('6. Testing file access...');
            const fileUrl = `${BASE_URL}${updatedProfileResponse.data.data.user.profile_picture_url}`;
            try {
                const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                console.log('✅ Uploaded file is accessible');
                console.log('File size:', fileResponse.data.length, 'bytes');
                console.log('Content type:', fileResponse.headers['content-type']);
            } catch (fileError) {
                console.log('❌ File access failed:', fileError.message);
            }
        }

        console.log('\n🎉 Profile picture upload test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testProfilePictureUpload();
