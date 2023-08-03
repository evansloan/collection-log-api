import { Knex } from 'knex';

const GROUPS_TABLE = 'collection_log_group';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema
    .createTable(GROUPS_TABLE, (tb) => {
      tb.uuid('id')
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      tb.string('access_key', 11)
        .unique()
        .notNullable();

      tb.string('name', 20)
        .unique()
        .notNullable()
        .index();

      tb.string('description', 120);

      tb.integer('world')
        .unsigned()
        .checkBetween([301, 580]);

      tb.string('friends_chat', 12);

      tb.string('clan', 20);

      tb.integer('unique_obtained')
        .defaultTo(0)
        .unsigned();

      tb.integer('unique_items')
        .defaultTo(0)
        .unsigned();

      tb.integer('group_user_count')
        .defaultTo(0)
        .unsigned();

      tb.boolean('is_updating')
        .defaultTo(false);

      tb.timestamp('created_at', { useTz: true })
        .defaultTo(knex.fn.now());

      tb.timestamp('updated_at', { useTz: true })
        .defaultTo(knex.fn.now());

      tb.timestamp('deleted_at', { useTz: true });
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTableIfExists(GROUPS_TABLE);
};
