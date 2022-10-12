import { ColumnNameMappers, Model } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLogPage } from '@models/index';

export default class CollectionLogTab extends BaseModel {
  name!: string;

  pages!: CollectionLogPage[];

  static tableName = 'collection_log_tab';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        name: obj.name,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        name: obj.name,
      };
    },
  };

  static relationMappings = () => ({
    pages: {
      relation: Model.HasManyRelation,
      modelClass: CollectionLogPage,
      join: {
        from: 'collection_log_tab.id',
        to: 'collection_log_entry.collection_log_tab_id',
      },
    },
  });
}
