// This script adds debug logging and fixes the order classification issue in DeliveryPage.js

const fs = require('fs');
const path = require('path');

// Read the file
const filePath = 'c:\\sfc\\client\\src\\pages\\DeliveryPage.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add logging to order classification
const orderClassificationRegex = /let orderType = null;[\s\S]*?orderType = 'regular';[\s\S]*?return \{[\s\S]*?order_type: orderType,/;
const newClassification = `
// FIXED: Properly detect custom orders every time
// First check if it's definitely a custom order
let orderType = 'regular'; // Default to regular

// Check all possible indicators for a custom order
if (order.custom_design_id || 
    order.is_custom === true || 
    order.is_custom === 'true' ||
    (order.custom_details && Object.keys(order.custom_details).length > 0) ||
    (order.id && typeof order.id === 'string' && order.id.includes('custom-'))) {
  orderType = 'custom';
  // Force the order_type property to be correctly set
  order.order_type = 'custom';
}

// Log for debugging
console.log(\`Order \${order.id}: classified as \${orderType}\`);

return {
  ...order,
  order_type: orderType,`;

content = content.replace(orderClassificationRegex, newClassification);

// Update filter logic to be strictly type-based
const regularFilterRegex = /if \(orderFilter === 'regular'\) return order\.order_type === 'regular';/;
const customFilterRegex = /if \(orderFilter === 'custom'\) return order\.order_type === 'custom';/;

content = content.replace(regularFilterRegex, "if (orderFilter === 'regular') { console.log(`Filter regular: ${order.id}, type=${order.order_type}`); return order.order_type === 'regular'; }");
content = content.replace(customFilterRegex, "if (orderFilter === 'custom') { console.log(`Filter custom: ${order.id}, type=${order.order_type}`); return order.order_type === 'custom'; }");

// Save the modified file
fs.writeFileSync(filePath, content);
console.log('DeliveryPage.js has been successfully updated.');
