const FormData = require('form-data');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCustomOrder() {
    console.log('🧪 Testing Custom Order Submission...');
    
    const formData = new FormData();
      // Add form fields
    formData.append('productType', 't-shirts');
    formData.append('productName', 'My Awesome Custom T-Shirt');
    formData.append('size', 'L');
    formData.append('color', 'Black');
    formData.append('quantity', '2');
    formData.append('specialInstructions', 'Test custom design with product name');
    formData.append('customerName', 'Test Customer Enhanced');
    formData.append('customerEmail', 'test-enhanced@example.com');
    formData.append('customerPhone', '09123456789');
    formData.append('province', 'Metro Manila');
    formData.append('municipality', 'Quezon City');
    formData.append('streetNumber', '123 Enhanced Test Street');
    formData.append('houseNumber', 'Unit 2A');
    formData.append('barangay', 'Test Barangay Enhanced');
    formData.append('postalCode', '1100');
    
    // Create a test image file
    const testImageContent = Buffer.from('fake-image-data');
    formData.append('images', testImageContent, {
        filename: 'test-design.jpg',
        contentType: 'image/jpeg'
    });
    
    try {
        const response = await fetch('http://localhost:3001/api/custom-orders', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });
        
        const result = await response.text();
        console.log('Response status:', response.status);
        console.log('Response:', result);
        
        if (response.ok) {
            const jsonResult = JSON.parse(result);
            console.log('✅ Custom order submitted successfully!');
            console.log('Order ID:', jsonResult.data.customOrderId);
            console.log('Estimated Price:', jsonResult.data.estimatedPrice);
        } else {
            console.log('❌ Custom order submission failed');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCustomOrder();
