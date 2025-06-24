# Inventory Loading Issue - Quick Fix Guide

## The Problem
InventoryPage shows "Failed to Load Inventory" because the server is not running.

## Quick Fix Steps

### 1. Start the Server
Open a new Command Prompt or PowerShell as Administrator and run:

```bash
cd c:\sevenfour
npm run server
```

**Alternative methods:**
```bash
# Method 1: Using npm
cd c:\sevenfour
npm run server

# Method 2: Direct node command
cd c:\sevenfour
node server/app.js

# Method 3: Using the batch file
double-click start-server.bat
```

### 2. Verify Server is Running
You should see output like:
```
✅ Server is running on port 5000
🔗 http://localhost:5000
```

### 3. Test the API Endpoint
Open your browser and go to:
```
http://localhost:5000/api/inventory/overview-test
```

You should see JSON data with product information.

### 4. Refresh the InventoryPage
Go back to your browser with the InventoryPage and click "Try Again" or refresh the page.

## Troubleshooting

### If server won't start:
1. Check if another process is using port 5000:
   ```bash
   netstat -ano | findstr :5000
   ```

2. If port is in use, kill the process:
   ```bash
   taskkill /PID [process_id] /F
   ```

3. Try starting on a different port:
   ```bash
   set PORT=5001
   npm run server
   ```

### If API returns errors:
1. Check database connection (MySQL should be running)
2. Verify database credentials in server/.env
3. Run the diagnostic script:
   ```bash
   node diagnose-inventory-issue.js
   ```

### If frontend still shows errors:
1. Restart the React client:
   ```bash
   cd c:\sevenfour\client
   npm start
   ```

2. Clear browser cache and refresh

3. Check browser console for specific error messages

## Expected Results
After starting the server, the InventoryPage should display:
- Product names and stock levels
- Size breakdowns for each product  
- Correct total inventory counts
- Data matching the MaintenancePage

## Files to Check
- ✅ Server: `server/app.js` 
- ✅ API Routes: `server/routes/api/inventory.js`
- ✅ Controller: `server/controllers/inventoryController.js`
- ✅ Client Config: `client/.env` (should have `REACT_APP_API_URL=http://localhost:5000`)

The inventory system is properly configured - it just needs the server to be running! 🚀
