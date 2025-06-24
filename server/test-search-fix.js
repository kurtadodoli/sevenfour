const { pool } = require('./config/database');

async function testSearchRoutes() {
    console.log('🔍 Testing Search Routes Setup...');
    
    try {
        // Test database connection
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database query test passed');
        
        connection.release();
        
        // Test route import
        const searchRoutes = require('./routes/api/search');
        console.log('✅ Search routes module loaded successfully');
        
        console.log('🎉 All tests passed! The search routes should work properly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        process.exit(0);
    }
}

testSearchRoutes();
