import { ColumnNameMappers, Model } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLog, CollectionLogPage } from '@models/index';

export default class CollectionLogKillCount extends BaseModel {
  name!: string;
  amount!: number;
  collectionLogId!: string;
  collectionLogEntryId!: string;

  page!: CollectionLogPage;
  collectionLog!: CollectionLog;

  static tableName = 'collection_log_kill_count';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        name: obj.name,
        amount: obj.amount,
        collectionLogId: obj.collection_log_id,
        collectionLogEntryId: obj.collection_log_entry_id,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        name: obj.name,
        amount: obj.amount,
        collection_log_id: obj.collectionLogId,
        collection_log_entry_id: obj.collectionLogEntryId,
      };
    },
  };

  static relationMappings = () => ({
    page: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLogPage,
      join: {
        from: 'collection_log_kill_count.collection_log_entry_id',
        to: 'collection_log_entry.id',
      },
    },
    collectionLog: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLog,
      join: {
        from: 'collection_log_kill_count.collection_log_id',
        to: 'collection_log.id',
      },
    },
  });
}
