const axios = require('axios');

async function testCustomDesignRequests() {
    try {
        console.log('🧪 Testing custom design requests structure...\n');
        
        // Test the custom-orders endpoint to see what data is available
        const response = await axios.get('http://localhost:5000/api/custom-orders');
        
        if (response.data.success && response.data.data.length > 0) {
            console.log('✅ Got custom design request data, checking structure...\n');
            
            // Check the first few design requests
            response.data.data.slice(0, 3).forEach((request, index) => {
                console.log(`=== DESIGN REQUEST ${index + 1}: ${request.custom_order_id} ===`);
                console.log(`Customer: ${request.customer_name}`);
                console.log(`Product Type: ${request.product_type}`);
                console.log(`Status: ${request.status}`);
                console.log(`Design Notes: ${request.design_notes || 'No notes'}`);
                
                // Check image fields
                console.log('Image Information:');
                console.log(`  - image_paths: ${request.image_paths ? JSON.stringify(request.image_paths) : 'N/A'}`);
                console.log(`  - images: ${request.images ? JSON.stringify(request.images) : 'N/A'}`);
                console.log(`  - design_images: ${request.design_images ? JSON.stringify(request.design_images) : 'N/A'}`);
                console.log(`  - uploaded_images: ${request.uploaded_images ? JSON.stringify(request.uploaded_images) : 'N/A'}`);
                
                // Count available images
                const imageCount = request.image_paths ? request.image_paths.length : 0;
                console.log(`📸 Total Design Images: ${imageCount}`);
                
                if (imageCount > 0) {
                    console.log('📁 Image Paths:');
                    request.image_paths.forEach((path, idx) => {
                        console.log(`   ${idx + 1}. ${path}`);
                    });
                }
                
                console.log('');
            });
            
            // Summary
            const requestsWithImages = response.data.data.filter(request => 
                request.image_paths && request.image_paths.length > 0
            );
            
            console.log('=== SUMMARY ===');
            console.log(`Total Design Requests: ${response.data.data.length}`);
            console.log(`Requests with Images: ${requestsWithImages.length}`);
            console.log(`Success Rate: ${((requestsWithImages.length / response.data.data.length) * 100).toFixed(1)}%`);
            
            if (requestsWithImages.length > 0) {
                console.log('\n✅ Design images are available! The View Designs button will work.');
                console.log('📋 Sample image paths:');
                requestsWithImages.slice(0, 2).forEach(request => {
                    console.log(`   ${request.custom_order_id}: ${request.image_paths.length} images`);
                    request.image_paths.forEach((path, idx) => {
                        console.log(`     ${idx + 1}. ${path}`);
                    });
                });
            } else {
                console.log('\n⚠️  No design images found. Users may not have uploaded images yet.');
            }
        } else {
            console.log('❌ No custom design requests found or API error');
        }
        
    } catch (error) {
        console.error('❌ Error testing custom design requests:', error.message);
    }
}

// Run the test
testCustomDesignRequests();
