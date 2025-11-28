import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

import { User } from '../models/User';
import { Dog } from '../models/Dog';
import { GroomingAppointment } from '../models/GroomingAppointment';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'mysql',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  models: [User, Dog, GroomingAppointment],
  logging: false,
});

export default sequelize;
