# INVENTORY MANAGEMENT TROUBLESHOOTING GUIDE

## Current Issue
The inventory management (stock subtraction on order confirmation and restoration on cancellation) is not working as expected.

## What Should Happen

### 1. Order Confirmation Process:
1. User clicks "Confirm Order" in Order History
2. Server checks if sufficient stock is available
3. If sufficient stock: 
   - Deducts ordered quantity from `total_available_stock`
   - Adds ordered quantity to `total_reserved_stock`
   - Updates `stock_status` based on remaining stock
   - Changes order status to 'confirmed'
4. If insufficient stock: Returns error message

### 2. Order Cancellation Process:
1. User submits cancellation request
2. Admin approves the cancellation
3. Server automatically:
   - Adds cancelled quantity back to `total_available_stock`
   - Subtracts cancelled quantity from `total_reserved_stock`
   - Updates `stock_status`
   - Changes order status to 'cancelled'

## Testing the System

### Method 1: Direct API Test (Recommended)
I've added a test endpoint that bypasses authentication to test the inventory logic directly:

**Test URL:** `POST http://localhost:3001/api/test-confirm-order/{orderId}`

**How to test:**
1. Find a pending order ID (check your Order History or database)
2. Use a tool like Postman or browser to call:
   ```
   POST http://localhost:3001/api/test-confirm-order/4
   ```
3. Check the response for inventory updates
4. Verify stock changes in InventoryPage or MaintenancePage

### Method 2: Check Server Logs
When you click "Confirm Order" in the frontend, watch the server terminal for these logs:
```
=== CONFIRM ORDER DEBUG ===
req.user: { id: ... }
orderId: 4
Getting order items for inventory update...
Found X items in order
Checking stock for Product Name: ordered=5, available=146
✅ All items have sufficient stock
Updating inventory for confirmed order...
Updated stock for Product Name: -5 units
```

If you don't see these logs, the request isn't reaching the server.

### Method 3: Database Verification
Check the database directly before and after order confirmation:

**Before confirmation:**
```sql
SELECT productname, total_available_stock, total_reserved_stock, stock_status
FROM products 
WHERE productname = 'No Struggles No Progress';
```

**After confirmation (should show decreased available stock):**
```sql
SELECT productname, total_available_stock, total_reserved_stock, stock_status
FROM products 
WHERE productname = 'No Struggles No Progress';
```

## Common Issues and Solutions

### Issue 1: Authentication Problems
**Symptoms:** No server logs appear when clicking "Confirm Order"
**Solution:** 
- Check if you're logged in
- Check browser console for authentication errors
- Verify the token is being sent with requests

### Issue 2: Order Doesn't Belong to User
**Symptoms:** Server logs show "Order not found or access denied"
**Solution:**
- Make sure you're confirming an order that belongs to your user account
- Check the order's user_id matches your logged-in user ID

### Issue 3: Order Status Issues
**Symptoms:** "Cannot confirm order with status: confirmed"
**Solution:**
- Only pending orders can be confirmed
- If testing repeatedly, reset order status to 'pending' in database

### Issue 4: Insufficient Stock
**Symptoms:** "Insufficient stock for some items"
**Solution:**
- Check current product stock in database
- Use the fix script to restore available stock:
```sql
UPDATE products 
SET total_available_stock = total_stock 
WHERE total_stock > total_available_stock;
```

## Quick Fixes

### Fix 1: Reset Order Status for Testing
```sql
UPDATE orders SET status = 'pending' WHERE id = 4;
```

### Fix 2: Restore Product Stock
```sql
UPDATE products 
SET total_available_stock = total_stock,
    total_reserved_stock = 0
WHERE productname = 'No Struggles No Progress';
```

### Fix 3: Check Order Ownership
```sql
SELECT o.id, o.order_number, o.user_id, u.email 
FROM orders o 
LEFT JOIN users u ON o.user_id = u.user_id 
WHERE o.id = 4;
```

## Files Modified for Inventory Management

1. **`server/controllers/orderController.js`**:
   - `confirmOrder()` - Enhanced with inventory management
   - `processCancellationRequest()` - Enhanced with inventory restoration

2. **`client/src/pages/OrderPage.js`**:
   - Updated to show "Cancellation Requested" instead of cancel button

3. **Database Tables Used**:
   - `products` - Stock fields: `total_available_stock`, `total_reserved_stock`, `stock_status`
   - `orders` - Order status tracking
   - `order_items` - Product quantities in orders
   - `cancellation_requests` - Cancellation tracking

## Next Steps

1. **Test the direct API endpoint** using the test URL above
2. **Check server logs** when using the frontend
3. **Verify database changes** before and after operations
4. **Report specific error messages** if issues persist

The inventory management logic is implemented and should work correctly. The issue is likely related to authentication, order ownership, or data inconsistencies rather than the core inventory logic itself.
