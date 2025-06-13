// server/models/Product.js
const { query } = require('../config/db');

class Product {
  static async getAll(includeArchived = false) {
    try {
      let sql = `
        SELECT p.*,
          GROUP_CONCAT(DISTINCT pc.color) as colors,
          GROUP_CONCAT(DISTINCT ps.size) as sizes,
          GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) as images
        FROM products p
        LEFT JOIN product_colors pc ON p.product_id = pc.product_id
        LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id
      `;

      if (!includeArchived) {
        sql += ` WHERE p.is_archived = FALSE`;
      }

      sql += ` GROUP BY p.product_id`;

      const products = await query(sql);
      
      // Convert comma-separated strings to arrays
      return products.map(product => ({
        ...product,
        colors: product.colors ? product.colors.split(',') : [],
        sizes: product.sizes ? product.sizes.split(',') : [],
        images: product.images ? product.images.split(',') : []
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [product] = await query(
        `SELECT p.*,
          GROUP_CONCAT(DISTINCT pc.color) as colors,
          GROUP_CONCAT(DISTINCT ps.size) as sizes, 
          GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) as images
        FROM products p
        LEFT JOIN product_colors pc ON p.product_id = pc.product_id
        LEFT JOIN product_sizes ps ON p.product_id = ps.product_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id
        WHERE p.product_id = ?
        GROUP BY p.product_id`,
        [id]
      );

      if (!product) return null;

      // Convert comma-separated strings to arrays
      return {
        ...product,
        colors: product.colors ? product.colors.split(',') : [],
        sizes: product.sizes ? product.sizes.split(',') : [],
        images: product.images ? product.images.split(',') : []
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(productData, userId) {
    try {
      const { 
        name, description, price, category, brand, 
        status = 'active', is_featured = false 
      } = productData;
      
      const [result] = await query(
        `INSERT INTO products 
          (name, description, price, category, brand, status, is_featured, created_by, updated_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,        [name, description, price, category, brand, status, is_featured, userId, userId]
      );
      
      const productId = result.insertId;
      return { product_id: productId, name, description, price, category, brand, status, is_featured };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, productData, userId) {
    try {
      const { name, description, price, category, brand, status, is_featured } = productData;
      
      await query(
        `UPDATE products SET 
          name = ?, 
          description = ?, 
          price = ?, 
          category = ?, 
          brand = ?,
          status = ?,
          is_featured = ?,
          updated_by = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?`,
        [name, description, price, category, brand, status, is_featured, userId, id]
      );
      
      return { product_id: id, ...productData };
    } catch (error) {
      throw error;
    }
  }
  static async delete(id, userId) {
    try {
      // Soft delete - set is_archived to true
      await query(
        'UPDATE products SET is_archived = TRUE, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?', 
        [userId, id]
      );      return { product_id: id, is_archived: true };
    } catch (error) {
      throw error;
    }
  }
  
  static async restore(id, userId) {
    try {
      // Restore - set is_archived to false
      await query(
        'UPDATE products SET is_archived = FALSE, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?', 
        [userId, id]
      );
      return { product_id: id, is_archived: false };
    } catch (error) {
      throw error;
    }
  }
  
  static async updateStock(id, stockStatus, userId) {
    try {
      await query(
        'UPDATE products SET stock_status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
        [stockStatus, userId, id]
      );
      return { product_id: id, stock_status: stockStatus };
    } catch (error) {
      throw error;
    }
  }
  
  static async addImage(productId, imageUrl, isPrimary = false, displayOrder = 0) {
    try {
      // If this is primary, unset any existing primary
      if (isPrimary) {
        await query(
          'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
          [productId]
        );
      }
      
      const [result] = await query(
        'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
        [productId, imageUrl, isPrimary, displayOrder]
      );
      
      return { image_id: result.insertId, product_id: productId, image_url: imageUrl, is_primary: isPrimary };
    } catch (error) {
      throw error;
    }
  }
  
  static async updateProductSizes(productId, sizes) {
    try {
      // Delete existing sizes
      await query('DELETE FROM product_sizes WHERE product_id = ?', [productId]);
      
      // Add new sizes
      if (sizes && sizes.length > 0) {
        const values = sizes.map(size => [productId, size]);
        await query(
          'INSERT INTO product_sizes (product_id, size) VALUES ?',
          [values]
        );
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async updateProductColors(productId, colors) {
    try {
      // Delete existing colors
      await query('DELETE FROM product_colors WHERE product_id = ?', [productId]);
      
      // Add new colors
      if (colors && colors.length > 0) {
        const values = colors.map(color => [productId, color]);
        await query(
          'INSERT INTO product_colors (product_id, color) VALUES ?',
          [values]
        );
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async getAuditLog(productId) {
    try {
      const logs = await query(`
        SELECT al.*, u.first_name, u.last_name, u.email
        FROM product_audit_log al
        LEFT JOIN users u ON al.user_id = u.user_id
        WHERE al.product_id = ?
        ORDER BY al.created_at DESC
      `, [productId]);
      
      return logs;
    } catch (error) {
      throw error;
    }
  }
  
  static async getAllCategories() {
    try {
      return await query('SELECT * FROM product_categories ORDER BY category_name');
    } catch (error) {
      throw error;
    }
  }

  static async getArchived() {
    try {
      let sql = `
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
      `;

      const products = await query(sql);
      
      // Convert comma-separated strings to arrays
      return products.map(product => ({
        ...product,
        colors: product.colors ? product.colors.split(',') : [],
        sizes: product.sizes ? product.sizes.split(',') : [],
        images: product.images ? product.images.split(',') : []
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;