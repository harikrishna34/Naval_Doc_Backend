import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

class Feature extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public status!: string; // Status of the feature (e.g., 'active', 'inactive')
  public createdById!: number | null; // ID of the user who created the record
  public updatedById!: number | null; // ID of the user who last updated the record
  public createdAt!: number; // Unix timestamp
  public updatedAt!: number; // Unix timestamp
}

Feature.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: 'Feature',
    tableName: 'features',
    timestamps: true,
    hooks: {
      beforeCreate: (feature) => {
        const now = Math.floor(Date.now() / 1000);
        feature.createdAt = now;
        feature.updatedAt = now;
      },
      beforeUpdate: (feature) => {
        feature.updatedAt = Math.floor(Date.now() / 1000);
      },
    },
  }
);

export default Feature;