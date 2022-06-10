'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collection_log', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      unique_obtained: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      unique_items: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_obtained: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_items: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'collection_log_user',
          },
          key: 'id',
        },
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
      },
      deleted_at: {
        type: Sequelize.DataTypes.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('collection_log');
  },
};
