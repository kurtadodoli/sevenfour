const open = require('open');

console.log('🌐 Opening the Custom Design Studio page in your default browser...');
console.log('📝 Instructions:');
console.log('1. Open the browser developer tools (F12)');
console.log('2. Go to the Console tab');
console.log('3. Look for debug messages starting with 🔄, ✅, ❌');
console.log('4. Check if you see your pending orders appear');
console.log('5. If not, try refreshing the page and check the Network tab for API calls');
console.log('');
console.log('🔍 Key things to look for:');
console.log('- "CustomPage component mounted, checking for token..."');
console.log('- "Token found: Yes/No"');
console.log('- "User state set from token"');
console.log('- "useEffect triggered for pending orders"');
console.log('- "Fetching pending orders..."');
console.log('- API call to /api/custom-orders/my-orders in Network tab');
console.log('');

// Open the Custom Design Studio page
open('http://localhost:3002/custom');
