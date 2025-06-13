const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        console.log('🧪 Testing Profile Picture Upload Simple');
        console.log('==========================================');
        
        // 1. Login first
        console.log('1. Logging in...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },            body: JSON.stringify({
                email: 'kurtadodoli@gmail.com',
                password: 'Admin123!@#'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            console.log('❌ Login failed:', loginData.message);
            return;
        }
        
        console.log('✅ Login successful');
        const token = loginData.data.token;
        
        // 2. Create a simple test image
        console.log('2. Creating test image...');
        const canvas = require('canvas');
        const canvasInstance = canvas.createCanvas(200, 200);
        const ctx = canvasInstance.getContext('2d');
        
        // Draw a simple rectangle
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '30px Arial';
        ctx.fillText('TEST', 60, 110);
        
        const buffer = canvasInstance.toBuffer('image/jpeg');
        
        // 3. Upload the image
        console.log('3. Uploading profile picture...');
        const formData = new FormData();
        formData.append('profilePicture', buffer, {
            filename: 'test-profile.jpg',
            contentType: 'image/jpeg'
        });
        
        const uploadResponse = await fetch('http://localhost:5000/api/auth/upload-profile-picture', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const uploadData = await uploadResponse.json();
        console.log('Upload response:', JSON.stringify(uploadData, null, 2));
        
        if (uploadData.success) {
            console.log('✅ Upload successful!');
            console.log('Profile picture URL:', uploadData.data.profile_picture_url);
        } else {
            console.log('❌ Upload failed:', uploadData.message);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testUpload();
