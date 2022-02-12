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

import CollectionLogDetail from './CollectionLogDetail';
import User from './User';

@Table
class CollectionLog extends Model {

  @PrimaryKey
  @Column(DataType.UUID)
  @Default(DataType.UUIDV4)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => CollectionLogDetail)
  items?: CollectionLogDetail[];
}

export default CollectionLog;