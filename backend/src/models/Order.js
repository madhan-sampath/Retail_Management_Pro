const LocalModel = require('../utils/LocalModel');

class OrderModel extends LocalModel {
  constructor() {
    super('Orders');
  }

  async getOrdersWithDetails() {
    const orders = await this.findAll();
    const OrderItem = new LocalModel('OrderItems');
    const Customer = new LocalModel('Customers');
    const User = new LocalModel('Users');
    
    const orderItems = await OrderItem.findAll();
    const customers = await Customer.findAll();
    const users = await User.findAll();

    return orders.map(order => {
      const orderItemsForOrder = orderItems.filter(item => item.orderId === order.id);
      const customer = customers.find(cust => cust.id === order.customerId);
      const user = users.find(usr => usr.id === order.userId);

      return {
        ...order,
        orderItems: orderItemsForOrder,
        customer: customer || null,
        user: user || null
      };
    });
  }

  async getOrdersByCustomer(customerId) {
    return await this.findAll({ 
      where: { customerId: parseInt(customerId) },
      order: ['createdAt', 'DESC']
    });
  }

  async getOrdersByUser(userId) {
    return await this.findAll({ 
      where: { userId: parseInt(userId) },
      order: ['createdAt', 'DESC']
    });
  }

  async getOrdersByStatus(status) {
    return await this.findAll({ 
      where: { status },
      order: ['createdAt', 'DESC']
    });
  }

  async getOrdersByDateRange(startDate, endDate) {
    return await this.findByDateRange('createdAt', startDate, endDate);
  }

  async getTodayOrders() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await this.findByDateRange('createdAt', startOfDay, endOfDay);
  }

  async getOrdersByPaymentMethod(paymentMethod) {
    return await this.findAll({ 
      where: { paymentMethod },
      order: ['createdAt', 'DESC']
    });
  }

  async calculateOrderTotal(orderId) {
    const OrderItem = new LocalModel('OrderItems');
    const orderItems = await OrderItem.findAll({ where: { orderId } });
    
    return orderItems.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }

  async updateOrderStatus(orderId, status, notes = '') {
    return await this.update(
      { 
        status,
        statusNotes: notes,
        updatedAt: new Date().toISOString()
      },
      { where: { id: orderId } }
    );
  }

  async getSalesSummary(startDate, endDate) {
    const orders = await this.getOrdersByDateRange(startDate, endDate);
    const OrderItem = new LocalModel('OrderItems');
    const orderItems = await OrderItem.findAll();
    
    const completedOrders = orders.filter(order => order.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const completedOrdersCount = completedOrders.length;
    
    // Calculate average order value
    const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;
    
    // Get top selling products
    const productSales = {};
    completedOrders.forEach(order => {
      const orderItemsForOrder = orderItems.filter(item => item.orderId === order.id);
      orderItemsForOrder.forEach(item => {
        if (productSales[item.productId]) {
          productSales[item.productId] += item.quantity;
        } else {
          productSales[item.productId] = item.quantity;
        }
      });
    });

    return {
      totalRevenue,
      totalOrders,
      completedOrders: completedOrdersCount,
      averageOrderValue,
      productSales
    };
  }

  async getRecentOrders(limit = 10) {
    return await this.findAll({
      order: ['createdAt', 'DESC'],
      limit
    });
  }

  async searchOrders(searchTerm) {
    const orders = await this.findAll();
    const Customer = new LocalModel('Customers');
    const customers = await Customer.findAll();
    
    return orders.filter(order => {
      const customer = customers.find(cust => cust.id === order.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : '';
      
      return order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
             customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             order.status.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
}

module.exports = OrderModel;
