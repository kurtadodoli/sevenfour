const { pool } = require('../config/db');

// Get all inventory with product info
exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await pool.query(`
      SELECT 
        i.id, 
        p.product_id, 
        p.name as product_name, 
        p.category,
        pc.color, 
        ps.size, 
        i.quantity, 
        i.critical_level
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN product_colors pc ON i.color_id = pc.id
      JOIN product_sizes ps ON i.size_id = ps.id
      ORDER BY p.name, pc.color, ps.size
    `);
    
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get low stock items (for staff/admin alerts)
exports.getLowStock = async (req, res) => {
  try {
    const [lowStock] = await pool.query(`
      SELECT 
        i.id, 
        p.product_id, 
        p.name as product_name, 
        p.category,
        pc.color, 
        ps.size, 
        i.quantity, 
        i.critical_level
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN product_colors pc ON i.color_id = pc.id
      JOIN product_sizes ps ON i.size_id = ps.id
      WHERE i.quantity <= i.critical_level
      ORDER BY p.name, pc.color, ps.size
    `);
    
    res.json(lowStock);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update inventory quantity (admin or staff)
exports.updateInventory = async (req, res) => {
  const { inventoryId, quantity } = req.body;
  
  if (quantity < 0) {
    return res.status(400).json({ message: 'Quantity cannot be negative' });
  }
  
  try {
    const [result] = await pool.query(
      'UPDATE inventory SET quantity = ? WHERE id = ?',
      [quantity, inventoryId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    
    // Get the updated inventory record to return
    const [updatedInventory] = await pool.query(`
      SELECT 
        i.id, 
        p.product_id, 
        p.name as product_name, 
        pc.color, 
        ps.size, 
        i.quantity, 
        i.critical_level
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN product_colors pc ON i.color_id = pc.id
      JOIN product_sizes ps ON i.size_id = ps.id
      WHERE i.id = ?
    `, [inventoryId]);
    
    res.json(updatedInventory[0]);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update critical level threshold (admin only)
exports.updateCriticalLevel = async (req, res) => {
  const { inventoryId, criticalLevel } = req.body;
  
  if (criticalLevel < 0) {
    return res.status(400).json({ message: 'Critical level cannot be negative' });
  }
  
  try {
    const [result] = await pool.query(
      'UPDATE inventory SET critical_level = ? WHERE id = ?',
      [criticalLevel, inventoryId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    
    res.json({ message: 'Critical level updated successfully' });
  } catch (error) {
    console.error('Error updating critical level:', error);
    res.status(500).json({ message: 'Server error' });
  }
};