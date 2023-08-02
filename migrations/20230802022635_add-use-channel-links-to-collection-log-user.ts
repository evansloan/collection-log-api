import { Knex } from 'knex';

const COLLECTION_LOG_USER_TABLE = 'collection_log_user';
const YOUTUBE_URL_COLUMN = 'youtube_url';
const TWITCH_URL_COLUMN = 'twitch_url';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.string(YOUTUBE_URL_COLUMN).nullable();
    tb.string(TWITCH_URL_COLUMN).nullable();
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.dropColumn(YOUTUBE_URL_COLUMN);
    tb.dropColumn(TWITCH_URL_COLUMN);
  });
};
