import { Sequelize } from 'sequelize-typescript';

const createConnection = () => {
  const db = new Sequelize({
    database: process.env.DB_NAME,
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string),
  });
  
  return db;
}

export default createConnection();
