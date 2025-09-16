const fs = require('fs').promises;
const path = require('path');

class LocalModel {
  constructor(modelName, dataDir = './data') {
    this.modelName = modelName;
    this.filePath = path.join(dataDir, `${modelName}.json`);
    this.data = [];
    this.nextId = 1;
  }

  async loadData() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8');
      this.data = JSON.parse(fileContent);
      if (this.data.length > 0) {
        this.nextId = Math.max(...this.data.map(item => item.id || 0)) + 1;
      }
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      this.data = [];
      this.nextId = 1;
    }
  }

  async saveData() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      throw new Error(`Failed to save data: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    await this.loadData();
    let results = [...this.data];

    // Apply where conditions
    if (options.where) {
      results = results.filter(item => {
        return Object.keys(options.where).every(key => {
          const condition = options.where[key];
          if (typeof condition === 'object' && condition !== null) {
            if (condition.$like) {
              return item[key] && item[key].toString().toLowerCase().includes(condition.$like.toLowerCase());
            }
            if (condition.$gt) {
              return item[key] > condition.$gt;
            }
            if (condition.$lt) {
              return item[key] < condition.$lt;
            }
            if (condition.$gte) {
              return item[key] >= condition.$gte;
            }
            if (condition.$lte) {
              return item[key] <= condition.$lte;
            }
            if (condition.$in) {
              return condition.$in.includes(item[key]);
            }
            if (condition.$ne) {
              return item[key] !== condition.$ne;
            }
          }
          return item[key] === condition;
        });
      });
    }

    // Apply ordering
    if (options.order) {
      const [field, direction = 'ASC'] = options.order;
      results.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction.toUpperCase() === 'DESC') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    // Apply offset
    if (options.offset) {
      results = results.slice(options.offset);
    }

    return results;
  }

  async findOne(options = {}) {
    const results = await this.findAll(options);
    return results.length > 0 ? results[0] : null;
  }

  async findByPk(id) {
    await this.loadData();
    return this.data.find(item => item.id === parseInt(id)) || null;
  }

  async create(data) {
    await this.loadData();
    const newItem = {
      id: this.nextId++,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.push(newItem);
    await this.saveData();
    return newItem;
  }

  async update(data, options = {}) {
    await this.loadData();
    const items = await this.findAll(options);
    
    if (items.length === 0) {
      throw new Error('No items found to update');
    }

    items.forEach(item => {
      const index = this.data.findIndex(d => d.id === item.id);
      if (index !== -1) {
        this.data[index] = {
          ...this.data[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
    });

    await this.saveData();
    return items.length;
  }

  async destroy(options = {}) {
    await this.loadData();
    const items = await this.findAll(options);
    
    if (items.length === 0) {
      throw new Error('No items found to delete');
    }

    const idsToDelete = items.map(item => item.id);
    this.data = this.data.filter(item => !idsToDelete.includes(item.id));
    await this.saveData();
    return items.length;
  }

  async count(options = {}) {
    const results = await this.findAll(options);
    return results.length;
  }

  async findAndCountAll(options = {}) {
    const rows = await this.findAll(options);
    const count = await this.count(options);
    return { rows, count };
  }

  // Custom methods for specific queries
  async search(searchTerm, fields = []) {
    await this.loadData();
    if (!searchTerm) return this.data;

    return this.data.filter(item => {
      return fields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }

  async findByDateRange(field, startDate, endDate) {
    await this.loadData();
    return this.data.filter(item => {
      const itemDate = new Date(item[field]);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });
  }
}

module.exports = LocalModel;
