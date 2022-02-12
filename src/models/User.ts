import {
  AllowNull,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';

import CollectionLog from './CollectionLog';


@Table
class User extends Model {

  @PrimaryKey
  @Column(DataType.UUID)
  @Default(DataType.UUIDV4)
  id!: string;

  @Column
  @AllowNull(false)
  username!: string;

  @Column
  runelite_id?: string;

  @HasOne(() => CollectionLog)
  collectionLog?: CollectionLog;
}

export default User;
