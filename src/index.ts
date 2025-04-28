import express from 'express';
import bodyParser from 'body-parser';

import authRoutes from './routes/authRoutes';
import canteenRoutes from './routes/canteenRoutes';
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import menuConfigurationRoutes from './routes/menuConfigurationRoutes';
import menuRoutes from './routes/menuRoutes';



import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';
import cors from 'cors';
import { sequelize } from './config/database'; // Updated import
import Role from './models/role';
import User from './models/user';
import UserRole from './models/userRole';

import Menu from './models/menu';
import MenuItem from './models/menuItem';
import Item from './models/item';
import MenuConfiguration from './models/menuConfiguration';
import Canteen from './models/canteen';
import cartRoutes from './routes/cartRoutes';
import Pricing from './models/pricing';
import CartItem from './models/cartItem'; // Import CartItem
import Cart from './models/cart'; // Import Cart




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

// Define associations
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

Menu.hasMany(MenuItem, { foreignKey: 'menuId', as: 'menuItems' }); // Unique alias for Menu -> MenuItem
MenuItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' }); // Reverse association
MenuItem.belongsTo(Item, { foreignKey: 'itemId', as: 'item' }); // Keep this alias as 'item'

Menu.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'canteen' });
Menu.belongsTo(MenuConfiguration, { foreignKey: 'menuConfigurationId', as: 'menuConfiguration' });


// Cart associations
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'cartItems' }); // Ensure this association exists
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' }); // Reverse association

// CartItem associations
CartItem.belongsTo(Item, { foreignKey: 'itemId', as: 'item' }); // Ensure this association exists
Item.hasMany(CartItem, { foreignKey: 'itemId', as: 'cartItems' }); // Reverse association


// Cart associations
Cart.belongsTo(MenuConfiguration, { foreignKey: 'menuConfigurationId', as: 'menuConfiguration' });
Cart.belongsTo(Canteen, { foreignKey: 'canteenId', as: 'canteen' });
sequelize.sync({ force: false }) // Sync all models
  .then(async () => {
    console.log('All tables created successfully!');

    // Seed admin account and roles
    const seedAdminAccount = async () => {
      try {
        const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' } });
        await Role.findOrCreate({ where: { name: 'User' } });

        const [adminUser] = await User.findOrCreate({
          where: { email: 'admin@example.com' },
          defaults: {
            firstName: 'Admin',
            lastName: 'User',
            mobile: '1234567890',
            canteenId: null,
          },
        });

        await UserRole.findOrCreate({
          where: { userId: adminUser.id, roleId: adminRole.id },
        });

        console.log('Admin account and roles seeded successfully.');
      } catch (error) {
        console.error('Error seeding admin account:', error);
      }
    };

    await seedAdminAccount();
  })
  .catch((error) => {
    console.error('Error creating tables:', error);
  });

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/canteen', canteenRoutes);

app.use('/api/user', userRoutes);

app.use('/api/item', itemRoutes);

app.use('/api/menu', menuRoutes);

app.use('/api/menuconfig', menuConfigurationRoutes);

app.use('/api/cart', cartRoutes);










app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});