import { raw } from 'objection';

import { CollectionLog, CollectionLogUser } from '@models/index';
import { CustomQueryBuilder } from '@lib/custom-query-builder';

export default class CollectionLogDao {
  private collectionLog?: CollectionLog;
  private genderModifier = 'maleItems';
  private query: CustomQueryBuilder<CollectionLog> = CollectionLog.query();

  constructor(collectionLog?: CollectionLog) {
    if (collectionLog) {
      this.init(collectionLog);
    }
  }

  private init = (collectionLog?: CollectionLog) => {
    this.collectionLog = collectionLog;
    const isFemale = collectionLog?.user.isFemale;
    this.genderModifier = isFemale ? 'femaleItems' : 'maleItems';
  };

  getByUsername = async (username: string) => {
    const collectionLog = await this.query
      .withGraphJoined('user')
      .findOne(raw('LOWER(??)', 'user.username'), '=', username.toLowerCase())
      .orderBy('updated_at', 'DESC');
    this.init(collectionLog);

    return this.collectionLog;
  };

  getByAccountHash = async (accountHash: string) => {
    const collectionLog = await this.query
      .withGraphJoined('user')
      .findOne({ account_hash: accountHash })
      .orderBy('updated_at', 'DESC');
    this.init(collectionLog);

    return this.collectionLog;
  };

  getItemsWithRelated = async (filterGender: boolean) => {
    const query = this.collectionLog?.$relatedQuery('items')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC')
      .orderBy('sequence', 'ASC');

    if (filterGender) {
      query?.modify(this.genderModifier);
    }

    return await query;
  };

  getItems = async (select?: any, pageName?: string, limit?: number, offset?: number) => {
    const query = this.collectionLog?.$relatedQuery('items')
      .modify(this.genderModifier)
      .joinRelated('page')
      .orderBy('sequence', 'ASC');

    if (select) {
      query?.select(select);
    }

    if (pageName) {
      query?.where(raw('LOWER(??)', 'page.name'), pageName.toLowerCase());
    }

    if (limit) {
      query?.limit(limit);
    }

    if (offset) {
      query?.offset(offset);
    }

    return await query;
  };

  getObtainedItems = async (limit?: number) => {
    const query = this.collectionLog?.$relatedQuery('items')
      .modify(this.genderModifier)
      .select({
        id: 'item_id',
        obtained: raw('BOOL_OR(obtained)'),
      })
      .max('name AS name')
      .max('quantity AS quantity')
      .max('obtained_at AS obtained_at')
      .where('obtained', true)
      .groupBy('item_id')
      .orderBy(raw('MAX(obtained_at)'), 'DESC');

    if (limit) {
      query?.limit(limit);
    }

    return await query;
  };

  getKillCountsWithRelated = async () => {
    const killCounts = await this.collectionLog?.$relatedQuery('killCounts')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC')
      .orderBy('sequence', 'ASC');

    return killCounts;
  };

  getKillCounts = async (select?: any, pageName?: string, limit?: number, offset?: number) => {
    const query = this.collectionLog?.$relatedQuery('killCounts')
      .joinRelated('page')
      .orderBy('sequence', 'ASC');

    if (select) {
      query?.select(select);
    }

    if (pageName) {
      query?.where(raw('LOWER(??)', 'page.name'), pageName.toLowerCase());
    }

    if (limit) {
      query?.limit(limit);
    }

    if (offset) {
      query?.offset(offset);
    }

    return await query;
  };

  getFormattedCollectionLog = async (user?: CollectionLogUser) => {
    if (!this.collectionLog) {
      return undefined;
    }

    const { id, userId, totalObtained, totalItems, uniqueObtained, uniqueItems } = this.collectionLog;
    if (!user) {
      user = this.collectionLog?.user;
    }

    const { username, accountType } = user;
    const items = await this.getItemsWithRelated(true);
    const killCounts = await this.getKillCountsWithRelated();

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
  };
}