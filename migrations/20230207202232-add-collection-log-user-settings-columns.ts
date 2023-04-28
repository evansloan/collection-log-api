import { Knex } from 'knex';

const COLLECTION_LOG_USER_TABLE = 'collection_log_user';
const SHOW_QUANTITY_COLUMN = 'show_quantity';
const DISPLAY_RANK_COLUMN = 'display_rank';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.boolean(SHOW_QUANTITY_COLUMN).defaultTo(true);
    tb.string(DISPLAY_RANK_COLUMN).defaultTo('ALL');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.dropColumn(SHOW_QUANTITY_COLUMN);
    tb.dropColumn(DISPLAY_RANK_COLUMN);
  });
};
