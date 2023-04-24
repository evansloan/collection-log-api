import { Knex } from 'knex';

const RECENT_OBTAINED_ITEMS_TABLE = 'recent_obtained_items';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .createTable(RECENT_OBTAINED_ITEMS_TABLE, (tb) => {
      tb.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'));
      tb.string('username').notNullable();
      tb.string('name').notNullable();
      tb.integer('item_id').notNullable();
      tb.integer('quantity').defaultTo(0);
      tb.boolean('obtained').defaultTo(false);
      tb.timestamp('obtained_at').notNullable();
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTable(RECENT_OBTAINED_ITEMS_TABLE);
};
