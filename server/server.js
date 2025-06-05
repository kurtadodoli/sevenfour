require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/products', productsRoutes);

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});