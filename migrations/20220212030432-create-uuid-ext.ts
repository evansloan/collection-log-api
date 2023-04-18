import { Knex } from 'knex';

export const up = (knex: Knex): Knex.Raw<any> => {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
};

export const down = (knex: Knex): Knex.Raw<any> => {
  return knex.raw('DROP EXTENSION "uuid-ossp"');
};
