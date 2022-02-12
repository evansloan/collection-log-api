import { Sequelize } from 'sequelize-typescript';
import path from 'path';

const srcDir = __dirname.split('/').slice(0, -1);
srcDir.push('models');

export default new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  models: [path.resolve(...srcDir)],
});
