const LocalModel = require('../utils/LocalModel');

class AuditLogModel extends LocalModel {
  constructor() {
    super('AuditLogs');
  }

  async createLog(action, entityType, entityId, userId, details = {}) {
    return await this.create({
      action,
      entityType,
      entityId,
      userId,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      ipAddress: details.ipAddress || null,
      userAgent: details.userAgent || null
    });
  }

  async getLogsByUser(userId, limit = 50) {
    return await this.findAll({
      where: { userId: parseInt(userId) },
      order: ['timestamp', 'DESC'],
      limit
    });
  }

  async getLogsByEntity(entityType, entityId, limit = 50) {
    return await this.findAll({
      where: { 
        entityType,
        entityId: parseInt(entityId)
      },
      order: ['timestamp', 'DESC'],
      limit
    });
  }

  async getLogsByAction(action, limit = 50) {
    return await this.findAll({
      where: { action },
      order: ['timestamp', 'DESC'],
      limit
    });
  }

  async getLogsByDateRange(startDate, endDate, limit = 100) {
    return await this.findByDateRange('timestamp', startDate, endDate)
      .then(logs => logs.slice(0, limit));
  }

  async getRecentLogs(limit = 50) {
    return await this.findAll({
      order: ['timestamp', 'DESC'],
      limit
    });
  }

  async searchLogs(searchTerm) {
    return await this.search(searchTerm, ['action', 'entityType', 'details']);
  }

  async getAuditSummary(startDate, endDate) {
    const logs = await this.getLogsByDateRange(startDate, endDate, 1000);
    
    // Group by action
    const actionCounts = {};
    const userCounts = {};
    const entityTypeCounts = {};
    
    logs.forEach(log => {
      // Count by action
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      
      // Count by user
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      
      // Count by entity type
      entityTypeCounts[log.entityType] = (entityTypeCounts[log.entityType] || 0) + 1;
    });
    
    return {
      period: { startDate, endDate },
      totalLogs: logs.length,
      actionCounts,
      userCounts,
      entityTypeCounts,
      mostActiveUser: Object.keys(userCounts).reduce((a, b) => userCounts[a] > userCounts[b] ? a : b, null),
      mostCommonAction: Object.keys(actionCounts).reduce((a, b) => actionCounts[a] > actionCounts[b] ? a : b, null)
    };
  }

  async getLogsWithUser() {
    const logs = await this.findAll();
    const User = new LocalModel('Users');
    const users = await User.findAll();
    
    return logs.map(log => {
      const user = users.find(usr => usr.id === log.userId);
      return {
        ...log,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } : null
      };
    });
  }
}

module.exports = AuditLogModel;
