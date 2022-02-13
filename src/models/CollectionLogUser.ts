import {
  AllowNull,
  Column,
  DataType,
  Default,
  DefaultScope,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import CollectionLog from './CollectionLog';

@DefaultScope(() => ({
  attributes: [
    'id',
    'username',
    'created_at',
    'updated_at',
  ]
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
  runeliteId?: string;

  @HasOne(() => CollectionLog)
  collectionLog?: CollectionLog;
}

export default CollectionLogUser;