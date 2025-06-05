const express = require('express');
const router = express.Router();

// In-memory storage
let products = [];
let nextId = 1;

// Get all products
router.get('/', (req, res) => {
    res.json(products);
});

// Add new product
router.post('/', (req, res) => {
    try {
        const { name, description, price, sizes, stock } = req.body;

        const newProduct = {
            id: nextId++,
            name,
            description,
            price: parseFloat(price),
            sizes: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()),
            stock: parseInt(stock)
        };

        products.push(newProduct);
        
        res.status(201).json({
            success: true,
            product: newProduct
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to add product'
        });
    }
});

module.exports = router;

/*
In your MySQL database
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sizes JSON,
    stock INT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/