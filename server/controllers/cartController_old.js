const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

// Get the user's cart
exports.getCart = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if user has a cart
    const [carts] = await connection.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    let cartId;
    
    // If no cart exists, create one
    if (carts.length === 0) {
      const [result] = await connection.execute(
        'INSERT INTO carts (user_id) VALUES (?)',
        [req.user.id]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }
    
    // Get cart items with product details
    const [cartItems] = await connection.execute(`
      SELECT 
        ci.id, 
        ci.quantity, 
        ci.size,
        ci.color,
        p.product_id, 
        p.productname as name, 
        p.productprice as price, 
        p.productcolor,
        p.productimage as main_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = ?
    `, [cartId]);
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        id: cartId,
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  const { product_id, color, size, quantity = 1 } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Product ID is required' 
    });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get or create cart
    const [carts] = await connection.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    let cartId;
    
    if (carts.length === 0) {
      const [result] = await connection.execute(
        'INSERT INTO carts (user_id) VALUES (?)',
        [req.user.id]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }
    
    // Check if product exists
    const [products] = await connection.execute(
      'SELECT product_id, productname, productprice FROM products WHERE product_id = ?',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    const product = products[0];
    
    // Check if item already exists in cart
    const [existingItems] = await connection.execute(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND color = ? AND size = ?',
      [cartId, product_id, color || '', size || '']
    );
    
    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await connection.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // Add new item
      await connection.execute(
        'INSERT INTO cart_items (cart_id, product_id, quantity, color, size, price) VALUES (?, ?, ?, ?, ?, ?)',
        [cartId, product_id, quantity, color || '', size || '', product.productprice]
      );
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const { item_id, quantity } = req.body;
  
  if (!item_id || quantity < 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid item ID and quantity are required' 
    });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    if (quantity === 0) {
      // Remove item
      await connection.execute(
        'DELETE FROM cart_items WHERE id = ?',
        [item_id]
      );
    } else {
      // Update quantity
      await connection.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [quantity, item_id]
      );
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(
      'DELETE FROM cart_items WHERE id = ?',
      [itemId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get user's cart
    const [carts] = await connection.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    if (carts.length > 0) {
      await connection.execute(
        'DELETE FROM cart_items WHERE cart_id = ?',
        [carts[0].id]
      );
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
      [productId, size]
    );
    
    if (sizes.length === 0) {
      return res.status(400).json({ message: 'Invalid size for this product' });
    }
    
    const colorId = colors[0].id;
    const sizeId = sizes[0].id;
    
    // Check inventory
    const [inventory] = await pool.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND color_id = ? AND size_id = ?',
      [productId, colorId, sizeId]
    );
    
    if (inventory.length === 0 || inventory[0].quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Check if item already in cart
    const [existingItems] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND color_id = ? AND size_id = ?',
      [cartId, productId, colorId, sizeId]
    );
    
    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      
      // Check again against inventory
      if (newQuantity > inventory[0].quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
      
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, color_id, size_id, quantity) VALUES (?, ?, ?, ?, ?)',
        [cartId, productId, colorId, sizeId, quantity]
      );
    }
    
    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const { itemId, quantity } = req.body;
  
  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }
  
  try {
    // First verify the item belongs to the user's cart
    const [cartItems] = await pool.query(`
      SELECT ci.*, i.quantity as available_stock
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN inventory i ON 
        ci.product_id = i.product_id AND 
        ci.size_id = i.size_id AND 
        ci.color_id = i.color_id
      WHERE ci.id = ? AND c.user_id = ?
    `, [itemId, req.user.id]);
    
    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Check against inventory
    if (quantity > cartItems[0].available_stock) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Update quantity
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, itemId]
    );
    
    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  
  try {
    // Verify the item belongs to the user's cart
    const [cartItems] = await pool.query(`
      SELECT ci.*
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [itemId, req.user.id]);
    
    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Remove the item
    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    
    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    // Get user's cart
    const [carts] = await pool.query(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    if (carts.length === 0) {
      return res.json({ message: 'Cart is already empty' });
    }
    
    // Clear cart items
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

module.exports = {
  getCart: exports.getCart,
  addToCart: exports.addToCart,
  updateCartItem: exports.updateCartItem,
  removeFromCart: exports.removeFromCart,
  clearCart: exports.clearCart,
};
