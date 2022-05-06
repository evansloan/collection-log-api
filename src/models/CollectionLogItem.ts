import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import {
  CollectionLog,
  CollectionLogEntry,
} from '@models/index';

@Table({
  tableName: 'collection_log_item',
  underscored: true,
  paranoid: true,
})
class CollectionLogItem extends Model {

  @Index
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Index
  @ForeignKey(() => CollectionLog)
  @Column(DataType.UUID)
  collectionLogId!: string;

  @ForeignKey(() => CollectionLogEntry)
  @Column(DataType.UUID)
  collectionLogEntryId!: string;

  @Column
  name!: string;

  @Column(DataType.NUMBER.UNSIGNED)
  itemId!: number;

  @Default(0)
  @Column(DataType.NUMBER.UNSIGNED)
  quantity!: number;

  @Default(false)
  @Column
  obtained!: boolean;

  @Column(DataType.NUMBER.UNSIGNED)
  sequence!: number;

  @Column(DataType.DATE)
  obtainedAt?: Date;

  @BelongsTo(() => CollectionLog)
  collectionLog!: CollectionLog;

  @BelongsTo(() => CollectionLogEntry)
  entry!: CollectionLogEntry;
}

export default CollectionLogItem;
