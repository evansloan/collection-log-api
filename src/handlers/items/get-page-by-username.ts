import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { raw } from 'objection';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { CollectionLogItem, CollectionLogKillCount, CollectionLogPage } from '@models/index';
import { headers } from '@utils/handler-utils';

const getPageByUsername: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;

  const collectionLog = await CollectionLogDao.getByUsername(paramsUsername);

  if (!collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: `Collection log not found for user ${paramsUsername}`,
      }),
    };
  }

  const pageName = event.queryStringParameters?.pageName as string;
  const offset: number|undefined = parseInt(event.queryStringParameters?.offset as string);
  const limit: number|undefined = parseInt(event.queryStringParameters?.limit as string);

  const page = await CollectionLogPage.query()
    .findOne(raw('LOWER(??)', 'name'), '=', pageName.toLowerCase());

  if (!page) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: `Collection log page not found with name ${pageName}`,
      }),
    };
  }

  const itemSelect = {
    id: 'item_id',
    name: 'name',
    quantity: 'quantity',
    obtained: 'obtained',
    obtainedAt: 'obtained_at',
    sequence: 'sequence',
  };
  const items = await CollectionLogItem.query()
    .select(itemSelect)
    .where({ collection_log_entry_id: page.id })
    .andWhere({ collection_log_id: collectionLog.id })
    .orderBy('sequence')
    .limit(limit)
    .offset(offset);

  const kcSelect = {
    name: 'name',
    amount: 'amount',
  };
  const killCount = await CollectionLogKillCount.query()
    .select(kcSelect)
    .where({ collection_log_entry_id: page.id })
    .andWhere({ collection_log_id: collectionLog.id })
    .limit(limit)
    .offset(offset);

  const res = {
    username: collectionLog.user.username,
    page: page.name,
    itemCount: items.length,
    obtainedCount: items.filter((item) => item.obtained).length,
    items,
    killCount,
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(res),
  };
};

export const handler = middleware(getPageByUsername);
