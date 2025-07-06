const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testDeliveryQuery() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('=== TESTING ACTUAL DELIVERY PAGE QUERY ===\n');

    // This is the exact query used by getOrdersForDelivery
    const [regularOrders] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        oi.customer_name,
        oi.customer_email,
        o.contact_phone as customer_phone,
        o.total_amount,
        o.status,
        o.order_date,
        o.shipping_address,
        COALESCE(SUBSTRING_INDEX(SUBSTRING_INDEX(o.shipping_address, ',', -3), ',', 1), 'Unknown City') as shipping_city,
        COALESCE(SUBSTRING_INDEX(SUBSTRING_INDEX(o.shipping_address, ',', -2), ',', 1), 'Metro Manila') as shipping_province,
        '' as shipping_postal_code,
        o.contact_phone as shipping_phone,
        o.notes as shipping_notes,
        'regular' as order_type,
        COALESCE(o.delivery_status, ds.delivery_status) as delivery_status,
        ds.delivery_date as scheduled_delivery_date,
        ds.delivery_time_slot as scheduled_delivery_time,
        COALESCE(o.delivery_notes, ds.delivery_notes) as delivery_notes,
        ds.id as delivery_schedule_id,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM orders o
      LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
      LEFT JOIN (
        SELECT 
          order_id,
          delivery_date,
          delivery_time_slot,
          delivery_status,
          delivery_notes,
          courier_id,
          id,
          ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY created_at DESC) as rn
        FROM delivery_schedules_enhanced 
        WHERE order_type = 'regular'
      ) ds ON o.id = ds.order_id AND ds.rn = 1
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE o.status IN ('confirmed', 'processing', 'Order Received')
      AND (
        o.confirmed_by IS NOT NULL 
        OR o.status = 'Order Received'
        OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
      )
      AND NOT (o.order_number LIKE '%CUSTOM%' OR o.notes LIKE '%Custom Order%')
      AND o.order_number = 'ORD17517282369104816'
      ORDER BY o.order_date DESC
    `);

    if (regularOrders.length > 0) {
      console.log('✅ Order FOUND in delivery query!');
      const order = regularOrders[0];
      console.log('📋 Order Details:');
      console.log(`- ID: ${order.id}`);
      console.log(`- Order Number: ${order.order_number}`);
      console.log(`- Customer Name: ${order.customer_name}`);
      console.log(`- Customer Email: ${order.customer_email}`);
      console.log(`- Status: ${order.status}`);
      console.log(`- Total Amount: ${order.total_amount}`);
      console.log(`- Order Date: ${order.order_date}`);
      console.log(`- Delivery Status: ${order.delivery_status}`);
      console.log(`- Notes: ${order.shipping_notes}`);
    } else {
      console.log('❌ Order NOT FOUND in delivery query');
      
      // Test each condition separately
      console.log('\n🔍 Testing each query condition separately:');
      
      // Base query without conditions
      const [baseQuery] = await connection.execute(`
        SELECT o.id, o.order_number, o.status, o.confirmed_by, o.notes
        FROM orders o
        WHERE o.order_number = 'ORD17517282369104816'
      `);
      
      if (baseQuery.length > 0) {
        const order = baseQuery[0];
        console.log(`✅ Order exists in orders table`);
        console.log(`- Status: ${order.status}`);
        console.log(`- Confirmed By: ${order.confirmed_by}`);
        console.log(`- Notes: ${order.notes}`);
        
        // Test status condition
        const statusCheck = ['confirmed', 'processing', 'Order Received'].includes(order.status);
        console.log(`- Status condition (${order.status} in allowed): ${statusCheck}`);
        
        // Test confirmed_by condition
        const confirmedByCheck = order.confirmed_by !== null;
        console.log(`- Confirmed by condition: ${confirmedByCheck}`);
        
        // Test Order Received condition
        const orderReceivedCheck = order.status === 'Order Received';
        console.log(`- Order Received condition: ${orderReceivedCheck}`);
        
        // Test admin approval condition
        const adminApprovalCheck = order.notes && order.notes.includes('Payment approved by admin') && order.status === 'confirmed';
        console.log(`- Admin approval condition: ${adminApprovalCheck}`);
        
        // Test CUSTOM exclusion
        const customExclusion = !(order.order_number.includes('CUSTOM') || (order.notes && order.notes.includes('Custom Order')));
        console.log(`- Not custom order condition: ${customExclusion}`);
        
        // Test invoice join
        console.log('\n🔍 Testing invoice join:');
        const [invoiceCheck] = await connection.execute(`
          SELECT oi.invoice_id, oi.customer_name, oi.customer_email
          FROM orders o
          LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
          WHERE o.order_number = 'ORD17517282369104816'
        `);
        
        if (invoiceCheck.length > 0) {
          console.log(`✅ Invoice join successful`);
          console.log(`- Invoice ID: ${invoiceCheck[0].invoice_id}`);
          console.log(`- Customer Name: ${invoiceCheck[0].customer_name}`);
          console.log(`- Customer Email: ${invoiceCheck[0].customer_email}`);
        } else {
          console.log(`❌ Invoice join failed`);
        }
        
      } else {
        console.log('❌ Order not found in orders table');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDeliveryQuery();
