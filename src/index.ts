import express from 'express';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import { sequelize } from './models';
import cors from 'cors'; // Import CORS
import Role from './models/role';
import User from './models/user';
import UserRole from './models/userRole';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

// Enable CORS with open options
const corsOptions = {
  origin: true, // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies
};

app.use(cors(corsOptions)); // Apply CORS globally

sequelize.sync({ force: false }) // Sync all models
  .then(async () => {
    console.log('All tables created successfully!');

    // Seed admin account and roles
    const seedAdminAccount = async () => {
      try {
        // Create default roles
        const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' } });
        const [userRole] = await Role.findOrCreate({ where: { name: 'User' } });

        // Create admin user
        const [adminUser] = await User.findOrCreate({
          where: { email: 'admin@example.com' },
          defaults: {
            firstName: 'Admin', // Use firstName
            lastName: 'User', // Use lastName
            mobile: '1234567890', // Add mobile number
          },
        });

        // Assign admin role to the admin user
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});