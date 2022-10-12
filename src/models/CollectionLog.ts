import { ColumnNameMappers, Model } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLogItem, CollectionLogKillCount, CollectionLogUser } from '@models/index';

export default class CollectionLog extends BaseModel {
  uniqueObtained!: number;
  uniqueItems!: number;
  totalObtained!: number;
  totalItems!: number;
  isUpdating!: boolean;
  userId!: string;

  user!: CollectionLogUser;
  items!: CollectionLogItem[];
  killCounts!: CollectionLogKillCount[];

  static tableName = 'collection_log';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        uniqueObtained: obj.unique_obtained,
        uniqueItems: obj.unique_items,
        totalObtained: obj.total_obtained,
        totalItems: obj.total_items,
        isUpdating: obj.is_updating,
        userId: obj.user_id,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        unique_obtained: obj.uniqueObtained,
        unique_items: obj.uniqueItems,
        total_obtained: obj.totalObtained,
        total_items: obj.totalItems,
        is_updating: obj.isUpdating,
        user_id: obj.userId,
      };
    },
  };

  static relationMappings = () => ({
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLogUser,
      join: {
        from: 'collection_log.user_id',
        to: 'collection_log_user.id',
      },
    },
    items: {
      relation: Model.HasManyRelation,
      modelClass: CollectionLogItem,
      join: {
        from: 'collection_log.id',
        to: 'collection_log_item.collection_log_id',
      },
    },
    killCounts: {
      relation: Model.HasManyRelation,
      modelClass: CollectionLogKillCount,
      join: {
        from: 'collection_log.id',
        to: 'collection_log_kill_count.collection_log_id',
      },
    },
  });
}
