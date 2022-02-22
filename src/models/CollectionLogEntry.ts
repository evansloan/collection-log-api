import {
  AllowNull,
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
import CollectionLogTab from './CollectionLogTab';

@Table({
  tableName: 'collection_log_entry',
  underscored: true,
  paranoid: true,
})
class CollectionLogEntry extends Model {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => CollectionLogTab)
  @Column(DataType.UUID)
  collectionLogTabId!: string;

  @AllowNull(false)
  @Column
  name!: string;

  @BelongsTo(() => CollectionLogTab)
  tab!: CollectionLogTab;

  @HasMany(() => CollectionLogItem)
  items?: CollectionLogItem[];

  @HasMany(() => CollectionLogKillCount)
  killCounts?: CollectionLogKillCount[];
}

export default CollectionLogEntry;
