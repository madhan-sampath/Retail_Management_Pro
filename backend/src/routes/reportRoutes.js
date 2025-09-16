const express = require('express');
const { query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getProductReport,
  getDashboardStats,
  getAuditReport,
  getTopSellingProducts,
  getRevenueReport
} = require('../controllers/reportController');

const router = express.Router();

// Validation middleware
const dateRangeValidation = [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date')
];

// All routes require authentication
router.use(authenticateToken);

// Dashboard and general reports
router.get('/dashboard', getDashboardStats);
router.get('/inventory', getInventoryReport);

// Date range reports
router.get('/sales', dateRangeValidation, getSalesReport);
router.get('/customers', dateRangeValidation, getCustomerReport);
router.get('/products', dateRangeValidation, getProductReport);
router.get('/audit', dateRangeValidation, getAuditReport);
router.get('/revenue', dateRangeValidation, getRevenueReport);

// Product reports
router.get('/top-selling', getTopSellingProducts);

module.exports = router;
