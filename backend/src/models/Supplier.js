const LocalModel = require('../utils/LocalModel');

class SupplierModel extends LocalModel {
  constructor() {
    super('Suppliers');
  }

  async searchSuppliers(searchTerm) {
    return await this.search(searchTerm, ['name', 'contactPerson', 'email', 'phone', 'company']);
  }

  async getActiveSuppliers() {
    return await this.findAll({ where: { isActive: true } });
  }

  async getSuppliersByCity(city) {
    return await this.findAll({ where: { city } });
  }

  async getSuppliersByState(state) {
    return await this.findAll({ where: { state } });
  }

  async getSupplierProducts(supplierId) {
    const Product = new LocalModel('Products');
    return await Product.getProductsBySupplier(supplierId);
  }

  async updateSupplierStatus(supplierId, isActive) {
    return await this.update(
      { isActive },
      { where: { id: supplierId } }
    );
  }

  async getSupplierStats() {
    const totalSuppliers = await this.count();
    const activeSuppliers = await this.count({ where: { isActive: true } });
    const inactiveSuppliers = totalSuppliers - activeSuppliers;
    
    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers
    };
  }

  async getRecentSuppliers(limit = 10) {
    return await this.findAll({
      order: ['createdAt', 'DESC'],
      limit
    });
  }
}

module.exports = SupplierModel;
