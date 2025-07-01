// Add this to browser console to test API directly
window.testCustomDesignAPI = async function() {
    console.log('🧪 Testing Custom Design API from browser...');
    
    const token = localStorage.getItem('token');
    console.log('🔑 Token available:', !!token);
    console.log('👤 User info:', localStorage.getItem('user'));
    
    if (!token) {
        console.log('❌ No authentication token found in localStorage');
        return;
    }
    
    try {
        const response = await fetch('/api/custom-orders/admin/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        const data = await response.json();
        console.log('📋 Response data:', data);
        
        if (data.success) {
            console.log('✅ API call successful!');
            console.log('📊 Custom orders count:', data.data?.length || 0);
            console.log('📄 First order:', data.data?.[0]);
        } else {
            console.log('❌ API returned success: false');
            console.log('📋 Message:', data.message);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ API call failed:', error);
        return null;
    }
};

console.log('✅ Test function added to window.testCustomDesignAPI()');
console.log('💡 Run: window.testCustomDesignAPI() in console to test API');

// Also add a function to check the current React state
window.checkReactState = function() {
    console.log('🔍 Checking React component state...');
    console.log('customDesignRequests window var:', window.customDesignRequests);
    console.log('Debug info:', window.customDesignDebugInfo);
    
    // Try to access React dev tools if available
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('⚛️ React DevTools detected');
    }
};

console.log('✅ State check function added to window.checkReactState()');
