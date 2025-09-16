const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentSummary,
  getTodayPayments,
  searchPayments
} = require('../controllers/paymentController');

const router = express.Router();

// Validation middleware
const createPaymentValidation = [
  body('orderId').isInt().withMessage('Order ID must be an integer'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updatePaymentValidation = [
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('paymentMethod').optional().notEmpty().withMessage('Payment method cannot be empty'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updatePaymentStatusValidation = [
  body('status').isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// Public routes (read-only)
router.get('/', getAllPayments);
router.get('/summary', getPaymentSummary);
router.get('/today', getTodayPayments);
router.get('/search', searchPayments);
router.get('/:id', getPaymentById);

// Protected routes (require authentication)
router.post('/', authenticateToken, createPaymentValidation, createPayment);
router.put('/:id', authenticateToken, updatePaymentValidation, updatePayment);
router.put('/:id/status', authenticateToken, updatePaymentStatusValidation, updatePaymentStatus);

// Manager-only routes
router.delete('/:id', authenticateToken, requireManager, deletePayment);

module.exports = router;
