import sequelize from '../config/database';
import { DataTypes } from 'sequelize';
import User from './user';
import Otp from './otp';

// Ensure models are registered with Sequelize
User.init(
  {
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    profile: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' }, // Added status key
    createdById: { type: DataTypes.INTEGER, allowNull: true }, // Added createdById
    updatedById: { type: DataTypes.INTEGER, allowNull: true }, // Added updatedById
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000), // Default to current Unix timestamp
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000), // Default to current Unix timestamp
    },
  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true }
);

Otp.init(
  {
    mobile: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' }, // Added status key
    createdById: { type: DataTypes.INTEGER, allowNull: true }, // Added createdById
    updatedById: { type: DataTypes.INTEGER, allowNull: true }, // Added updatedById
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000), // Default to current Unix timestamp
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000), // Default to current Unix timestamp
    },
  },
  { sequelize, modelName: 'Otp', tableName: 'otps', timestamps: true }
);

// Export models and Sequelize instance
export { sequelize, User, Otp };