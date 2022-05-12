'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('collection_log', 'is_updating', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('collection_log', 'is_updating');
  }
};
