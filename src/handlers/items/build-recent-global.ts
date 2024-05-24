import { ScheduledHandler } from 'aws-lambda';

import { CollectionLogItem, CollectionLogUser } from '@models/index';
import { DatabaseService } from '@services/database';

const buildRecentGlobal: ScheduledHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const dbService = new DatabaseService();
  const db = dbService.getConnection();
  const previousRecords = await db.select('id').from('recent_obtained_items');

  console.log('FETCHING RECENT GLOBAL OBTAINED ITEMS');

  const recentObtainedUsersCTE = 'recent_obtained_users';
  const userSelect = {
    username: 'username',
    recent_obtained_date: 'recent_obtained_date',
    obtained_collection_log_item_id: 'obtained_collection_log_item_id',
  };
  const recentObtainedUsers = db.select(userSelect)
    .from(CollectionLogUser.tableName)
    .where({ deleted_at: null })
    .andWhereNot({ recent_obtained_date: null })
    .orderBy('recent_obtained_date', 'DESC')
    .limit(30);

  const select = {
    username: 'username',
    name: 'name',
    quantity: 'quantity',
    obtained: 'obtained',
    obtained_at: 'obtained_at',
    item_id: 'item_id',
  };
  const recentItems = await db.with(recentObtainedUsersCTE, recentObtainedUsers)
    .select(select)
    .from(recentObtainedUsersCTE)
    .join(CollectionLogItem.tableName, `${CollectionLogItem.tableName}.id`, '=', `${recentObtainedUsersCTE}.obtained_collection_log_item_id`)
    .where(`${CollectionLogItem.tableName}.obtained`, true);

  console.log('INSERTING RECENT GLOBAL ITEMS');
  await db.insert(recentItems).into('recent_obtained_items');

  if (previousRecords.length > 0) {
    console.log('DELETING PREVIOUS RECENT GLOBAL OBTAINED ITEMS');
    await db.delete().from('recent_obtained_items').whereIn('id', previousRecords.map((record) => record.id));
  }
};

export const handler = buildRecentGlobal;
