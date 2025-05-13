import express from 'express';
import bodyParser from 'body-parser';

import authRoutes from './routes/authRoutes';
import canteenRoutes from './routes/canteenRoutes';
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import menuConfigurationRoutes from './routes/menuConfigurationRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import adminDashboardRoutes from './routes/adminDashboardRoutes';





import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';
import cors from 'cors';
import { sequelize } from './config/database'; // Updated import
import User from './models/user';
import UserRole from './models/userRole';
import Role from './models/role';

import Menu from './models/menu';
import MenuItem from './models/menuItem';
import Item from './models/item';
import MenuConfiguration from './models/menuConfiguration';
import Canteen from './models/canteen';
import cartRoutes from './routes/cartRoutes';
import Pricing from './models/pricing';
import CartItem from './models/cartItem'; // Import CartItem
import Cart from './models/cart'; // Import Cart
import Order from './models/order';
import OrderItem from './models/orderItem';
import Payment from './models/payment';






dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// Enable CORS
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Initialize models
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    canteenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  { sequelize, modelName: 'User' }
);
Role.init(
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
  },
  { sequelize, modelName: 'Role' }
);
UserRole.init(
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
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'UserRole' }
);

// User and Role associations
User.hasMany(UserRole, { foreignKey: 'userId', as: 'userRoles' }); // Alias for User -> UserRole
UserRole.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Reverse association
UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'role' }); // Alias for UserRole -> Role
Role.hasMany(UserRole, { foreignKey: 'roleId', as: 'roleUserRoles' }); // Updated alias to avoid conflicts

// Menu and MenuItem associations
Menu.hasMany(MenuItem, { foreignKey: 'menuId', as: 'menuItems' }); // Alias for Menu -> MenuItem
MenuItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' }); // Reverse association
MenuItem.belongsTo(Item, { foreignKey: 'itemId', as: 'menuItemItem' }); // Updated alias to avoid conflicts

// Menu and Canteen/MenuConfiguration associations
Menu.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'menuCanteen' }); // Updated alias to avoid conflicts
Menu.belongsTo(MenuConfiguration, { foreignKey: 'menuConfigurationId', as: 'menuMenuConfiguration' }); // Updated alias

// Cart and CartItem associations
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'cartItems' }); // Alias for Cart -> CartItem
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' }); // Reverse association

// Item and CartItem associations
Item.hasMany(CartItem, { foreignKey: 'itemId', as: 'itemCartItems' }); // Updated alias to avoid conflicts
CartItem.belongsTo(Item, { foreignKey: 'itemId', as: 'cartItemItem' }); // Updated alias to avoid conflicts

// Cart and MenuConfiguration/Canteen associations
Cart.belongsTo(MenuConfiguration, { foreignKey: 'menuConfigurationId', as: 'cartMenuConfiguration' }); // Updated alias
Cart.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'cartCanteen' }); // Updated alias

// Order and User associations
// Order.belongsTo(User, { foreignKey: 'userId', as: 'orderUser' }); // Updated alias to avoid conflicts
// User.hasMany(Order, { foreignKey: 'userId', as: 'userOrders' }); // Updated alias to avoid conflicts


Order.belongsTo(User, { foreignKey: 'userId', as: 'orderUser' }); // Alias for Order -> User
User.hasMany(Order, { foreignKey: 'userId', as: 'userOrders' }); // Reverse association

// Menu and Canteen association
Menu.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'canteenMenu' }); // Alias for Menu -> Canteen
Canteen.hasMany(Menu, { foreignKey: 'canteenId', as: 'canteenMenus' }); // Reverse association

// Order and Canteen association
Order.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'orderCanteen' }); // Updated alias
Canteen.hasMany(Order, { foreignKey: 'canteenId', as: 'canteenOrders' }); // Reverse association


// Order and OrderItem associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' }); // Alias for Order -> OrderItem
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' }); // Reverse association


// Order and Payment associations
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' }); // Alias for Order -> Payment
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' }); // Reverse association

// OrderItem and Item associations
OrderItem.belongsTo(Item, { foreignKey: 'itemId', as: 'menuItemItem' }); // Alias for OrderItem -> Item
Item.hasMany(OrderItem, { foreignKey: 'itemId', as: 'itemOrderItems' }); // Reverse association


CartItem.belongsTo(MenuItem, { as: 'menuItem', foreignKey: 'itemId' });


// Associate Item with Pricing
Item.hasOne(Pricing, { foreignKey: 'itemId', as: 'itemPricing' }); // Associate Item with Pricing
Pricing.belongsTo(Item, { foreignKey: 'itemId', as: 'pricingItem' }); // Updated alias to avoid conflict


sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully!');
});

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/canteen', canteenRoutes);

app.use('/api/user', userRoutes);

app.use('/api/item', itemRoutes);

app.use('/api/menu', menuRoutes);

app.use('/api/menuconfig', menuConfigurationRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/order', orderRoutes);

 app.use('/api/adminDasboard', adminDashboardRoutes);












app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});