import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

import Menu from './menu';
import Item from './item';

class MenuItem extends Model {
  public id!: number;
  public menuId!: number;
  public itemId!: number;
  public minQuantity!: number;
  public maxQuantity!: number;
  public status!: string; // Status of the menu item (e.g., 'active', 'inactive')
  public createdById!: number | null; // ID of the user who created the menu item
  public updatedById!: number | null; // ID of the user who last updated the menu item
  public createdAt!: number;
  public updatedAt!: number;
}

MenuItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    maxQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
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
      defaultValue: () => Math.floor(Date.now() / 1000),
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000),
    },
  },
  {
    sequelize,
    modelName: 'MenuItem',
    tableName: 'menu_items',
    timestamps: true,
    hooks: {
      beforeCreate: (menuItem) => {
        const now = Math.floor(Date.now() / 1000);
        menuItem.createdAt = now;
        menuItem.updatedAt = now;
      },
      beforeUpdate: (menuItem) => {
        menuItem.updatedAt = Math.floor(Date.now() / 1000);
      },
    },
  }
);

// Menu.hasMany(MenuItem, { foreignKey: 'menuId', as: 'menuItemsForMenu' }); // Unique alias
// MenuItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' }); // Reverse association


export default MenuItem;