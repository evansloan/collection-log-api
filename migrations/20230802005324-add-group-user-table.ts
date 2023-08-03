import { Knex } from 'knex';

const GROUP_USER_TABLE = 'collection_log_group_user';
const GROUP_TABLE = 'collection_log_group';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .createTable(GROUP_USER_TABLE, (tb) => {
      tb.uuid('id')
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary()
        .index();

      tb.uuid('collection_log_user_id')
        .references('id')
        .inTable('collection_log_user')
        .notNullable()
        .index();

      tb.uuid('collection_log_group_id')
        .references('id')
        .inTable(GROUP_TABLE)
        .onDelete('CASCADE')
        .notNullable()
        .index();

      tb.timestamp('created_at', { useTz: true })
        .defaultTo(knex.fn.now());

      tb.timestamp('updated_at', { useTz: true })
        .defaultTo(knex.fn.now());

      tb.timestamp('deleted_at', { useTz: true });
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTableIfExists(GROUP_USER_TABLE);
};
