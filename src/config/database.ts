import { Sequelize } from 'sequelize';

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file


const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: console.log, // Enable logging for debugging
});

export { sequelize };