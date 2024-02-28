import { ScheduledHandler } from 'aws-lambda';

import { CollectionLogUser } from '@models/index';
import { DatabaseService } from '@services/database';

const buildRecentGlobal: ScheduledHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const dbService = new DatabaseService();
  const db = dbService.getConnection();

  const previousRecords = await db.select('id').from('recent_obtained_items');

  const select = {
    username: 'username',
    name: 'name',
    quantity: 'quantity',
    obtained: 'obtained',
    obtained_at: 'obtained_at',
    item_id: 'item_id',
  };

  console.log('FETCHING RECENT GLOBAL OBTAINED ITEMS');
  const items = await db.select(select)
    .from(CollectionLogUser.tableName)
    .join('collection_log_item', 'collection_log_item.id', '=', 'collection_log_user.obtained_collection_log_item_id')
    .where('collection_log_item.obtained', true)
    .andWhere('collection_log_user.deleted_at', null)
    .orderBy('collection_log_user.recent_obtained_date', 'desc')
    .limit(30);

  console.log('INSERTING RECENT GLOBAL ITEMS');
  await db.insert(items).into('recent_obtained_items');

  if (previousRecords.length > 0) {
    console.log('DELETING PREVIOUS RECENT GLOBAL OBTAINED ITEMS');
    await db.delete().from('recent_obtained_items').whereIn('id', previousRecords.map((record) => record.id));
  }
};

export const handler = buildRecentGlobal;
