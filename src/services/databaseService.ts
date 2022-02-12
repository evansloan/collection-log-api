import { Sequelize } from 'sequelize-typescript';

import CollectionLog from '../models/CollectionLog';
import CollectionLogDetail from '../models/CollectionLogDetail';
import User from '../models/User';

export default new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  models: [CollectionLog, CollectionLogDetail, User],
});
