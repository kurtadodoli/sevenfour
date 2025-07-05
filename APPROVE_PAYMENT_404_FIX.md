# Approve Payment 404 Error Fix

## Problem
The frontend was receiving 404 errors when trying to approve payments through these endpoints:
- `PUT /api/orders/ORD17516767720582673/approve-payment`
- `PUT /api/orders/ORD17516763384212997/approve-payment`

## Root Cause
The backend `approve-payment` endpoints were expecting numeric order IDs (like `1`, `2`, `3`) but the frontend was sending order numbers (like `ORD17516767720582673`). This caused a mismatch where the backend couldn't find orders by the wrong identifier type.

## Solution
Updated the backend order approval endpoints to handle both order IDs (numeric) and order numbers (strings):

### Files Modified
- `c:\sfc\server\routes\api\orders.js`

### Endpoints Fixed
1. `PUT /:orderId/approve-payment` (line ~819)
2. `PUT /:id/approve-payment` (line ~1069) 
3. `PUT /:orderId/deny-payment` (line ~946)

### Changes Made

#### Before (problematic code):
```javascript
// Only handled numeric IDs
const [orderCheck] = await connection.execute(`
    SELECT id, status, total_amount, user_id
    FROM orders 
    WHERE id = ? AND status = 'pending'
`, [orderId]);
```

#### After (fixed code):
```javascript
// Handle both order numbers and numeric IDs
let orderCheck;
if (isNaN(parseInt(orderIdOrNumber))) {
    // It's an order number (string)
    [orderCheck] = await connection.execute(`
        SELECT id, order_number, status, total_amount, user_id
        FROM orders 
        WHERE order_number = ? AND status = 'pending'
    `, [orderIdOrNumber]);
} else {
    // It's a numeric order ID
    [orderCheck] = await connection.execute(`
        SELECT id, order_number, status, total_amount, user_id
        FROM orders 
        WHERE id = ? AND status = 'pending'
    `, [parseInt(orderIdOrNumber)]);
}

const order = orderCheck[0];
const orderId = order.id; // Use the actual numeric ID for database operations
```

### Key Improvements
1. **Flexible Parameter Handling**: Endpoints now accept both numeric order IDs and string order numbers
2. **Automatic Detection**: Uses `isNaN(parseInt())` to determine if the parameter is a number or string
3. **Consistent Internal Usage**: Always converts to numeric order ID for internal database operations
4. **Better Logging**: Updated log messages to show "Order ID/Number" for clarity

### Expected Result
- Frontend calls like `PUT /api/orders/ORD17516767720582673/approve-payment` will now work correctly
- Backend will find the order by order number and process the approval
- No more 404 errors for payment approval/denial operations

### Testing
The fix should resolve the following frontend errors:
- `Failed to load resource: the server responded with a status of 404 (Not Found)`
- `❌ Error approving payment: Object`

Date: July 5, 2025
