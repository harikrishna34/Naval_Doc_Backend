import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Role extends Model {
  public id!: number;
  public name!: string;
  public status!: string; // Status of the role (e.g., 'active', 'inactive')
  public createdById!: number | null; // ID of the user who created the record
  public updatedById!: number | null; // ID of the user who last updated the record
  public createdAt!: number; // Unix timestamp
  public updatedAt!: number; // Unix timestamp
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    hooks: {
      beforeCreate: (role) => {
        const now = Math.floor(Date.now() / 1000);
        role.createdAt = now;
        role.updatedAt = now;
      },
      beforeUpdate: (role) => {
        role.updatedAt = Math.floor(Date.now() / 1000);
      },
    },
  }
);

export default Role;