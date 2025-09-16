const CategoryModel = require('../models/Category');
const ProductModel = require('../models/Product');
const AuditLogModel = require('../models/AuditLog');

const Category = new CategoryModel();
const Product = new ProductModel();
const AuditLog = new AuditLogModel();

const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let categories;
    
    if (search) {
      categories = await Category.searchCategories(search);
    } else if (isActive !== undefined) {
      categories = await Category.findAll({ 
        where: { isActive: isActive === 'true' },
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    } else {
      categories = await Category.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: categories.length
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryData = req.body;

    // Validate required fields
    const { name } = categoryData;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Create category
    const newCategory = await Category.create({
      ...categoryData,
      isActive: true
    });

    // Log creation
    await AuditLog.createLog('CREATE', 'Category', newCategory.id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      categoryData
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if category exists
    const existingCategory = await Category.findByPk(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameExists = await Category.findOne({ where: { name: updateData.name } });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update category
    const updatedCategory = await Category.update(updateData, { where: { id } });

    if (updatedCategory === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get updated category
    const category = await Category.findByPk(id);

    // Log update
    await AuditLog.createLog('UPDATE', 'Category', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: updateData
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if category exists
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const products = await Product.getProductsByCategory(id);
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products'
      });
    }

    // Delete category
    await Category.destroy({ where: { id } });

    // Log deletion
    await AuditLog.createLog('DELETE', 'Category', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      categoryData: category
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

const updateCategoryStatus = async (req, res) => {
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

    // Check if category exists
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update status
    await Category.updateCategoryStatus(id, isActive);

    // Log status update
    await AuditLog.createLog('UPDATE_STATUS', 'Category', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      isActive
    });

    res.json({
      success: true,
      message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update category status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category status',
      error: error.message
    });
  }
};

const getCategoriesWithProductCount = async (req, res) => {
  try {
    const categories = await Category.getCategoriesWithProductCount();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories with product count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories with product count',
      error: error.message
    });
  }
};

const getCategoryHierarchy = async (req, res) => {
  try {
    const hierarchy = await Category.getCategoryHierarchy();

    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error('Get category hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category hierarchy',
      error: error.message
    });
  }
};

const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const categories = await Category.searchCategories(q);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Search categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search categories',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  getCategoriesWithProductCount,
  getCategoryHierarchy,
  searchCategories
};
