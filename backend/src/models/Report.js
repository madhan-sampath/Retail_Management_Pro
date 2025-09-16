const LocalModel = require('../utils/LocalModel');

class ReportModel extends LocalModel {
  constructor() {
    super('Reports');
  }

  async getSalesReport(startDate, endDate) {
    const Order = new LocalModel('Orders');
    const OrderItem = new LocalModel('OrderItems');
    const Product = new LocalModel('Products');
    
    const orders = await Order.getOrdersByDateRange(startDate, endDate);
    const completedOrders = orders.filter(order => order.status === 'completed');
    const orderItems = await OrderItem.findAll();
    const products = await Product.findAll();
    
    // Calculate total revenue
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate product sales
    const productSales = {};
    completedOrders.forEach(order => {
      const orderItemsForOrder = orderItems.filter(item => item.orderId === order.id);
      orderItemsForOrder.forEach(item => {
        const product = products.find(prod => prod.id === item.productId);
        if (product) {
          if (productSales[product.id]) {
            productSales[product.id].quantity += item.quantity;
            productSales[product.id].revenue += item.quantity * item.unitPrice;
          } else {
            productSales[product.id] = {
              productId: product.id,
              productName: product.name,
              quantity: item.quantity,
              revenue: item.quantity * item.unitPrice
            };
          }
        }
      });
    });
    
    // Sort products by revenue
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    return {
      period: { startDate, endDate },
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      topProducts
    };
  }

  async getInventoryReport() {
    const Inventory = new LocalModel('Inventory');
    const Product = new LocalModel('Products');
    
    const inventory = await Inventory.findAll();
    const products = await Product.findAll();
    
    const inventoryWithProducts = inventory.map(item => {
      const product = products.find(prod => prod.id === item.productId);
      return {
        ...item,
        product: product || null,
        totalValue: item.currentStock * item.unitCost
      };
    });
    
    const totalValue = inventoryWithProducts.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = inventoryWithProducts.filter(item => item.currentStock <= item.minStockLevel);
    const outOfStockItems = inventoryWithProducts.filter(item => item.currentStock === 0);
    
    return {
      totalItems: inventory.length,
      totalValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems
    };
  }

  async getCustomerReport(startDate, endDate) {
    const Customer = new LocalModel('Customers');
    const Order = new LocalModel('Orders');
    
    const customers = await Customer.findAll();
    const orders = await Order.getOrdersByDateRange(startDate, endDate);
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    // Calculate customer statistics
    const customerStats = customers.map(customer => {
      const customerOrders = completedOrders.filter(order => order.customerId === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent,
        averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
      };
    });
    
    // Sort by total spent
    const topCustomers = customerStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    return {
      period: { startDate, endDate },
      totalCustomers: customers.length,
      activeCustomers: customerStats.filter(c => c.orderCount > 0).length,
      totalRevenue: customerStats.reduce((sum, c) => sum + c.totalSpent, 0),
      topCustomers
    };
  }

  async getProductReport(startDate, endDate) {
    const Product = new LocalModel('Products');
    const OrderItem = new LocalModel('OrderItems');
    const Order = new LocalModel('Orders');
    
    const products = await Product.findAll();
    const orders = await Order.getOrdersByDateRange(startDate, endDate);
    const completedOrders = orders.filter(order => order.status === 'completed');
    const orderItems = await OrderItem.findAll();
    
    const orderIds = completedOrders.map(order => order.id);
    const relevantOrderItems = orderItems.filter(item => orderIds.includes(item.orderId));
    
    const productStats = products.map(product => {
      const productOrderItems = relevantOrderItems.filter(item => item.productId === product.id);
      const totalQuantity = productOrderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = productOrderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      return {
        ...product,
        totalQuantity,
        totalRevenue,
        orderCount: productOrderItems.length
      };
    });
    
    // Sort by revenue
    const topProducts = productStats
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
    
    return {
      period: { startDate, endDate },
      totalProducts: products.length,
      activeProducts: productStats.filter(p => p.totalQuantity > 0).length,
      totalRevenue: productStats.reduce((sum, p) => sum + p.totalRevenue, 0),
      topProducts
    };
  }

  async getDashboardStats() {
    const Order = new LocalModel('Orders');
    const Product = new LocalModel('Products');
    const Customer = new LocalModel('Customers');
    const Inventory = new LocalModel('Inventory');
    
    // Today's stats
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayOrders = await Order.findByDateRange('createdAt', startOfDay, endOfDay);
    const todayRevenue = todayOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Overall stats
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    const totalCustomers = await Customer.count();
    const inventoryAlerts = await Inventory.getInventoryAlerts();
    
    return {
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue
      },
      overall: {
        totalOrders,
        totalProducts,
        totalCustomers,
        lowStockItems: inventoryAlerts.lowStock.length,
        outOfStockItems: inventoryAlerts.outOfStock.length
      }
    };
  }
}

module.exports = ReportModel;
