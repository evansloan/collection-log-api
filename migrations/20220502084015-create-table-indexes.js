'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addIndex('collection_log', ['id']);
    queryInterface.addIndex('collection_log_user', ['id']);
    queryInterface.addIndex('collection_log_item', ['id', 'collection_log_id']);
    queryInterface.addIndex('collection_log_kill_count', ['id', 'collection_log_id']);
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeIndex('collection_log', ['id']);
    queryInterface.removeIndex('collection_log_user', ['id']);
    queryInterface.removeIndex('collection_log_item', ['id', 'collection_log_id']);
    queryInterface.removeIndex('collection_log_kill_count', ['id', 'collection_log_id']);
  }
};
