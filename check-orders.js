const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'seven_four_clothing'
};

async function checkOrders() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('Checking existing orders...');
        
        // Check orders table
        const [orders] = await connection.execute('SELECT * FROM orders LIMIT 5');
        console.log(`Found ${orders.length} orders in database`);
        
        if (orders.length > 0) {
            console.log('Sample order:', orders[0]);
            
            // Check order items for the first order
            const [orderItems] = await connection.execute(
                'SELECT * FROM order_items WHERE order_id = ?', 
                [orders[0].id]
            );
            console.log(`Found ${orderItems.length} items for order ${orders[0].id}`);
            
            if (orderItems.length > 0) {
                console.log('Sample order item:', orderItems[0]);
            }
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Error checking orders:', error.message);
    }
}

checkOrders();
