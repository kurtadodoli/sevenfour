// server/models/Product.js
const db = require('../config/db');

class Product {
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM products');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(productData) {
    try {
      const { name, description, price, category, image_url } = productData;
      const [result] = await db.execute(
        'INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, category, image_url]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const { name, description, price, category, image_url } = productData;
      const [result] = await db.execute(
        'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE id = ?',
        [name, description, price, category, image_url, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;