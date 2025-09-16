const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  searchOrders
} = require('../controllers/orderController');

const router = express.Router();

// Validation middleware
const createOrderValidation = [
  body('customerId').isInt().withMessage('Customer ID must be an integer'),
  body('orderItems').isArray({ min: 1 }).withMessage('Order items must be a non-empty array'),
  body('orderItems.*.productId').isInt().withMessage('Product ID must be an integer'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('orderItems.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
  body('paymentMethod').optional().isString().withMessage('Payment method must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updateOrderValidation = [
  body('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// Public routes (read-only)
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/search', searchOrders);
router.get('/:id', getOrderById);

// Protected routes (require authentication)
router.post('/', authenticateToken, createOrderValidation, createOrder);
router.put('/:id', authenticateToken, updateOrderValidation, updateOrder);
router.put('/:id/status', authenticateToken, updateOrderStatusValidation, updateOrderStatus);

// Manager-only routes
router.delete('/:id', authenticateToken, requireManager, deleteOrder);

module.exports = router;
