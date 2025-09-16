const LocalModel = require('../utils/LocalModel');
const bcrypt = require('bcryptjs');

class UserModel extends LocalModel {
  constructor() {
    super('Users');
  }

  async createUser(userData) {
    const { password, ...otherData } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    return await this.create({
      ...otherData,
      password: hashedPassword,
      isActive: true,
      lastLogin: null
    });
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async findByEmail(email) {
    return await this.findOne({ where: { email } });
  }

  async findByUsername(username) {
    return await this.findOne({ where: { username } });
  }

  async updateLastLogin(userId) {
    return await this.update(
      { lastLogin: new Date().toISOString() },
      { where: { id: userId } }
    );
  }

  async getActiveUsers() {
    return await this.findAll({ where: { isActive: true } });
  }

  async searchUsers(searchTerm) {
    return await this.search(searchTerm, ['firstName', 'lastName', 'email', 'username']);
  }

  async getUsersByRole(role) {
    return await this.findAll({ where: { role } });
  }

  async updatePassword(userId, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    return await this.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );
  }

  async deactivateUser(userId) {
    return await this.update(
      { isActive: false },
      { where: { id: userId } }
    );
  }

  async activateUser(userId) {
    return await this.update(
      { isActive: true },
      { where: { id: userId } }
    );
  }
}

module.exports = UserModel;
