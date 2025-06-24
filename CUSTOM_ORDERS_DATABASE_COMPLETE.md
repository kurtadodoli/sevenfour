# Custom Orders Database Implementation - Complete Guide

## Overview
This document outlines the complete database structure for storing all information submitted through the CustomPage.js form in the Seven Four Clothing custom design system.

## Database Schema

### 1. `custom_orders` Table
Stores all main order information from the CustomPage.js form.

```sql
CREATE TABLE custom_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) UNIQUE NOT NULL,  -- Generated order ID
    user_id BIGINT NULL,                          -- Links to users table (NULL for guests)
    
    -- STEP 1 & 3: Product Information
    product_type ENUM('t-shirts', 'shorts', 'hoodies', 'jackets', 'sweaters', 'jerseys') NOT NULL,
    product_name VARCHAR(255) NULL,               -- Custom product name from form
    size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL,
    color VARCHAR(50) NOT NULL,                   -- Base color selection
    quantity INT NOT NULL DEFAULT 1,
    urgency ENUM('standard', 'express', 'rush') DEFAULT 'standard',
    special_instructions TEXT NULL,               -- Special requirements/notes
    
    -- STEP 4: Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NULL,
    
    -- STEP 5: Shipping Address (Metro Manila Only)
    province VARCHAR(100) DEFAULT 'Metro Manila',
    municipality ENUM(
        'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
        'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
        'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
    ) NOT NULL,
    street_number VARCHAR(255) NOT NULL,          -- Complete street address
    house_number VARCHAR(100) NULL,               -- Unit/House number (optional)
    barangay VARCHAR(100) NULL,                   -- Barangay (optional)
    postal_code VARCHAR(20) NULL,                 -- Postal code (optional)
    
    -- Order Management
    status ENUM('pending', 'under_review', 'approved', 'in_production', 'ready_for_delivery', 'completed', 'cancelled') DEFAULT 'pending',
    estimated_price DECIMAL(10, 2) NOT NULL,     -- Calculated price (quantity × base price)
    final_price DECIMAL(10, 2) NULL,             -- Final agreed price
    admin_notes TEXT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. `custom_order_images` Table
Stores all uploaded design images (Step 2 of CustomPage.js).

```sql
CREATE TABLE custom_order_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,        -- Links to custom_orders.custom_order_id
    image_filename VARCHAR(255) NOT NULL,        -- Generated filename on server
    original_filename VARCHAR(255) NOT NULL,     -- Original filename from user
    image_path VARCHAR(500) NOT NULL,            -- Full file path on server
    image_url VARCHAR(500) NULL,                 -- Public URL (if applicable)
    image_size INT NULL,                         -- File size in bytes
    mime_type VARCHAR(50) NULL,                  -- Image MIME type (jpeg, png, etc.)
    upload_order INT DEFAULT 0,                  -- Order of upload (1-10)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE
);
```

## CustomPage.js Form Mapping

### Form Steps → Database Fields

**Step 1: Product Selection**
- `selectedProduct` → `product_type`
- Product pricing → `estimated_price` calculation

**Step 2: Design Upload**
- `uploadedImages` → `custom_order_images` table entries
- File metadata → `image_size`, `mime_type`, `original_filename`

**Step 3: Product Customization**
- `formData.productName` → `product_name`
- `formData.size` → `size`
- `formData.color` → `color`
- `formData.quantity` → `quantity`
- `formData.specialInstructions` → `special_instructions`

**Step 4: Customer Information**
- `formData.customerName` → `customer_name`
- `formData.email` → `customer_email`
- `formData.phone` → `customer_phone`

**Step 5: Shipping Information**
- `formData.province` → `province` (always "Metro Manila")
- `formData.city` → `municipality`
- `formData.streetAddress` → `street_number`
- `formData.houseNumber` → `house_number`
- `formData.barangay` → `barangay`
- `formData.postalCode` → `postal_code`

## API Endpoint

### POST `/api/custom-orders`
**File:** `server/routes/custom-orders.js`

**Request Format:**
```javascript
// Form data (multipart/form-data)
{
  // Product details
  productType: 't-shirts',
  productName: 'My Custom Shirt',
  size: 'L',
  color: 'Black',
  quantity: 2,
  specialInstructions: 'Print logo on front',
  
  // Customer info
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '09123456789',
  
  // Shipping
  province: 'Metro Manila',
  municipality: 'Manila',
  streetNumber: '123 Rizal Street',
  houseNumber: 'Unit 4B',
  barangay: 'Ermita',
  postalCode: '1000',
  
  // Files
  images: [File, File, ...] // Up to 10 images
}
```

**Response Format:**
```javascript
{
  "success": true,
  "message": "Custom order submitted successfully",
  "customOrderId": "CUSTOM-MC7VB4WW-I6O66",
  "orderId": 4,
  "estimatedPrice": 2100,
  "imagesUploaded": 2
}
```

## Pricing Logic

```javascript
const basePrice = {
  't-shirts': 1050,
  'shorts': 850,
  'hoodies': 1600,
  'jackets': 1800,
  'sweaters': 1400,
  'jerseys': 1000
};

estimatedPrice = basePrice[productType] * quantity;
```

## File Upload Handling

**Storage Location:** `server/uploads/custom-orders/`
**File Naming:** `{fieldname}-{timestamp}-{random}.{ext}`
**Limits:** 
- Max 10 files per order
- Max 10MB per file
- Allowed types: JPEG, JPG, PNG, GIF, WEBP

## Database Relationships

```
users (user_id) ← custom_orders (user_id) ← custom_order_images (custom_order_id)
     1:∞                    1:∞
```

## Indexes for Performance

```sql
-- custom_orders table
INDEX idx_custom_order_id (custom_order_id)
INDEX idx_user_id (user_id)
INDEX idx_status (status)
INDEX idx_product_type (product_type)
INDEX idx_customer_email (customer_email)
INDEX idx_created_at (created_at)
INDEX idx_municipality (municipality)
INDEX idx_product_name (product_name)

-- custom_order_images table
INDEX idx_custom_order_id (custom_order_id)
INDEX idx_upload_order (upload_order)
INDEX idx_created_at (created_at)
```

## Sample Queries

### Get Complete Order Information
```sql
SELECT 
    co.*,
    COUNT(coi.id) as image_count,
    GROUP_CONCAT(coi.original_filename) as image_files
FROM custom_orders co
LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
WHERE co.custom_order_id = 'CUSTOM-12345'
GROUP BY co.id;
```

### Get Orders by Status
```sql
SELECT custom_order_id, product_name, customer_name, estimated_price, created_at
FROM custom_orders 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Get Customer Order History
```sql
SELECT custom_order_id, product_name, status, estimated_price, created_at
FROM custom_orders 
WHERE customer_email = 'customer@example.com'
ORDER BY created_at DESC;
```

## Testing

Run the test script to verify data storage:
```bash
node test-custom-order-storage.js
```

## Files

- **Database Creation:** `server/sql/complete_custom_orders_database.sql`
- **Setup Script:** `setup-custom-orders-database.js`
- **API Route:** `server/routes/custom-orders.js`
- **Frontend Component:** `client/src/pages/CustomPage.js`
- **Test Script:** `test-custom-order-storage.js`

## Status

✅ **COMPLETE** - All CustomPage.js form data is successfully stored in the database with proper relationships, validation, and file handling.
