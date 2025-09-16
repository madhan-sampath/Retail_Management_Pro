const SupplierModel = require('../models/Supplier');
const ProductModel = require('../models/Product');
const AuditLogModel = require('../models/AuditLog');

const Supplier = new SupplierModel();
const Product = new ProductModel();
const AuditLog = new AuditLogModel();

const getAllSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, state, isActive, search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let suppliers;
    
    if (search) {
      suppliers = await Supplier.searchSuppliers(search);
    } else if (city) {
      suppliers = await Supplier.getSuppliersByCity(city);
    } else if (state) {
      suppliers = await Supplier.getSuppliersByState(state);
    } else if (isActive !== undefined) {
      suppliers = await Supplier.findAll({ 
        where: { isActive: isActive === 'true' },
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    } else {
      suppliers = await Supplier.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: suppliers.length
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suppliers',
      error: error.message
    });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get supplier products
    const products = await Supplier.getSupplierProducts(id);

    res.json({
      success: true,
      data: {
        ...supplier,
        products
      }
    });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supplier',
      error: error.message
    });
  }
};

const createSupplier = async (req, res) => {
  try {
    const userId = req.user.id;
    const supplierData = req.body;

    // Validate required fields
    const { name, contactPerson, email, phone } = supplierData;
    if (!name || !contactPerson || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact person, email, and phone are required'
      });
    }

    // Check if email already exists
    const existingSupplier = await Supplier.findOne({ where: { email } });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this email already exists'
      });
    }

    // Create supplier
    const newSupplier = await Supplier.create({
      ...supplierData,
      isActive: true
    });

    // Log creation
    await AuditLog.createLog('CREATE', 'Supplier', newSupplier.id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      supplierData
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: newSupplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if supplier exists
    const existingSupplier = await Supplier.findByPk(id);
    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== existingSupplier.email) {
      const emailExists = await Supplier.findOne({ where: { email: updateData.email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another supplier'
        });
      }
    }

    // Update supplier
    const updatedSupplier = await Supplier.update(updateData, { where: { id } });

    if (updatedSupplier === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get updated supplier
    const supplier = await Supplier.findByPk(id);

    // Log update
    await AuditLog.createLog('UPDATE', 'Supplier', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: updateData
    });

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if supplier exists
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier has products
    const products = await Supplier.getSupplierProducts(id);
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with existing products'
      });
    }

    // Delete supplier
    await Supplier.destroy({ where: { id } });

    // Log deletion
    await AuditLog.createLog('DELETE', 'Supplier', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      supplierData: supplier
    });

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};

const updateSupplierStatus = async (req, res) => {
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

    // Check if supplier exists
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Update status
    await Supplier.updateSupplierStatus(id, isActive);

    // Log status update
    await AuditLog.createLog('UPDATE_STATUS', 'Supplier', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      isActive
    });

    res.json({
      success: true,
      message: `Supplier ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update supplier status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier status',
      error: error.message
    });
  }
};

const getSupplierStats = async (req, res) => {
  try {
    const stats = await Supplier.getSupplierStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supplier statistics',
      error: error.message
    });
  }
};

const searchSuppliers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const suppliers = await Supplier.searchSuppliers(q);

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Search suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search suppliers',
      error: error.message
    });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  updateSupplierStatus,
  getSupplierStats,
  searchSuppliers
};
