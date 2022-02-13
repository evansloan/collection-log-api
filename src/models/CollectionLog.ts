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
import User from './User';

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

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => CollectionLogItem)
  items?: CollectionLogItem[];

  @HasMany(() => CollectionLogKillCount)
  killCounts?: CollectionLogKillCount[];
}

export default CollectionLog;
