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

@Table({
  tableName: 'collection_log_detail',
  underscored: true,
  paranoid: true,
})
class CollectionLogDetail extends Model {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => CollectionLog)
  @Column(DataType.UUID)
  collectionLogId!: string;

  @Column
  tab!: string;

  @Column
  entry!: string;

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

  @BelongsTo(() => CollectionLog)
  collectionLog!: CollectionLog;
}

export default CollectionLogDetail;
