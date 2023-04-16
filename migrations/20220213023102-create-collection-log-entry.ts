import { Knex } from 'knex';

const COLLECTION_LOG_ENTRY_TABLE = 'collection_log_entry';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .createTable(COLLECTION_LOG_ENTRY_TABLE, (tb) => {
      tb.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'));

      tb.uuid('collection_log_tab_id').notNullable();
      tb.foreign('collection_log_tab_id').references('collection_log_tab.id');

      tb.string('name').notNullable();
      tb.timestamp('created_at');
      tb.timestamp('updated_at');
      tb.timestamp('deleted_at');
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTable(COLLECTION_LOG_ENTRY_TABLE);
};
