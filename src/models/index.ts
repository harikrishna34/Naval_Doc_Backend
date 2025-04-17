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
  },
  { sequelize, modelName: 'User', tableName: 'users' }
);

Otp.init(
  {
    mobile: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Otp', tableName: 'otps' }
);

// Export models and Sequelize instance
export { sequelize, User, Otp };