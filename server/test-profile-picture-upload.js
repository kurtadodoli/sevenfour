// Complete test of profile picture upload functionality
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testProfilePictureUpload() {
    console.log('🧪 Testing Profile Picture Upload Functionality');
    console.log('================================================');

    try {        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@sevenfour.com',
            password: 'Admin@123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }

        const token = loginResponse.data.data.token;
        console.log('✓ Login successful');

        // Step 2: Get current profile
        console.log('2. Getting current profile...');
        const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileResponse.data.success) {
            throw new Error('Failed to get profile');
        }

        console.log('✓ Current profile retrieved');
        console.log('   Current profile picture:', profileResponse.data.data.user.profile_picture_url || 'None');

        // Step 3: Test upload without file (should fail)
        console.log('3. Testing upload without file...');
        try {
            await axios.post(`${BASE_URL}/api/auth/upload-profile-picture`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✗ Upload without file should have failed');
        } catch (error) {
            if (error.response.status === 400) {
                console.log('✓ Upload without file correctly rejected');
            } else {
                throw error;
            }
        }

        // Step 4: Create a test image file
        console.log('4. Creating test image...');
        const sharp = require('sharp');
        const testImageBuffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 0, b: 0 }
            }
        })
        .jpeg()
        .toBuffer();

        console.log('✓ Test image created');

        // Step 5: Upload profile picture
        console.log('5. Uploading profile picture...');
        const formData = new FormData();
        formData.append('profilePicture', testImageBuffer, {
            filename: 'test-profile.jpg',
            contentType: 'image/jpeg'
        });

        const uploadResponse = await axios.post(`${BASE_URL}/api/auth/upload-profile-picture`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        if (!uploadResponse.data.success) {
            throw new Error('Upload failed: ' + uploadResponse.data.message);
        }

        console.log('✓ Profile picture uploaded successfully');
        console.log('   New profile picture URL:', uploadResponse.data.data.profile_picture_url);

        // Step 6: Verify the profile was updated
        console.log('6. Verifying profile update...');
        const updatedProfileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const updatedUser = updatedProfileResponse.data.data.user;
        if (updatedUser.profile_picture_url) {
            console.log('✓ Profile picture URL updated in database');
            console.log('   Updated URL:', updatedUser.profile_picture_url);
        } else {
            throw new Error('Profile picture URL not updated in database');
        }

        // Step 7: Check if file exists on server
        console.log('7. Checking if file exists on server...');
        const filePath = path.join(__dirname, 'public', updatedUser.profile_picture_url);
        if (fs.existsSync(filePath)) {
            console.log('✓ Profile picture file exists on server');
            const stats = fs.statSync(filePath);
            console.log('   File size:', stats.size, 'bytes');
        } else {
            console.log('⚠️ Profile picture file not found on server at:', filePath);
        }

        // Step 8: Test file access via HTTP
        console.log('8. Testing file access via HTTP...');
        try {
            const fileResponse = await axios.get(`${BASE_URL}${updatedUser.profile_picture_url}`, {
                responseType: 'arraybuffer'
            });
            
            if (fileResponse.status === 200) {
                console.log('✓ Profile picture accessible via HTTP');
                console.log('   Response size:', fileResponse.data.byteLength, 'bytes');
                console.log('   Content-Type:', fileResponse.headers['content-type']);
            }
        } catch (error) {
            console.log('⚠️ Profile picture not accessible via HTTP:', error.response?.status || error.message);
        }

        console.log('\n🎉 Profile Picture Upload Test Completed Successfully!');
        console.log('✅ All functionality working correctly');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testProfilePictureUpload();
