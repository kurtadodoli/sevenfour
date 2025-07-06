const axios = require('axios');

console.log('🚀 Starting PDF endpoint test...');

async function testInvoicePDF() {
  try {
    // Test invoice ID from the database
    const invoiceId = 'INV17514928754733476';
    const userId = '967502321335218';
    
    console.log(`🧪 Testing PDF generation for invoice: ${invoiceId}`);
    console.log(`👤 User ID: ${userId}`);
    
    // First, let's test if we can reach the server
    console.log('\n1️⃣ Testing server connectivity...');
    try {
      const healthCheck = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is responding');
    } catch (healthError) {
      console.log('❌ Server health check failed:', healthError.message);
      // Continue anyway, maybe there's no health endpoint
    }
    
    // Test without authentication first to see the error
    console.log('\n2️⃣ Testing PDF endpoint without auth...');
    try {
      const response1 = await axios.get(`http://localhost:5000/api/orders/invoice/${invoiceId}/pdf`, {
        responseType: 'stream',
        validateStatus: () => true // Don't throw on error status codes
      });
      
      console.log(`Response status: ${response1.status}`);
      console.log(`Response headers:`, response1.headers);
      
      if (response1.status !== 200) {
        console.log('Error response data:', response1.data);
      } else {
        console.log('✅ PDF endpoint responded successfully!');
      }
    } catch (pdfError) {
      console.log('❌ PDF endpoint error:', pdfError.message);
      if (pdfError.response) {
        console.log('Error status:', pdfError.response.status);
        console.log('Error data:', pdfError.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing PDF:', error.message);
  }
}

testInvoicePDF();
