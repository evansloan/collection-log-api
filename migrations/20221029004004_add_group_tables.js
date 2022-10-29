const GROUPS_TABLE_NAME = 'collection_log_group';
const GROUP_USERS_TABLE_NAME = 'collection_log_group_user';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable(GROUPS_TABLE_NAME, (table) => {
      table.uuid('id')
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table.string('access_key', 11)
        .unique()
        .notNullable();

      table.string('name', 20)
        .unique()
        .notNullable()
        .index();

      table.string('description', 120);

      table.integer('world')
        .unsigned()
        .checkBetween([301, 580]);

      table.string('friends_chat', 12);

      table.string('clan', 20);

      table.integer('unique_obtained')
        .defaultTo(0)
        .unsigned();

      table.integer('unique_items')
        .defaultTo(0)
        .unsigned();

      table.integer('group_member_count')
        .defaultTo(0)
        .unsigned();

      table.boolean('is_updating')
        .defaultTo(false);
    })

    .createTable(GROUP_USERS_TABLE_NAME, (table) => {
      table.uuid('id')
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary()
        .index();

      table.uuid('collection_log_user_id')
        .references('id')
        .inTable('collection_log_user')
        .notNullable()
        .index();

      table.uuid('collection_log_group_id')
        .references('id')
        .inTable(GROUPS_TABLE_NAME)
        .onDelete('CASCADE')
        .notNullable()
        .index();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists(GROUP_USERS_TABLE_NAME)
    .dropTableIfExists(GROUPS_TABLE_NAME);
};
