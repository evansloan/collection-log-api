'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collection_log_item', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      collection_log_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'collection_log',
          },
          key: 'id',
        },
        allowNull: false,
      },
      collection_log_entry_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'collection_log_entry',
          },
          key: 'id',
        },
        allowNull: false,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      item_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      obtained: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sequence: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      obtained_at: {
        type: Sequelize.DataTypes.DATE,
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
    await queryInterface.dropTable('collection_log_item');
  },
};
