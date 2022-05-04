'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addIndex('collection_log_item', ['collection_log_id']);
    queryInterface.addIndex('collection_log_item', ['collection_log_entry_id', 'collection_log_id']);
    queryInterface.addIndex('collection_log_kill_count', ['collection_log_entry_id', 'collection_log_id']);
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeIndex('collection_log_item', ['collection_log_id']);
    queryInterface.removeIndex('collection_log_item', ['collection_log_entry_id', 'collection_log_id']);
    queryInterface.removeIndex('collection_log_kill_count', ['collection_log_entry_id', 'collection_log_id']);
  }
};
