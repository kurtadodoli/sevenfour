const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function createRefundRequestsTable() {
    try {
        console.log('=== CREATING REFUND REQUESTS TABLE ===');
        
        const connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(`
            CREATE TABLE refund_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                order_number VARCHAR(50) NOT NULL,
                user_id BIGINT NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(20),
                amount DECIMAL(10,2) NOT NULL,
                reason TEXT NOT NULL,
                bank_account_number VARCHAR(50),
                bank_name VARCHAR(100),
                account_holder_name VARCHAR(255),
                status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
                admin_notes TEXT,
                processed_by BIGINT,
                processed_at TIMESTAMP NULL,
                refund_method ENUM('bank_transfer', 'gcash', 'cash') DEFAULT 'bank_transfer',
                refund_reference VARCHAR(100),
                refund_date TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
                
                INDEX idx_order_id (order_id),
                INDEX idx_user_id (user_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            )
        `);
        
        console.log('✅ refund_requests table created successfully');
        
        // Insert some test data
        await connection.execute(`
            INSERT INTO refund_requests (
                order_id, order_number, user_id, customer_name, customer_email, 
                amount, reason, bank_account_number, bank_name, account_holder_name,
                status, created_at
            ) VALUES 
            (1, 'ORD1751TEST001', 967502321335177, 'Josh Russel Magpantay', 'joshmagpantay@gmail.com', 
             1500.00, 'Product damaged during delivery', '1234567890', 'BPI', 'Josh Russel Magpantay',
             'pending', NOW()),
            (2, 'ORD1751TEST002', 967502321335178, 'Aljon Mendoza', 'aljonmendoza@gmail.com', 
             2500.00, 'Wrong size delivered', '0987654321', 'BDO', 'Aljon Mendoza',
             'pending', NOW())
        `);
        
        console.log('✅ Test refund requests created');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error creating refund_requests table:', error);
    }
}

createRefundRequestsTable();
