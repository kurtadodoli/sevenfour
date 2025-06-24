const axios = require('axios');
const FormData = require('form-data');

const formData = new FormData();
formData.append('productType', 't-shirts');
formData.append('customerName', 'Frontend Test User');
formData.append('customerEmail', 'frontend@test.com');
formData.append('customerPhone', '09123456789');
formData.append('shippingAddress', '456 Frontend Street');
formData.append('municipality', 'Manila');
formData.append('productSize', 'M');
formData.append('productColor', 'blue');
formData.append('productName', 'Frontend Test T-Shirt');
formData.append('quantity', '1');
formData.append('additionalInfo', 'Order to be cancelled from frontend');

const testImg = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
formData.append('images', testImg, {
    filename: 'test.png',
    contentType: 'image/png'
});

axios.post('http://localhost:3001/api/custom-designs', formData, {
    headers: formData.getHeaders()
}).then(response => {
    console.log('✅ Test order created for frontend testing:', response.data.message);
    console.log('🌐 Now visit http://localhost:3000/orders and test the cancel functionality!');
}).catch(error => {
    console.error('❌ Error:', error.response?.data || error.message);
});
