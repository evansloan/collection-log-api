import { Knex } from 'knex';

const COLLECTION_LOG_USER_TABLE = 'collection_log_user';
const IS_BANNED_COLUMN = 'is_banned';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.boolean(IS_BANNED_COLUMN).defaultTo(false);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.dropColumn(IS_BANNED_COLUMN);
  });
};
