import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import { CollectionLog, CollectionLogItem, CollectionLogUser } from '@models/index';
import { headers } from '@utils/handler-utils';

const recentItemsGlobal: APIGatewayProxyHandlerV2 = async (event, context) => {
  const dbContext = context as DatabaseContext;
  const { database: db } = dbContext;

  const itemSubSelect = {
    name: 'name',
    quantity: 'quantity',
    obtained: 'obtained',
    obtained_at: 'obtained_at',
    collection_log_id: 'collection_log_id',
    item_id: 'item_id',
  };

  const itemOuterSelect = {
    name: 'name',
    quantity: 'quantity',
    obtained: 'obtained',
    obtainedAt: 'obtained_at',
    id: 'item_id',
    username: 'username',
  };

  const allItemsQuery = db.select(itemSubSelect)
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
    .andWhereRaw("obtained_at >= NOW() - INTERVAL '10 DAYS'");

  const items = await db.with('items', allItemsQuery)
    .select(itemOuterSelect)
    .from('items')
    .join(CollectionLog.tableName, 'collection_log.id', '=', 'items.collection_log_id')
    .join(CollectionLogUser.tableName, 'collection_log_user.id', '=', 'collection_log.user_id')
    .where('index', 1)
    .andWhere('collection_log.deleted_at', null)
    .andWhere('collection_log_user.deleted_at', null)
    .orderBy('items.obtained_at', 'DESC')
    .limit(30);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ items }),
  };
};

export const handler = middleware(recentItemsGlobal);
