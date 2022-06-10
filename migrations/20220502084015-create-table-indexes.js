'use strict';

module.exports = {
  async up(queryInterface) {
    queryInterface.addIndex('collection_log_item', ['collection_log_id']);
    queryInterface.addIndex('collection_log_item', ['collection_log_entry_id', 'collection_log_id']);
    queryInterface.addIndex('collection_log_kill_count', ['collection_log_entry_id', 'collection_log_id']);
  },

  async down(queryInterface) {
    queryInterface.removeIndex('collection_log_item', ['collection_log_id']);
    queryInterface.removeIndex('collection_log_item', ['collection_log_entry_id', 'collection_log_id']);
    queryInterface.removeIndex('collection_log_kill_count', ['collection_log_entry_id', 'collection_log_id']);
  },
};
