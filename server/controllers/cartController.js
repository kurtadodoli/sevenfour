const { pool } = require('../config/db.js');

// Get the user's cart
exports.getCart = async (req, res) => {
  try {
    // Check if user has a cart
    const [carts] = await pool.query(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    let cartId;
    
    // If no cart exists, create one
    if (carts.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO carts (user_id) VALUES (?)',
        [req.user.id]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }
    
    // Get cart items with product details
    const [cartItems] = await pool.query(`
      SELECT 
        ci.id, 
        ci.quantity, 
        p.product_id, 
        p.name, 
        p.price, 
        pc.color, 
        ps.size,
        pi.image_url as main_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      JOIN product_colors pc ON ci.color_id = pc.id
      JOIN product_sizes ps ON ci.size_id = ps.id
      LEFT JOIN (
        SELECT product_id, MIN(image_url) as image_url 
        FROM product_images 
        GROUP BY product_id
      ) pi ON p.product_id = pi.product_id
      WHERE ci.cart_id = ?
    `, [cartId]);
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      id: cartId,
      items: cartItems,
      total
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  const { productId, color, size, quantity = 1 } = req.body;
  
  if (!productId || !color || !size) {
    return res.status(400).json({ message: 'Product ID, color, and size are required' });
  }
  
  try {
    // Get or create cart
    const [carts] = await pool.query(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    let cartId;
    
    if (carts.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO carts (user_id) VALUES (?)',
        [req.user.id]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }
    
    // Get color and size IDs
    const [colors] = await pool.query(
      'SELECT id FROM product_colors WHERE product_id = ? AND color = ?',
      [productId, color]
    );
    
    if (colors.length === 0) {
      return res.status(400).json({ message: 'Invalid color for this product' });
    }
    
    const [sizes] = await pool.query(
      'SELECT id FROM product_sizes WHERE product_id = ? AND size = ?',
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
