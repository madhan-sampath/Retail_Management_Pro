const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerStats,
  getTopCustomers,
  searchCustomers
} = require('../controllers/customerController');

const router = express.Router();

// Validation middleware
const createCustomerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('state').optional().isString().withMessage('State must be a string'),
  body('zipCode').optional().isString().withMessage('Zip code must be a string'),
  body('company').optional().isString().withMessage('Company must be a string')
];

const updateCustomerValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('state').optional().isString().withMessage('State must be a string'),
  body('zipCode').optional().isString().withMessage('Zip code must be a string'),
  body('company').optional().isString().withMessage('Company must be a string')
];

const updateCustomerStatusValidation = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
];

// Public routes (read-only)
router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);
router.get('/top', getTopCustomers);
router.get('/search', searchCustomers);
router.get('/:id', getCustomerById);

// Protected routes (require authentication)
router.post('/', authenticateToken, createCustomerValidation, createCustomer);
router.put('/:id', authenticateToken, updateCustomerValidation, updateCustomer);
router.put('/:id/status', authenticateToken, updateCustomerStatusValidation, updateCustomerStatus);

// Manager-only routes
router.delete('/:id', authenticateToken, requireManager, deleteCustomer);

module.exports = router;
