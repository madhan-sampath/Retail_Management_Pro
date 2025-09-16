const OrderModel = require('../models/Order');
const OrderItemModel = require('../models/OrderItem');
const ProductModel = require('../models/Product');
const CustomerModel = require('../models/Customer');
const AuditLogModel = require('../models/AuditLog');

const Order = new OrderModel();
const OrderItem = new OrderItemModel();
const Product = new ProductModel();
const Customer = new CustomerModel();
const AuditLog = new AuditLogModel();

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, startDate, endDate, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    
    let orders;
    
    if (status) {
      orders = await Order.getOrdersByStatus(status);
    } else if (customerId) {
      orders = await Order.getOrdersByCustomer(customerId);
    } else if (startDate && endDate) {
      orders = await Order.getOrdersByDateRange(startDate, endDate);
    } else {
      orders = await Order.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    // Get order details
    const ordersWithDetails = await Order.getOrdersWithDetails();

    res.json({
      success: true,
      data: ordersWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: ordersWithDetails.length
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order details
    const orderItems = await OrderItem.getOrderItemsByOrder(id);
    const customer = await Customer.findByPk(order.customerId);
    const User = require('../models/User');
    const user = await User.findByPk(order.userId);

    // Get product details for order items
    const products = await Product.findAll();
    const orderItemsWithProducts = orderItems.map(item => {
      const product = products.find(prod => prod.id === item.productId);
      return {
        ...item,
        product: product || null
      };
    });

    res.json({
      success: true,
      data: {
        ...order,
        orderItems: orderItemsWithProducts,
        customer: customer || null,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } : null
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customerId, orderItems, paymentMethod, notes } = req.body;

    // Validate required fields
    if (!customerId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and order items are required'
      });
    }

    // Validate customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`
        });
      }

      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const newOrder = await Order.create({
      orderNumber,
      customerId,
      userId,
      totalAmount,
      status: 'pending',
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
      orderDate: new Date().toISOString()
    });

    // Create order items and update stock
    for (const item of validatedItems) {
      await OrderItem.create({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      });

      // Update product stock
      await Product.updateStock(item.productId, -item.quantity, 'subtract');
    }

    // Log creation
    await AuditLog.createLog('CREATE', 'Order', newOrder.id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      orderData: { customerId, totalAmount, itemCount: orderItems.length }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if order exists
    const existingOrder = await Order.findByPk(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order
    const updatedOrder = await Order.update(updateData, { where: { id } });

    if (updatedOrder === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get updated order
    const order = await Order.findByPk(id);

    // Log update
    await AuditLog.createLog('UPDATE', 'Order', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: updateData
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if order exists
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    await Order.updateOrderStatus(id, status, notes);

    // Log status update
    await AuditLog.createLog('UPDATE_STATUS', 'Order', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status,
      notes
    });

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if order exists
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be deleted (only pending orders)
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be deleted'
      });
    }

    // Get order items to restore stock
    const orderItems = await OrderItem.getOrderItemsByOrder(id);
    
    // Restore stock for each item
    for (const item of orderItems) {
      await Product.updateStock(item.productId, item.quantity, 'add');
    }

    // Delete order items
    await OrderItem.destroy({ where: { orderId: id } });

    // Delete order
    await Order.destroy({ where: { id } });

    // Log deletion
    await AuditLog.createLog('DELETE', 'Order', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      orderData: order
    });

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 30);
    }

    const stats = await Order.getSalesSummary(start, end);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order statistics',
      error: error.message
    });
  }
};

const searchOrders = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const orders = await Order.searchOrders(q);
    const ordersWithDetails = await Order.getOrdersWithDetails();
    const filteredOrders = ordersWithDetails.filter(order => 
      orders.some(o => o.id === order.id)
    );

    res.json({
      success: true,
      data: filteredOrders
    });
  } catch (error) {
    console.error('Search orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search orders',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  searchOrders
};
