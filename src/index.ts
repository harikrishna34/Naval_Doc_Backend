import express from 'express';
import authRoutes from './routes/authRoutes';
import canteenRoutes from './routes/canteenRoutes';
import userRoutes from './routes/userRoutes';

import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';
import cors from 'cors';
import { sequelize } from './config/database'; // Updated import
import Role from './models/role';
import User from './models/user';
import UserRole from './models/userRole';

dotenv.config();

const app = express();
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

app.use('/api/userRoutes', userRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});