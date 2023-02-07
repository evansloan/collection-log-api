import { Knex } from 'knex';

const COLLECTION_LOG_ITEM_TABLE = 'collection_log_item';
const COLLECTION_LOG_KILL_COUNT_TABLE = 'collection_log_kill_count';
const COLLECTION_LOG_ID_COLUMN = 'collection_log_id';
const COLLECTION_LOG_ENTRY_ID_COLUMN = 'collection_log_entry_id';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .alterTable(COLLECTION_LOG_ITEM_TABLE, (tb) => {
      tb.index([COLLECTION_LOG_ID_COLUMN]);
      tb.index([COLLECTION_LOG_ENTRY_ID_COLUMN, COLLECTION_LOG_ID_COLUMN]);
    })
    .alterTable(COLLECTION_LOG_KILL_COUNT_TABLE, (tb) => {
      tb.index([COLLECTION_LOG_ENTRY_ID_COLUMN, COLLECTION_LOG_ID_COLUMN]);
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema
    .alterTable(COLLECTION_LOG_ITEM_TABLE, (tb) => {
      tb.dropIndex([COLLECTION_LOG_ID_COLUMN]);
      tb.dropIndex([COLLECTION_LOG_ENTRY_ID_COLUMN, COLLECTION_LOG_ID_COLUMN]);
    })
    .alterTable(COLLECTION_LOG_KILL_COUNT_TABLE, (tb) => {
      tb.dropIndex([COLLECTION_LOG_ENTRY_ID_COLUMN, COLLECTION_LOG_ID_COLUMN]);
    });
};
