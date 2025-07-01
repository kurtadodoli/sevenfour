# Custom Design Requests Debug Guide

## Current Situation
The Custom Design Requests tab is showing empty even though we've added the fetch functionality. Let's debug this step by step.

## Step 1: Open Browser Developer Tools
1. Open the TransactionPage in your browser
2. Press F12 to open Developer Tools
3. Go to the **Console** tab

## Step 2: Check Authentication
In the Console, run these commands one by one:

```javascript
// Check if user is logged in
localStorage.getItem('token')

// Check user info
localStorage.getItem('user')

// Parse user info
JSON.parse(localStorage.getItem('user') || '{}')
```

## Step 3: Click on Custom Design Requests Tab
1. Click on the "Custom Design Requests" tab
2. Watch the Console for debug messages that should appear:
   - `🔍 useEffect for design-requests triggered`
   - `✅ Active tab is design-requests, calling fetchCustomDesignRequests`
   - `🔄 Fetching custom design requests...`

## Step 4: Look for Debug Information
The page now shows a debug information box with:
- Current Tab
- Requests State (number of items)
- Loading status
- Search Term
- Token Available
- User info

## Step 5: Use Debug Test Button
Click the red "🧪 Debug Test" button to manually trigger the API call and see detailed logs.

## Step 6: Test API Directly
Copy and paste this code into the Console:

```javascript
// Test the API directly
async function testAPI() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/custom-orders/admin/all', {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log('API Response:', data);
    return data;
}

testAPI();
```

## Step 7: Check Network Tab
1. Go to the **Network** tab in Developer Tools
2. Click the Custom Design Requests tab again
3. Look for a request to `/api/custom-orders/admin/all`
4. Click on it to see:
   - Request headers (should include Authorization)
   - Response status (should be 200)
   - Response data

## Expected Console Output
If everything is working, you should see:
```
🔍 useEffect for design-requests triggered {activeTab: "design-requests"}
✅ Active tab is design-requests, calling fetchCustomDesignRequests
🔄 Fetching custom design requests...
📋 Raw API response: {data: {...}, status: 200}
✅ Custom design requests fetched successfully
📊 Data count: 5
📄 Raw data: [Array of 5 orders]
✅ State updated with 5 requests
🏁 fetchCustomDesignRequests completed
```

## Common Issues and Solutions

### Issue 1: No Authentication Token
**Symptoms:** Console shows "Token Available: No"
**Solution:** Log out and log back in as an admin user

### Issue 2: 401 Unauthorized
**Symptoms:** API returns 401 status
**Solution:** Token might be expired, log out and log back in

### Issue 3: 403 Forbidden
**Symptoms:** API returns 403 status
**Solution:** User doesn't have admin privileges

### Issue 4: useEffect Not Triggering
**Symptoms:** No debug messages when clicking tab
**Solution:** React might have cached the component, hard refresh (Ctrl+F5)

### Issue 5: API Call Succeeds but No Display
**Symptoms:** Console shows success but UI is empty
**Solution:** Check if filtering is working correctly

## Report Back
Please run through these steps and share:
1. The console output when clicking the Custom Design Requests tab
2. Any error messages
3. What the debug information box shows
4. The Network tab request/response details

This will help me identify exactly where the issue is occurring.
