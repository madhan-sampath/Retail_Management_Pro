const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getTopSellingProducts,
  searchProducts
} = require('../controllers/productController');

const router = express.Router();

// Validation middleware
const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('categoryId').isInt().withMessage('Category ID must be an integer'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('description').optional().isString().withMessage('Description must be a string')
];

const updateProductValidation = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
  body('sku').optional().notEmpty().withMessage('SKU cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string')
];

// Public routes (read-only)
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/top-selling', getTopSellingProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication and manager role)
router.post('/', authenticateToken, requireManager, createProductValidation, createProduct);
router.put('/:id', authenticateToken, requireManager, updateProductValidation, updateProduct);
router.delete('/:id', authenticateToken, requireManager, deleteProduct);

module.exports = router;
