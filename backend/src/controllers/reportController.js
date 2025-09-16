const ReportModel = require('../models/Report');
const AuditLogModel = require('../models/AuditLog');

const Report = new ReportModel();
const AuditLog = new AuditLogModel();

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const report = await Report.getSalesReport(startDate, endDate);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales report',
      error: error.message
    });
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const report = await Report.getInventoryReport();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory report',
      error: error.message
    });
  }
};

const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const report = await Report.getCustomerReport(startDate, endDate);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get customer report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer report',
      error: error.message
    });
  }
};

const getProductReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const report = await Report.getProductReport(startDate, endDate);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get product report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product report',
      error: error.message
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await Report.getDashboardStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
};

const getAuditReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const report = await AuditLog.getAuditSummary(startDate, endDate);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get audit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit report',
      error: error.message
    });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let products;
    if (startDate && endDate) {
      const OrderItem = require('../models/OrderItem');
      const orderItems = await OrderItem.getSalesByDateRange(startDate, endDate);
      
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
        .slice(0, parseInt(limit));

      // Get product details
      const Product = require('../models/Product');
      const products = await Product.findAll();
      
      products = [];
      for (const [productId, totalSold] of sortedProducts) {
        const product = products.find(prod => prod.id === parseInt(productId));
        if (product) {
          products.push({
            ...product,
            totalSold
          });
        }
      }
    } else {
      const Product = require('../models/Product');
      products = await Product.getTopSellingProducts(parseInt(limit));
    }

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get top selling products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top selling products',
      error: error.message
    });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const Order = require('../models/Order');
    const orders = await Order.getOrdersByDateRange(startDate, endDate);
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    // Group by date
    const revenueByDate = {};
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (revenueByDate[date]) {
        revenueByDate[date] += order.totalAmount || 0;
      } else {
        revenueByDate[date] = order.totalAmount || 0;
      }
    });

    // Convert to array and sort by date
    const revenueData = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const averageDailyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        totalRevenue,
        averageDailyRevenue,
        revenueData,
        totalOrders: completedOrders.length
      }
    });
  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue report',
      error: error.message
    });
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getProductReport,
  getDashboardStats,
  getAuditReport,
  getTopSellingProducts,
  getRevenueReport
};
