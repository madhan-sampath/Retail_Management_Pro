const AuditLogModel = require('../models/AuditLog');

const AuditLog = new AuditLogModel();

const getAllAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, entityType, entityId, action, startDate, endDate, sortBy = 'timestamp', sortOrder = 'DESC' } = req.query;
    
    let logs;
    
    if (userId) {
      logs = await AuditLog.getLogsByUser(userId, parseInt(limit));
    } else if (entityType && entityId) {
      logs = await AuditLog.getLogsByEntity(entityType, entityId, parseInt(limit));
    } else if (action) {
      logs = await AuditLog.getLogsByAction(action, parseInt(limit));
    } else if (startDate && endDate) {
      logs = await AuditLog.getLogsByDateRange(startDate, endDate, parseInt(limit));
    } else {
      logs = await AuditLog.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error.message
    });
  }
};

const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findByPk(id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit log',
      error: error.message
    });
  }
};

const getAuditLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const logs = await AuditLog.getLogsByUser(parseInt(userId), parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit logs by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs by user',
      error: error.message
    });
  }
};

const getAuditLogsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 50 } = req.query;
    
    const logs = await AuditLog.getLogsByEntity(entityType, parseInt(entityId), parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit logs by entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs by entity',
      error: error.message
    });
  }
};

const getAuditLogsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const { limit = 50 } = req.query;
    
    const logs = await AuditLog.getLogsByAction(action, parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit logs by action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs by action',
      error: error.message
    });
  }
};

const getAuditLogsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { limit = 100 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const logs = await AuditLog.getLogsByDateRange(startDate, endDate, parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit logs by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs by date range',
      error: error.message
    });
  }
};

const getRecentAuditLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const logs = await AuditLog.getRecentLogs(parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get recent audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent audit logs',
      error: error.message
    });
  }
};

const searchAuditLogs = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const logs = await AuditLog.searchLogs(q);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Search audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search audit logs',
      error: error.message
    });
  }
};

const getAuditLogsWithUser = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const logs = await AuditLog.getLogsWithUser();

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length
      }
    });
  } catch (error) {
    console.error('Get audit logs with user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs with user',
      error: error.message
    });
  }
};

const getAuditSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const summary = await AuditLog.getAuditSummary(startDate, endDate);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get audit summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit summary',
      error: error.message
    });
  }
};

module.exports = {
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
};
