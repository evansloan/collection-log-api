import { ColumnNameMappers, Model } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLogUser } from '@models/index';
import CollectionLogGroup from './CollectionLogGroup';

export default class CollectionLogGroupUser extends BaseModel {
  collectionLogGroupId!: string;
  collectionLogUserId!: string;

  group?: CollectionLogGroup;
  user?: CollectionLogUser;

  static tableName = 'collection_log_group_user';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        collectionLogGroupId: obj.collection_log_group_id,
        collectionLogUserId: obj.collection_log_user_id,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        collection_log_group_id: obj.collectionLogGroupId,
        collection_log_user_id: obj.collectionLogUserId,
      };
    },
  };

  static relationMappings = () => ({
    group: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLogGroup,
      join: {
        from: 'collection_log_group_user.collection_log_group_id',
        to: 'collection_log_group.id',
      },
    },
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLogUser,
      join: {
        from: 'collection_log_group_user.collection_log_user_id',
        to: 'collection_log_user.id',
      },
    },
  });
}
