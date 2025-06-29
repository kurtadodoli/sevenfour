const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

async function createPaymentVerificationsTable() {
    let connection;
    
    try {
        console.log('Creating payment_verifications table...');
        connection = await mysql.createConnection(dbConfig);
        
        // Create payment_verifications table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS payment_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                payment_reference VARCHAR(50) NOT NULL,
                verification_hash VARCHAR(64) NOT NULL,
                server_hash VARCHAR(64) NOT NULL,
                payment_proof_filename VARCHAR(255) NOT NULL,
                payment_proof_path TEXT NOT NULL,
                order_total DECIMAL(10, 2) NOT NULL,
                verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_payment_reference (payment_reference),
                INDEX idx_verification_hash (verification_hash),
                INDEX idx_verification_status (verification_status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await connection.execute(createTableQuery);
        console.log('✅ payment_verifications table created successfully');
        
        // Add payment-related columns to orders table if they don't exist
        const alterOrdersQuery = `
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_verification_hash VARCHAR(64),
            ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_proof_filename VARCHAR(255),
            ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending'
        `;
        
        try {
            await connection.execute(alterOrdersQuery);
            console.log('✅ Orders table updated with payment columns');
        } catch (alterError) {
            console.log('⚠️ Orders table columns may already exist:', alterError.message);
        }
        
        console.log('✅ Payment verification system setup complete');
        
    } catch (error) {
        console.error('❌ Error creating payment_verifications table:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if called directly
if (require.main === module) {
    createPaymentVerificationsTable()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { createPaymentVerificationsTable };
