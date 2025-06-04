const { pool } = require('../config/db');

// Get all products with optional filtering
exports.getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = `
      SELECT p.*, 
      GROUP_CONCAT(DISTINCT pc.color) as colors,
      GROUP_CONCAT(DISTINCT ps.size) as sizes,
      MIN(pi.image_url) as main_image
      FROM products p
      LEFT JOIN product_colors pc ON p.product_id = pc.product_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (category || search) {
      query += ' WHERE ';
      const conditions = [];
      
      if (category && category !== 'all') {
        conditions.push('p.category = ?');
        queryParams.push(category);
      }
      
      if (search) {
        conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`);
      }
      
      query += conditions.join(' AND ');
    }
    
    query += ' GROUP BY p.product_id';
    
    const [products] = await pool.query(query, queryParams);
    
    // Process the results to convert string lists to arrays
    const processedProducts = products.map(product => ({
      ...product,
      colors: product.colors ? product.colors.split(',') : [],
      sizes: product.sizes ? product.sizes.split(',') : []
    }));
    
    res.json(processedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product details
    const [products] = await pool.query(
      'SELECT * FROM products WHERE product_id = ?',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    
    // Get product colors
    const [colors] = await pool.query(
      'SELECT color FROM product_colors WHERE product_id = ?',
      [id]
    );
    
    // Get product sizes
    const [sizes] = await pool.query(
      'SELECT size FROM product_sizes WHERE product_id = ?',
      [id]
    );
    
    // Get product images
    const [images] = await pool.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order',
      [id]
    );
    
    // Get inventory availability
    const [inventory] = await pool.query(`
      SELECT pc.color, ps.size, i.quantity 
      FROM inventory i
      JOIN product_colors pc ON i.color_id = pc.id
      JOIN product_sizes ps ON i.size_id = ps.id
      WHERE i.product_id = ?
    `, [id]);
    
    // Construct the full product object
    const fullProduct = {
      ...product,
      colors: colors.map(c => c.color),
      sizes: sizes.map(s => s.size),
      images: images.map(img => img.image_url),
      inventory: inventory
    };
    
    res.json(fullProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Create a new product
exports.createProduct = async (req, res) => {
  const { 
    product_id, 
    name, 
    price, 
    category, 
    description, 
    colors, 
    sizes, 
    images 
  } = req.body;
  
  // Start a transaction to ensure data consistency
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Insert product
    await connection.query(
      'INSERT INTO products (product_id, name, price, category, description) VALUES (?, ?, ?, ?, ?)',
      [product_id, name, price, category, description]
    );
    
    // Insert colors
    if (colors && colors.length > 0) {
      for (const color of colors) {
        await connection.query(
          'INSERT INTO product_colors (product_id, color) VALUES (?, ?)',
          [product_id, color]
        );
      }
    }
    
    // Insert sizes
    if (sizes && sizes.length > 0) {
      for (const size of sizes) {
        await connection.query(
          'INSERT INTO product_sizes (product_id, size) VALUES (?, ?)',
          [product_id, size]
        );
      }
    }
    
    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
          [product_id, images[i], i]
        );
      }
    }
    
    // Create inventory entries for each size/color combination with default quantity of 0
    const [colorRows] = await connection.query('SELECT id FROM product_colors WHERE product_id = ?', [product_id]);
    const [sizeRows] = await connection.query('SELECT id FROM product_sizes WHERE product_id = ?', [product_id]);
    
    for (const colorRow of colorRows) {
      for (const sizeRow of sizeRows) {
        await connection.query(
          'INSERT INTO inventory (product_id, color_id, size_id, quantity, critical_level) VALUES (?, ?, ?, ?, ?)',
          [product_id, colorRow.id, sizeRow.id, 0, 5]
        );
      }
    }
    
    await connection.commit();
    
    res.status(201).json({ message: 'Product created successfully', product_id });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Admin: Update a product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    price, 
    category, 
    description, 
    colors, 
    sizes, 
    images 
  } = req.body;
  
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Update product details
    await connection.query(
      'UPDATE products SET name = ?, price = ?, category = ?, description = ? WHERE product_id = ?',
      [name, price, category, description, id]
    );
    
    // Handle colors (delete and re-insert)
    if (colors && colors.length > 0) {
      await connection.query('DELETE FROM product_colors WHERE product_id = ?', [id]);
      for (const color of colors) {
        await connection.query(
          'INSERT INTO product_colors (product_id, color) VALUES (?, ?)',
          [id, color]
        );
      }
    }
    
    // Handle sizes (delete and re-insert)
    if (sizes && sizes.length > 0) {
      await connection.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
      for (const size of sizes) {
        await connection.query(
          'INSERT INTO product_sizes (product_id, size) VALUES (?, ?)',
          [id, size]
        );
      }
    }
    
    // Handle images (delete and re-insert)
    if (images && images.length > 0) {
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
          [id, images[i], i]
        );
      }
    }
    
    await connection.commit();
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Admin: Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Due to ON DELETE CASCADE, this will delete all related records in 
    // product_colors, product_sizes, product_images, and inventory tables
    const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};