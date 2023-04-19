import { Knex } from 'knex';

export const seed = async (knex: Knex): Promise<void> => {
  await knex('collection_log_kill_count').del();
  await knex('collection_log_item').del();
  await knex('collection_log_entry').del();
  await knex('collection_log_tab').del();
  await knex('collection_log').del();
  await knex('collection_log_user').del();
};
