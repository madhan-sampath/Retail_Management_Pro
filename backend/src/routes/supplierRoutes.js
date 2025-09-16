const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  updateSupplierStatus,
  getSupplierStats,
  searchSuppliers
} = require('../controllers/supplierController');

const router = express.Router();

// Validation middleware
const createSupplierValidation = [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('state').optional().isString().withMessage('State must be a string'),
  body('zipCode').optional().isString().withMessage('Zip code must be a string'),
  body('company').optional().isString().withMessage('Company must be a string')
];

const updateSupplierValidation = [
  body('name').optional().notEmpty().withMessage('Supplier name cannot be empty'),
  body('contactPerson').optional().notEmpty().withMessage('Contact person cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('state').optional().isString().withMessage('State must be a string'),
  body('zipCode').optional().isString().withMessage('Zip code must be a string'),
  body('company').optional().isString().withMessage('Company must be a string')
];

const updateSupplierStatusValidation = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
];

// Public routes (read-only)
router.get('/', getAllSuppliers);
router.get('/stats', getSupplierStats);
router.get('/search', searchSuppliers);
router.get('/:id', getSupplierById);

// Protected routes (require authentication and manager role)
router.post('/', authenticateToken, requireManager, createSupplierValidation, createSupplier);
router.put('/:id', authenticateToken, requireManager, updateSupplierValidation, updateSupplier);
router.put('/:id/status', authenticateToken, requireManager, updateSupplierStatusValidation, updateSupplierStatus);
router.delete('/:id', authenticateToken, requireManager, deleteSupplier);

module.exports = router;
