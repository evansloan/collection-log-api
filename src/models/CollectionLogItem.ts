import { ColumnNameMappers, Model } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLog, CollectionLogPage } from '@models/index';

export default class CollectionLogItem extends BaseModel {
  name!: string;
  itemId!: number;
  quantity!: number;
  sequence!: number;
  obtained!: boolean;
  obtainedAt?: Date;
  collectionLogId!: string;
  collectionLogEntryId!: string;

  page!: CollectionLogPage;
  collectionLog!: CollectionLog;

  static tableName = 'collection_log_item';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        name: obj.name,
        itemId: obj.item_id,
        quantity: obj.quantity,
        sequence: obj.sequence,
        obtained: obj.obtained,
        obtainedAt: obj.obtained_at,
        collectionLogId: obj.collection_log_id,
        collectionLogEntryId: obj.collection_log_entry_id,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        name: obj.name,
        item_id: obj.itemId,
        quantity: obj.quantity,
        sequence: obj.sequence,
        obtained: obj.obtained,
        obtained_at: obj.obtainedAt,
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
        from: 'collection_log_item.collection_log_entry_id',
        to: 'collection_log_entry.id',
      },
    },
    collectionLog: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLog,
      join: {
        from: 'collection_log_item.collection_log_id',
        to: 'collection_log.id',
      },
    },
  });
}
