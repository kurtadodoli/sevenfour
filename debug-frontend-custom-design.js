console.log('🧪 Frontend Debug Script for Custom Design Requests');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
    // Add debug functions to window for easy testing
    window.debugCustomDesign = {
        checkState: () => {
            console.log('🔍 Current custom design requests state:');
            console.log('customDesignRequests:', window.customDesignRequests);
            console.log('designRequestsLoading:', window.designRequestsLoading);
            console.log('designSearchTerm:', window.designSearchTerm);
        },
        
        testFetch: async () => {
            console.log('🧪 Testing custom design requests fetch...');
            try {
                // Simulate the API call
                const response = await fetch('/api/custom-orders/admin/all', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                console.log('📋 Raw API response:', data);
                
                if (data.success) {
                    console.log(`✅ Found ${data.data?.length || 0} custom design requests`);
                    console.log('📄 Requests:', data.data);
                } else {
                    console.log('❌ API returned success: false');
                }
            } catch (error) {
                console.error('❌ Error fetching:', error);
            }
        },
        
        checkFiltering: () => {
            console.log('🔍 Testing filtering logic...');
            const requests = window.customDesignRequests || [];
            const searchTerm = window.designSearchTerm || '';
            
            console.log(`📋 Total requests: ${requests.length}`);
            console.log(`🔍 Search term: "${searchTerm}"`);
            
            const filtered = requests.filter(request => {
                if (!searchTerm) return true;
                
                const searchLower = searchTerm.toLowerCase();
                return (
                    request.custom_order_id?.toString().includes(searchLower) ||
                    request.product_display_name?.toLowerCase().includes(searchLower) ||
                    request.customer_name?.toLowerCase().includes(searchLower) ||
                    request.customer_email?.toLowerCase().includes(searchLower) ||
                    request.status?.toLowerCase().includes(searchLower) ||
                    request.status_display?.toLowerCase().includes(searchLower) ||
                    request.size?.toLowerCase().includes(searchLower) ||
                    request.color?.toLowerCase().includes(searchLower) ||
                    request.special_instructions?.toLowerCase().includes(searchLower)
                );
            });
            
            console.log(`📄 Filtered requests: ${filtered.length}`);
            console.log('Filtered data:', filtered);
        }
    };
    
    console.log('✅ Debug functions added to window.debugCustomDesign');
    console.log('Available functions:');
    console.log('- window.debugCustomDesign.checkState()');
    console.log('- window.debugCustomDesign.testFetch()');
    console.log('- window.debugCustomDesign.checkFiltering()');
} else {
    console.log('❌ Not in browser environment');
}

// If running in Node.js, just export the debug functions
module.exports = {
    name: 'CustomDesignDebug',
    description: 'Debug script for custom design requests frontend issues'
};
