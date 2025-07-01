const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/db');

// Enhanced get cart with strict user isolation
exports.getCart = async (req, res) => {
  try {
    console.log('=== ENHANCED GET CART DEBUG ===');
    console.log('Request User:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });
    console.log('Request headers authorization:', req.headers.authorization?.substring(0, 50) + '...');
    console.log('Request IP:', req.ip || req.connection.remoteAddress);
    console.log('Request User-Agent:', req.headers['user-agent']?.substring(0, 50) + '...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // CRITICAL: Double-verify the user exists and token is valid
    const [userVerification] = await connection.execute(
      'SELECT user_id, email, role FROM users WHERE user_id = ? AND is_active = 1',
      [req.user.id]
    );
    
    if (userVerification.length === 0) {
      console.error('❌ USER VERIFICATION FAILED - User not found or inactive');
      await connection.end();
      return res.status(401).json({
        success: false,
        message: 'User verification failed'
      });
    }
    
    const verifiedUser = userVerification[0];
    console.log('User verified:', verifiedUser);
    
    // Get or create user-specific cart with STRICT user ID check
    const [carts] = await connection.execute(
      'SELECT id, user_id FROM carts WHERE user_id = ?',
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
      
      // TRIPLE VERIFICATION: Ensure cart belongs to user
      if (carts[0].user_id !== req.user.id) {
        console.error('❌ CRITICAL: Cart ownership mismatch!');
        console.error('Cart user_id:', carts[0].user_id);
        console.error('Request user_id:', req.user.id);
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'Cart access denied - ownership verification failed'
        });
      }
    }
    
    // Get cart items with QUADRUPLE verification (cart_id, user_id, join verification)
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
        p.productimage as main_image,
        c.user_id as cart_owner_id,
        c.id as cart_id_verify
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.cart_id = ? AND c.user_id = ? AND c.id = ?
      ORDER BY ci.created_at DESC
    `, [cartId, req.user.id, cartId]);
    
    // FINAL VERIFICATION: Check each item belongs to correct user
    const invalidItems = cartItems.filter(item => item.cart_owner_id !== req.user.id);
    if (invalidItems.length > 0) {
      console.error('❌ CRITICAL: Found items with wrong ownership!');
      invalidItems.forEach(item => {
        console.error(`Item ${item.id}: Expected user ${req.user.id}, got ${item.cart_owner_id}`);
      });
      await connection.end();
      return res.status(500).json({
        success: false,
        message: 'Cart data integrity violation detected'
      });
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.productprice * item.quantity), 0);
    
    console.log(`✅ VERIFIED: Found ${cartItems.length} items in cart for user ${req.user.id}`);
    console.log('Cart items details:');
    cartItems.forEach((item, index) => {
      console.log(`  Item ${index + 1}: ${item.name}, Owner: ${item.cart_owner_id}, Cart: ${item.cart_id_verify}, Qty: ${item.quantity}`);
    });
    console.log('=== END GET CART DEBUG ===');
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        id: cartId,
        user_id: req.user.id,
        items: cartItems,
        total,
        item_count: cartItems.length,
        debug: {
          verified_user: verifiedUser.email,
          cart_owner_verification: 'passed'
        }
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
    console.log('=== ENHANCED ADD TO CART DEBUG ===');
    console.log('Request User:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });
    console.log('Product ID:', product_id);
    console.log('Color:', color);
    console.log('Size:', size);
    console.log('Quantity:', quantity);
    console.log('Request IP:', req.ip || req.connection.remoteAddress);
    
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
      console.log('Using existing cart ID:', cartId, 'for user:', req.user.id);
    }
    
    // CRITICAL: Verify cart ownership before proceeding
    const [cartOwnershipCheck] = await connection.execute(
      'SELECT user_id FROM carts WHERE id = ?',
      [cartId]
    );
    
    if (cartOwnershipCheck.length === 0 || cartOwnershipCheck[0].user_id !== req.user.id) {
      console.error('❌ CART OWNERSHIP MISMATCH IN ADD TO CART!');
      console.error('Cart ID:', cartId);
      console.error('Expected user:', req.user.id);
      console.error('Actual user:', cartOwnershipCheck[0]?.user_id);
      await connection.end();
      return res.status(403).json({
        success: false,
        message: 'Cart access denied - ownership mismatch'
      });
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
    
    // Validate and clean color value
    const cleanColor = (color && color.trim() !== '') ? color.trim() : '';
    const cleanSize = (size && size.trim() !== '') ? size.trim() : '';
    
    console.log(`Adding item with cleaned values: color="${cleanColor}", size="${cleanSize}"`);
    
    // If color and size are specified, verify the variant exists and has stock
    if (cleanColor && cleanSize) {
      const [variantCheck] = await connection.execute(`
        SELECT available_quantity 
        FROM product_variants 
        WHERE product_id = ? AND color = ? AND size = ?
      `, [product_id, cleanColor, cleanSize]);
      
      if (variantCheck.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: `The selected variant (${cleanColor} ${cleanSize}) is not available for this product`
        });
      }
      
      if (variantCheck[0].available_quantity < quantity) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${variantCheck[0].available_quantity} units available for ${cleanColor} ${cleanSize}`
        });
      }
      
      console.log(`✅ Variant ${cleanColor} ${cleanSize} has ${variantCheck[0].available_quantity} units available`);
    }
    
    // Check if item already exists in THIS user's cart
    const [existingItems] = await connection.execute(`
      SELECT ci.id, ci.quantity 
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.cart_id = ? AND ci.product_id = ? AND ci.color = ? AND ci.size = ? AND c.user_id = ?
    `, [cartId, product_id, cleanColor, cleanSize, req.user.id]);
    
    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await connection.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
      console.log('Updated existing cart item quantity to:', newQuantity, 'for user:', req.user.id);
    } else {
      // Add new item
      const [insertResult] = await connection.execute(
        'INSERT INTO cart_items (cart_id, product_id, quantity, color, size, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [cartId, product_id, quantity, cleanColor, cleanSize, product.productprice]
      );
      console.log('Added new item to cart ID:', cartId, 'for user:', req.user.id, 'Insert ID:', insertResult.insertId);
    }
    
    // Final verification - check what's actually in the cart now
    const [finalCartCheck] = await connection.execute(`
      SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        p.productname,
        c.user_id as cart_owner
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.cart_id = ? AND c.user_id = ?
    `, [cartId, req.user.id]);
    
    console.log('Final cart contents for user', req.user.id, ':');
    finalCartCheck.forEach((item, index) => {
      console.log(`  Item ${index + 1}: ${item.productname}, Qty: ${item.quantity}, Owner: ${item.cart_owner}`);
    });
    console.log('=== END ADD TO CART DEBUG ===');
    
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
