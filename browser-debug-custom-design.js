// IMPORTANT: This script should be run in the browser console, not Node.js
// Open the TransactionPage.js in browser, press F12, go to Console tab, and paste this code

console.log('🧪 Frontend API Test for Custom Design Requests');

// Test 1: Check current state
console.log('📊 Current State Check:');
console.log('- customDesignRequests length:', window.customDesignRequests?.length || 'undefined');
console.log('- designRequestsLoading:', window.designRequestsLoading);
console.log('- designSearchTerm:', window.designSearchTerm);

// Test 2: Check authentication
console.log('\n🔐 Authentication Check:');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
console.log('- Token exists:', !!token);
console.log('- User info:', user);

if (user) {
  try {
    const userObj = JSON.parse(user);
    console.log('- User role:', userObj.role);
    console.log('- User email:', userObj.email);
  } catch (e) {
    console.log('- User parse error:', e.message);
  }
}

// Test 3: Manual API call
console.log('\n📡 Manual API Test:');
if (token) {
  fetch('/api/custom-orders/admin/all', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('- Response status:', response.status);
    console.log('- Response ok:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('- Response data:', data);
    if (data.success) {
      console.log('✅ API call successful!');
      console.log('- Data count:', data.data?.length || 0);
      console.log('- First item:', data.data?.[0]);
    } else {
      console.log('❌ API returned success: false');
      console.log('- Message:', data.message);
    }
  })
  .catch(error => {
    console.log('❌ API call failed:', error);
  });
} else {
  console.log('❌ No token available for API call');
}

// Test 4: Check if React component is receiving the data
console.log('\n⚛️ React Component Check:');
console.log('- Active tab from debug info:', document.querySelector('.debug-info')?.textContent);

// Test 5: Force trigger the fetch function
console.log('\n🔄 Force Trigger Fetch:');
if (typeof window.debugCustomDesign !== 'undefined') {
  console.log('- Debug functions available');
  // window.debugCustomDesign.testFetch();
} else {
  console.log('- Debug functions not available');
  console.log('- Try manually clicking the "🧪 Debug Test" button on the page');
}

console.log('\n📝 Instructions:');
console.log('1. Check the console output above');
console.log('2. If API call succeeds but UI is empty, there might be a React rendering issue');
console.log('3. If API call fails, check authentication or server status');
console.log('4. Try clicking the "🧪 Debug Test" button on the page');
console.log('5. Report back the console output from this test');

// Test 6: Check for React render blocking
setTimeout(() => {
  console.log('\n🔍 Delayed Check (after 2 seconds):');
  console.log('- customDesignRequests length:', window.customDesignRequests?.length || 'undefined');
  console.log('- Debug info element exists:', !!document.querySelector('[style*="monospace"]'));
  
  // Try to find the requests container
  const requestsContainer = document.querySelector('div:contains("No custom design requests found")') || 
                           document.querySelector('div:contains("Loading custom design requests")');
  console.log('- Requests container found:', !!requestsContainer);
  
  if (requestsContainer) {
    console.log('- Container text:', requestsContainer.textContent?.trim());
  }
}, 2000);
