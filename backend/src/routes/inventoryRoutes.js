const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const {
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
} = require('../controllers/inventoryController');

const router = express.Router();

// Validation middleware
const updateStockValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('operation').optional().isIn(['add', 'subtract', 'set']).withMessage('Operation must be add, subtract, or set'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// Public routes (read-only)
router.get('/', getAllInventory);
router.get('/summary', getInventorySummary);
router.get('/alerts', getInventoryAlerts);
router.get('/low-stock', getLowStockItems);
router.get('/out-of-stock', getOutOfStockItems);
router.get('/search', searchInventory);
router.get('/product/:productId', getInventoryByProduct);
router.get('/location/:location', getInventoryByLocation);
router.get('/:id', getInventoryById);

// Protected routes (require authentication and manager role)
router.put('/:productId/stock', authenticateToken, requireManager, updateStockValidation, updateStock);

module.exports = router;
