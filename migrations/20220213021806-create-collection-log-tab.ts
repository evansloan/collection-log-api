import { Knex } from 'knex';

const COLLECTION_LOG_TAB_TABLE = 'collection_log_tab';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .createTable(COLLECTION_LOG_TAB_TABLE, (tb) => {
      tb.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'));
      tb.string('name').notNullable();
      tb.timestamp('updated_at');
      tb.timestamp('deleted_at');
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTable(COLLECTION_LOG_TAB_TABLE);
};
