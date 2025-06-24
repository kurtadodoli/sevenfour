const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

console.log('Setting up delivery management database tables...');
console.log('Database config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port
});

async function setupDeliveryDatabase() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // 1. Create delivery_schedules table
        console.log('Creating delivery_schedules table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS delivery_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                order_type ENUM('regular', 'custom') NOT NULL DEFAULT 'regular',
                customer_id INT NOT NULL,
                
                -- Delivery Information
                delivery_date DATE NOT NULL,
                delivery_time_slot VARCHAR(50) DEFAULT NULL,
                delivery_status ENUM('scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled') DEFAULT 'scheduled',
                
                -- Address Information  
                delivery_address TEXT NOT NULL,
                delivery_city VARCHAR(100) NOT NULL,
                delivery_postal_code VARCHAR(20) DEFAULT NULL,
                delivery_province VARCHAR(100) DEFAULT NULL,
                delivery_contact_phone VARCHAR(20) DEFAULT NULL,
                delivery_notes TEXT DEFAULT NULL,
                
                -- Delivery Tracking
                tracking_number VARCHAR(100) UNIQUE DEFAULT NULL,
                courier_name VARCHAR(100) DEFAULT NULL,
                estimated_delivery_time DATETIME DEFAULT NULL,
                actual_delivery_time DATETIME DEFAULT NULL,
                
                -- Priority and Logistics
                priority_level ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
                delivery_fee DECIMAL(10,2) DEFAULT 0.00,
                
                -- Status Management
                scheduled_by INT DEFAULT NULL,
                delivered_by INT DEFAULT NULL,
                cancelled_reason TEXT DEFAULT NULL,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Indexes for performance
                INDEX idx_order_type_id (order_type, order_id),
                INDEX idx_delivery_date (delivery_date),
                INDEX idx_delivery_status (delivery_status),
                INDEX idx_customer_id (customer_id),
                INDEX idx_tracking_number (tracking_number)
            )
        `);
        console.log('✅ delivery_schedules table created/verified');

        // 2. Create delivery_items table
        console.log('Creating delivery_items table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS delivery_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                delivery_schedule_id INT NOT NULL,
                
                -- Item Information
                product_id INT DEFAULT NULL,
                custom_design_id INT DEFAULT NULL,
                product_name VARCHAR(255) NOT NULL,
                product_type VARCHAR(100) DEFAULT NULL,
                
                -- Variant Information
                size VARCHAR(50) DEFAULT NULL,
                color VARCHAR(100) DEFAULT NULL,
                
                -- Quantity and Pricing
                quantity INT NOT NULL DEFAULT 1,
                unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                
                -- Custom Order Specific
                custom_instructions TEXT DEFAULT NULL,
                production_status ENUM('pending', 'in_production', 'completed', 'shipped') DEFAULT 'pending',
                production_start_date DATE DEFAULT NULL,
                production_completion_date DATE DEFAULT NULL,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Foreign Keys
                FOREIGN KEY (delivery_schedule_id) REFERENCES delivery_schedules(id) ON DELETE CASCADE,
                
                -- Indexes
                INDEX idx_delivery_schedule_id (delivery_schedule_id),
                INDEX idx_product_id (product_id),
                INDEX idx_custom_design_id (custom_design_id),
                INDEX idx_production_status (production_status)
            )
        `);
        console.log('✅ delivery_items table created/verified');

        // 3. Create delivery_routes table
        console.log('Creating delivery_routes table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS delivery_routes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                route_name VARCHAR(100) NOT NULL,
                route_date DATE NOT NULL,
                driver_id INT DEFAULT NULL,
                vehicle_info VARCHAR(255) DEFAULT NULL,
                
                -- Route Optimization
                start_location VARCHAR(255) DEFAULT NULL,
                estimated_duration INT DEFAULT NULL,
                actual_duration INT DEFAULT NULL,
                total_distance DECIMAL(8,2) DEFAULT NULL,
                
                -- Route Status
                route_status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
                start_time DATETIME DEFAULT NULL,
                end_time DATETIME DEFAULT NULL,
                
                -- Cost Management
                fuel_cost DECIMAL(10,2) DEFAULT 0.00,
                driver_fee DECIMAL(10,2) DEFAULT 0.00,
                vehicle_maintenance_cost DECIMAL(10,2) DEFAULT 0.00,
                
                -- Notes and Comments
                route_notes TEXT DEFAULT NULL,
                completion_notes TEXT DEFAULT NULL,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Indexes
                INDEX idx_route_date (route_date),
                INDEX idx_route_status (route_status),
                INDEX idx_driver_id (driver_id)
            )
        `);
        console.log('✅ delivery_routes table created/verified');

        // 4. Create delivery_route_stops table
        console.log('Creating delivery_route_stops table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS delivery_route_stops (
                id INT AUTO_INCREMENT PRIMARY KEY,
                route_id INT NOT NULL,
                delivery_schedule_id INT NOT NULL,
                
                -- Stop Information
                stop_order INT NOT NULL,
                estimated_arrival_time DATETIME DEFAULT NULL,
                actual_arrival_time DATETIME DEFAULT NULL,
                estimated_duration INT DEFAULT 15,
                actual_duration INT DEFAULT NULL,
                
                -- Stop Status
                stop_status ENUM('pending', 'en_route', 'arrived', 'completed', 'failed') DEFAULT 'pending',
                delivery_attempt_count INT DEFAULT 0,
                
                -- Location Details
                stop_address TEXT NOT NULL,
                stop_coordinates VARCHAR(100) DEFAULT NULL,
                access_instructions TEXT DEFAULT NULL,
                
                -- Delivery Outcome
                delivery_success BOOLEAN DEFAULT NULL,
                failure_reason TEXT DEFAULT NULL,
                recipient_name VARCHAR(255) DEFAULT NULL,
                recipient_signature_path VARCHAR(500) DEFAULT NULL,
                delivery_photo_path VARCHAR(500) DEFAULT NULL,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Foreign Keys
                FOREIGN KEY (route_id) REFERENCES delivery_routes(id) ON DELETE CASCADE,
                FOREIGN KEY (delivery_schedule_id) REFERENCES delivery_schedules(id) ON DELETE CASCADE,
                
                -- Indexes
                INDEX idx_route_id (route_id),
                INDEX idx_delivery_schedule_id (delivery_schedule_id),
                INDEX idx_stop_order (route_id, stop_order),
                INDEX idx_stop_status (stop_status)
            )
        `);
        console.log('✅ delivery_route_stops table created/verified');

        // 5. Create delivery_calendar table
        console.log('Creating delivery_calendar table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS delivery_calendar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                calendar_date DATE NOT NULL UNIQUE,
                
                -- Availability Settings
                is_available BOOLEAN DEFAULT TRUE,
                max_deliveries INT DEFAULT 50,
                current_deliveries INT DEFAULT 0,
                
                -- Time Slot Management
                morning_slot_available BOOLEAN DEFAULT TRUE,
                afternoon_slot_available BOOLEAN DEFAULT TRUE,
                evening_slot_available BOOLEAN DEFAULT FALSE,
                
                -- Special Conditions
                is_holiday BOOLEAN DEFAULT FALSE,
                is_blackout_date BOOLEAN DEFAULT FALSE,
                special_notes TEXT DEFAULT NULL,
                
                -- Weather/External Factors
                weather_condition VARCHAR(100) DEFAULT NULL,
                delivery_conditions TEXT DEFAULT NULL,
                
                -- Admin Controls
                set_by_admin_id INT DEFAULT NULL,
                admin_notes TEXT DEFAULT NULL,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Indexes
                INDEX idx_calendar_date (calendar_date),
                INDEX idx_is_available (is_available),
                INDEX idx_is_blackout_date (is_blackout_date)
            )
        `);
        console.log('✅ delivery_calendar table created/verified');

        // 6. Create delivery_analytics table
        console.log('Creating delivery_analytics table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS delivery_analytics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                analytics_date DATE NOT NULL,
                
                -- Daily Metrics
                total_deliveries_scheduled INT DEFAULT 0,
                total_deliveries_completed INT DEFAULT 0,
                total_deliveries_failed INT DEFAULT 0,
                
                -- Performance Metrics
                average_delivery_time DECIMAL(5,2) DEFAULT NULL,
                on_time_delivery_rate DECIMAL(5,2) DEFAULT NULL,
                customer_satisfaction_score DECIMAL(3,2) DEFAULT NULL,
                
                -- Order Type Breakdown
                regular_orders_delivered INT DEFAULT 0,
                custom_orders_delivered INT DEFAULT 0,
                
                -- Financial Metrics
                total_delivery_revenue DECIMAL(12,2) DEFAULT 0.00,
                total_delivery_costs DECIMAL(12,2) DEFAULT 0.00,
                delivery_profit DECIMAL(12,2) DEFAULT 0.00,
                
                -- Geographic Distribution
                local_deliveries INT DEFAULT 0,
                regional_deliveries INT DEFAULT 0,
                express_deliveries INT DEFAULT 0,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Unique constraint
                UNIQUE KEY unique_analytics_date (analytics_date),
                
                -- Indexes
                INDEX idx_analytics_date (analytics_date)
            )
        `);
        console.log('✅ delivery_analytics table created/verified');

        // 7. Insert initial calendar data (next 90 days)
        console.log('Setting up initial delivery calendar data...');
        
        // First, create a sequence of numbers 0-89 for next 90 days
        const dates = [];
        for (let i = 0; i < 90; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            
            // Skip weekends (Saturday = 6, Sunday = 0)
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            dates.push([
                dateStr,
                !isWeekend, // is_available
                isWeekend ? 0 : 50, // max_deliveries
                0, // current_deliveries
                true, // morning_slot_available
                true, // afternoon_slot_available
                false, // evening_slot_available
                false, // is_holiday
                false, // is_blackout_date
                null, // special_notes
                null, // weather_condition
                null, // delivery_conditions
                null, // set_by_admin_id
                null  // admin_notes
            ]);
        }

        // Insert calendar data in batches to avoid SQL limits
        const batchSize = 20;
        for (let i = 0; i < dates.length; i += batchSize) {
            const batch = dates.slice(i, i + batchSize);
            const placeholders = batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
            
            await connection.execute(`
                INSERT IGNORE INTO delivery_calendar (
                    calendar_date, is_available, max_deliveries, current_deliveries,
                    morning_slot_available, afternoon_slot_available, evening_slot_available,
                    is_holiday, is_blackout_date, special_notes,
                    weather_condition, delivery_conditions, set_by_admin_id, admin_notes
                ) VALUES ${placeholders}
            `, batch.flat());
        }
        console.log('✅ Initial delivery calendar data inserted');

        // 8. Create some sample delivery schedules for testing
        console.log('Creating sample delivery schedules...');
          // Check if we have any users to use as customers
        const [users] = await connection.execute('SELECT user_id FROM users LIMIT 5');
        
        if (users.length > 0) {
            const sampleSchedules = [
                {
                    order_id: 1001,
                    order_type: 'regular',
                    customer_id: users[0].user_id,
                    delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
                    delivery_time_slot: '9:00-12:00',
                    delivery_address: '123 Main Street, Apt 4B',
                    delivery_city: 'Manila',
                    delivery_postal_code: '1000',
                    delivery_province: 'Metro Manila',
                    delivery_contact_phone: '+63-912-345-6789',
                    priority_level: 'normal',
                    delivery_fee: 150.00
                },                {
                    order_id: 1002,
                    order_type: 'custom',
                    customer_id: users[Math.min(1, users.length - 1)].user_id,
                    delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
                    delivery_time_slot: '1:00-5:00',
                    delivery_address: '456 Business Avenue, Floor 10',
                    delivery_city: 'Quezon City',
                    delivery_postal_code: '1100',
                    delivery_province: 'Metro Manila',
                    delivery_contact_phone: '+63-917-123-4567',
                    priority_level: 'high',
                    delivery_fee: 200.00
                }
            ];

            for (const schedule of sampleSchedules) {
                const tracking_number = `TN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                
                await connection.execute(`
                    INSERT INTO delivery_schedules (
                        order_id, order_type, customer_id, delivery_date, delivery_time_slot,
                        delivery_address, delivery_city, delivery_postal_code, delivery_province,
                        delivery_contact_phone, priority_level, delivery_fee, tracking_number,
                        delivery_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
                `, [
                    schedule.order_id, schedule.order_type, schedule.customer_id, 
                    schedule.delivery_date, schedule.delivery_time_slot,
                    schedule.delivery_address, schedule.delivery_city, 
                    schedule.delivery_postal_code, schedule.delivery_province,
                    schedule.delivery_contact_phone, schedule.priority_level, 
                    schedule.delivery_fee, tracking_number
                ]);
            }
            console.log('✅ Sample delivery schedules created');
        }

        console.log('\n🎉 Delivery management database setup completed successfully!');
        console.log('\nTables created:');
        console.log('- delivery_schedules (main delivery scheduling)');
        console.log('- delivery_items (individual items per delivery)');
        console.log('- delivery_routes (route optimization)');
        console.log('- delivery_route_stops (individual stops)');
        console.log('- delivery_calendar (calendar availability)');
        console.log('- delivery_analytics (performance metrics)');
        console.log('\nAPI endpoints available at:');
        console.log('- GET    /api/delivery/schedules');
        console.log('- POST   /api/delivery/schedules');
        console.log('- PUT    /api/delivery/schedules/:id');
        console.log('- DELETE /api/delivery/schedules/:id');
        console.log('- GET    /api/delivery/calendar');
        console.log('- POST   /api/delivery/calendar/unavailable');
        console.log('- GET    /api/delivery/analytics');

    } catch (error) {
        console.error('❌ Error setting up delivery database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Run the setup
setupDeliveryDatabase();
