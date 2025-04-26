import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

class Otp extends Model {
  public id!: number;
  public mobile!: string;
  public otp!: string;
  public expiresAt!: number;
  public status!: string; // Status of the OTP (e.g., 'active', 'expired')
}

Otp.init(
  {
    mobile: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active', // Default status is 'active'
    },
  },
  {
    sequelize,
    modelName: 'Otp',
    tableName: 'otps',
    timestamps: true,
    hooks: {
      beforeCreate: (otp) => {
        const now = Math.floor(Date.now() / 1000);
        otp.expiresAt = now + 300; // Example: OTP expires in 5 minutes
      },
    },
  }
);

export default Otp;

