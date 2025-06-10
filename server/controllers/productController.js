const { pool } = require('../config/db');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const ImageOptimizer = require('../utils/imageOptimizer');

// Get all active products
exports.getActiveProducts = async (req, res) => {
  try {
    let [products] = await pool.query(`
      SELECT p.*,
        GROUP_CONCAT(DISTINCT pc.color) as colors,
        GROUP_CONCAT(DISTINCT ps.size) as sizes,
        GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) as images
      FROM products p
      LEFT JOIN product_colors pc ON p.product_id = pc.product_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      WHERE p.is_archived = FALSE
      GROUP BY p.product_id
    `);

    products = products.map(product => ({
      ...product,
      colors: product.colors ? product.colors.split(',') : [],
      sizes: product.sizes ? product.sizes.split(',') : [],
      images: product.images ? product.images.split(',') : []
    }));

    res.json({ products });
  } catch (error) {
    console.error('Error fetching active products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all archived products
exports.getArchivedProducts = async (req, res) => {
  try {
    let [products] = await pool.query(`
      SELECT p.*,
        GROUP_CONCAT(DISTINCT pc.color) as colors,
        GROUP_CONCAT(DISTINCT ps.size) as sizes,
        GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) as images
      FROM products p
      LEFT JOIN product_colors pc ON p.product_id = pc.product_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      WHERE p.is_archived = TRUE
      GROUP BY p.product_id
    `);

    products = products.map(product => ({
      ...product,
      colors: product.colors ? product.colors.split(',') : [],
      sizes: product.sizes ? product.sizes.split(',') : [],
      images: product.images ? product.images.split(',') : []
    }));

    res.json({ products });
  } catch (error) {
    console.error('Error fetching archived products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single product by ID
exports.getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Get product details with related data
    const [products] = await pool.query(`
      SELECT p.*,
        GROUP_CONCAT(DISTINCT pc.color) as colors,
        GROUP_CONCAT(DISTINCT ps.size) as sizes,
        GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) as images
      FROM products p
      LEFT JOIN product_colors pc ON p.product_id = pc.product_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      WHERE p.product_id = ?
      GROUP BY p.product_id
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = {
      ...products[0],
      colors: products[0].colors ? products[0].colors.split(',') : [],
      sizes: products[0].sizes ? products[0].sizes.split(',') : [],
      images: products[0].images ? products[0].images.split(',') : []
    };

    // Get delivery schedule
    const [deliverySchedule] = await pool.query(
      'SELECT * FROM delivery_schedules WHERE product_id = ?',
      [id]
    );

    const fullProduct = {
      ...product,
      deliverySchedule: deliverySchedule[0] ? {
        ...deliverySchedule[0],
        availableRegions: JSON.parse(deliverySchedule[0].available_regions || '[]')
      } : {
        estimatedDays: 3,
        shippingCost: 0,
        availableRegions: []
      }
    };

    res.json(fullProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  const formData = req.body;
  const { 
    name, 
    price, 
    category, 
    description, 
    sizes,
    deliverySchedule
  } = typeof formData === 'string' ? JSON.parse(formData) : formData;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert product
    const [result] = await connection.query(
      'INSERT INTO products (name, price, category, description) VALUES (?, ?, ?, ?)',
      [name, price, category, description]
    );

    const productId = result.insertId;

    // Handle sizes
    if (sizes && sizes.length > 0) {
      const sizeValues = sizes.map(size => [productId, size]);
      await connection.query(
        'INSERT INTO product_sizes (product_id, size) VALUES ?',
        [sizeValues]
      );
    }

    // Handle images
    if (req.processedFiles && req.processedFiles.length > 0) {
      const imageValues = req.processedFiles.map((file, index) => [
        productId,
        `/uploads/${file.filename}`,
        index
      ]);

      await connection.query(
        'INSERT INTO product_images (product_id, image_url, display_order) VALUES ?',
        [imageValues]
      );
    }

    // Handle delivery schedule
    if (deliverySchedule) {
      const { estimatedDays, shippingCost, availableRegions } = deliverySchedule;
      await connection.query(
        'INSERT INTO delivery_schedules (product_id, estimated_days, shipping_cost, available_regions) VALUES (?, ?, ?, ?)',
        [productId, estimatedDays, shippingCost, JSON.stringify(availableRegions)]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Product created successfully', productId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  const { 
    name, 
    price, 
    category, 
    description, 
    sizes,
    deliverySchedule
  } = typeof formData === 'string' ? JSON.parse(formData) : formData;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Update product details
    await connection.query(
      'UPDATE products SET name = ?, price = ?, category = ?, description = ? WHERE product_id = ?',
      [name, price, category, description, id]
    );

    // Handle sizes (delete and re-insert)
    await connection.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
    if (sizes && sizes.length > 0) {
      const sizeValues = sizes.map(size => [id, size]);
      await connection.query(
        'INSERT INTO product_sizes (product_id, size) VALUES ?',
        [sizeValues]
      );
    }

    // Handle new images if any
    if (req.processedFiles && req.processedFiles.length > 0) {
      const [existingImages] = await connection.query(
        'SELECT display_order FROM product_images WHERE product_id = ? ORDER BY display_order DESC LIMIT 1',
        [id]
      );

      const startOrder = existingImages.length > 0 ? existingImages[0].display_order + 1 : 0;
      const imageValues = req.processedFiles.map((file, index) => [
        id,
        `/uploads/${file.filename}`,
        startOrder + index
      ]);

      await connection.query(
        'INSERT INTO product_images (product_id, image_url, display_order) VALUES ?',
        [imageValues]
      );
    }

    // Handle delivery schedule
    if (deliverySchedule) {
      const { estimatedDays, shippingCost, availableRegions } = deliverySchedule;
      await connection.query(`
        INSERT INTO delivery_schedules (product_id, estimated_days, shipping_cost, available_regions)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          estimated_days = VALUES(estimated_days),
          shipping_cost = VALUES(shipping_cost),
          available_regions = VALUES(available_regions)
      `, [id, estimatedDays, shippingCost, JSON.stringify(availableRegions)]);
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

// Archive a product
exports.archiveProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE products SET is_archived = TRUE WHERE product_id = ?',
      [id]
    );
    res.json({ message: 'Product archived successfully' });
  } catch (error) {
    console.error('Error archiving product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restore an archived product
exports.restoreProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE products SET is_archived = FALSE WHERE product_id = ?',
      [id]
    );
    res.json({ message: 'Product restored successfully' });
  } catch (error) {
    console.error('Error restoring product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery schedule
exports.updateDeliverySchedule = async (req, res) => {
  const { id } = req.params;
  const { estimatedDays, shippingCost, availableRegions } = req.body;

  try {
    await pool.query(`
      INSERT INTO delivery_schedules (product_id, estimated_days, shipping_cost, available_regions)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        estimated_days = VALUES(estimated_days),
        shipping_cost = VALUES(shipping_cost),
        available_regions = VALUES(available_regions)
    `, [id, estimatedDays, shippingCost, JSON.stringify(availableRegions)]);

    res.json({ message: 'Delivery schedule updated successfully' });
  } catch (error) {
    console.error('Error updating delivery schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get delivery schedule
exports.getDeliverySchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const [schedule] = await pool.query(
      'SELECT * FROM delivery_schedules WHERE product_id = ?',
      [id]
    );

    if (schedule.length === 0) {
      return res.json({
        estimatedDays: 3,
        shippingCost: 0,
        availableRegions: []
      });
    }

    const result = {
      ...schedule[0],
      availableRegions: JSON.parse(schedule[0].available_regions || '[]')
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching delivery schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload additional product images
exports.uploadImages = async (req, res) => {
  const { id } = req.params;
  if (!req.processedFiles || req.processedFiles.length === 0) {
    return res.status(400).json({ message: 'No images uploaded' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get max display order for this product
    const [maxOrder] = await connection.query(
      'SELECT MAX(display_order) as maxOrder FROM product_images WHERE product_id = ?',
      [id]
    );
    let startOrder = maxOrder[0].maxOrder || 0;

    // Insert each image
    const imageValues = req.processedFiles.map((file, index) => [
      id,
      `/uploads/${file.filename}`,
      startOrder + index + 1
    ]);

    await connection.query(
      'INSERT INTO product_images (product_id, image_url, display_order) VALUES ?',
      [imageValues]
    );

    await connection.commit();
    res.json({ message: 'Images uploaded successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Remove a product image
exports.removeImage = async (req, res) => {
  const { id, imageId } = req.params;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get image URL to delete file
    const [images] = await connection.query(
      'SELECT image_url FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, id]
    );

    if (images.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from database
    await connection.query(
      'DELETE FROM product_images WHERE id = ?',
      [imageId]
    );

    // Reorder remaining images
    await connection.query(`
      UPDATE product_images pi1
      JOIN (
        SELECT id, ROW_NUMBER() OVER (ORDER BY display_order) - 1 as new_order
        FROM product_images
        WHERE product_id = ?
      ) pi2 ON pi1.id = pi2.id
      SET pi1.display_order = pi2.new_order
    `, [id]);

    await connection.commit();

    // Delete file from disk
    const imagePath = images[0].image_url.replace('/uploads/', '');
    const fullPath = path.join(__dirname, '../public/uploads', imagePath);
    await fs.unlink(fullPath).catch(error => {
      console.error('Error deleting image file:', error);
    });

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error removing image:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Reorder product images
exports.reorderImages = async (req, res) => {
  const { id } = req.params;
  const { imageIds } = req.body;

  if (!Array.isArray(imageIds)) {
    return res.status(400).json({ message: 'Invalid image order data' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify all images belong to the product
    const [images] = await connection.query(
      'SELECT id FROM product_images WHERE product_id = ?',
      [id]
    );

    const productImageIds = images.map(img => img.id);
    const isValid = imageIds.every(id => productImageIds.includes(id));

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid image IDs' });
    }

    // Update display order for each image
    const updatePromises = imageIds.map((imageId, index) => {
      return connection.query(
        'UPDATE product_images SET display_order = ? WHERE id = ?',
        [index, imageId]
      );
    });

    await Promise.all(updatePromises);
    await connection.commit();
    
    res.json({ message: 'Image order updated successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error reordering images:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Backup products
exports.backupProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*,
        GROUP_CONCAT(DISTINCT pc.color) as colors,
        GROUP_CONCAT(DISTINCT ps.size) as sizes,
        GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) as images,
        ds.estimated_days,
        ds.shipping_cost,
        ds.available_regions
      FROM products p
      LEFT JOIN product_colors pc ON p.product_id = pc.product_id
      LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      LEFT JOIN delivery_schedules ds ON p.product_id = ds.product_id
      GROUP BY p.product_id
    `);

    const formattedProducts = products.map(product => ({
      ...product,
      colors: product.colors ? product.colors.split(',') : [],
      sizes: product.sizes ? product.sizes.split(',') : [],
      images: product.images ? product.images.split(',') : [],
      deliverySchedule: {
        estimatedDays: product.estimated_days || 3,
        shippingCost: product.shipping_cost || 0,
        availableRegions: product.available_regions ? JSON.parse(product.available_regions) : []
      }
    }));

    const backup = {
      date: new Date().toISOString(),
      products: formattedProducts
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=products-backup-${new Date().toISOString()}.json`);
    res.json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restore from backup
exports.restoreFromBackup = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No backup file provided' });
  }

  let connection;
  try {
    const backup = JSON.parse(req.file.buffer.toString());
    if (!backup.products || !Array.isArray(backup.products)) {
      return res.status(400).json({ message: 'Invalid backup file format' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Clear existing data
    await connection.query('DELETE FROM delivery_schedules');
    await connection.query('DELETE FROM product_images');
    await connection.query('DELETE FROM product_sizes');
    await connection.query('DELETE FROM product_colors');
    await connection.query('DELETE FROM products');

    // Restore products
    for (const product of backup.products) {
      const [result] = await connection.query(
        'INSERT INTO products SET ?',
        {
          product_id: product.product_id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          is_archived: product.is_archived
        }
      );

      // Restore sizes
      if (product.sizes && product.sizes.length > 0) {
        const sizeValues = product.sizes.map(size => [product.product_id, size]);
        await connection.query(
          'INSERT INTO product_sizes (product_id, size) VALUES ?',
          [sizeValues]
        );
      }

      // Restore colors
      if (product.colors && product.colors.length > 0) {
        const colorValues = product.colors.map(color => [product.product_id, color]);
        await connection.query(
          'INSERT INTO product_colors (product_id, color) VALUES ?',
          [colorValues]
        );
      }

      // Restore images
      if (product.images && product.images.length > 0) {
        const imageValues = product.images.map((url, index) => [
          product.product_id,
          url,
          index
        ]);
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES ?',
          [imageValues]
        );
      }

      // Restore delivery schedule
      if (product.deliverySchedule) {
        await connection.query(
          'INSERT INTO delivery_schedules SET ?',
          {
            product_id: product.product_id,
            estimated_days: product.deliverySchedule.estimatedDays,
            shipping_cost: product.deliverySchedule.shippingCost,
            available_regions: JSON.stringify(product.deliverySchedule.availableRegions)
          }
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error restoring backup:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};