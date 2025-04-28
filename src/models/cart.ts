import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class Cart extends Model {
  public id!: number;
  public userId!: number;
  public status!: string;
  public totalAmount!: number;
  public canteenId!: number; // Added canteenId
  public menuConfigurationId!: number; // Added menuConfigurationId
  public menuId!: number; // Added menuId
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'abandoned'),
      allowNull: false,
      defaultValue: 'active',
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    canteenId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for backward compatibility
    },
    menuConfigurationId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for backward compatibility
    },
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for backward compatibility
    }
  },
  {
    sequelize,
    tableName: 'carts',
    timestamps: true,
  }
);

export default Cart;