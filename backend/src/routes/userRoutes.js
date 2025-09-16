const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  changeUserPassword,
  searchUsers
} = require('../controllers/userController');

const router = express.Router();

// Validation middleware
const createUserValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
];

const updateUserValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
];

const updateUserStatusValidation = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
];

const changeUserPasswordValidation = [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// User management routes
router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, createUser);
router.put('/:id', updateUserValidation, updateUser);
router.put('/:id/status', updateUserStatusValidation, updateUserStatus);
router.put('/:id/password', changeUserPasswordValidation, changeUserPassword);
router.delete('/:id', deleteUser);

module.exports = router;
