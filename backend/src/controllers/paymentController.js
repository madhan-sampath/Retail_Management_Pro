const PaymentModel = require('../models/Payment');
const OrderModel = require('../models/Order');
const AuditLogModel = require('../models/AuditLog');

const Payment = new PaymentModel();
const Order = new OrderModel();
const AuditLog = new AuditLogModel();

const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, orderId, paymentMethod, status, startDate, endDate, sortBy = 'paymentDate', sortOrder = 'DESC' } = req.query;
    
    let payments;
    
    if (orderId) {
      payments = await Payment.getPaymentsByOrder(orderId);
    } else if (paymentMethod) {
      payments = await Payment.getPaymentsByMethod(paymentMethod);
    } else if (status) {
      payments = await Payment.getPaymentsByStatus(status);
    } else if (startDate && endDate) {
      payments = await Payment.getPaymentsByDateRange(startDate, endDate);
    } else {
      payments = await Payment.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payments.length
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get order details
    const order = await Order.findByPk(payment.orderId);

    res.json({
      success: true,
      data: {
        ...payment,
        order: order || null
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment',
      error: error.message
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentData = req.body;

    // Validate required fields
    const { orderId, amount, paymentMethod } = paymentData;
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and payment method are required'
      });
    }

    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment
    const newPayment = await Payment.create({
      ...paymentData,
      transactionId,
      status: 'pending',
      paymentDate: new Date().toISOString()
    });

    // Log creation
    await AuditLog.createLog('CREATE', 'Payment', newPayment.id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      paymentData
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: newPayment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if payment exists
    const existingPayment = await Payment.findByPk(id);
    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment
    const updatedPayment = await Payment.update(updateData, { where: { id } });

    if (updatedPayment === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get updated payment
    const payment = await Payment.findByPk(id);

    // Log update
    await AuditLog.createLog('UPDATE', 'Payment', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: updateData
    });

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

const updatePaymentStatus = async (req, res) => {
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

    // Check if payment exists
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update status
    await Payment.updatePaymentStatus(id, status, notes);

    // If payment is completed, update order status
    if (status === 'completed') {
      await Order.updateOrderStatus(payment.orderId, 'paid', 'Payment completed');
    }

    // Log status update
    await AuditLog.createLog('UPDATE_STATUS', 'Payment', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status,
      notes
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if payment exists
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment can be deleted (only pending payments)
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payments can be deleted'
      });
    }

    // Delete payment
    await Payment.destroy({ where: { id } });

    // Log deletion
    await AuditLog.createLog('DELETE', 'Payment', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      paymentData: payment
    });

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
};

const getPaymentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const summary = await Payment.getPaymentSummary(startDate, endDate);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment summary',
      error: error.message
    });
  }
};

const getTodayPayments = async (req, res) => {
  try {
    const payments = await Payment.getTodayPayments();

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get today payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today payments',
      error: error.message
    });
  }
};

const searchPayments = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const payments = await Payment.searchPayments(q);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Search payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search payments',
      error: error.message
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentSummary,
  getTodayPayments,
  searchPayments
};
