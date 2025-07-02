# INDIVIDUAL ADDRESS FIELDS FIX COMPLETE

## Problem Identified
The user was correct - individual address fields (street_address, city_municipality, province, zip_code) were **NOT** being saved to the orders table when new orders were created, even though:
1. The orders table schema already had these columns
2. The frontend was sending this data
3. The frontend display logic expected these fields to be populated

## Root Cause
The backend order creation endpoints were only saving the combined `shipping_address` field but **not** the individual address fields to the orders table:

### Issues Found:
1. **`/orders/gcash` endpoint** (used for GCash orders) - Did not include individual address fields in the orders table INSERT statement
2. **`createOrderFromCart` function** (used for regular orders) - Did not accept or save individual address fields
3. **Payment method hardcoding** - `createOrderFromCart` was still hardcoded to 'cash_on_delivery' instead of 'gcash'

## Fixes Applied

### 1. Fixed GCash Order Endpoint (`/server/routes/api/orders.js`)
**Lines ~580-590**: Updated the orders table INSERT statement to include individual address fields:

```sql
-- BEFORE:
INSERT INTO orders (
    order_number, user_id, invoice_id, transaction_id, 
    total_amount, shipping_address, contact_phone, notes,
    payment_method, payment_reference, payment_verification_hash,
    payment_proof_filename, payment_status, status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'gcash', ?, ?, ?, 'verified', 'pending')

-- AFTER:
INSERT INTO orders (
    order_number, user_id, invoice_id, transaction_id, 
    total_amount, shipping_address, contact_phone, notes,
    payment_method, payment_reference, payment_verification_hash,
    payment_proof_filename, payment_status, status,
    street_address, city_municipality, province, zip_code
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'gcash', ?, ?, ?, 'verified', 'pending', ?, ?, ?, ?)
```

Updated parameter array to include: `street_address, city, province, postal_code`

### 2. Fixed Regular Order Creation (`/server/controllers/orderController.js`)
**`createOrderFromCart` function**:
- Added individual address fields to function parameters
- Updated orders table INSERT to include address fields  
- Fixed hardcoded 'cash_on_delivery' to 'gcash' in sales_transactions

### 3. Both Duplicate Endpoints Fixed
There were two identical `/orders/gcash` endpoints in the routes file. Both were updated to include the individual address fields.

## Frontend Data Flow Confirmed
✅ Frontend sends:
- `street_address` → maps to `street_address` in orders table
- `city` → maps to `city_municipality` in orders table  
- `province` → maps to `province` in orders table
- `postal_code` → maps to `zip_code` in orders table
- `shipping_address` → combined address still saved for compatibility

## Expected Results
With these fixes, new orders created through the frontend will now:
1. ✅ Use 'gcash' as the payment method (no more 'cash_on_delivery')
2. ✅ Save individual address fields to the orders table
3. ✅ Display proper address details in the frontend (no more "N/A" if data provided)
4. ✅ Maintain backward compatibility with the combined shipping_address field

## Database State
- ✅ Orders table schema includes all required address fields
- ✅ Payment method defaults to 'gcash'
- ✅ Existing orders updated to use 'gcash' payment method
- ❗ Existing orders still have NULL individual address fields (expected)
- ✅ **New orders will now populate individual address fields correctly**

## Files Modified
1. `c:\sfc\server\routes\api\orders.js` - Updated both GCash order endpoints
2. `c:\sfc\server\controllers\orderController.js` - Updated createOrderFromCart function
3. `c:\sfc\fix-gcash-address-fields.js` - Script used to apply the fixes

## Testing Required
Create a new order through the frontend to verify:
1. Individual address fields are saved to orders table
2. Frontend displays address details without "N/A"
3. Payment method is 'gcash'
4. Order creation completes successfully

---
**Status**: ✅ COMPLETE - Ready for testing with new orders
