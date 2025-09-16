const ProductModel = require('../models/Product');
const CategoryModel = require('../models/Category');
const InventoryModel = require('../models/Inventory');
const AuditLogModel = require('../models/AuditLog');

const Product = new ProductModel();
const Category = new CategoryModel();
const Inventory = new InventoryModel();
const AuditLog = new AuditLogModel();

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let products;
    
    if (search) {
      products = await Product.searchProducts(search);
    } else if (categoryId) {
      products = await Product.getProductsByCategory(categoryId);
    } else if (minPrice || maxPrice) {
      products = await Product.getProductsByPriceRange(
        minPrice ? parseFloat(minPrice) : 0,
        maxPrice ? parseFloat(maxPrice) : Infinity
      );
    } else {
      products = await Product.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    // Get categories for each product
    const categories = await Category.findAll();
    const productsWithCategory = products.map(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      return {
        ...product,
        category: category || null
      };
    });

    res.json({
      success: true,
      data: productsWithCategory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: productsWithCategory.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get category
    const category = await Category.findByPk(product.categoryId);
    
    // Get inventory info
    const inventory = await Inventory.findOne({ where: { productId: id } });

    res.json({
      success: true,
      data: {
        ...product,
        category: category || null,
        inventory: inventory || null
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productData = req.body;

    // Validate required fields
    const { name, price, categoryId, sku } = productData;
    if (!name || !price || !categoryId || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, categoryId, and SKU are required'
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Create product
    const newProduct = await Product.create(productData);

    // Create inventory record
    await Inventory.create({
      productId: newProduct.id,
      currentStock: productData.stockQuantity || 0,
      minStockLevel: productData.minStockLevel || 10,
      maxStockLevel: productData.maxStockLevel || 1000,
      unitCost: productData.unitCost || productData.price,
      location: productData.location || 'Main Warehouse'
    });

    // Log creation
    await AuditLog.createLog('CREATE', 'Product', newProduct.id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      productData
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await Product.findByPk(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if SKU is being changed and if it already exists
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ where: { sku: updateData.sku } });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Update product
    const updatedProduct = await Product.update(updateData, { where: { id } });

    if (updatedProduct === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update inventory if stock quantity is provided
    if (updateData.stockQuantity !== undefined) {
      await Inventory.update(
        { currentStock: updateData.stockQuantity },
        { where: { productId: id } }
      );
    }

    // Get updated product
    const product = await Product.findByPk(id);

    // Log update
    await AuditLog.createLog('UPDATE', 'Product', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: updateData
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has orders
    const OrderItem = require('../models/OrderItem');
    const orderItems = await OrderItem.findAll({ where: { productId: id } });
    if (orderItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing orders'
      });
    }

    // Delete inventory record
    await Inventory.destroy({ where: { productId: id } });

    // Delete product
    await Product.destroy({ where: { id } });

    // Log deletion
    await AuditLog.createLog('DELETE', 'Product', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      productData: product
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const products = await Product.getLowStockProducts(parseInt(threshold));

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock products',
      error: error.message
    });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.getTopSellingProducts(parseInt(limit));

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

const searchProducts = async (req, res) => {
  try {
    const { q, categoryId, minPrice, maxPrice } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let products = await Product.searchProducts(q);

    // Apply filters
    if (categoryId) {
      products = products.filter(product => product.categoryId === parseInt(categoryId));
    }

    if (minPrice) {
      products = products.filter(product => product.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      products = products.filter(product => product.price <= parseFloat(maxPrice));
    }

    // Get categories
    const categories = await Category.findAll();
    const productsWithCategory = products.map(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      return {
        ...product,
        category: category || null
      };
    });

    res.json({
      success: true,
      data: productsWithCategory
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getTopSellingProducts,
  searchProducts
};
