import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('collection_log_user', (tb) => {
    tb.timestamp('recent_obtained_date');
    tb.uuid('obtained_collection_log_item_id');
    tb.foreign('obtained_collection_log_item_id').references('collection_log_item.id');

    tb.index(['obtained_collection_log_item_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('collection_log_user', (tb) => {
    tb.dropColumn('recent_obtained_date');
    tb.dropColumn('obtained_collection_log_item_id');

    tb.dropIndex(['obtained_collection_log_item_id']);
  });
}

