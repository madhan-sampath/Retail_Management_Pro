const LocalModel = require('../utils/LocalModel');

class CategoryModel extends LocalModel {
  constructor() {
    super('Categories');
  }

  async getCategoriesWithProductCount() {
    const categories = await this.findAll();
    const Product = new LocalModel('Products');
    const products = await Product.findAll();
    
    return categories.map(category => {
      const productCount = products.filter(product => product.categoryId === category.id).length;
      return {
        ...category,
        productCount
      };
    });
  }

  async getActiveCategories() {
    return await this.findAll({ where: { isActive: true } });
  }

  async searchCategories(searchTerm) {
    return await this.search(searchTerm, ['name', 'description']);
  }

  async getCategoryHierarchy() {
    const categories = await this.findAll();
    const parentCategories = categories.filter(cat => !cat.parentId);
    const childCategories = categories.filter(cat => cat.parentId);
    
    return parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parentId === parent.id)
    }));
  }

  async updateCategoryStatus(categoryId, isActive) {
    return await this.update(
      { isActive },
      { where: { id: categoryId } }
    );
  }

  async getCategoryStats() {
    const totalCategories = await this.count();
    const activeCategories = await this.count({ where: { isActive: true } });
    const inactiveCategories = totalCategories - activeCategories;
    
    return {
      totalCategories,
      activeCategories,
      inactiveCategories
    };
  }
}

module.exports = CategoryModel;
