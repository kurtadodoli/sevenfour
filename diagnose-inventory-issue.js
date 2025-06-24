/**
 * Diagnostic script to troubleshoot inventory loading issue
 */

console.log('🔍 Inventory Loading Diagnostic Tool\n');

// Check if required modules are available
try {
    const mysql = require('mysql2/promise');
    console.log('✅ mysql2 module loaded successfully');
} catch (error) {
    console.log('❌ mysql2 module not found:', error.message);
    process.exit(1);
}

try {
    const express = require('express');
    console.log('✅ express module loaded successfully');
} catch (error) {
    console.log('❌ express module not found:', error.message);
    process.exit(1);
}

// Test database connection
async function testDatabaseConnection() {
    console.log('\n📊 Testing database connection...');
    
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });
        
        console.log('✅ Database connection successful');
        
        // Test key tables
        const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log(`📦 Products table: ${products[0].count} records`);
        
        const [stock] = await connection.execute('SELECT COUNT(*) as count FROM product_stock');
        console.log(`📋 Product_stock table: ${stock[0].count} records`);
        
        // Test the actual query used by inventory controller
        const [testQuery] = await connection.execute(`
            SELECT 
                p.product_id,
                p.productname,
                p.productprice,
                p.productstatus,
                COALESCE(SUM(ps.stock_quantity), 0) as total_stock
            FROM products p
            LEFT JOIN product_stock ps ON p.product_id = ps.product_id
            WHERE (p.productstatus = 'active' OR p.status = 'active')
            GROUP BY p.product_id, p.productname, p.productprice, p.productstatus
            ORDER BY p.productname
            LIMIT 3
        `);
        
        console.log('✅ Inventory query test successful');
        console.log('Sample products:');
        testQuery.forEach(product => {
            console.log(`  - ${product.productname}: ${product.total_stock} units`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
    }
    
    return true;
}

// Test server files
function testServerFiles() {
    console.log('\n📁 Checking server files...');
    
    const fs = require('fs');
    const path = require('path');
    
    const serverPath = path.join(__dirname, 'server');
    const appPath = path.join(serverPath, 'app.js');
    const controllerPath = path.join(serverPath, 'controllers', 'inventoryController.js');
    const routePath = path.join(serverPath, 'routes', 'api', 'inventory.js');
    
    if (fs.existsSync(appPath)) {
        console.log('✅ server/app.js exists');
    } else {
        console.log('❌ server/app.js missing');
    }
    
    if (fs.existsSync(controllerPath)) {
        console.log('✅ inventoryController.js exists');
    } else {
        console.log('❌ inventoryController.js missing');
    }
    
    if (fs.existsSync(routePath)) {
        console.log('✅ inventory routes exist');
    } else {
        console.log('❌ inventory routes missing');
    }
}

// Check client configuration
function checkClientConfig() {
    console.log('\n🌐 Checking client configuration...');
    
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, 'client', '.env');
    
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        console.log('✅ client/.env exists');
        console.log('Content:', envContent.trim());
        
        if (envContent.includes('localhost:5000')) {
            console.log('✅ Correct API URL configured');
        } else {
            console.log('❌ API URL may be incorrect');
        }
    } else {
        console.log('❌ client/.env missing');
    }
}

// Main diagnostic function
async function runDiagnostics() {
    console.log('🚀 Starting diagnostics...\n');
    
    testServerFiles();
    checkClientConfig();
    
    const dbOk = await testDatabaseConnection();
    
    console.log('\n📋 Summary:');
    console.log('1. Required modules: Available');
    console.log(`2. Database connection: ${dbOk ? 'Working' : 'Failed'}`);
    console.log('3. Server files: Check output above');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. If database is working, start the server:');
    console.log('   - Run: npm run server');
    console.log('   - Or: node server/app.js');
    console.log('2. Server should start on port 5000');
    console.log('3. Test the API endpoint:');
    console.log('   - http://localhost:5000/api/inventory/overview-test');
    console.log('4. If client shows error, restart it:');
    console.log('   - In client directory: npm start');
}

runDiagnostics();
