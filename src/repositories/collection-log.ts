import { CollectionLog } from '@models/index';
import { raw } from 'objection';
import Repository from './repository';

class CollectionLogRepository extends Repository<CollectionLog> {

  protected model = CollectionLog;

  public async findByAccountHash(accountHash: string) {
    return this.model.query()
      .withGraphJoined('user')
      .findOne({ account_hash: accountHash })
      .orderBy('updated_at', 'DESC');
  }

  public async findByUsername(username: string) {
    return this.model.query()
      .withGraphJoined('user')
      .findOne(raw('LOWER(??)', 'user.username'), '=', username.toLowerCase())
      .orderBy('updated_at', 'DESC');
  }

  public async formatCollectionLog(collectionLog: CollectionLog) {
    let user = collectionLog.user;
    if (!user) {
      user = await collectionLog.$relatedQuery('user');
    }

    const { id, userId, totalObtained, totalItems, uniqueObtained, uniqueItems } = collectionLog;
    const { username, accountType } = user;
    const items = await collectionLog.$relatedQuery('items')
      .modify('withRelated', true, user.isFemale);
    const killCounts = await collectionLog.$relatedQuery('killCounts')
      .modify('withRelated');

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

export default CollectionLogRepository;
