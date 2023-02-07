import { Knex } from 'knex';

const COLLECTION_LOG_TABLE = 'collection_log';
const IS_UPDATING_COLUMN = 'is_updating';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_TABLE, (tb) => {
    tb.boolean(IS_UPDATING_COLUMN).defaultTo(false);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_TABLE, (tb) => {
    tb.dropColumn(IS_UPDATING_COLUMN);
  });
};
