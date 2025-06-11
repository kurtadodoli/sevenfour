const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Test database connection
app.get('/health', async (req, res) => {
    const isConnected = await testConnection();
    res.json({ 
        status: isConnected ? 'healthy' : 'unhealthy',
        database: isConnected ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection before starting server
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Failed to connect to database. Server will not start.');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🔗 http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Server failed to start:', error);
        process.exit(1);
    }
};

startServer();