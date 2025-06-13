# Product Maintenance System Documentation

## Overview

The Product Maintenance System allows administrators to manage the products in the Seven Four Clothing store. This includes adding new products, editing existing ones, uploading product images, managing stock levels, and tracking product changes over time.

## Features

1. **Product Management**
   - Add new products
   - Edit existing products
   - Archive (soft delete) products
   - Restore archived products
   - View product history/audit log

2. **Image Management**
   - Upload product images
   - Set primary product image
   - Manage multiple images per product

3. **Inventory Management**
   - Update stock status (in stock, low stock, out of stock)
   - Manage available sizes and colors

## Getting Started

### Database Setup

1. Run the product database initialization script:
   ```
   cd server/database
   init-product-db.bat
   ```

2. This will create all necessary tables for product management:
   - `products`: Main product information
   - `product_variants`: Product size and color variants with stock quantities
   - `product_sizes`: Available sizes for each product
   - `product_colors`: Available colors for each product
   - `product_images`: Product images with display order
   - `product_audit_log`: Log of all changes to products
   - `product_categories`: Product categories

### Accessing the Product Maintenance Page

1. Login as an administrator
2. Navigate to `/admin/products` or click "Product Maintenance" in the admin navigation panel

## Using the Product Maintenance Page

### Adding a New Product

1. Fill in the product form on the left side of the page
2. Required fields:
   - Product Name
   - Price
   - Category
3. Optional fields:
   - Description
   - Brand
   - Sizes
   - Colors
   - Status (Active/Inactive)
   - Featured flag
4. Click "Create Product"
5. Upload images if desired

### Editing a Product

1. Find the product in the table
2. Click the "Edit" button
3. Make changes to the product details
4. Click "Update Product"

### Managing Product Images

1. When adding or editing a product, you can upload images using the file input
2. Multiple images can be uploaded at once
3. The first image will be set as the primary product image by default
4. Images will be automatically resized and optimized

### Setting Stock Status

1. Edit the product
2. Change the "Status" dropdown to the appropriate value:
   - Active: Product is available for purchase
   - Inactive: Product is temporarily unavailable
3. Click "Update Product"

### Archiving and Restoring Products

1. To archive a product (soft delete), click the "Delete" button
2. To view archived products, check the "Show Archived Products" checkbox
3. To restore an archived product, find it in the list and click "Restore"

### Viewing Product History

1. Click the "History" button for any product
2. View a log of all changes made to the product
3. See who made each change and when

## Product Display

Products added through the maintenance page will automatically appear on the main product listing page if they are:

1. Active (status = 'active')
2. Not archived (is_archived = false)

## Technical Details

### Database Structure

- **Products Table**: Stores basic product information (name, description, price, etc.)
- **Product Variants**: Stores specific variations of products (size, color, stock quantity)
- **Product Images**: Stores image paths and display order
- **Audit Log**: Automatically tracks all product changes through database triggers

### API Endpoints

- `GET /api/products` - Get all active products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Archive a product (admin only)
- `POST /api/products/:id/restore` - Restore an archived product (admin only)
- `POST /api/products/:id/images` - Upload a product image (admin only)
- `GET /api/products/:id/audit-log` - Get product change history (admin only)
- `GET /api/products/categories` - Get all product categories

### Security

- All administrative product management endpoints require:
  1. Valid authentication (JWT token)
  2. Admin role permissions
- Image uploads are validated and sanitized
- All user inputs are validated on both client and server side
