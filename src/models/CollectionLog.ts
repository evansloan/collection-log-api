import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';

import CollectionLogItem from './CollectionLogItem';
import CollectionLogKillCount from './CollectionLogKillCount';
import CollectionLogUser from './CollectionLogUser';

@Table({
  tableName: 'collection_log',
  underscored: true,
  paranoid: true,
})
class CollectionLog extends Model {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => CollectionLogUser)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => CollectionLogUser)
  user!: CollectionLogUser;

  @HasMany(() => CollectionLogItem)
  items?: CollectionLogItem[];

  @HasMany(() => CollectionLogKillCount)
  killCounts?: CollectionLogKillCount[];
}

export default CollectionLog;
