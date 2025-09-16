const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireManager } = require('../middleware/auth');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  getCategoriesWithProductCount,
  getCategoryHierarchy,
  searchCategories
} = require('../controllers/categoryController');

const router = express.Router();

// Validation middleware
const createCategoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('parentId').optional().isInt().withMessage('Parent ID must be an integer')
];

const updateCategoryValidation = [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('parentId').optional().isInt().withMessage('Parent ID must be an integer')
];

const updateCategoryStatusValidation = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
];

// Public routes (read-only)
router.get('/', getAllCategories);
router.get('/with-count', getCategoriesWithProductCount);
router.get('/hierarchy', getCategoryHierarchy);
router.get('/search', searchCategories);
router.get('/:id', getCategoryById);

// Protected routes (require authentication and manager role)
router.post('/', authenticateToken, requireManager, createCategoryValidation, createCategory);
router.put('/:id', authenticateToken, requireManager, updateCategoryValidation, updateCategory);
router.put('/:id/status', authenticateToken, requireManager, updateCategoryStatusValidation, updateCategoryStatus);
router.delete('/:id', authenticateToken, requireManager, deleteCategory);

module.exports = router;
