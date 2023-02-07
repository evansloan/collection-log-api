import { Knex } from 'knex';

const COLLECTION_LOG_USER_TABLE = 'collection_log_user';
const IS_FEMALE_COLUMN = 'is_female';
const ACCOUNT_HASH_COLUMN = 'account_hash';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.boolean(IS_FEMALE_COLUMN).defaultTo(false);
    tb.string(ACCOUNT_HASH_COLUMN);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.dropColumn(IS_FEMALE_COLUMN);
    tb.dropColumn(ACCOUNT_HASH_COLUMN);
  });
};
