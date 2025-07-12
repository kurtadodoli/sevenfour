// Enhanced Delivery Controller for DeliveryPage.js
// This controller handles all delivery management operations with the new database schema

const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

class DeliveryController {
  
  // =============================================
  // CALENDAR MANAGEMENT
  // =============================================
  
  /**
   * Get calendar data for a specific month with delivery schedules
   */
  static async getCalendarData(req, res) {
    let connection;
    try {
      const { year, month } = req.query;
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01`;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Get detailed delivery schedules for the month first (primary source of truth)
      const [deliverySchedules] = await connection.execute(`
        SELECT 
          ds.*,
          c.name as courier_name,
          c.phone_number as courier_phone,
          c.vehicle_type
        FROM delivery_schedules_enhanced ds
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE ds.delivery_date >= ? AND ds.delivery_date < ?
        ORDER BY ds.delivery_date, ds.delivery_time_slot
      `, [startDate, endDate]);
      
      // Group schedules by date
      const schedulesByDate = {};
      deliverySchedules.forEach(schedule => {
        const dateKey = schedule.delivery_date.toISOString().split('T')[0];
        if (!schedulesByDate[dateKey]) {
          schedulesByDate[dateKey] = [];
        }
        schedulesByDate[dateKey].push(schedule);
      });
      
      // Get calendar settings for dates that have deliveries (optional settings)
      const datesWithDeliveries = Object.keys(schedulesByDate);
      let calendarSettings = {};
      
      if (datesWithDeliveries.length > 0) {
        const placeholders = datesWithDeliveries.map(() => '?').join(',');
        const [calendarData] = await connection.execute(`
          SELECT 
            dc.*
          FROM delivery_calendar dc
          WHERE DATE(dc.calendar_date) IN (${placeholders})
        `, datesWithDeliveries);
        
        calendarData.forEach(cal => {
          const dateKey = cal.calendar_date.toISOString().split('T')[0];
          calendarSettings[dateKey] = cal;
        });
      }
      
      // Create calendar response with deliveries as primary data
      // Return ALL dates that have deliveries, with default calendar settings if no calendar entry exists
      const calendarWithSchedules = datesWithDeliveries.map(dateKey => {
        const deliveriesCount = schedulesByDate[dateKey].length;
        const defaultSettings = {
          id: null,
          calendar_date: new Date(dateKey + 'T12:00:00.000Z'),
          max_deliveries: 3,
          current_bookings: deliveriesCount,
          is_available: 1,
          is_holiday: 0,
          is_weekend: [0, 6].includes(new Date(dateKey).getDay()) ? 1 : 0,
          special_notes: null,
          weather_status: 'good',
          delivery_restrictions: null,
          created_at: new Date(),
          updated_at: new Date(),
          scheduled_deliveries: deliveriesCount
        };
        
        // Use calendar settings if they exist, otherwise use defaults
        const settings = calendarSettings[dateKey] ? {
          ...calendarSettings[dateKey],
          scheduled_deliveries: deliveriesCount,
          current_bookings: deliveriesCount
        } : defaultSettings;
        
        return {
          ...settings,
          deliveries: schedulesByDate[dateKey] || []
        };
      }).sort((a, b) => new Date(a.calendar_date) - new Date(b.calendar_date));
      
      res.json({
        success: true,
        data: {
          calendar: calendarWithSchedules,
          summary: {
            totalDays: calendarWithSchedules.length,
            totalDeliveries: deliverySchedules.length,
            availableDays: calendarWithSchedules.filter(d => d.is_available).length
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar data',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  /**
   * Update calendar day availability
   */
  static async updateCalendarDay(req, res) {
    let connection;
    try {
      const { date } = req.params;
      const { is_available, special_notes, max_deliveries } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      
      await connection.execute(`
        INSERT INTO delivery_calendar (calendar_date, is_available, special_notes, max_deliveries)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        is_available = VALUES(is_available),
        special_notes = VALUES(special_notes),
        max_deliveries = VALUES(max_deliveries),
        updated_at = CURRENT_TIMESTAMP
      `, [date, is_available, special_notes, max_deliveries]);
      
      res.json({
        success: true,
        message: 'Calendar day updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating calendar day:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update calendar day',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // =============================================
  // ORDER MANAGEMENT FOR DELIVERY
  // =============================================
  
  /**
   * Get all orders available for delivery scheduling (separated by type)
   */
  static async getOrdersForDelivery(req, res) {
    let connection;
    try {
      console.log('🚚 Enhanced Delivery: Fetching orders for delivery...');
      connection = await mysql.createConnection(dbConfig);
      
      // Get regular orders from orders table (excluding custom orders)
      // Only include orders where payment has been verified (status = 'confirmed' means payment approved)
      // Exclude custom orders to prevent duplicates (custom orders are fetched separately)
      console.log('📦 Fetching payment-verified regular orders from orders table...');
      const [regularOrders] = await connection.execute(`
        SELECT 
          o.id,
          o.order_number,
          oi.customer_name,
          oi.customer_email,
          o.contact_phone,
          o.contact_phone as customer_phone,
          o.total_amount,
          o.status,
          o.order_date,
          o.shipping_address,
          o.payment_reference,
          o.payment_proof_filename,
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
          c.phone_number as courier_phone,
          o.street_address,
          o.city_municipality,
          o.province,
          o.zip_code
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
        ORDER BY o.order_date DESC
      `);
      
      // Get custom orders from custom_orders table
      // Only include orders where payment has been verified by admin
      console.log('🎨 Fetching payment-verified custom orders...');
      console.log('🔍 Custom orders query conditions:');
      console.log('   - Status must be in: confirmed, approved, completed');
      console.log('   - Payment status must be: verified');
      console.log('   - Payment verified at must not be null');
      
      const [customOrders] = await connection.execute(`
        SELECT 
          co.id,
          co.custom_order_id as order_number,
          co.customer_name,
          co.customer_email,
          co.customer_phone,
          COALESCE(co.final_price, co.estimated_price, 0) as total_amount,
          co.status,
          co.payment_status,
          co.payment_verified_at,
          co.created_at as order_date,
          CONCAT(co.street_number, ', ', co.municipality, ', ', co.province) as shipping_address,
          co.municipality as shipping_city,
          co.province as shipping_province,
          co.postal_code as shipping_postal_code,
          co.customer_phone as shipping_phone,
          co.special_instructions as shipping_notes,
          'custom_order' as order_type,
          COALESCE(co.delivery_status, ds.delivery_status) as delivery_status,
          ds.delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          COALESCE(co.delivery_notes, ds.delivery_notes) as delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone,
          latest_payment.verified_at as latest_payment_verified_at,
          latest_payment.payment_amount as latest_payment_amount,
          latest_payment.gcash_reference
        FROM custom_orders co
        LEFT JOIN (
          SELECT 
            custom_order_id,
            payment_amount,
            verified_at,
            gcash_reference,
            ROW_NUMBER() OVER (PARTITION BY custom_order_id ORDER BY verified_at DESC) as rn
          FROM custom_order_payments 
          WHERE payment_status = 'verified'
        ) latest_payment ON co.custom_order_id = latest_payment.custom_order_id AND latest_payment.rn = 1
        LEFT JOIN (
          SELECT 
            order_number,
            delivery_date,
            delivery_time_slot,
            delivery_status,
            delivery_notes,
            courier_id,
            id,
            ROW_NUMBER() OVER (PARTITION BY order_number ORDER BY created_at DESC) as rn
          FROM delivery_schedules_enhanced 
          WHERE order_type = 'custom_order'
        ) ds ON ds.order_number = co.custom_order_id AND ds.rn = 1
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE co.status IN ('confirmed', 'approved', 'completed')
        AND co.payment_status = 'verified'
        AND co.payment_verified_at IS NOT NULL
        ORDER BY co.created_at DESC
      `);
      
      console.log(`✅ Found ${customOrders.length} payment-verified custom orders`);
      if (customOrders.length > 0) {
        console.log('🔍 Sample custom order data:');
        const sample = customOrders[0];
        console.log(`   - Order: ${sample.order_number}`);
        console.log(`   - Status: ${sample.status}`);
        console.log(`   - Payment Status: ${sample.payment_status}`);
        console.log(`   - Payment Verified At: ${sample.payment_verified_at}`);
        console.log(`   - Created At: ${sample.order_date}`);
      }
      
      // Get custom designs from custom_designs table
      // Only include designs where payment has been verified by admin
      console.log('🎨 Fetching payment-verified custom designs...');
      const [customDesigns] = await connection.execute(`
        SELECT 
          cd.id,
          cd.design_id as order_number,
          cd.customer_name,
          cd.customer_email,
          cd.customer_phone,
          COALESCE(cd.final_price, cd.estimated_price, 0) as total_amount,
          cd.status,
          cd.created_at as order_date,
          CONCAT(cd.street_address, ', ', cd.city, ', Metro Manila') as shipping_address,
          cd.city as shipping_city,
          'Metro Manila' as shipping_province,
          cd.postal_code as shipping_postal_code,
          cd.customer_phone as shipping_phone,
          cd.additional_info as shipping_notes,
          'custom_design' as order_type,
          COALESCE(cd.delivery_status, ds.delivery_status) as delivery_status,
          ds.delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          COALESCE(cd.delivery_notes, ds.delivery_notes) as delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM custom_designs cd
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
          WHERE order_type = 'custom_design'
        ) ds ON cd.id = ds.order_id AND ds.rn = 1
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE cd.status IN ('approved', 'in_production', 'ready_for_pickup', 'completed')
        ORDER BY cd.created_at DESC
      `);
      
      console.log(`✅ Found ${regularOrders.length} payment-verified regular orders`);
      console.log(`✅ Found ${customOrders.length} payment-verified custom orders`);
      console.log(`✅ Found ${customDesigns.length} payment-verified custom designs`);
      
      // Get order items for regular orders
      for (let order of regularOrders) {
        const [items] = await connection.execute(`
          SELECT 
            oi.*,
            p.productname,
            p.productcolor,
            p.product_type,
            p.productimage
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = ?
        `, [order.id]);
        order.items = items;
      }
      
      // Get items for custom orders (they use a different structure)
      for (let order of customOrders) {
        // Get the actual fields from the fetched order for custom order items
        const fetchedOrder = customOrders.find(co => co.id === order.id);
        if (fetchedOrder) {
          // Use a query to get the detailed custom order data
          const [customOrderDetails] = await connection.execute(`
            SELECT * FROM custom_orders WHERE id = ?
          `, [order.id]);
          
          if (customOrderDetails.length > 0) {
            const details = customOrderDetails[0];
            order.items = [{
              id: order.id,
              order_id: order.id,
              product_name: `Custom ${details.product_type || 'Product'} - ${details.product_name || ''}`,
              product_price: order.total_amount,
              quantity: details.quantity || 1,
              color: details.color,
              size: details.size,
              subtotal: order.total_amount,
              productname: `Custom ${details.product_type || 'Product'}`,
              productcolor: details.color,
              product_type: details.product_type,
              productimage: null
            }];
          }
        }
      }
      
      // Get items for custom designs
      for (let order of customDesigns) {
        // Get the actual fields from the fetched order for custom design items
        const [customDesignDetails] = await connection.execute(`
          SELECT * FROM custom_designs WHERE id = ?
        `, [order.id]);
        
        if (customDesignDetails.length > 0) {
          const details = customDesignDetails[0];
          order.items = [{
            id: order.id,
            order_id: order.id,
            product_name: `Custom Design - ${details.product_type || 'Product'}`,
            product_price: order.total_amount,
            quantity: details.quantity || 1,
            color: details.product_color,
            size: details.product_size,
            subtotal: order.total_amount,
            productname: `Custom Design - ${details.product_type || 'Product'}`,
            productcolor: details.product_color,
            product_type: details.product_type,
            productimage: null // Could add design images here if available
          }];
        }
      }
      
      // Populate GCash reference for custom orders
      console.log('💳 Setting GCash reference information for custom orders...');
      for (let order of customOrders) {
        try {
          // Custom orders already have gcash_reference from the query
          order.gcash_reference_number = order.gcash_reference || 'N/A';
          
          // Add mock items for custom orders for consistency
          if (!order.items) {
            order.items = [{
              id: 'custom',
              productname: `Custom ${order.product_type || 'Product'}`,
              productcolor: order.color || null,
              size: order.size || null,
              quantity: order.quantity || 1,
              product_price: order.total_amount,
              subtotal: order.total_amount,
              productimage: null
            }];
            order.item_count = 1;
          }
          
        } catch (error) {
          console.error(`Error processing custom order ${order.order_number}:`, error.message);
          order.gcash_reference_number = 'N/A';
          order.gcash_reference = 'N/A';
        }
      }
      
      // Populate order items and GCash reference for regular orders
      console.log('💳 Populating GCash reference information for regular orders...');
      for (let order of regularOrders) {
        try {
          // Get order items with GCash reference information
          const [items] = await connection.execute(`
            SELECT 
              oi.*,
              p.productname,
              p.productcolor,
              p.product_type,
              p.productimage
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
            ORDER BY oi.id
          `, [order.id]);
          
          // Set GCash reference using comprehensive fallback logic
          const itemWithGcash = items.find(item => 
            item.gcash_reference_number && 
            item.gcash_reference_number !== 'N/A' && 
            item.gcash_reference_number !== 'COD_ORDER'
          );
          
          order.gcash_reference_number = order.payment_reference || 
                                        (itemWithGcash ? itemWithGcash.gcash_reference_number : null) ||
                                        'N/A';
          
          // Also set gcash_reference for consistency
          order.gcash_reference = order.gcash_reference_number;
          
          console.log(`Order ${order.order_number} GCash debug:`, {
            payment_reference: order.payment_reference,
            itemWithGcash: itemWithGcash ? itemWithGcash.gcash_reference_number : 'none found',
            final_gcash_reference: order.gcash_reference_number
          });
          
          // Set payment proof path
          if (order.payment_proof_filename) {
            order.payment_proof_image_path = `/uploads/payment-proofs/${order.payment_proof_filename}`;
          } else if (items.length > 0) {
            const itemWithProof = items.find(item => item.payment_proof_image_path);
            if (itemWithProof) {
              order.payment_proof_image_path = itemWithProof.payment_proof_image_path.startsWith('/') 
                ? itemWithProof.payment_proof_image_path 
                : `/uploads/payment-proofs/${itemWithProof.payment_proof_image_path}`;
            }
          }
          
          // Add items to order
          order.items = items;
          order.item_count = items.length;
          
        } catch (error) {
          console.error(`Error processing order ${order.order_number}:`, error.message);
          order.gcash_reference_number = 'N/A';
          order.gcash_reference = 'N/A';
          order.items = [];
          order.item_count = 0;
        }
      }
      
      // Combine all orders for backward compatibility but keep them separated
      const allOrders = [...regularOrders, ...customOrders, ...customDesigns];
      
      // Calculate summary statistics
      const totalScheduled = allOrders.filter(o => o.delivery_status && o.delivery_status !== 'pending').length;
      const totalPending = allOrders.filter(o => !o.delivery_status || o.delivery_status === 'pending').length;
      
      res.json({
        success: true,
        data: allOrders, // Combined list for backward compatibility
        separatedData: {
          regularOrders: regularOrders,
          customOrders: customOrders,
          customDesigns: customDesigns
        },
        summary: {
          total: allOrders.length,
          regular: regularOrders.length,
          custom_orders: customOrders.length,
          custom_designs: customDesigns.length,
          scheduled: totalScheduled,
          pending: totalPending
        }
      });
      
    } catch (error) {
      console.error('Error fetching orders for delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders for delivery',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // =============================================
  // DELIVERY SCHEDULING
  // =============================================
  
  /**
   * Schedule a delivery for an order
   */
  static async scheduleDelivery(req, res) {
    let connection;
    try {
      console.log('🚀 Schedule delivery called with body:', req.body);
      
      const {
        order_id,
        order_number,
        order_type,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_date,
        delivery_time_slot,
        delivery_address,
        delivery_city,
        delivery_province,
        delivery_postal_code,
        delivery_contact_phone,
        delivery_notes,
        courier_id,
        priority_level,
        delivery_fee,
        calendar_color,
        display_icon
      } = req.body;
      
      console.log('📋 Extracted parameters:', { order_id, order_type, delivery_date });
      
      // Validate required fields
      if (!order_id || !order_type || !delivery_date) {
        console.log('❌ Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: order_id, order_type, and delivery_date are required'
        });
      }
      
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ Database connection established');
      
      // Get order details based on type with improved ID handling
      let orderDetails;
      let actualOrderId = order_id;
      
      if (order_type === 'regular') {
        const [orders] = await connection.execute(`
          SELECT o.*, 
                 CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                 u.email as customer_email,
                 u.phone as customer_phone,
                 o.shipping_address,
                 o.contact_phone as shipping_phone
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.user_id 
          WHERE o.id = ?
        `, [actualOrderId]);
        orderDetails = orders[0];
        console.log('📅 Found regular order:', orderDetails ? 'YES' : 'NO');
      } else if (order_type === 'custom_design') {
        // Try with and without prefix stripping
        actualOrderId = order_id.toString().replace('custom-design-', '');
        let [designs] = await connection.execute(`
          SELECT *, design_id as order_number FROM custom_designs WHERE id = ?
        `, [actualOrderId]);
        
        if (designs.length === 0 && order_id !== actualOrderId) {
          // Try with original ID if stripping didn't work
          [designs] = await connection.execute(`
            SELECT *, design_id as order_number FROM custom_designs WHERE id = ?
          `, [order_id]);
          actualOrderId = order_id;
        }
        
        orderDetails = designs[0];
        console.log('📅 Found custom design:', orderDetails ? 'YES' : 'NO');
      } else if (order_type === 'custom_order') {
        // For custom orders, first look in custom_orders table, then in orders table for delivery orders
        console.log('🔍 Looking for custom order with ID:', order_id);
        
        // First, try to find in custom_orders table
        const [customOrders] = await connection.execute(`
          SELECT co.id, co.custom_order_id, co.user_id, co.product_type, co.product_name,
                 co.size, co.color, co.quantity, co.urgency, co.special_instructions,
                 co.customer_name,
                 co.customer_email,
                 co.customer_phone,
                 co.province, co.municipality, co.street_number, co.house_number, 
                 co.barangay, co.postal_code, co.status, co.estimated_price, co.final_price,
                 co.payment_status, co.payment_method, co.delivery_status, co.delivery_notes,
                 CONCAT(
                   COALESCE(co.house_number, ''), 
                   CASE WHEN co.house_number IS NOT NULL THEN ' ' ELSE '' END,
                   COALESCE(co.street_number, ''), 
                   CASE WHEN co.barangay IS NOT NULL THEN CONCAT(', ', co.barangay) ELSE '' END,
                   CASE WHEN co.municipality IS NOT NULL THEN CONCAT(', ', co.municipality) ELSE '' END,
                   CASE WHEN co.province IS NOT NULL THEN CONCAT(', ', co.province) ELSE '' END,
                   CASE WHEN co.postal_code IS NOT NULL THEN CONCAT(' ', co.postal_code) ELSE '' END
                 ) as shipping_address,
                 CONCAT(
                   COALESCE(co.house_number, ''), 
                   CASE WHEN co.house_number IS NOT NULL THEN ' ' ELSE '' END,
                   COALESCE(co.street_number, ''), 
                   CASE WHEN co.barangay IS NOT NULL THEN CONCAT(', ', co.barangay) ELSE '' END,
                   CASE WHEN co.municipality IS NOT NULL THEN CONCAT(', ', co.municipality) ELSE '' END,
                   CASE WHEN co.province IS NOT NULL THEN CONCAT(', ', co.province) ELSE '' END,
                   CASE WHEN co.postal_code IS NOT NULL THEN CONCAT(' ', co.postal_code) ELSE '' END
                 ) as delivery_address,
                 co.customer_phone as contact_phone,
                 co.custom_order_id as order_number
          FROM custom_orders co
          WHERE co.id = ?
        `, [order_id]);
        
        if (customOrders.length > 0) {
          orderDetails = customOrders[0];
          console.log('🔍 Found custom order:', orderDetails.order_number);
        } else {
          // If not found in custom_orders, look in orders table for delivery orders
          console.log('🔍 Not found in custom_orders, checking delivery orders...');
          const [customDeliveryOrders] = await connection.execute(`
            SELECT o.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                   u.email as customer_email,
                   u.phone as customer_phone,
                   o.shipping_address,
                   o.contact_phone as shipping_phone,
                   o.order_number
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id 
            WHERE o.id = ? AND o.notes LIKE '%Reference: CUSTOM-%'
          `, [order_id]);
          
          if (customDeliveryOrders.length > 0) {
            orderDetails = customDeliveryOrders[0];
            console.log('🔍 Found delivery order:', orderDetails.order_number);
          }
        }
        
        console.log('📅 Found custom order:', orderDetails ? 'YES' : 'NO');
        console.log('📅 Order ID used:', order_id);
      }
      
      if (!orderDetails) {
        console.log('❌ Order not found for ID:', order_id, 'Type:', order_type);
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      console.log('📋 Debugging schedule delivery request...');
      console.log('Order ID:', order_id, 'Type:', order_type);
      console.log('Order details found:', orderDetails ? 'YES' : 'NO');
      if (orderDetails) {
        console.log('Order details keys:', Object.keys(orderDetails));
      }
      
      // Extract delivery location information from shipping address
      let deliveryCity = 'Unknown City';
      let deliveryProvince = 'Metro Manila';
      
      if (orderDetails.shipping_address) {
        const addressParts = orderDetails.shipping_address.split(',');
        if (addressParts.length >= 2) {
          deliveryCity = addressParts[addressParts.length - 3]?.trim() || 'Unknown City';
          deliveryProvince = addressParts[addressParts.length - 2]?.trim() || 'Metro Manila';
        }
      }
      
      // Prepare SQL parameters with explicit null checks and defaults
      const sqlParams = [
        order_id || null,
        order_number || orderDetails.order_number || `ORDER-${order_id}`,
        order_type || 'regular',
        customer_id || orderDetails.customer_id || orderDetails.user_id || null,
        customer_name || orderDetails.customer_name || orderDetails.customerName || 'Unknown Customer',
        customer_email || orderDetails.customer_email || orderDetails.customerEmail || null,
        customer_phone || orderDetails.customer_phone || orderDetails.customerPhone || orderDetails.contact_phone || null,
        delivery_date || null,
        delivery_time_slot || null,
        delivery_address || orderDetails.shipping_address || orderDetails.shippingAddress || 'No address provided',
        delivery_city || deliveryCity || 'Unknown City',
        delivery_province || deliveryProvince || 'National Capital Region',
        delivery_postal_code || null,
        delivery_contact_phone || orderDetails.shipping_phone || orderDetails.customer_phone || orderDetails.contact_phone || null,
        delivery_notes || '',
        courier_id || null,
        priority_level || 'normal',
        delivery_fee || 0.00,
        null, // scheduled_at - will be set to CURRENT_TIMESTAMP by default
        null, // dispatched_at
        null, // delivered_at
        calendar_color || '#007bff',
        display_icon || '📅'
      ];
      
      console.log('📋 SQL Parameters:');
      sqlParams.forEach((param, index) => {
        console.log(`  ${index}: ${param} (${typeof param})`);
      });
      
      // Check delivery capacity for the requested date (max 3 deliveries per day)
      const deliveryDateOnly = delivery_date.split('T')[0]; // Extract just the date part
      const [capacityCheck] = await connection.execute(`
        SELECT COUNT(DISTINCT order_id) as delivery_count 
        FROM delivery_schedules_enhanced 
        WHERE DATE(delivery_date) = ? 
        AND delivery_status NOT IN ('cancelled', 'removed')
      `, [deliveryDateOnly]);
      
      const currentDeliveries = capacityCheck[0].delivery_count;
      console.log(`📊 Current deliveries for ${deliveryDateOnly}: ${currentDeliveries}/3`);
      
      if (currentDeliveries >= 3) {
        console.log('❌ Delivery capacity exceeded for date:', deliveryDateOnly);
        return res.status(400).json({
          success: false,
          message: `Cannot schedule delivery for ${deliveryDateOnly}. Maximum of 3 deliveries per day already reached (${currentDeliveries} deliveries scheduled).`,
          capacityExceeded: true,
          currentDeliveries: currentDeliveries,
          maxDeliveries: 3
        });
      }
      
      // Create delivery schedule
      const [result] = await connection.execute(`
        INSERT INTO delivery_schedules_enhanced (
          order_id, order_number, order_type, customer_id,
          customer_name, customer_email, customer_phone,
          delivery_date, delivery_time_slot, delivery_status,
          delivery_address, delivery_city, delivery_province, delivery_postal_code,
          delivery_contact_phone, delivery_notes,
          courier_id, priority_level, delivery_fee,
          scheduled_at, dispatched_at, delivered_at,
          calendar_color, display_icon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        delivery_date = VALUES(delivery_date),
        delivery_time_slot = VALUES(delivery_time_slot),
        delivery_status = 'scheduled',
        courier_id = VALUES(courier_id),
        delivery_notes = VALUES(delivery_notes),
        priority_level = VALUES(priority_level),
        updated_at = CURRENT_TIMESTAMP
      `, sqlParams);
      
      // Update delivery status in source table using the correct actualOrderId
      if (order_type === 'regular') {
        await connection.execute(`
          UPDATE orders 
          SET delivery_status = 'scheduled', scheduled_delivery_date = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_date, delivery_notes, actualOrderId]);
      } else if (order_type === 'custom_design') {
        await connection.execute(`
          UPDATE custom_designs 
          SET delivery_status = 'scheduled', delivery_date = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_date, delivery_notes, actualOrderId]);
      } else if (order_type === 'custom_order') {
        // For custom orders, update the custom_orders table
        await connection.execute(`
          UPDATE custom_orders 
          SET delivery_status = 'scheduled', estimated_delivery_date = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_date, delivery_notes, actualOrderId]);
      }
      
      // Update calendar booking count
      await connection.execute(`
        UPDATE delivery_calendar 
        SET current_bookings = current_bookings + 1 
        WHERE calendar_date = ?
      `, [delivery_date]);
      
      // Log status change (temporarily disabled for testing)
      // await this.logStatusChange(connection, result.insertId, order_id, null, 'scheduled', 'Order scheduled for delivery', req.user?.id || null, req.user?.username || 'system');
      
      res.json({
        success: true,
        message: 'Delivery scheduled successfully',
        data: {
          delivery_schedule_id: result.insertId,
          order_id,
          delivery_date,
          delivery_status: 'scheduled'
        }
      });
      
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule delivery',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  /**
   * Update delivery status
   */
  static async updateDeliveryStatus(req, res) {
    let connection;
    try {
      const { id } = req.params;
      const { delivery_status, delivery_notes, location_address } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Get current delivery schedule
      const [currentSchedule] = await connection.execute(`
        SELECT * FROM delivery_schedules_enhanced WHERE id = ?
      `, [id]);
      
      if (currentSchedule.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Delivery schedule not found'
        });
      }
      
      const schedule = currentSchedule[0];
      const previousStatus = schedule.delivery_status;
      
      // Update delivery schedule
      const updateFields = {
        delivery_status,
        delivery_notes,
        calendar_color: this.getStatusColor(delivery_status),
        display_icon: this.getStatusIcon(delivery_status),
        updated_at: new Date()
      };
      
      if (delivery_status === 'delivered') {
        updateFields.delivered_at = new Date();
      } else if (delivery_status === 'in_transit') {
        updateFields.dispatched_at = new Date();
      }
      
      await connection.execute(`
        UPDATE delivery_schedules_enhanced 
        SET delivery_status = ?, delivery_notes = ?, calendar_color = ?, display_icon = ?,
            delivered_at = ?, dispatched_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        delivery_status,
        delivery_notes,
        updateFields.calendar_color,
        updateFields.display_icon,
        updateFields.delivered_at || null,
        updateFields.dispatched_at || null,
        id
      ]);
      
      // Update status in source table
      if (schedule.order_type === 'regular') {
        await connection.execute(`
          UPDATE orders 
          SET delivery_status = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_status, delivery_notes, schedule.order_id]);
      } else if (schedule.order_type === 'custom_design') {
        await connection.execute(`
          UPDATE custom_designs 
          SET delivery_status = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_status, delivery_notes, schedule.order_id]);
      } else if (schedule.order_type === 'custom_order') {
        await connection.execute(`
          UPDATE custom_orders 
          SET delivery_status = ?, delivery_notes = ?
          WHERE id = ?
        `, [delivery_status, delivery_notes, schedule.order_id]);
      }
      
      // Log status change
      await this.logStatusChange(connection, id, schedule.order_id, previousStatus, delivery_status, delivery_notes, req.user?.id, req.user?.username, location_address);
      
      res.json({
        success: true,
        message: 'Delivery status updated successfully',
        data: {
          delivery_schedule_id: id,
          previous_status: previousStatus,
          new_status: delivery_status,
          updated_at: updateFields.updated_at
        }
      });
      
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update delivery status',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  /**
   * Remove order from delivery management
   * This doesn't delete the order but removes it from delivery scheduling
   */
  static async removeOrderFromDelivery(req, res) {
    let connection;
    try {
      const { orderId } = req.params;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Remove any delivery schedules for this order
      const [deleteSchedules] = await connection.execute(`
        DELETE FROM delivery_schedules_enhanced 
        WHERE order_id = ?
      `, [orderId]);
      
      // Log the removal for audit purposes
      await connection.execute(`
        INSERT INTO delivery_status_history 
        (delivery_schedule_id, order_id, previous_status, new_status, changed_by_user_id, changed_by_name, status_notes, created_at)
        VALUES (?, ?, 'scheduled', 'removed_from_delivery', ?, 'System', 'Order removed from delivery management', NOW())
      `, [0, orderId, 1]); // Using delivery_schedule_id 0 for system operations and user ID 1
      
      console.log(`✅ Removed order ${orderId} from delivery management`);
      
      res.json({
        success: true,
        message: `Order ${orderId} removed from delivery management`,
        data: {
          orderId: orderId,
          schedulesRemoved: deleteSchedules.affectedRows
        }
      });
      
    } catch (error) {
      console.error('❌ Error removing order from delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing order from delivery management',
        error: error.message
      });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // =============================================
  // HELPER METHODS
  // =============================================
  
  static getStatusColor(status) {
    const colors = {
      'pending': '#ffc107',
      'scheduled': '#007bff',
      'in_transit': '#000000',
      'delivered': '#28a745',
      'delayed': '#dc3545',
      'cancelled': '#6c757d',
      'failed': '#e74c3c'
    };
    return colors[status] || '#6c757d';
  }
  
  static getStatusIcon(status) {
    const icons = {
      'pending': '⏳',
      'scheduled': '📅',
      'in_transit': '🚚',
      'delivered': '✅',
      'delayed': '⚠️',
      'cancelled': '❌',
      'failed': '💥'
    };
    return icons[status] || '📦';
  }
  
  static async logStatusChange(connection, deliveryScheduleId, orderId, previousStatus, newStatus, notes, userId, userName, locationAddress = null) {
    try {
      await connection.execute(`
        INSERT INTO delivery_status_history (
          delivery_schedule_id, order_id, previous_status, new_status, 
          status_notes, changed_by_user_id, changed_by_name, location_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [deliveryScheduleId, orderId, previousStatus, newStatus, notes, userId, userName, locationAddress]);
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  }
}

module.exports = DeliveryController;
