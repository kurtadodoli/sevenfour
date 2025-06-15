#!/bin/bash
# Initialize Product Database Tables
# This script ensures all product-related tables exist and are populated with default data

echo "Initializing product database..."

# Run the product schema script
mysql -u root -p seven_four_clothing < ../database/product_schema.sql

echo "Product database initialization complete!"
echo "Product tables created:"
echo "- products"
echo "- product_variants"  
echo "- product_sizes"
echo "- product_colors"
echo "- product_images"
echo "- product_audit_log"
echo "- product_categories"
echo ""
echo "Default categories added:"
echo "- T-Shirts"
echo "- Hoodies"
echo "- Shorts"
echo "- Jackets"
echo "- Accessories"
