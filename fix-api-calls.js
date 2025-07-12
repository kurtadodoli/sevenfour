const fs = require('fs');
const path = require('path');

// Fix the custom design button API calls to use custom_order_id instead of id
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Fixing custom design request API calls...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all instances of request.id in the processDesignRequest calls
    const fixes = [
        {
            from: 'processDesignRequest(request.id, \'approved\')',
            to: 'processDesignRequest(request.custom_order_id, \'approved\')'
        },
        {
            from: 'processDesignRequest(request.id, \'rejected\')',
            to: 'processDesignRequest(request.custom_order_id, \'rejected\')'
        },
        {
            from: '`design_${request.id}_approve`',
            to: '`design_${request.custom_order_id}_approve`'
        },
        {
            from: '`design_${request.id}_reject`',
            to: '`design_${request.custom_order_id}_reject`'
        }
    ];
    
    let changesCount = 0;
    
    fixes.forEach(fix => {
        const regex = new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
            content = content.replace(regex, fix.to);
            changesCount += matches.length;
            console.log(`✅ Replaced ${matches.length} instances of: ${fix.from}`);
        }
    });
    
    if (changesCount > 0) {
        // Write the file back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`\n✅ Successfully fixed ${changesCount} API call issues!`);
        console.log('The buttons should now work correctly with the backend API.');
    } else {
        console.log('❌ No changes made - patterns not found');
    }
    
} catch (error) {
    console.error('❌ Error fixing API calls:', error.message);
}
