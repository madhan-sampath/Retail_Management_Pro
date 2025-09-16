const CustomerModel = require('../models/Customer');
const OrderModel = require('../models/Order');
const AuditLogModel = require('../models/AuditLog');

const Customer = new CustomerModel();
const Order = new OrderModel();
const AuditLog = new AuditLogModel();

const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, state, isActive, sortBy = 'firstName', sortOrder = 'ASC' } = req.query;
    
    let customers;
    
    if (search) {
      customers = await Customer.searchCustomers(search);
    } else if (city) {
      customers = await Customer.getCustomersByCity(city);
    } else if (state) {
      customers = await Customer.getCustomersByState(state);
    } else if (isActive !== undefined) {
      customers = await Customer.findAll({ 
        where: { isActive: isActive === 'true' },
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    } else {
      customers = await Customer.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: customers.length
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customers',
      error: error.message
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer order history
    const orderHistory = await Customer.getCustomerOrderHistory(id);
    const totalSpent = await Customer.getCustomerTotalSpent(id);

    res.json({
      success: true,
      data: {
        ...customer,
        orderHistory,
        totalSpent
      }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer',
      error: error.message
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const customerData = req.body;

    // Validate required fields
    const { firstName, lastName, email } = customerData;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Create customer
    const newCustomer = await Customer.create({
      ...customerData,
      isActive: true
    });

    // Log creation
    await AuditLog.createLog('CREATE', 'Customer', newCustomer.id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      customerData
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if customer exists
    const existingCustomer = await Customer.findByPk(id);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== existingCustomer.email) {
      const emailExists = await Customer.findOne({ where: { email: updateData.email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another customer'
        });
      }
    }

    // Update customer
    const updatedCustomer = await Customer.update(updateData, { where: { id } });

    if (updatedCustomer === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get updated customer
    const customer = await Customer.findByPk(id);

    // Log update
    await AuditLog.createLog('UPDATE', 'Customer', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: updateData
    });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if customer exists
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has orders
    const orders = await Order.getOrdersByCustomer(id);
    if (orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing orders'
      });
    }

    // Delete customer
    await Customer.destroy({ where: { id } });

    // Log deletion
    await AuditLog.createLog('DELETE', 'Customer', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      customerData: customer
    });

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    // Check if customer exists
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Update status
    await Customer.updateCustomerStatus(id, isActive);

    // Log status update
    await AuditLog.createLog('UPDATE_STATUS', 'Customer', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      isActive
    });

    res.json({
      success: true,
      message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer status',
      error: error.message
    });
  }
};

const getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.getCustomerStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer statistics',
      error: error.message
    });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const customers = await Customer.findAll();
    
    // Calculate total spent for each customer
    const customersWithSpending = await Promise.all(
      customers.map(async (customer) => {
        const totalSpent = await Customer.getCustomerTotalSpent(customer.id);
        return {
          ...customer,
          totalSpent
        };
      })
    );

    // Sort by total spent
    const topCustomers = customersWithSpending
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topCustomers
    });
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top customers',
      error: error.message
    });
  }
};

const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const customers = await Customer.searchCustomers(q);

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search customers',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerStats,
  getTopCustomers,
  searchCustomers
};
