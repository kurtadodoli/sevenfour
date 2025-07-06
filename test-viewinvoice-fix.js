// Test the custom order viewInvoice fix directly
console.log('🧪 Testing Custom Order ViewInvoice Fix');

// Simulate the check that should happen in viewInvoice function
function testCustomOrderDetection(order) {
    console.log('\n🔍 Testing order:', {
        id: order.id,
        order_number: order.order_number,
        order_type: order.order_type
    });
    
    // This is the logic from the fixed viewInvoice function
    if (order.order_type === 'custom' || (typeof order.id === 'string' && order.id.startsWith('custom-'))) {
        console.log('✅ CUSTOM ORDER DETECTED - Should skip API call');
        console.log('📦 Items already included:', order.items?.length || 0, 'items');
        return true;
    } else {
        console.log('🔄 REGULAR ORDER - Should call API');
        return false;
    }
}

// Test cases
console.log('\n🧪 Test Cases:');

// Test 1: Custom order with custom- prefix ID
const customOrder1 = {
    id: 'custom-CUSTOM-MCQA8R1Q-YXU65',
    order_number: 'CUSTOM-MCQA8R1Q-YXU65',
    order_type: 'custom',
    items: [{ productname: 'Custom T-Shirt', quantity: 1 }]
};
testCustomOrderDetection(customOrder1);

// Test 2: Custom order with just order_type
const customOrder2 = {
    id: 123,
    order_number: 'CUSTOM-ABC123',
    order_type: 'custom',
    items: [{ productname: 'Custom Hoodie', quantity: 2 }]
};
testCustomOrderDetection(customOrder2);

// Test 3: Regular order
const regularOrder = {
    id: 456,
    order_number: 'ORD123456',
    order_type: 'regular',
    items: []
};
testCustomOrderDetection(regularOrder);

console.log('\n🎯 Summary:');
console.log('✅ Custom orders should be detected and not call API');
console.log('🔄 Regular orders should call API for items');
console.log('\n💡 If you are still seeing 404 errors:');
console.log('1. Clear browser cache (Ctrl+Shift+R)');
console.log('2. Check browser console for custom order detection logs');
console.log('3. Verify the order data structure in frontend');
