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
