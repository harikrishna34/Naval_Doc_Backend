import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Otp extends Model {
  public id!: number;
  public mobile!: string;
  public otp!: string;
  public expiresAt!: number;
}

Otp.init(
  {
    mobile: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Otp', tableName: 'otps' }
);

export default Otp;

