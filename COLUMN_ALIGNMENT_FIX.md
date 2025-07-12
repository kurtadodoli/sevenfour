# Column Alignment Fix - Cancellation Requests Table

## Issue Fixed
The columns in the Cancellation Requests table were not properly aligned with the header columns.

## Root Cause
When the "reason" column was removed from the table rows, the Payment column was accidentally omitted from the row structure, causing misalignment with the header columns.

## Fix Applied
Added the missing "Payment Method" column to the table row structure in the Cancellation Requests table.

### Table Structure Now Properly Aligned:

**Header Columns:**
1. Expand/Collapse button (empty header)
2. Order #
3. Date
4. Customer
5. Products
6. Amount
7. Payment
8. Status
9. Delivery
10. Created
11. Actions

**Row Columns (now matching):**
1. ✅ Expand/Collapse button
2. ✅ Order # (with order type badge)
3. ✅ Date
4. ✅ Customer (name and email)
5. ✅ Products (name, size, color, quantity)
6. ✅ Amount (formatted currency)
7. ✅ **Payment Method** (shows "GCash") - **THIS WAS MISSING**
8. ✅ Status (with colored badge)
9. ✅ Delivery (with status badge)
10. ✅ Created (formatted date)
11. ✅ Actions (approve/reject buttons)

## Changes Made
```javascript
// Added Payment Method column between Amount and Status:
{/* Payment Method */}
<div style={{ 
  fontSize: '12px', 
  fontWeight: '500',
  color: '#666' 
}}>
  GCash
</div>
```

## Result
- ✅ All columns now properly align with their headers
- ✅ Table maintains consistent spacing and layout
- ✅ No compilation errors
- ✅ Payment method (GCash) is now visible for each cancellation request

The table should now display properly with all columns aligned correctly with their respective headers.
