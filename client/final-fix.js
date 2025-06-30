const fs = require('fs');

try {
  // Read the file
  const filePath = './src/pages/DeliveryPage.js';
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Fix order processing logic - make all checks explicitly evaluate to a boolean
  const processingPattern = /\/\/ Force explicit type checking for better filtering[\s\S]+?orderType = 'regular';/g;
  const newProcessing = `// Force explicit type checking for better filtering
            let orderType = 'regular'; // Default to regular
            
            // Check all possible indicators of custom orders
            if (
                Boolean(order.custom_design_id) || 
                order.is_custom === true || 
                order.is_custom === 'true' ||
                (order.custom_details && Object.keys(order.custom_details).length > 0) ||
                (typeof order.id === 'string' && order.id.includes('custom-'))
            ) {
              orderType = 'custom';
            }`;

  content = content.replace(processingPattern, newProcessing);

  // 2. Fix filtering logic to be strict
  const filterPattern = /\/\/ Simpler filtering logic with strict type checking[\s\S]+?if \(orderFilter === 'custom'\) return order\.order_type === 'custom';/g;
  const newFilter = `// Enhanced strict filtering logic
                      if (orderFilter === 'all') return true;
                      
                      // Regular orders - ONLY show orders explicitly marked as regular
                      if (orderFilter === 'regular') {
                        return order.order_type === 'regular';
                      }
                      
                      // Custom orders - ONLY show orders explicitly marked as custom
                      if (orderFilter === 'custom') {
                        return order.order_type === 'custom';
                      }`;

  content = content.replace(filterPattern, newFilter);

  // 3. Remove any debug logs that might cause issues
  content = content.replace(/\/\/ Log for debugging[\s\S]*?console\.log\(`[^`]+`\);/g, '// Debug logging removed');

  // Save the changes
  fs.writeFileSync(filePath, content);
  console.log('DeliveryPage.js successfully updated!');
} catch (error) {
  console.error('Error updating file:', error);
}
