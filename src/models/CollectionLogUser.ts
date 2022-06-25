import {
  AllowNull,
  Column,
  DataType,
  Default,
  DefaultScope,
  HasOne,
  Model,
  Index,
  PrimaryKey,
  Table,
  Scopes,
} from 'sequelize-typescript';

import { CollectionLog } from '@models/index';

@DefaultScope(() => ({
  attributes: [
    'id',
    'username',
    'accountType',
    'isBanned',
    'created_at',
    'updated_at',
  ],
}))
@Scopes(() => ({
  info: {
    attributes: [
      ['username', 'username'],
      ['account_type', 'account_type'],
      ['is_female', 'is_female'],
    ],
  },
}))
@Table({
  tableName: 'collection_log_user',
  underscored: true,
  paranoid: true,
})
class CollectionLogUser extends Model {

  @Index
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column
  username!: string;

  @Column
  accountType?: string;

  @Column
  runeliteId?: string;

  @Column
  accountHash?: string;

  @Default(false)
  @Column
  isBanned!: boolean;

  @HasOne(() => CollectionLog)
  collectionLog?: CollectionLog;
}

export default CollectionLogUser;
