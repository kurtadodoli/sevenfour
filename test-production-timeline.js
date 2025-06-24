const mysql = require('mysql2/promise');

async function testCustomOrderProductionStatus() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🧪 Testing Custom Order Production Timeline Logic...\n');

    // Get custom orders
    const [customOrders] = await connection.execute(
      'SELECT * FROM custom_orders WHERE status = "approved" ORDER BY created_at DESC'
    );

    // Simulate the same logic as the frontend
    const getCustomOrderProductionStatus = (order) => {
      const now = new Date();
      const orderDate = new Date(order.created_at);
      const daysSinceOrder = Math.floor((now - orderDate) / (24 * 60 * 60 * 1000));
      const productionDays = 10;
      
      if (daysSinceOrder < productionDays) {
        const remainingDays = productionDays - daysSinceOrder;
        return {
          status: 'production',
          remainingDays: remainingDays,
          completionDate: new Date(orderDate.getTime() + (productionDays * 24 * 60 * 60 * 1000)),
          isReady: false,
          message: `Production in progress - ${remainingDays} day${remainingDays !== 1 ? 's' : ''} remaining`
        };
      } else {
        return {
          status: 'ready',
          remainingDays: 0,
          completionDate: new Date(orderDate.getTime() + (productionDays * 24 * 60 * 60 * 1000)),
          isReady: true,
          message: 'Production completed - Ready for delivery'
        };
      }
    };

    console.log('📊 Custom Orders Production Status:\n');

    customOrders.forEach((order, index) => {
      const productionStatus = getCustomOrderProductionStatus(order);
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const daysSinceOrder = Math.floor((now - orderDate) / (24 * 60 * 60 * 1000));

      console.log(`${index + 1}. ${order.custom_order_id}`);
      console.log(`   Product: ${order.product_name} (${order.product_type})`);
      console.log(`   Customer: ${order.customer_name}`);
      console.log(`   Created: ${orderDate.toLocaleString()}`);
      console.log(`   Days Since Order: ${daysSinceOrder}`);
      console.log(`   Production Status: ${productionStatus.status.toUpperCase()}`);
      console.log(`   Message: ${productionStatus.message}`);
      console.log(`   Completion Date: ${productionStatus.completionDate.toLocaleDateString()}`);
      console.log(`   Ready for Delivery: ${productionStatus.isReady ? 'YES' : 'NO'}`);
      
      if (!productionStatus.isReady) {
        console.log(`   🟡 YELLOW BAR: "Production in progress - ${productionStatus.remainingDays}d"`);
      } else {
        console.log(`   🟢 GREEN BAR: "Production completed - Ready for delivery"`);
      }
      console.log('');
    });

    console.log('✅ Frontend should display:');
    customOrders.forEach((order, index) => {
      const productionStatus = getCustomOrderProductionStatus(order);
      if (!productionStatus.isReady) {
        console.log(`   - ${order.custom_order_id}: YELLOW production bar (${productionStatus.remainingDays} days remaining)`);
      } else {
        console.log(`   - ${order.custom_order_id}: GREEN ready bar (can be scheduled)`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testCustomOrderProductionStatus();
