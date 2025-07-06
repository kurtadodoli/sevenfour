// Debug script to trace the exact order creation flow
const fs = require('fs');
const path = require('path');

console.log('=== ORDER CREATION DEBUG ANALYSIS ===\n');

// Check frontend form data being sent
console.log('🔍 Frontend Analysis:');
const orderPagePath = path.join(__dirname, 'client/src/pages/OrderPage.js');
if (fs.existsSync(orderPagePath)) {
    const orderPageContent = fs.readFileSync(orderPagePath, 'utf8');
    
    // Check for customer_fullname in FormData
    if (orderPageContent.includes("formData.append('customer_fullname'")) {
        console.log('✅ Frontend sends customer_fullname');
    } else {
        console.log('❌ Frontend does NOT send customer_fullname');
    }
    
    // Check API endpoint being called
    const apiCallMatch = orderPageContent.match(/api\.post\(['"`]([^'"`]+)['"`]/);
    if (apiCallMatch) {
        console.log(`✅ Frontend calls: ${apiCallMatch[1]}`);
    }
} else {
    console.log('❌ OrderPage.js not found');
}

// Check backend route mapping
console.log('\n🔍 Backend Route Analysis:');
const ordersRoutePath = path.join(__dirname, 'server/routes/api/orders.js');
if (fs.existsSync(ordersRoutePath)) {
    const routeContent = fs.readFileSync(ordersRoutePath, 'utf8');
    
    // Check POST route
    const postRouteMatch = routeContent.match(/router\.post\(['"`]\/['"`][^,]+,\s*([^,]+)/);
    if (postRouteMatch) {
        console.log(`✅ POST / route handler: ${postRouteMatch[1]}`);
    }
    
    // Check if customer_fullname is extracted
    if (routeContent.includes('customer_fullname')) {
        console.log('✅ Backend extracts customer_fullname');
    } else {
        console.log('❌ Backend does NOT extract customer_fullname');
    }
} else {
    console.log('❌ orders.js route not found');
}

// Check order controller
console.log('\n🔍 Order Controller Analysis:');
const controllerPath = path.join(__dirname, 'server/controllers/orderController.js');
if (fs.existsSync(controllerPath)) {
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    // Check createOrderFromCart function
    const createOrderMatch = controllerContent.match(/exports\.createOrderFromCart[\s\S]*?(?=exports\.|$)/);
    if (createOrderMatch) {
        const funcContent = createOrderMatch[0];
        
        if (funcContent.includes('customer_fullname')) {
            console.log('✅ createOrderFromCart handles customer_fullname');
        } else {
            console.log('❌ createOrderFromCart does NOT handle customer_fullname');
        }
        
        // Check SQL INSERT
        const insertMatch = funcContent.match(/INSERT INTO orders[\s\S]*?VALUES[\s\S]*?\)/);
        if (insertMatch) {
            const insertStmt = insertMatch[0];
            if (insertStmt.includes('customer_fullname')) {
                console.log('✅ SQL INSERT includes customer_fullname');
            } else {
                console.log('❌ SQL INSERT does NOT include customer_fullname');
            }
        }
    }
} else {
    console.log('❌ orderController.js not found');
}

// Check database config
console.log('\n🔍 Database Configuration:');
const envPath = path.join(__dirname, 'server/.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbNameMatch = envContent.match(/DB_NAME=(.+)/);
    if (dbNameMatch) {
        console.log(`✅ Database name: ${dbNameMatch[1]}`);
    }
    
    const dbUserMatch = envContent.match(/DB_USER=(.+)/);
    if (dbUserMatch) {
        console.log(`✅ Database user: ${dbUserMatch[1]}`);
    }
} else {
    console.log('❌ .env file not found');
}

console.log('\n=== NEXT STEPS ===');
console.log('1. Run: node force-database-fix.js (to fix database schema)');
console.log('2. Restart the server');
console.log('3. Test order creation');
console.log('4. If still failing, check server logs for the exact SQL being executed');

console.log('\n=== DEBUG COMPLETE ===');
