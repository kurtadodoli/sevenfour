const fs = require('fs');
const path = require('path');

function patchOrderInserts() {
    console.log('=== PATCHING ALL ORDER INSERT STATEMENTS ===\n');
    
    const filesToCheck = [
        'server/routes/api/orders.js',
        'server/controllers/orderController.js',
        'server/controllers/orderController_enhanced.js',
        'server/routes/custom-orders.js'
    ];
    
    let patchCount = 0;
    
    filesToCheck.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }
        
        console.log(`\n🔍 Checking: ${filePath}`);
        
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        // Pattern 1: INSERT INTO orders without customer_fullname in columns
        const insertPattern = /INSERT INTO orders\s*\(\s*([^)]+)\s*\)\s*VALUES\s*\(\s*([^)]+)\s*\)/gi;
        
        content = content.replace(insertPattern, (match, columns, values) => {
            if (!columns.includes('customer_fullname')) {
                console.log('  🔧 Found INSERT without customer_fullname, patching...');
                
                // Add customer_fullname to columns
                const newColumns = columns.trim() + ', customer_fullname';
                
                // Count the number of placeholders in values
                const placeholderCount = (values.match(/\?/g) || []).length;
                
                // Add one more placeholder for customer_fullname
                const newValues = values.trim() + ', ?';
                
                modified = true;
                patchCount++;
                
                return `INSERT INTO orders (\n                    ${newColumns}\n                ) VALUES (${newValues})`;
            }
            return match;
        });
        
        if (modified) {
            // Write the modified content back
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`  ✅ Patched: ${filePath}`);
        } else {
            console.log(`  ✅ Already correct: ${filePath}`);
        }
    });
    
    console.log(`\n=== PATCHING COMPLETE ===`);
    console.log(`Total patches applied: ${patchCount}`);
    
    if (patchCount > 0) {
        console.log('\n⚠️  WARNING: SQL INSERT statements were modified.');
        console.log('You need to update the corresponding JavaScript arrays that provide values to these queries.');
        console.log('Make sure to add a fallback value for customer_fullname in each affected query.');
        console.log('\nExample:');
        console.log('  customer_name || req.user.username || req.user.email || "Guest Customer"');
    }
}

patchOrderInserts();
