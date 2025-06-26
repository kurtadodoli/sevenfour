# Seven Four Clothing - Server Setup Instructions

## 🚀 Quick Start Guide

### 1. Start the Backend Server

**Option A: Using Command Prompt**
```cmd
cd c:\sfc\server
node app.js
```

**Option B: Using PowerShell**
```powershell
Set-Location c:\sfc\server
node app.js
```

**Option C: Using Batch File**
Double-click or run: `c:\sfc\start-backend-server.bat`

### 2. Verify Server is Running

You should see output like:
```
🚀 Server running on port 5000
📊 Frontend should connect to: http://localhost:5000
✅ Server initialization complete
```

### 3. Test the API Endpoints

**Option A: Run Comprehensive Test**
```cmd
cd c:\sfc
node comprehensive-test.js
```

**Option B: Test Individual Endpoints**
- Open browser: http://localhost:5000/api/test
- Open browser: http://localhost:5000/api/couriers
- Run: `node c:\sfc\test-api.js`

### 4. Start the Frontend (React)

**In a new terminal:**
```cmd
cd c:\sfc\client
npm start
```

The frontend should start on http://localhost:3000

## 🔧 Configuration Status

### Backend Configuration ✅
- ✅ Server configured for port 5000
- ✅ CORS enabled for localhost:3000
- ✅ Database connection configured
- ✅ Courier API endpoints implemented
- ✅ All routes properly mounted

### Frontend Configuration ✅  
- ✅ API configured to use http://localhost:5000
- ✅ Courier management components created
- ✅ Delivery scheduling with courier assignment
- ✅ Error handling and loading states

### Database Configuration ✅
- ✅ Courier table created
- ✅ Foreign key added to delivery_schedules
- ✅ Sample courier data available

## 📊 Available API Endpoints

### Courier Management
- `GET /api/couriers` - Get all couriers
- `GET /api/couriers?status=active` - Get active couriers only
- `POST /api/couriers` - Create new courier
- `PUT /api/couriers/:id` - Update courier
- `DELETE /api/couriers/:id` - Delete courier

### Other Important Endpoints
- `GET /api/test` - Test server connectivity
- `GET /api/products` - Get products
- `GET /api/orders` - Get orders
- `GET /api/delivery` - Get delivery schedules

## 🐛 Troubleshooting

### Server Won't Start
1. Check if Node.js is installed: `node --version`
2. Check if port 5000 is available: `netstat -an | findstr 5000`
3. Kill any existing Node processes: `taskkill /f /im node.exe`
4. Navigate to server directory: `cd c:\sfc\server`
5. Install dependencies: `npm install`

### API Connection Issues
1. Verify server is running on port 5000
2. Check browser console for CORS errors
3. Test endpoints manually: http://localhost:5000/api/test
4. Run test script: `node c:\sfc\comprehensive-test.js`

### Database Issues
1. Verify MySQL is running
2. Check database credentials in `c:\sfc\server\.env`
3. Run courier table creation: `node c:\sfc\create_courier_table.js`

## 📁 Key Files Modified

### Backend Files
- `c:\sfc\server\app.js` - Main server configuration
- `c:\sfc\server\.env` - Environment variables (port 5000)
- `c:\sfc\server\routes\couriers.js` - Courier API routes
- `c:\sfc\server\config\database.js` - Database configuration

### Frontend Files
- `c:\sfc\client\src\utils\api.js` - API configuration (port 5000)
- `c:\sfc\client\src\components\CourierModal.js` - Courier form
- `c:\sfc\client\src\components\CourierManagement.js` - Courier CRUD UI
- `c:\sfc\client\src\pages\DeliveryPage.js` - Delivery scheduling with courier assignment

### Test Files
- `c:\sfc\comprehensive-test.js` - Complete API testing
- `c:\sfc\test-api.js` - Simple courier API test
- `c:\sfc\start-backend-server.bat` - Server startup script

## 🎯 Next Steps

1. **Start the server** using one of the methods above
2. **Run the comprehensive test** to verify all endpoints work
3. **Start the frontend** and test the UI
4. **Test courier management** - create/edit/delete couriers
5. **Test delivery scheduling** - assign couriers to deliveries
6. **Verify end-to-end functionality** in the browser

## ✅ Success Indicators

- Server starts without errors
- API test returns courier data
- Frontend loads without connection errors
- Courier management UI works
- Deliveries can be assigned to couriers

The courier management system is now fully implemented and configured!
