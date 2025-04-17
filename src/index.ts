import express from 'express';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import { sequelize, User, Otp } from './models';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }) // Sync all models
  .then(() => {
    console.log('All tables created successfully!');
  })
  .catch((error) => {
    console.error('Error creating tables:', error);
  });

app.use(express.json());
app.use('/api', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});