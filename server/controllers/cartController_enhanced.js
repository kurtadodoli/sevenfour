const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

// Enhanced get cart with strict user isolation
exports.getCart = async (req, res) => {
  try {
    console.log('=== ENHANCED GET CART ===');
    console.log('User ID:', req.user.id);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Get or create user-specific cart
    const [carts] = await connection.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    let cartId;
    
    if (carts.length === 0) {
      // Create new cart for user
      const [result] = await connection.execute(
        'INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
        [req.user.id]
      );
      cartId = result.insertId;
      console.log('Created new cart ID:', cartId, 'for user:', req.user.id);
    } else {
      cartId = carts[0].id;
      console.log('Using existing cart ID:', cartId, 'for user:', req.user.id);
    }
    
    // Get cart items with user verification
    const [cartItems] = await connection.execute(`
      SELECT 
        ci.id, 
        ci.quantity, 
        ci.size,
        ci.color,
        ci.price,
        p.product_id, 
        p.productname as name, 
        p.productprice,
        p.productcolor,
        p.productimage as main_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.cart_id = ? AND c.user_id = ?
      ORDER BY ci.created_at DESC
    `, [cartId, req.user.id]);
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.productprice * item.quantity), 0);
    
    console.log(`Found ${cartItems.length} items in cart for user ${req.user.id}`);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        id: cartId,
        user_id: req.user.id,
        items: cartItems,
        total,
        item_count: cartItems.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch cart' 
    });
  }
};

// Enhanced add to cart with user isolation
exports.addToCart = async (req, res) => {
  const { product_id, color, size, quantity = 1 } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Product ID is required' 
    });
  }
  
  try {
    console.log('=== ENHANCED ADD TO CART ===');
    console.log('User ID:', req.user.id);
    console.log('Product ID:', product_id);
    console.log('Quantity:', quantity);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Get or create user-specific cart
    const [carts] = await connection.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    let cartId;
    
    if (carts.length === 0) {
      const [result] = await connection.execute(
        'INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
        [req.user.id]
      );
      cartId = result.insertId;
      console.log('Created new cart ID:', cartId, 'for user:', req.user.id);
    } else {
      cartId = carts[0].id;
    }
    
    // Verify product exists
    const [products] = await connection.execute(
      'SELECT product_id, productname, productprice FROM products WHERE product_id = ? AND status = "active"',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Product not found or inactive' 
      });
    }
    
    const product = products[0];
    
    // Check if item already exists in THIS user's cart
    const [existingItems] = await connection.execute(`
      SELECT ci.id, ci.quantity 
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.cart_id = ? AND ci.product_id = ? AND ci.color = ? AND ci.size = ? AND c.user_id = ?
    `, [cartId, product_id, color || '', size || '', req.user.id]);
    
    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await connection.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
      console.log('Updated existing cart item quantity to:', newQuantity);
    } else {
      // Add new item
      await connection.execute(
        'INSERT INTO cart_items (cart_id, product_id, quantity, color, size, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [cartId, product_id, quantity, color || '', size || '', product.productprice]
      );
      console.log('Added new item to cart');
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
      message: 'Failed to add item to cart' 
    });
  }
};

// Enhanced update cart item with user verification
exports.updateCartItem = async (req, res) => {
  const { item_id, quantity } = req.body;
  
  if (!item_id || quantity < 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid item ID and quantity are required' 
    });
  }
  
  try {
    console.log('=== ENHANCED UPDATE CART ITEM ===');
    console.log('User ID:', req.user.id);
    console.log('Item ID:', item_id);
    console.log('New Quantity:', quantity);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Verify the item belongs to the user's cart
    const [verification] = await connection.execute(`
      SELECT ci.id 
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [item_id, req.user.id]);
    
    if (verification.length === 0) {
      await connection.end();
      return res.status(403).json({
        success: false,
        message: 'Cart item not found or access denied'
      });
    }
    
    if (quantity === 0) {
      // Remove item
      await connection.execute(
        'DELETE FROM cart_items WHERE id = ?',
        [item_id]
      );
      console.log('Removed cart item');
    } else {
      // Update quantity
      await connection.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [quantity, item_id]
      );
      console.log('Updated cart item quantity to:', quantity);
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
      message: 'Failed to update cart item' 
    });
  }
};

// Enhanced remove from cart with user verification
exports.removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  
  try {
    console.log('=== ENHANCED REMOVE FROM CART ===');
    console.log('User ID:', req.user.id);
    console.log('Item ID:', itemId);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Verify the item belongs to the user's cart before removing
    const [verification] = await connection.execute(`
      SELECT ci.id 
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [itemId, req.user.id]);
    
    if (verification.length === 0) {
      await connection.end();
      return res.status(403).json({
        success: false,
        message: 'Cart item not found or access denied'
      });
    }
    
    await connection.execute(
      'DELETE FROM cart_items WHERE id = ?',
      [itemId]
    );
    
    console.log('Removed cart item successfully');
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove item from cart' 
    });
  }
};

// Enhanced clear cart with user verification
exports.clearCart = async (req, res) => {
  try {
    console.log('=== ENHANCED CLEAR CART ===');
    console.log('User ID:', req.user.id);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Get user's cart
    const [carts] = await connection.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [req.user.id]
    );
    
    if (carts.length > 0) {
      // Clear only THIS user's cart items
      await connection.execute(
        'DELETE FROM cart_items WHERE cart_id = ?',
        [carts[0].id]
      );
      console.log(`Cleared cart ${carts[0].id} for user ${req.user.id}`);
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
      message: 'Failed to clear cart' 
    });
  }
};
