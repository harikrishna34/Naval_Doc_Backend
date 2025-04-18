import express from 'express';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import { sequelize } from './models';
import cors from 'cors'; // Import CORS

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