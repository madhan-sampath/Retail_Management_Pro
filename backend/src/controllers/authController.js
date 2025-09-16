const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const AuditLogModel = require('../models/AuditLog');

const User = new UserModel();
const AuditLog = new AuditLogModel();

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, role = 'user' } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create new user
    const newUser = await User.createUser({
      firstName,
      lastName,
      email,
      username,
      password,
      role
    });

    // Generate token
    const token = generateToken(newUser.id);

    // Log registration
    await AuditLog.createLog('REGISTER', 'User', newUser.id, newUser.id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Log login
    await AuditLog.createLog('LOGIN', 'User', user.id, user.id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Log logout
    await AuditLog.createLog('LOGOUT', 'User', userId, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, username } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another user'
        });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken by another user'
        });
      }
    }

    // Update user
    const updatedUser = await User.update(
      { firstName, lastName, email, username },
      { where: { id: userId } }
    );

    if (updatedUser === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user
    const user = await User.findByPk(userId);

    // Log profile update
    await AuditLog.createLog('UPDATE_PROFILE', 'User', userId, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      changes: { firstName, lastName, email, username }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate current password
    const isValidPassword = await User.validatePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await User.updatePassword(userId, newPassword);

    // Log password change
    await AuditLog.createLog('CHANGE_PASSWORD', 'User', userId, userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
