import { Handler } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import CollectionLogUser from '@models/CollectionlogUser';
import { CollectionLog, CollectionLogItem } from '@models/index';
import CollectionLogGroup from '@models/CollectionLogGroup';
import { successResponse } from '@utils/handler-utils';

interface UpdateGroupItemCountEvent {
  userIds: string[];
  groupId: string;
}

const updateGroupItemCounts: Handler = async (event: UpdateGroupItemCountEvent, context) => {
  const { groupId, userIds } = event;
  const { database: db } = context as DatabaseContext;

  const allItemsQuery = db.select(db.raw('BOOL_OR(obtained) AS obtained'))
    .from(CollectionLogUser.tableName)
    .join(CollectionLog.tableName, 'collection_log.user_id', '=', 'collection_log_user.id')
    .join(CollectionLogItem.tableName, 'collection_log_item.collection_log_id', '=', 'collection_log.id')
    .andWhere('collection_log_item.deleted_at', null)
    .whereIn('collection_log_user.id', userIds)
    .groupBy('item_id');

  const itemCount = await db.with('items', allItemsQuery)
    .count('*')
    .sum(db.raw('CASE WHEN obtained THEN 1 ELSE 0 END'))
    .from('items')
    .first() as { count: number; sum: number };

  const uniqueItems = itemCount?.count;
  const uniqueObtained = itemCount?.sum;

  await CollectionLogGroup.query()
    .update({ uniqueObtained, uniqueItems })
    .where({ id: groupId });

  return successResponse(200, `Group ${groupId} item counts updated'`);
};

export const handler = middleware(updateGroupItemCounts);
