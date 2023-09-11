import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import {
  CollectionLogRepository,
  ItemsRepository,
  KillCountsRepository, PagesRepository,
} from '@repositories/index';
import { errorResponse, response } from '@utils/handler-utils';

const getPageByUsername: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;

  const clRepo = new CollectionLogRepository();
  const itemsRepo = new ItemsRepository();
  const kcRepo = new KillCountsRepository();

  const collectionLog = await clRepo.findByUsername(paramsUsername);

  if (!collectionLog) {
    return errorResponse(404, `Collection log not found for user ${paramsUsername}`);
  }

  const pageName = event.queryStringParameters?.pageName as string;
  const offset: number|undefined = parseInt(event.queryStringParameters?.offset as string);
  const limit: number|undefined = parseInt(event.queryStringParameters?.limit as string);

  const page = await (new PagesRepository()).findByName(pageName);

  if (!page) {
    return errorResponse(404, `Collection log page not found with name ${pageName}`);
  }

  const itemSelect = {
    id: 'item_id',
    name: 'collection_log_item.name',
    quantity: 'quantity',
    obtained: 'obtained',
    obtainedAt: 'obtained_at',
    sequence: 'sequence',
  };
  const items = await itemsRepo.fetchPage(collectionLog, pageName, {
    select: itemSelect,
    limit,
    offset,
  });
  if (!items) {
    return errorResponse(404, `Unable to find items for user: ${paramsUsername} page: ${pageName}`);
  }

  const kcSelect = {
    name: 'collection_log_kill_count.name',
    amount: 'amount',
  };
  const killCount = await kcRepo.fetchPage(collectionLog, pageName, {
    select: kcSelect,
    limit,
    offset,
  });

  const res = {
    username: collectionLog.user.username,
    page: page.name,
    itemCount: items.length,
    obtainedCount: items.filter((item) => item.obtained).length,
    items,
    killCount,
  };

  return response(200, res);
};

export const handler = middleware(getPageByUsername);
