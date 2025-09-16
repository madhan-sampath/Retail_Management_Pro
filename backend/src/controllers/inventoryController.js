const InventoryModel = require('../models/Inventory');
const ProductModel = require('../models/Product');
const AuditLogModel = require('../models/AuditLog');

const Inventory = new InventoryModel();
const Product = new ProductModel();
const AuditLog = new AuditLogModel();

const getAllInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, location, threshold, sortBy = 'productId', sortOrder = 'ASC' } = req.query;
    
    let inventory;
    
    if (location) {
      inventory = await Inventory.getInventoryByLocation(location);
    } else if (threshold) {
      inventory = await Inventory.getLowStockItems(parseInt(threshold));
    } else {
      inventory = await Inventory.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    // Get inventory with product details
    const inventoryWithProducts = await Inventory.getInventoryWithProduct();

    res.json({
      success: true,
      data: inventoryWithProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: inventoryWithProducts.length
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory',
      error: error.message
    });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findByPk(id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    // Get product details
    const product = await Product.findByPk(inventory.productId);

    res.json({
      success: true,
      data: {
        ...inventory,
        product: product || null
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory',
      error: error.message
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { quantity, operation = 'add', notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update stock
    await Inventory.updateStock(productId, quantity, operation);

    // Update product stock quantity
    const currentStock = await Inventory.findOne({ where: { productId } });
    await Product.update(
      { stockQuantity: currentStock.currentStock },
      { where: { id: productId } }
    );

    // Log stock update
    await AuditLog.createLog('UPDATE_STOCK', 'Inventory', productId, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      quantity,
      operation,
      notes
    });

    res.json({
      success: true,
      message: 'Stock updated successfully'
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const items = await Inventory.getLowStockItems(parseInt(threshold));

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock items',
      error: error.message
    });
  }
};

const getOutOfStockItems = async (req, res) => {
  try {
    const items = await Inventory.getOutOfStockItems();

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get out of stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get out of stock items',
      error: error.message
    });
  }
};

const getInventoryAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.getInventoryAlerts();

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get inventory alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory alerts',
      error: error.message
    });
  }
};

const getInventorySummary = async (req, res) => {
  try {
    const summary = await Inventory.getInventorySummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory summary',
      error: error.message
    });
  }
};

const searchInventory = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const inventory = await Inventory.searchInventory(q);

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Search inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search inventory',
      error: error.message
    });
  }
};

const getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const inventory = await Inventory.getInventoryByProduct(productId);

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory by product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory by product',
      error: error.message
    });
  }
};

const getInventoryByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const inventory = await Inventory.getInventoryByLocation(location);

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory by location',
      error: error.message
    });
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
  updateStock,
  getLowStockItems,
  getOutOfStockItems,
  getInventoryAlerts,
  getInventorySummary,
  searchInventory,
  getInventoryByProduct,
  getInventoryByLocation
};
