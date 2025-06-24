const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const https = require('https');
const http = require('http');

async function testCustomDesignSubmission() {
    console.log('🧪 Testing Custom Design POST endpoint...');
    
    try {
        // Create FormData
        const form = new FormData();
        
        // Add form fields
        form.append('productType', 't-shirts');
        form.append('customerName', 'John Doe');
        form.append('customerEmail', 'john.doe@test.com');
        form.append('customerPhone', '+63-912-345-6789');
        form.append('shippingAddress', '123 Test Street');
        form.append('municipality', 'Quezon City');
        form.append('barangay', 'Barangay Test');
        form.append('postalCode', '1100');
        form.append('productSize', 'L');
        form.append('productColor', 'blue');
        form.append('productName', 'Custom Test T-Shirt');
        form.append('quantity', '2');
        form.append('additionalInfo', 'This is a test custom design order.');
          // Create a test image file
        const testImagePath = path.join(__dirname, 'test-image.jpg');
        fs.writeFileSync(testImagePath, 'This is a test image file content for custom design.');
        
        // Add image file
        form.append('images', fs.createReadStream(testImagePath), {
            filename: 'test-design.jpg',
            contentType: 'image/jpeg'
        });
          console.log('📤 Submitting custom design order...');
        
        // Make the request using http module
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/custom-designs',
            method: 'POST',
            headers: form.getHeaders()
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('📨 Response Status:', res.statusCode);
                    console.log('📨 Response Data:', JSON.stringify(result, null, 2));
                    
                    if (res.statusCode === 200 && result.success) {
                        console.log('✅ Custom design order submitted successfully!');
                        console.log(`🆔 Design ID: ${result.data.designId}`);
                        console.log(`📊 Status: ${result.data.status}`);
                        console.log(`📷 Images uploaded: ${result.data.imageCount}`);
                    } else {
                        console.log('❌ Custom design order submission failed');
                        console.log('Error:', result.message);
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing response:', parseError.message);
                    console.log('Raw response:', data);
                }
                
                // Clean up test file
                if (fs.existsSync(testImagePath)) {
                    fs.unlinkSync(testImagePath);
                    console.log('🗑️ Test file cleaned up');
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request failed:', error.message);
        });
        
        form.pipe(req);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCustomDesignSubmission();
