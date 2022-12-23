import { raw } from 'objection';

import { CollectionLog, CollectionLogUser } from '@models/index';

export default class CollectionLogDao {
  static async getByUsername(username: string) {
    const collectionLog = await CollectionLog.query()
      .withGraphJoined('user')
      .findOne(raw('LOWER(??)', 'user.username'), '=', username.toLowerCase())
      .orderBy('updated_at', 'DESC');

    return collectionLog;
  }

  static async getByAccountHash(accountHash: string) {
    const collectionLog = await CollectionLog.query()
      .withGraphJoined('user')
      .findOne({ account_hash: accountHash })
      .orderBy('updated_at', 'DESC');

    return collectionLog;
  }

  static async getItems(collectionLog: CollectionLog) {
    const items = await collectionLog.$relatedQuery('items')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC')
      .orderBy('sequence', 'ASC');

    return items;
  }

  static async getObtainedItems(collectionLog: CollectionLog) {
    const items = await collectionLog.$relatedQuery('items')
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

  static async getKillCounts(collectionLog: CollectionLog) {
    const killCounts = await collectionLog.$relatedQuery('killCounts')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC');

    return killCounts;
  }

  static async getFormattedCollectionLog(collectionLog: CollectionLog, user?: CollectionLogUser) {
    const { id, userId, totalObtained, totalItems, uniqueObtained, uniqueItems } = collectionLog;
    if (!user) {
      user = collectionLog.user;
    }

    const { username, accountType } = user;
    const items = await CollectionLogDao.getItems(collectionLog);
    const killCounts = await CollectionLogDao.getKillCounts(collectionLog);

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

    items.forEach((item) => {
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

    killCounts.forEach((kc) => {
      const {
        amount,
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
      page.killCount?.push({
        name: kcName,
        amount,
      });
    });

    return res;
  }
}