const fs = require('fs');

// Read the app.js file
const filePath = 'c:/sfc/server/app.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of "province: 'National Capital Region'," with "province: 'Metro Manila',"
content = content.replace(/province: 'National Capital Region',/g, "province: 'Metro Manila',");

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Updated app.js: replaced National Capital Region with Metro Manila');
