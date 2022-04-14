import Sequelize from 'sequelize';
import {
  AllowNull,
  Column,
  DataType,
  Default,
  DefaultScope,
  HasOne,
  Model,
  PrimaryKey,
  Scopes,
  Table,
} from 'sequelize-typescript';

import CollectionLog from './CollectionLog';

@DefaultScope(() => ({
  attributes: [
    'id',
    'username',
    'accountType',
    'created_at',
    'updated_at',
  ]
}))
@Scopes(() => ({
  hiscores: {
    attributes: ['username', 'accountType'],
  },
}))
@Table({
  tableName: 'collection_log_user',
  underscored: true,
  paranoid: true,
})
class CollectionLogUser extends Model {

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

  @HasOne(() => CollectionLog)
  collectionLog?: CollectionLog;
}

export default CollectionLogUser;
