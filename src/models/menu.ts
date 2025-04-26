import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import moment from 'moment';
import MenuConfiguration from './menuConfiguration'; // Import MenuConfiguration model
import MenuItem from './menuItem';

class Menu extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public startTime!: number; // Start time in Unix format
  public endTime!: number; // End time in Unix format
  public status!: string;
  public createdById!: number | null;
  public updatedById!: number | null;
  public createdAt!: number;
  public updatedAt!: number;
}

Menu.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.INTEGER, // Store as Unix timestamp
      allowNull: false,
    },
    endTime: {
      type: DataTypes.INTEGER, // Store as Unix timestamp
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    menuConfigurationId: {
      type: DataTypes.INTEGER, // Foreign key to MenuConfiguration
      allowNull: true, // Optional: Menus can be custom or based on configuration
      references: {
        model: MenuConfiguration,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    modelName: 'Menu',
    tableName: 'menus',
    timestamps: true,
    hooks: {
      beforeCreate: (menu) => {
        const now = Math.floor(Date.now() / 1000);
        menu.createdAt = now;
        menu.updatedAt = now;

        // Convert startTime and endTime to Unix timestamps
        menu.startTime = moment(menu.startTime, 'HH:mm').unix();
        menu.endTime = moment(menu.endTime, 'HH:mm').unix();
      },
      beforeUpdate: (menu) => {
        menu.updatedAt = Math.floor(Date.now() / 1000);

        // Convert startTime and endTime to Unix timestamps
        menu.startTime = moment(menu.startTime, 'HH:mm').unix();
        menu.endTime = moment(menu.endTime, 'HH:mm').unix();
      },
    },
  }
);

// Define association
// Menu.belongsTo(MenuConfiguration, { foreignKey: 'menuConfigurationId', as: 'menuConfiguration' });

// Menu.hasMany(MenuItem, { foreignKey: 'menuId', as: 'menuItems' }); // Define the association
// MenuItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' }); // Reverse association

export default Menu;