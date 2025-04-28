import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class CartItem extends Model {
  public id!: number;
  public cartId!: number;
  public itemId!: number;
  public menuId!: number;
  public quantity!: number;
  public price!: number;
  public total!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
 
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: true,
  }
);

export default CartItem;