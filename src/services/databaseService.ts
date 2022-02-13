import { Sequelize } from 'sequelize-typescript';

import CollectionLog from '../models/CollectionLog';
import CollectionLogEntry from '../models/CollectionLogEntry';
import CollectionLogItem from '../models/CollectionLogItem';
import CollectionLogKillCount from '../models/CollectionLogKillCount';
import CollectionLogTab from '../models/CollectionLogTab';
import User from '../models/CollectionLogUser';

export default async() => {
  const db = new Sequelize({
    database: process.env.DB_NAME,
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string),
    models: [
      CollectionLog,
      CollectionLogEntry,
      CollectionLogItem, 
      CollectionLogKillCount,
      CollectionLogTab,
      User,
    ],
  });
  await db.authenticate();
}
