import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.alterTable('collection_log_item', (tb) => {
    tb.index(['item_id']);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.alterTable('collection_log_item', (tb) => {
    tb.dropIndex(['item_id']);
  });
};
