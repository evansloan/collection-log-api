import { ColumnNameMappers, Model } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLogItem, CollectionLogKillCount, CollectionLogTab } from '@models/index';

export default class CollectionLogPage extends BaseModel {
  name!: string;
  collectionLogTabId!: string;

  tab!: CollectionLogTab;
  items!: CollectionLogItem[];
  killCounts!: CollectionLogKillCount[];

  static tableName = 'collection_log_entry';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        name: obj.name,
        collectionLogTabId: obj.collection_log_tab_id,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        name: obj.name,
        collection_log_tab_id: obj.collectionLogTabId,
      };
    },
  };

  static relationMappings = () => ({
    tab: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLogTab,
      join: {
        from: 'collection_log_entry.collection_log_tab_id',
        to: 'collection_log_tab.id',
      },
    },
    items: {
      relation: Model.HasManyRelation,
      modelClass: CollectionLogItem,
      join: {
        from: 'collection_log_entry.id',
        to: 'collection_log_item.collection_log_entry_id',
      },
    },
    killCounts: {
      relation: Model.HasManyRelation,
      modelClass: CollectionLogKillCount,
      join: {
        from: 'collection_log_entry.id',
        to: 'collection_log_kill_count.collection_log_entry_id',
      },
    },
  });
}
