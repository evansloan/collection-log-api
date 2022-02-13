'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collection_log_kill_count', {
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
          key: 'id'
        },
        allowNull: false
      },
      collection_log_entry_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'collection_log_entry',
          },
          key: 'id'
        },
        allowNull: false
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE
      },
      deleted_at: {
        type: Sequelize.DataTypes.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('collection_log_kill_count');
  }
};
