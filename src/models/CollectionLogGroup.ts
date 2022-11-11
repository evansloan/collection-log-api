import { ColumnNameMappers, Model, QueryBuilder, QueryContext } from 'objection';

import { BaseModel } from './BaseModel';
import CollectionLogGroupUser from './CollectionLogGroupUser';
import CollectionLogUser from './CollectionlogUser';

export default class CollectionLogGroup extends BaseModel {
  accessKey!: string;
  name!: string;
  description?: string;
  world?: number;
  clan?: string;
  friendsChat?: string;
  uniqueObtained!: number;
  uniqueItems!: number;
  groupUserCount!: number;
  isUpdating!: boolean;

  groupUsers?: CollectionLogGroupUser[];
  users?: CollectionLogUser[];

  static tableName = 'collection_log_group';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        accessKey: obj.access_key,
        name: obj.name,
        description: obj.description,
        world: obj.world,
        clan: obj.clan,
        friendsChat: obj.friends_chat,
        uniqueObtained: obj.unique_obtained,
        uniqueItems: obj.unique_items,
        groupUserCount: obj.group_user_count,
        isUpdating: obj.is_updating,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        access_key: obj.accessKey,
        name: obj.name,
        description: obj.description,
        world: obj.world,
        clan: obj.clan,
        friends_chat: obj.friendsChat,
        unique_obtained: obj.uniqueObtained,
        unique_items: obj.uniqueItems,
        group_user_count: obj.groupUserCount,
        is_updating: obj.isUpdating,
      };
    },
  };

  static relationMappings = () => ({
    groupUsers: {
      relation: Model.HasManyRelation,
      modelClass: CollectionLogGroupUser,
      join: {
        from: 'collection_log_group.id',
        to: 'collection_log_group_user.collection_log_group_id',
      },
    },
    users: {
      relation: Model.ManyToManyRelation,
      modelClass: CollectionLogUser,
      join: {
        from: 'collection_log_group.id',
        through: {
          from: 'collection_log_group_user.collection_log_group_id',
          to: 'collection_log_group_user.collection_log_user_id',
        },
        to: 'collection_log_user.id',
      },
    },
  });

  static modifiers = {
    onCreate(query: QueryBuilder<Model>) {
      query.select('access_key');
    },
    defaultSelects(query: QueryBuilder<Model>) {
      const { ref } = CollectionLogGroup;
      const cols = [
        'id',
        'name',
        'description',
        'world',
        'clan',
        'friends_chat',
        'unique_obtained',
        'unique_items',
        'group_user_count',
        'created_at',
      ];
      query.select(...cols.map((col) => ref(col)));
    },
    withAccessKey(query: QueryBuilder<Model>) {
      query.select('id', 'access_key', 'description', 'world', 'clan', 'friends_chat', 'unique_obtained', 'unique_items', 'group_user_count');
    },
    withGroupUsers(query: QueryBuilder<Model>) {
      query.withGraphJoined('groupUsers');
    },
    withUsers(query: QueryBuilder<Model>) {
      query.withGraphJoined('users.[collectionLog]');
    },
  };

  async $afterInsert(queryContext: QueryContext) {
    super.$afterInsert(queryContext);

    if (this.groupUsers) {
      this.groupUsers.forEach((groupUser) => {
        if (!groupUser.collectionLogGroupId) {
          return groupUser.collectionLogGroupId = this.id;
        }
      });
    }
  }
}
