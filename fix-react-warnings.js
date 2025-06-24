/**
 * Script to identify and fix React prop warnings across the project
 */

const fs = require('fs');
const path = require('path');

// Common problematic props that should use $ prefix
const problematicProps = [
    'active', 'show', 'visible', 'inStock', 'primary', 'isToday', 
    'isCurrentMonth', 'clickable', 'availabilityStatus', 'isSelected',
    'critical', 'lowStock'
];

// Directories to search
const searchDirs = [
    'client/src/pages',
    'client/src/components'
];

function searchForProblematicProps() {
    console.log('🔍 Searching for React prop warnings...\n');
    
    searchDirs.forEach(dir => {
        const fullPath = path.join(__dirname, dir);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  Directory not found: ${dir}`);
            return;
        }
        
        console.log(`📁 Searching in: ${dir}`);
        
        const files = fs.readdirSync(fullPath, { recursive: true })
            .filter(file => file.endsWith('.js') || file.endsWith('.jsx'))
            .map(file => path.join(fullPath, file));
        
        files.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                problematicProps.forEach(prop => {
                    // Look for styled components using the prop
                    const styledRegex = new RegExp(`\\$\\{[^}]*props\\.[^}]*${prop}[^}]*\\}`, 'g');
                    // Look for JSX attributes
                    const jsxRegex = new RegExp(`${prop}=\\{`, 'g');
                    
                    const styledMatches = content.match(styledRegex);
                    const jsxMatches = content.match(jsxRegex);
                    
                    if (styledMatches || jsxMatches) {
                        console.log(`  📄 ${path.relative(__dirname, file)}`);
                        
                        if (styledMatches) {
                            console.log(`    🎨 Styled component uses '${prop}' prop: ${styledMatches.length} times`);
                        }
                        
                        if (jsxMatches) {
                            console.log(`    🏷️  JSX uses '${prop}' attribute: ${jsxMatches.length} times`);
                        }
                    }
                });
            } catch (error) {
                console.log(`❌ Error reading ${file}:`, error.message);
            }
        });
        
        console.log('');
    });
}

function generateFixInstructions() {
    console.log('🛠️  Fix Instructions:\n');
    
    console.log('1. For styled components, change:');
    console.log('   props.active → props.$active');
    console.log('   props.show → props.$show');
    console.log('   etc.\n');
    
    console.log('2. For JSX attributes, change:');
    console.log('   active={value} → $active={value}');
    console.log('   show={value} → $show={value}');
    console.log('   etc.\n');
    
    console.log('3. The $ prefix tells styled-components not to pass the prop to the DOM\n');
    
    console.log('📋 Common problematic props to fix:');
    problematicProps.forEach(prop => {
        console.log(`   - ${prop} → $${prop}`);
    });
}

// Run the search
searchForProblematicProps();
generateFixInstructions();

console.log('\n✅ Search complete!');
console.log('\n🎯 Next steps:');
console.log('1. Fix the identified files using the instructions above');
console.log('2. Test the application to ensure warnings are gone');
console.log('3. Restart the development server if needed');
