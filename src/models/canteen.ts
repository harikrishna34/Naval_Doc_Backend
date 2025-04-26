import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

class Canteen extends Model {
  public id!: number;
  public canteenName!: string;
  public canteenCode!: string;
  public canteenImage!: Buffer | null;
  public createdById!: number | null;
  public updatedById!: number | null;
  public createdAt!: number | null;
  public updatedAt!: number | null;
}

Canteen.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    canteenName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    canteenCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    canteenImage: {
      type: DataTypes.BLOB,
      allowNull: true,
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
      defaultValue: () => Math.floor(Date.now() / 1000), // Unix timestamp in seconds
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000), // Unix timestamp in seconds
    },
  },
  {
    sequelize,
    modelName: 'Canteen',
    tableName: 'canteens',
    timestamps: false, // Disable Sequelize's automatic timestamps
  }
);

export default Canteen;