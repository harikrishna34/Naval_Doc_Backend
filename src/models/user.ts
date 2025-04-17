import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public mobile!: string;
  public email!: string;
  public profile!: string | null;
  public gender!: string | null;
}

User.init(
  {
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    profile: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'User', tableName: 'users' }
);

export default User;