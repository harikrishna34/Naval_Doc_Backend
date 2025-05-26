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
    orderDate: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for updates
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
// This code defines a Cart model using Sequelize ORM for a Node.js application.
// The Cart model includes fields for user ID, status, total amount, canteen ID, menu configuration ID, and menu ID.
// It also includes timestamps for created and updated dates. The model is initialized with appropriate data types and constraints.


// The Cart model is exported for use in other parts of the application, such as controllers or services.
// This allows for creating, reading, updating, and deleting cart records in the database.
//       return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
//         message: 'An error occurred while processing your request.',   
//       });
//     }
//   } catch (error) {
//     console.error('Error creating payment link:', error);
//     return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({

//       message: 'An error occurred while creating the payment link.',
//     });