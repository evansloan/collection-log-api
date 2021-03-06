'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('collection_log_user', 'is_female', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('collection_log_user', 'account_hash', {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('collection_log_user', 'is_female');
    await queryInterface.removeColumn('collection_log_user', 'account_hash');
  },
};
