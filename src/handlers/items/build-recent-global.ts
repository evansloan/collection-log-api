import { ScheduledHandler } from 'aws-lambda';

import { CollectionLog, CollectionLogItem, CollectionLogUser } from '@models/index';
import { DatabaseService } from '@services/database';

const buildRecentGlobal: ScheduledHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const dbService = new DatabaseService();
  const db = dbService.getConnection();

  const previousRecords = await db.select('id').from('recent_obtained_items');

  const select = {
    name: 'name',
    quantity: 'quantity',
    obtained: 'obtained',
    obtained_at: 'obtained_at',
    item_id: 'item_id',
  };

  const allItemsQuery = db.select({ ...select, collection_log_id: 'collection_log_id' })
    .rowNumber('index', (qb) => {
      qb.partitionBy('collection_log_id')
        .orderBy('obtained_at', 'DESC')
        .orderBy('name', 'ASC');
    })
    .from(CollectionLogItem.tableName)
    .where({
      obtained: true,
      deleted_at: null,
    })
    // eslint-disable-next-line quotes
    .andWhereRaw("obtained_at >= NOW() - INTERVAL '12 HOURS'");

  console.log('FETCHING RECENT GLOBAL OBTAINED ITEMS');
  const items = await db.with('items', allItemsQuery)
    .select({ ...select, username: 'username' })
    .from('items')
    .join(CollectionLog.tableName, 'collection_log.id', '=', 'items.collection_log_id')
    .join(CollectionLogUser.tableName, 'collection_log_user.id', '=', 'collection_log.user_id')
    .where('index', 1)
    .andWhere('collection_log.deleted_at', null)
    .andWhere('collection_log_user.deleted_at', null)
    .orderBy('items.obtained_at', 'DESC')
    .limit(30);

  console.log('INSERTING RECENT GLOBAL ITEMS');
  await db.insert(items).into('recent_obtained_items');

  if (previousRecords.length > 0) {
    console.log('DELETING PREVIOUS RECENT GLOBAL OBTAINED ITEMS');
    await db.delete().from('recent_obtained_items').whereIn('id', previousRecords.map((record) => record.id));
  }
};

export const handler = buildRecentGlobal;
