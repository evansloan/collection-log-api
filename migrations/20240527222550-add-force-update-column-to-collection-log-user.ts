import { Knex } from 'knex';

const COLLECTION_LOG_USER_TABLE = 'collection_log_user';
const FORCE_UPDATE_COLUMN = 'force_update';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.boolean(FORCE_UPDATE_COLUMN).defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table(COLLECTION_LOG_USER_TABLE, (tb) => {
    tb.dropColumn(FORCE_UPDATE_COLUMN);
  });
}

