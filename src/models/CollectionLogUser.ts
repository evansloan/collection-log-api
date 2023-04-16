import { ColumnNameMappers, Model, Modifiers } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLog } from '@models/index';

export default class CollectionLogUser extends BaseModel {
  username!: string;
  accountType!: string;
  accountHash!: string;
  isBanned!: boolean;
  isFemale!: boolean;
  showQuantity!: boolean;
  displayRank!: string;

  collectionLog?: CollectionLog;

  static tableName = 'collection_log_user';

  static get hidden() {
    return ['accountHash'];
  }

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        username: obj.username,
        accountType: obj.account_type,
        accountHash: obj.account_hash,
        isBanned: obj.is_banned,
        isFemale: obj.is_female,
        showQuantity: obj.show_quantity,
        displayRank: obj.display_rank,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        username: obj.username,
        account_type: obj.accountType,
        account_hash: obj.accountHash,
        is_banned: obj.isBanned,
        is_female: obj.isFemale,
        show_quantity: obj.showQuantity,
        display_rank: obj.displayRank,
      };
    },
  };

  static relationMappings = () => ({
    collectionLog: {
      relation: Model.HasOneRelation,
      modelClass: CollectionLog,
      join: {
        from: 'collection_log_user.id',
        to: 'collection_log.user_id',
      },
    },
  });

  static modifiers: Modifiers = {};
}
