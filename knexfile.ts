import type { Knex } from 'knex';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const client = 'postgresql';
const migrations = { tableName: 'knex_migrations' };
const seeds = { directory: './seeds/' };

const config: { [key: string]: Knex.Config } = {
  development: {
    client,
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    },
    pool: {
      min: 1,
      max: 1,
    },
    migrations,
    seeds,
  },
  production: {
    client,
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    },
    pool: {
      min: 1,
      max: 1,
    },
    migrations,
  },
};

module.exports = config;
