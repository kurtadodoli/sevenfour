# MANUAL FIX INSTRUCTIONS
## For "Field 'customer_fullname' doesn't have a default value" Error

### STEP 1: Fix Database Schema
1. **Start MySQL Service:**
   ```cmd
   net start mysql
   # or
   net start mysql80
   ```

2. **Connect to MySQL and fix the schema:**
   ```cmd
   mysql -u root -p
   # Enter password: s3v3n-f0ur-cl0thing*
   ```

3. **Run these SQL commands:**
   ```sql
   USE seven_four_clothing;
   DESCRIBE orders;
   ALTER TABLE orders ADD COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer';
   -- If column already exists:
   ALTER TABLE orders MODIFY COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer';
   DESCRIBE orders;
   exit;
   ```

### STEP 2: Restart Server
1. **Stop current server** (if running)
2. **Start server:**
   ```cmd
   cd c:\sfc\server
   npm start
   ```

### STEP 3: Test Order Creation
1. **Refresh browser** (clear cache: Ctrl+Shift+R)
2. **Try creating an order**
3. **Check server logs** for any remaining errors

---

## ALTERNATIVE: Quick Database Fix (If MySQL Command Line Doesn't Work)

### Using MySQL Workbench:
1. Open MySQL Workbench
2. Connect to local server (root / s3v3n-f0ur-cl0thing*)
3. Open SQL Editor
4. Run:
   ```sql
   USE seven_four_clothing;
   ALTER TABLE orders ADD COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer';
   ```

### Using phpMyAdmin (if installed):
1. Open phpMyAdmin in browser
2. Select `seven_four_clothing` database
3. Click on `orders` table
4. Go to "Structure" tab
5. Click "Add column"
6. Name: `customer_fullname`
7. Type: `VARCHAR(255)`
8. Default: `Guest Customer`
9. Allow NULL: Yes
10. Save

---

## WHAT THE FIX DOES:
- ✅ Adds missing `customer_fullname` column to orders table
- ✅ Sets a default value so INSERTs won't fail
- ✅ Frontend already sends the field
- ✅ Backend already handles the field
- ✅ Fallback logic now handles missing database column

---

## IF STILL NOT WORKING:
1. Check server logs for exact error message
2. Verify database connection in server/.env
3. Ensure you restarted the server after the fix
4. Try with a fresh browser session (incognito mode)

The backend code now has robust fallback handling, so even if the database column doesn't exist, it will retry the INSERT without the customer_fullname field and then attempt to add it afterward.
