# Custom Orders Database Structure

## Overview
The custom orders system stores all information submitted through the CustomPage.js component across multiple related tables for optimal data organization and retrieval.

## Database Tables

### 1. `custom_orders` (Main Order Information)

Stores all the primary order details from the CustomPage.js form:

```sql
CREATE TABLE custom_orders (
    -- Primary Keys & IDs
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NULL,  -- Links to users table (NULL for guest orders)
    
    -- Product Information (from Step 1 & 3)
    product_type ENUM('t-shirts','shorts','hoodies','jackets','sweaters','jerseys') NOT NULL,
    product_name VARCHAR(255) NULL,  -- Custom product name from user input
    size VARCHAR(10) NOT NULL,       -- XS, S, M, L, XL, XXL, XXXL
    color VARCHAR(50) NOT NULL,      -- Selected base color
    quantity INT NOT NULL DEFAULT 1,
    urgency ENUM('standard','express','rush') DEFAULT 'standard',
    special_instructions TEXT,       -- Special requirements/notes
    
    -- Customer Information (from Step 4)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    
    -- Shipping Address (from Step 5)
    province VARCHAR(100) NOT NULL,           -- Always "Metro Manila"
    municipality VARCHAR(100) NOT NULL,       -- Selected city
    street_number VARCHAR(255) NOT NULL,      -- Complete street address
    house_number VARCHAR(100),               -- Optional house/unit number
    barangay VARCHAR(100),                   -- Optional barangay
    postal_code VARCHAR(20),                 -- Optional postal code
    
    -- Order Management
    status ENUM(
        'pending','under_review','approved','in_production',
        'quality_check','ready_for_shipping','shipped','delivered','cancelled'
    ) DEFAULT 'pending',
    estimated_price DECIMAL(10,2) DEFAULT 0.00,    -- Auto-calculated price
    final_price DECIMAL(10,2) DEFAULT 0.00,        -- Admin can adjust
    payment_status ENUM('pending','paid','refunded') DEFAULT 'pending',
    payment_method ENUM('cash_on_delivery','online_payment') DEFAULT 'cash_on_delivery',
    
    -- Admin & Production Management
    admin_notes TEXT,                    -- Admin communication
    production_notes TEXT,               -- Production team notes
    estimated_delivery_date DATE,        -- Expected delivery
    actual_delivery_date DATE,           -- Actual delivery date
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for Performance
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_product_type (product_type),
    INDEX idx_product_name (product_name),
    INDEX idx_created_at (created_at),
    INDEX idx_customer_email (customer_email),
    
    -- Foreign Key Constraints
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
```

### 2. `custom_order_images` (Design Images from Step 2)

Stores all uploaded design images with metadata:

```sql
CREATE TABLE custom_order_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,    -- Links to custom_orders
    image_filename VARCHAR(255) NOT NULL,    -- Server-generated filename
    original_filename VARCHAR(255) NOT NULL, -- User's original filename
    image_path VARCHAR(500) NOT NULL,        -- Server file path
    image_url VARCHAR(500),                  -- Public URL for access
    image_size INT,                          -- File size in bytes
    mime_type VARCHAR(50),                   -- Image type (jpeg, png, etc.)
    upload_order INT DEFAULT 0,              -- Display order (1-10)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes and Constraints
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_upload_order (upload_order),
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE
);
```

### 3. `custom_order_status_history` (Order Tracking)

Tracks all status changes and updates:

```sql
CREATE TABLE custom_order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT,                       -- Admin user who made the change
    change_reason TEXT,                      -- Reason for status change
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL
);
```

### 4. `custom_order_communications` (Admin-Customer Communication)

Stores communication between admin and customers:

```sql
CREATE TABLE custom_order_communications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,
    sender_type ENUM('admin','customer') NOT NULL,
    sender_id BIGINT,                        -- User ID of sender
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL
);
```

## Data Flow from CustomPage.js

### Step 1: Product Selection
- `product_type` → Stores selected product type (t-shirts, shorts, etc.)
- `estimated_price` → Auto-calculated based on product type and quantity

### Step 2: Design Upload (up to 10 images)
- Each image creates a record in `custom_order_images`
- `image_filename` → Server-generated unique filename
- `original_filename` → User's original filename
- `image_path` → Server storage path
- `image_size` → File size validation
- `mime_type` → Image type validation
- `upload_order` → Display sequence

### Step 3: Product Customization
- `product_name` → Custom product name input
- `size` → Selected size (XS-XXXL)
- `color` → Selected base color
- `quantity` → Number of items (affects pricing)
- `special_instructions` → Additional requirements

### Step 4: Customer Information
- `customer_name` → Full name
- `customer_email` → Email address
- `customer_phone` → Phone number
- `user_id` → Linked if user is logged in

### Step 5: Shipping Information
- `province` → Always "Metro Manila"
- `municipality` → Selected Metro Manila city
- `street_number` → Complete street address
- `house_number` → Optional unit/house number
- `barangay` → Optional barangay
- `postal_code` → Optional postal code

## Automatic Fields

### System Generated
- `custom_order_id` → Unique order identifier (e.g., "CUSTOM-ABC123-XYZ789")
- `created_at` → Submission timestamp
- `updated_at` → Last modification timestamp
- `status` → Defaults to "pending"
- `payment_status` → Defaults to "pending"
- `payment_method` → Defaults to "cash_on_delivery"

### Price Calculation
- `estimated_price` → Calculated as: base_price × quantity
  - T-Shirts: ₱1,050
  - Shorts: ₱850
  - Hoodies: ₱1,600
  - Jerseys: ₱1,000
  - Jackets: ₱1,800
  - Sweaters: ₱1,400

## Query Examples

### Get Complete Order with Images
```sql
SELECT 
    co.*,
    GROUP_CONCAT(
        JSON_OBJECT(
            'filename', coi.image_filename,
            'original_name', coi.original_filename,
            'order', coi.upload_order
        ) ORDER BY coi.upload_order
    ) as images
FROM custom_orders co
LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
WHERE co.custom_order_id = 'CUSTOM-ABC123-XYZ789'
GROUP BY co.id;
```

### Get Orders by User
```sql
SELECT * FROM custom_orders 
WHERE user_id = 123 
ORDER BY created_at DESC;
```

### Get Orders by Email (for guest users)
```sql
SELECT * FROM custom_orders 
WHERE customer_email = 'user@example.com' 
ORDER BY created_at DESC;
```

### Admin Dashboard - Pending Orders
```sql
SELECT 
    co.custom_order_id,
    co.customer_name,
    co.product_type,
    co.product_name,
    co.estimated_price,
    co.created_at,
    COUNT(coi.id) as image_count
FROM custom_orders co
LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
WHERE co.status = 'pending'
GROUP BY co.id
ORDER BY co.created_at ASC;
```

## Security Features

### Data Protection
- User authentication via JWT tokens (optional)
- Email validation and sanitization
- File type and size validation for images
- SQL injection prevention via parameterized queries
- XSS protection on text inputs

### Privacy
- Guest orders supported (user_id can be NULL)
- Personal data linked to user accounts when logged in
- Secure file storage for design images
- Admin-only access to sensitive information

## File Storage

### Image Storage Location
- Path: `server/uploads/custom-orders/`
- Naming: `images-{timestamp}-{random}-{extension}`
- Max size: 10MB per file
- Supported types: JPG, PNG, GIF, WebP
- Max files: 10 per order

### Image Access
- Public URL format: `http://localhost:3001/uploads/custom-orders/{filename}`
- Access control can be implemented for sensitive designs
- Automatic cleanup for cancelled orders (optional)

This comprehensive database structure captures every piece of information from your CustomPage.js component and provides a solid foundation for order management, customer service, and business analytics.
