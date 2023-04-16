import { Knex } from 'knex';

const COLLECTION_LOG_ITEM_TABLE = 'collection_log_item';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .createTable(COLLECTION_LOG_ITEM_TABLE, (tb) => {
      tb.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'));

      tb.uuid('collection_log_id').notNullable();
      tb.foreign('collection_log_id').references('collection_log.id');

      tb.uuid('collection_log_entry_id').notNullable();
      tb.foreign('collection_log_entry_id').references('collection_log_entry.id');

      tb.string('name').notNullable();
      tb.integer('item_id').notNullable();
      tb.integer('quantity').defaultTo(0);
      tb.boolean('obtained').defaultTo(false);
      tb.integer('sequence').notNullable();
      tb.timestamp('obtained_at');
      tb.timestamp('created_at');
      tb.timestamp('updated_at');
      tb.timestamp('deleted_at');
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTable(COLLECTION_LOG_ITEM_TABLE);
};
