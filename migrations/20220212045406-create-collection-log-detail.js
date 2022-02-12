'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collection_log_detail', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      collectionLogId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'collection_log',
          },
          key: 'id'
        },
        allowNull: false
      },
      tab: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      entry: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      itemId: {
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
      createdAt: {
        type: Sequelize.DataTypes.DATE
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('collection_log_detail');
  }
};
