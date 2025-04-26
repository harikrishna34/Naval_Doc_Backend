import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import Item from './item';

class Pricing extends Model {
  public id!: number;
  public itemId!: number;
  public price!: number;
  public currency!: string;
  public startDate!: number; // Unix timestamp
  public endDate!: number; // Unix timestamp
  public status!: string; // Status of the pricing (e.g., 'active', 'inactive')
  public createdAt!: number; // Unix timestamp
  public updatedAt!: number; // Unix timestamp
}

Pricing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Item,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
    startDate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active', // Default status is 'active'
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000), // Unix timestamp
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000), // Unix timestamp
    },
  },
  {
    sequelize,
    modelName: 'Pricing',
    tableName: 'pricing',
    timestamps: true,
    hooks: {
      beforeCreate: (pricing) => {
        const now = Math.floor(Date.now() / 1000);
        pricing.createdAt = now;
        pricing.updatedAt = now;
      },
      beforeUpdate: (pricing) => {
        pricing.updatedAt = Math.floor(Date.now() / 1000);
      },
    },
  }
);

// Pricing.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

export default Pricing;