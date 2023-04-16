import { Knex } from 'knex';

const COLLECTION_LOG_KILL_COUNT_TABLE = 'collection_log_kill_count';
const SEQUENCE_COLUMN = 'sequence';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_KILL_COUNT_TABLE, (tb) => {
    tb.integer(SEQUENCE_COLUMN).defaultTo(0);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_KILL_COUNT_TABLE, (tb) => {
    tb.dropColumn(SEQUENCE_COLUMN);
  });
};