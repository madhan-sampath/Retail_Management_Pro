const LocalModel = require('../utils/LocalModel');

class OrderItemModel extends LocalModel {
  constructor() {
    super('OrderItems');
  }

  async getOrderItemsWithProduct() {
    const orderItems = await this.findAll();
    const Product = new LocalModel('Products');
    const products = await Product.findAll();
    
    return orderItems.map(item => {
      const product = products.find(prod => prod.id === item.productId);
      return {
        ...item,
        product: product || null
      };
    });
  }

  async getOrderItemsByOrder(orderId) {
    return await this.findAll({ 
      where: { orderId: parseInt(orderId) },
      order: ['createdAt', 'ASC']
    });
  }

  async getOrderItemsByProduct(productId) {
    return await this.findAll({ 
      where: { productId: parseInt(productId) },
      order: ['createdAt', 'DESC']
    });
  }

  async calculateOrderItemTotal(orderItemId) {
    const item = await this.findByPk(orderItemId);
    if (!item) {
      throw new Error('Order item not found');
    }
    return item.quantity * item.unitPrice;
  }

  async getTopSellingProducts(limit = 10) {
    const orderItems = await this.findAll();
    const Product = new LocalModel('Products');
    const products = await Product.findAll();
    
    // Group by productId and sum quantities
    const productSales = {};
    orderItems.forEach(item => {
      if (productSales[item.productId]) {
        productSales[item.productId] += item.quantity;
      } else {
        productSales[item.productId] = item.quantity;
      }
    });

    // Sort by total quantity sold
    const sortedProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);

    // Get product details
    const topProducts = [];
    for (const [productId, totalSold] of sortedProducts) {
      const product = products.find(prod => prod.id === parseInt(productId));
      if (product) {
        topProducts.push({
          ...product,
          totalSold
        });
      }
    }

    return topProducts;
  }

  async getSalesByDateRange(startDate, endDate) {
    const orderItems = await this.findAll();
    const Order = new LocalModel('Orders');
    const orders = await Order.findByDateRange('createdAt', startDate, endDate);
    
    const orderIds = orders.map(order => order.id);
    const filteredOrderItems = orderItems.filter(item => orderIds.includes(item.orderId));
    
    return filteredOrderItems;
  }

  async getProductSalesSummary(productId, startDate, endDate) {
    const orderItems = await this.getSalesByDateRange(startDate, endDate);
    const productOrderItems = orderItems.filter(item => item.productId === parseInt(productId));
    
    const totalQuantity = productOrderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = productOrderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const averagePrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;
    
    return {
      totalQuantity,
      totalRevenue,
      averagePrice,
      orderCount: productOrderItems.length
    };
  }
}

module.exports = OrderItemModel;
