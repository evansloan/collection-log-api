import { raw } from 'objection';

import { CollectionLog, CollectionLogUser } from '@models/index';
import { CustomQueryBuilder } from '@lib/custom-query-builder';

export default class CollectionLogDao {
  private collectionLog?: CollectionLog;
  private query: CustomQueryBuilder<CollectionLog> = CollectionLog.query();

  constructor(collectionLog?: CollectionLog) {
    if (collectionLog) {
      this.collectionLog = collectionLog;
    }
  }

  async getByUsername(username: string) {
    this.collectionLog = await this.query
      .withGraphJoined('user')
      .findOne(raw('LOWER(??)', 'user.username'), '=', username.toLowerCase())
      .orderBy('updated_at', 'DESC');

    return this.collectionLog;
  }

  async getByAccountHash(accountHash: string) {
    this.collectionLog = await this.query
      .withGraphJoined('user')
      .findOne({ account_hash: accountHash })
      .orderBy('updated_at', 'DESC');

    return this.collectionLog;
  }

  async getItems() {
    const items = await this.collectionLog?.$relatedQuery('items')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC')
      .orderBy('sequence', 'ASC');

    return items;
  }

  async getObtainedItems() {
    const items = await this.collectionLog?.$relatedQuery('items')
      .select({
        id: 'item_id',
        obtained: raw('BOOL_OR(obtained)'),
      })
      .max('name AS name')
      .max('quantity AS quantity')
      .max('obtained_at AS obtained_at')
      .where('obtained', true)
      .groupBy('item_id')
      .orderBy(raw('MAX(obtained_at)'), 'DESC')
      .limit(5);

    return items;
  }

  async getKillCounts() {
    const killCounts = await this.collectionLog?.$relatedQuery('killCounts')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC')
      .orderBy('sequence', 'ASC');

    return killCounts;
  }

  async getFormattedCollectionLog(user?: CollectionLogUser) {
    if (!this.collectionLog) {
      return undefined;
    }

    const { id, userId, totalObtained, totalItems, uniqueObtained, uniqueItems } = this.collectionLog;
    if (!user) {
      user = this.collectionLog?.user;
    }

    const { username, accountType } = user;
    const items = await this.getItems();
    const killCounts = await this.getKillCounts();

    const res: any = {
      collectionLogId: id,
      userId: userId,
      collectionLog: {
        tabs: {},
        username,
        accountType,
        totalObtained,
        totalItems,
        uniqueObtained,
        uniqueItems,
      },
    };

    items?.forEach((item) => {
      const {
        itemId,
        quantity,
        obtained,
        obtainedAt,
        sequence,
        name: itemName,
        page: {
          name: pageName,
          tab: {
            name: tabName,
          },
        },
      } = item;

      if (!res.collectionLog.tabs[tabName]) {
        res.collectionLog.tabs[tabName] = {};
      }

      if (!res.collectionLog.tabs[tabName][pageName]) {
        res.collectionLog.tabs[tabName][pageName] = { items: [] };
      }

      const page = res.collectionLog.tabs[tabName][pageName];
      page.items.push({
        id: itemId,
        name: itemName,
        quantity,
        obtained,
        obtainedAt,
        sequence,
      });
    });

    killCounts?.forEach((kc) => {
      const {
        amount,
        sequence,
        name: kcName,
        page: {
          name: pageName,
          tab: {
            name: tabName,
          },
        },
      } = kc;

      const page = res.collectionLog.tabs[tabName][pageName];
      if (!page.killCount) {
        page.killCount = [];
      }
      page.killCount.push({
        name: kcName,
        amount,
        sequence,
      });
    });

    return res;
  }
}