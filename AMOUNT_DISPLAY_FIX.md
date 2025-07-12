# Fixed Amount Display Issue in Cancellation Requests

## Issue
All cancellation requests were showing ₱0.00 as the amount instead of the actual order amount.

## Root Cause
The code was looking for `request.amount` but the actual field name in the cancellation request data might be different (like `total_amount`, `order_total`, or `invoice_total`).

## Solution Applied
Updated the amount display logic to check multiple possible field names for the amount:

```javascript
// Before (showing ₱0.00):
{formatCurrency(request.amount || 0)}

// After (checking multiple field names):
{formatCurrency(request.total_amount || request.amount || request.order_total || request.invoice_total || 0)}
```

## Changes Made

### 1. Main Table Amount Display
- Updated the amount column in the cancellation requests table
- Now checks: `total_amount` → `amount` → `order_total` → `invoice_total` → `0`

### 2. Expanded Row Amount Display  
- Updated the amount display in the expanded row details
- Uses the same fallback logic as the main table

### 3. Enhanced Debug Logging
- Added more comprehensive logging to see what fields are actually available
- Logs: `total_amount`, `amount`, `order_total`, `invoice_total`, and all available fields

## Testing
To verify the fix:
1. Navigate to Transaction Management → Cancellation Requests
2. Check that the Amount column now shows actual order amounts instead of ₱0.00
3. Expand a row to see the amount is also correct in the details section
4. Check the browser console for debug logs showing the actual field names

## Expected Result
- ✅ Amount column shows actual order amounts (e.g., ₱500.00, ₱1,200.00)
- ✅ Expanded row details show correct amounts
- ✅ Debug logs show which field name is being used for each request
- ✅ No compilation errors
- ✅ Fallback to ₱0.00 only if no amount fields are available

## Build Status
✅ **SUCCESS** - Application builds without errors, only ESLint warnings for unused variables.

The fix handles multiple possible field names for the amount, ensuring that the correct order amount is displayed regardless of how the backend structures the cancellation request data.
