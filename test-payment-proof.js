const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testPaymentProof() {
    console.log('🔍 Testing payment proof system...');
    
    try {
        // Connect to database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });
        
        console.log('✅ Connected to database');
        
        // Check orders with payment proof
        const [orders] = await connection.execute(`
            SELECT 
                id,
                order_number,
                user_id,
                payment_reference,
                payment_proof_filename,
                payment_status,
                created_at
            FROM orders 
            WHERE payment_proof_filename IS NOT NULL 
                AND payment_proof_filename != 'N/A'
                AND payment_proof_filename != ''
            ORDER BY created_at DESC
            LIMIT 10
        `);
        
        console.log(`\n📋 Found ${orders.length} orders with payment proof:`);
        
        for (const order of orders) {
            console.log(`\n🔍 Order: ${order.order_number}`);
            console.log(`  - User ID: ${order.user_id}`);
            console.log(`  - GCash Ref: ${order.payment_reference}`);
            console.log(`  - Payment Proof File: ${order.payment_proof_filename}`);
            console.log(`  - Payment Status: ${order.payment_status}`);
            console.log(`  - Created: ${order.created_at}`);
            
            // Check if file exists
            const paymentProofPath = path.join(__dirname, 'uploads', 'payment-proofs', order.payment_proof_filename);
            const alternativePath = path.join(__dirname, 'server', 'uploads', 'payment-proofs', order.payment_proof_filename);
            const uploadsRoot = path.join(__dirname, 'uploads', order.payment_proof_filename);
            
            console.log(`  - Looking for file at:`);
            console.log(`    * ${paymentProofPath}`);
            console.log(`    * ${alternativePath}`);
            console.log(`    * ${uploadsRoot}`);
            
            if (fs.existsSync(paymentProofPath)) {
                console.log(`    ✅ File found at: ${paymentProofPath}`);
            } else if (fs.existsSync(alternativePath)) {
                console.log(`    ✅ File found at: ${alternativePath}`);
            } else if (fs.existsSync(uploadsRoot)) {
                console.log(`    ✅ File found at: ${uploadsRoot}`);
            } else {
                console.log(`    ❌ File not found in any location`);
            }
        }
        
        // Check upload directories
        const uploadDirs = [
            path.join(__dirname, 'uploads'),
            path.join(__dirname, 'uploads', 'payment-proofs'),
            path.join(__dirname, 'server', 'uploads'),
            path.join(__dirname, 'server', 'uploads', 'payment-proofs')
        ];
        
        console.log(`\n📁 Checking upload directories:`);
        for (const dir of uploadDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                console.log(`  ✅ ${dir} - ${files.length} files`);
                if (files.length > 0) {
                    console.log(`      Files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
                }
            } else {
                console.log(`  ❌ ${dir} - does not exist`);
            }
        }
        
        // Check custom orders payment proof
        const [customOrders] = await connection.execute(`
            SELECT 
                id,
                custom_order_id,
                full_name,
                gcash_reference,
                payment_proof_filename,
                payment_status,
                created_at
            FROM custom_order_payments 
            WHERE payment_proof_filename IS NOT NULL 
                AND payment_proof_filename != 'N/A'
                AND payment_proof_filename != ''
            ORDER BY created_at DESC
            LIMIT 5
        `);
        
        console.log(`\n📋 Found ${customOrders.length} custom orders with payment proof:`);
        
        for (const order of customOrders) {
            console.log(`\n🔍 Custom Order: ${order.custom_order_id}`);
            console.log(`  - Customer: ${order.full_name}`);
            console.log(`  - GCash Ref: ${order.gcash_reference}`);
            console.log(`  - Payment Proof File: ${order.payment_proof_filename}`);
            console.log(`  - Status: ${order.payment_status}`);
        }
        
        await connection.end();
        console.log('\n✅ Payment proof test completed');
        
    } catch (error) {
        console.error('❌ Error testing payment proof:', error);
    }
}

testPaymentProof();
