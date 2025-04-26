import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';
import User from './user';
import Role from './role';
import UserRole from './userRole';

// Initialize models
User.init({}, { sequelize });
Role.init(
  {
	// Define attributes for Role model
	id: {
	  type: DataTypes.INTEGER,
	  primaryKey: true,
	  autoIncrement: true,
	},
	name: {
	  type: DataTypes.STRING,
	  allowNull: false,
	},
  },
  { sequelize }
);
UserRole.init(
  {
	// Define attributes for UserRole model
	userId: {
	  type: DataTypes.INTEGER,
	  allowNull: false,
	},
	roleId: {
	  type: DataTypes.INTEGER,
	  allowNull: false,
	},
  },
  { sequelize }
);

// Define associations
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

export { sequelize, User, Role, UserRole };