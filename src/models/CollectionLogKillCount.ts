import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import CollectionLog from './CollectionLog';
import CollectionLogEntry from './CollectionLogEntry';

@Table({
  tableName: 'collection_log_kill_count',
  underscored: true,
  paranoid: true,
})
class CollectionLogKillCount extends Model {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

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
