import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './user';
import Role from './role';

class UserRole extends Model {
  public id!: number;
  public userId!: number;
  public roleId!: number;
  public status!: string; // Status of the user-role mapping (e.g., 'active', 'inactive')
  public createdById!: number | null; // ID of the user who created the record
  public updatedById!: number | null; // ID of the user who last updated the record
  public createdAt!: number; // Unix timestamp
  public updatedAt!: number; // Unix timestamp
}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active', // Default status is 'active'
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
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
  {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    timestamps: true,
    hooks: {
      beforeCreate: (userRole) => {
        const now = Math.floor(Date.now() / 1000);
        userRole.createdAt = now;
        userRole.updatedAt = now;
      },
      beforeUpdate: (userRole) => {
        userRole.updatedAt = Math.floor(Date.now() / 1000);
      },
    },
  }
);



export default UserRole;