const UserModel = require('../models/User');
const AuditLogModel = require('../models/AuditLog');

const User = new UserModel();
const AuditLog = new AuditLogModel();

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search, sortBy = 'firstName', sortOrder = 'ASC' } = req.query;
    
    let users;
    
    if (search) {
      users = await User.searchUsers(search);
    } else if (role) {
      users = await User.getUsersByRole(role);
    } else if (isActive !== undefined) {
      users = await User.findAll({ 
        where: { isActive: isActive === 'true' },
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    } else {
      users = await User.findAll({
        order: [sortBy, sortOrder.toUpperCase()],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    }

    // Remove password from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    res.json({
      success: true,
      data: safeUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: safeUsers.length
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;

    // Validate required fields
    const { firstName, lastName, email, username, password, role = 'user' } = userData;
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if username already exists
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create user
    const newUser = await User.createUser(userData);

    // Log creation
    await AuditLog.createLog('CREATE', 'User', newUser.id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      userData: { firstName, lastName, email, username, role }
    });

    // Remove password from response
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: safeUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await User.findByPk(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findByEmail(updateData.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another user'
        });
      }
    }

    // Check if username is being changed and if it already exists
    if (updateData.username && updateData.username !== existingUser.username) {
      const usernameExists = await User.findByUsername(updateData.username);
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken by another user'
        });
      }
    }

    // Update user
    const updatedUser = await User.update(updateData, { where: { id } });

    if (updatedUser === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user
    const user = await User.findByPk(id);

    // Log update
    await AuditLog.createLog('UPDATE', 'User', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: updateData
    });

    // Remove password from response
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: safeUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (parseInt(id) === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user
    await User.destroy({ where: { id } });

    // Log deletion
    await AuditLog.createLog('DELETE', 'User', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      userData: { firstName: user.firstName, lastName: user.lastName, email: user.email }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

const updateUserStatus = async (req, res) => {
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

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deactivation
    if (parseInt(id) === userId && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    // Update status
    if (isActive) {
      await User.activateUser(id);
    } else {
      await User.deactivateUser(id);
    }

    // Log status update
    await AuditLog.createLog('UPDATE_STATUS', 'User', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      isActive
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    await User.updatePassword(id, newPassword);

    // Log password change
    await AuditLog.createLog('CHANGE_PASSWORD', 'User', id, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.searchUsers(q);

    // Remove password from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    res.json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  changeUserPassword,
  searchUsers
};
