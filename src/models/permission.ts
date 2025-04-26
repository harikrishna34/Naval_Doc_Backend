import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import Feature from './feature';
import Role from './role';

class Permission extends Model {
  public id!: number;
  public featureId!: number;
  public roleId!: number;
  public read!: boolean;
  public write!: boolean;
  public canUpdate!: boolean;
  public delete!: boolean;
  public status!: string; // Status of the permission (e.g., 'active', 'inactive')
  public createdById!: number | null; // ID of the user who created the record
  public updatedById!: number | null; // ID of the user who last updated the record
  public createdAt!: number; // Unix timestamp
  public updatedAt!: number; // Unix timestamp
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    featureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Feature,
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
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    write: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true,
    hooks: {
      beforeCreate: (permission) => {
        const now = Math.floor(Date.now() / 1000);
        permission.createdAt = now;
        permission.updatedAt = now;
      },
      beforeUpdate: (permission) => {
        permission.updatedAt = Math.floor(Date.now() / 1000);
      },
    },
  }
);

export default Permission;