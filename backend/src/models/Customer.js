const LocalModel = require('../utils/LocalModel');

class CustomerModel extends LocalModel {
  constructor() {
    super('Customers');
  }

  async searchCustomers(searchTerm) {
    return await this.search(searchTerm, ['firstName', 'lastName', 'email', 'phone', 'company']);
  }

  async getCustomersByCity(city) {
    return await this.findAll({ where: { city } });
  }

  async getCustomersByState(state) {
    return await this.findAll({ where: { state } });
  }

  async getActiveCustomers() {
    return await this.findAll({ where: { isActive: true } });
  }

  async getCustomerOrderHistory(customerId) {
    const Order = new LocalModel('Orders');
    return await Order.getOrdersByCustomer(customerId);
  }

  async getCustomerTotalSpent(customerId) {
    const Order = new LocalModel('Orders');
    const orders = await Order.findAll({ 
      where: { 
        customerId: parseInt(customerId),
        status: 'completed'
      }
    });
    
    return orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  }

  async getRecentCustomers(limit = 10) {
    return await this.findAll({
      order: ['createdAt', 'DESC'],
      limit
    });
  }

  async getCustomersByRegistrationDate(startDate, endDate) {
    return await this.findByDateRange('createdAt', startDate, endDate);
  }

  async updateCustomerStatus(customerId, isActive) {
    return await this.update(
      { isActive },
      { where: { id: customerId } }
    );
  }

  async getCustomerStats() {
    const totalCustomers = await this.count();
    const activeCustomers = await this.count({ where: { isActive: true } });
    const inactiveCustomers = totalCustomers - activeCustomers;
    
    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers
    };
  }
}

module.exports = CustomerModel;
