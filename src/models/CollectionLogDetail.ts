import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';

import CollectionLog from './CollectionLog';

@Table
class CollectionLogDetail extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  @Default(DataType.UUIDV4)
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

  @Column(DataType.NUMBER.UNSIGNED)
  @Default(0)
  quantity!: number;

  @Column
  @Default(false)
  obtained!: boolean;

  @BelongsTo(() => CollectionLog)
  collectionLog!: CollectionLog;
}

export default CollectionLogDetail;
