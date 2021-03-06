import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import {
  CollectionLogEntry,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogTab,
  CollectionLogUser,
} from '@models/index';

@Table({
  tableName: 'collection_log',
  underscored: true,
  paranoid: true,
})
class CollectionLog extends Model {

  @Index
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Default(0)
  @Column
  uniqueObtained!: number;

  @Default(0)
  @Column
  uniqueItems!: number;

  @Default(0)
  @Column
  totalObtained!: number;

  @Default(0)
  @Column
  totalItems!: number;

  @Default(false)
  @Column
  isUpdating!: boolean;

  @ForeignKey(() => CollectionLogUser)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => CollectionLogUser)
  user!: CollectionLogUser;

  @HasMany(() => CollectionLogItem)
  items?: CollectionLogItem[];

  @HasMany(() => CollectionLogKillCount)
  killCounts?: CollectionLogKillCount[];

  jsonData = async () => {
    /*
     * Grab the items from entry records to make looping
     * through the data a bit easier
     */
    const collectionLogEntries = await CollectionLogEntry.findAll({
      include: [
        CollectionLogTab, {
          model: CollectionLogItem,
          where: {
            collectionLogId: this.id,
          },
        }, {
          model: CollectionLogKillCount,
          where: {
            collectionLogId: this.id,
          },
          required: false,
        }],
      order: [['items', 'sequence', 'ASC']],
    });

    const user = await CollectionLogUser.findByPk(this.userId);

    const data: any = {
      collectionlog_id: this.id,
      user_id: this.userId,
      collection_log: {
        tabs: {},
        username: user?.username,
        account_type: user?.accountType,
        total_obtained: this.totalObtained,
        total_items: this.totalItems,
        unique_obtained: this.uniqueObtained,
        unique_items: this.uniqueItems,
      },
    };

    collectionLogEntries.forEach((entry) => {
      const tabName = entry.tab.name;

      if (!data.collection_log.tabs[tabName]) {
        data.collection_log.tabs[tabName] = {};
      }

      data.collection_log.tabs[tabName][entry.name] = {
        items: entry.items?.map((item) => {
          return {
            id: item.itemId,
            name: item.name,
            quantity: item.quantity,
            obtained: item.obtained,
            sequence: item.sequence,
          };
        }),
        kill_count: entry.killCounts?.map((killCount) => {
          return {
            name: killCount.name,
            amount: killCount.amount,
          };
        }),
      };
    });

    return data;
  };
}

export default CollectionLog;
