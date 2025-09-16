const express = require('express');
const { query } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  getAuditLogsByAction,
  getAuditLogsByDateRange,
  getRecentAuditLogs,
  searchAuditLogs,
  getAuditLogsWithUser,
  getAuditSummary
} = require('../controllers/auditLogController');

const router = express.Router();

// Validation middleware
const dateRangeValidation = [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date')
];

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Audit log routes
router.get('/', getAllAuditLogs);
router.get('/with-user', getAuditLogsWithUser);
router.get('/recent', getRecentAuditLogs);
router.get('/search', searchAuditLogs);
router.get('/summary', dateRangeValidation, getAuditSummary);
router.get('/user/:userId', getAuditLogsByUser);
router.get('/entity/:entityType/:entityId', getAuditLogsByEntity);
router.get('/action/:action', getAuditLogsByAction);
router.get('/date-range', dateRangeValidation, getAuditLogsByDateRange);
router.get('/:id', getAuditLogById);

module.exports = router;
