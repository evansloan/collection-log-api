import { Knex } from 'knex';

const COLLECTION_LOG_TABLE = 'collection_log';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .createTable(COLLECTION_LOG_TABLE, (tb) => {
      tb.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'));

      tb.uuid('user_id').notNullable();
      tb.foreign('user_id').references('collection_log_user.id');

      tb.integer('unique_obtained').defaultTo(0);
      tb.integer('unique_items').defaultTo(0);
      tb.integer('total_obtained').defaultTo(0);
      tb.integer('total_items').defaultTo(0);
      tb.timestamp('created_at');
      tb.timestamp('updated_at');
      tb.timestamp('deleted_at');
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTable(COLLECTION_LOG_TABLE);
};
