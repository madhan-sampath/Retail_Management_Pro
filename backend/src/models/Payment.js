const LocalModel = require('../utils/LocalModel');

class PaymentModel extends LocalModel {
  constructor() {
    super('Payments');
  }

  async getPaymentsByOrder(orderId) {
    return await this.findAll({ 
      where: { orderId: parseInt(orderId) },
      order: ['createdAt', 'DESC']
    });
  }

  async getPaymentsByMethod(paymentMethod) {
    return await this.findAll({ 
      where: { paymentMethod },
      order: ['createdAt', 'DESC']
    });
  }

  async getPaymentsByStatus(status) {
    return await this.findAll({ 
      where: { status },
      order: ['createdAt', 'DESC']
    });
  }

  async getPaymentsByDateRange(startDate, endDate) {
    return await this.findByDateRange('paymentDate', startDate, endDate);
  }

  async getPaymentSummary(startDate, endDate) {
    const payments = await this.getPaymentsByDateRange(startDate, endDate);
    const completedPayments = payments.filter(payment => payment.status === 'completed');
    
    const totalAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCount = payments.length;
    const completedCount = completedPayments.length;
    
    // Group by payment method
    const byMethod = {};
    completedPayments.forEach(payment => {
      if (byMethod[payment.paymentMethod]) {
        byMethod[payment.paymentMethod] += payment.amount;
      } else {
        byMethod[payment.paymentMethod] = payment.amount;
      }
    });
    
    return {
      totalAmount,
      totalCount,
      completedCount,
      byMethod,
      averageAmount: completedCount > 0 ? totalAmount / completedCount : 0
    };
  }

  async getTodayPayments() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await this.findByDateRange('paymentDate', startOfDay, endOfDay);
  }

  async searchPayments(searchTerm) {
    return await this.search(searchTerm, ['transactionId', 'paymentMethod', 'status']);
  }

  async updatePaymentStatus(paymentId, status, notes = '') {
    return await this.update(
      { 
        status,
        notes,
        updatedAt: new Date().toISOString()
      },
      { where: { id: paymentId } }
    );
  }
}

module.exports = PaymentModel;
