const LocalModel = require('../utils/LocalModel');

class ProductModel extends LocalModel {
  constructor() {
    super('Products');
  }

  async getProductsWithCategory() {
    const products = await this.findAll();
    const Category = new LocalModel('Categories');
    const categories = await Category.findAll();
    
    return products.map(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      return {
        ...product,
        category: category || null
      };
    });
  }

  async getProductsByCategory(categoryId) {
    return await this.findAll({ where: { categoryId: parseInt(categoryId) } });
  }

  async searchProducts(searchTerm) {
    return await this.search(searchTerm, ['name', 'description', 'sku', 'barcode']);
  }

  async getLowStockProducts(threshold = 10) {
    return await this.findAll({
      where: { stockQuantity: { $lte: threshold } },
      order: ['stockQuantity', 'ASC']
    });
  }

  async getTopSellingProducts(limit = 10) {
    const OrderItem = new LocalModel('OrderItems');
    const orderItems = await OrderItem.findAll();
    
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
      const product = await this.findByPk(productId);
      if (product) {
        topProducts.push({
          ...product,
          totalSold
        });
      }
    }

    return topProducts;
  }

  async getProductsByPriceRange(minPrice, maxPrice) {
    return await this.findAll({
      where: {
        price: { $gte: minPrice, $lte: maxPrice }
      },
      order: ['price', 'ASC']
    });
  }

  async updateStock(productId, quantityChange) {
    const product = await this.findByPk(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const newStock = product.stockQuantity + quantityChange;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return await this.update(
      { stockQuantity: newStock },
      { where: { id: productId } }
    );
  }

  async getOutOfStockProducts() {
    return await this.findAll({ where: { stockQuantity: 0 } });
  }

  async getProductsBySupplier(supplierId) {
    return await this.findAll({ where: { supplierId: parseInt(supplierId) } });
  }

  async getRecentProducts(limit = 10) {
    return await this.findAll({
      order: ['createdAt', 'DESC'],
      limit
    });
  }
}

module.exports = ProductModel;
