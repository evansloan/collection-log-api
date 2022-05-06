import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';

import { CollectionLogEntry } from '@models/index';

@Table({
  tableName: 'collection_log_tab',
  underscored: true,
  paranoid: true,
})
class CollectionLogTab extends Model {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column
  name!: string;

  @HasMany(() => CollectionLogEntry)
  entries?: CollectionLogEntry[];
}

export default CollectionLogTab;
