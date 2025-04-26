import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

class MenuConfiguration extends Model {
  public id!: number;
  public name!: string; // Name of the menu (e.g., Breakfast, Lunch)
  public defaultStartTime!: number; // Default start time in Unix format
  public defaultEndTime!: number; // Default end time in Unix format
  public status!: string; // Status of the menu configuration (e.g., 'active', 'inactive')
  public createdById!: number | null; // ID of the user who created the configuration
  public updatedById!: number | null; // ID of the user who last updated the configuration
  public createdAt!: number; // Unix timestamp for creation
  public updatedAt!: number; // Unix timestamp for last update
}

MenuConfiguration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure menu names are unique
    },
    defaultStartTime: {
      type: DataTypes.INTEGER, // Store as Unix timestamp
      allowNull: false,
    },
    defaultEndTime: {
      type: DataTypes.INTEGER, // Store as Unix timestamp
      allowNull: false,
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
    modelName: 'MenuConfiguration',
    tableName: 'menu_configurations',
    timestamps: false, // Disable Sequelize's automatic timestamps
    hooks: {
      beforeCreate: (menuConfig) => {
        const now = Math.floor(Date.now() / 1000);
        menuConfig.createdAt = now;
        menuConfig.updatedAt = now;
      },
      beforeUpdate: (menuConfig) => {
        menuConfig.updatedAt = Math.floor(Date.now() / 1000);
      },
    },
  }
);

export default MenuConfiguration;