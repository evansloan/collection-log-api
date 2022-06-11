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
  tableName: 'collection_log_kill_count',
  underscored: true,
  paranoid: true,
})
class CollectionLogKillCount extends Model {

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

  @Default(0)
  @Column(DataType.NUMBER.UNSIGNED)
  amount!: number;

  @BelongsTo(() => CollectionLog)
  collectionLog!: CollectionLog;

  @BelongsTo(() => CollectionLogEntry)
  entry!: CollectionLogEntry;
}

export default CollectionLogKillCount;
