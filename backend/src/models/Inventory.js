const LocalModel = require('../utils/LocalModel');

class InventoryModel extends LocalModel {
  constructor() {
    super('Inventory');
  }

  async getInventoryWithProduct() {
    const inventory = await this.findAll();
    const Product = new LocalModel('Products');
    const products = await Product.findAll();
    
    return inventory.map(item => {
      const product = products.find(prod => prod.id === item.productId);
      return {
        ...item,
        product: product || null
      };
    });
  }

  async getLowStockItems(threshold = 10) {
    return await this.findAll({
      where: { currentStock: { $lte: threshold } },
      order: ['currentStock', 'ASC']
    });
  }

  async getOutOfStockItems() {
    return await this.findAll({ where: { currentStock: 0 } });
  }

  async getInventoryByProduct(productId) {
    return await this.findAll({ where: { productId: parseInt(productId) } });
  }

  async getInventoryByLocation(location) {
    return await this.findAll({ where: { location } });
  }

  async updateStock(productId, quantity, operation = 'add') {
    const inventory = await this.findOne({ where: { productId: parseInt(productId) } });
    
    if (!inventory) {
      throw new Error('Inventory record not found for product');
    }

    let newStock;
    if (operation === 'add') {
      newStock = inventory.currentStock + quantity;
    } else if (operation === 'subtract') {
      newStock = inventory.currentStock - quantity;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }
    } else {
      newStock = quantity;
    }

    return await this.update(
      { 
        currentStock: newStock,
        lastUpdated: new Date().toISOString()
      },
      { where: { productId: parseInt(productId) } }
    );
  }

  async getInventoryAlerts() {
    const lowStock = await this.getLowStockItems();
    const outOfStock = await this.getOutOfStockItems();
    
    return {
      lowStock,
      outOfStock,
      totalAlerts: lowStock.length + outOfStock.length
    };
  }

  async getInventoryMovement(productId, startDate, endDate) {
    const movements = await this.findByDateRange('lastUpdated', startDate, endDate);
    return movements.filter(movement => movement.productId === parseInt(productId));
  }

  async getInventorySummary() {
    const inventory = await this.findAll();
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
    const lowStockCount = inventory.filter(item => item.currentStock <= item.minStockLevel).length;
    const outOfStockCount = inventory.filter(item => item.currentStock === 0).length;
    
    return {
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      averageStockValue: totalItems > 0 ? totalValue / totalItems : 0
    };
  }

  async searchInventory(searchTerm) {
    const inventory = await this.findAll();
    const Product = new LocalModel('Products');
    const products = await Product.findAll();
    
    return inventory.filter(item => {
      const product = products.find(prod => prod.id === item.productId);
      if (!product) return false;
      
      return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.location.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
}

module.exports = InventoryModel;
