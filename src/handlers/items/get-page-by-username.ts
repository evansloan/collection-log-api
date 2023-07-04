import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { raw } from 'objection';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { CollectionLogPage } from '@models/index';
import { errorResponse, response } from '@utils/handler-utils';

const getPageByUsername: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;

  const clDao = new CollectionLogDao();
  const collectionLog = await clDao.getByUsername(paramsUsername);

  if (!collectionLog) {
    return errorResponse(404, `Collection log not found for user ${paramsUsername}`);
  }

  const pageName = event.queryStringParameters?.pageName as string;
  const offset: number|undefined = parseInt(event.queryStringParameters?.offset as string);
  const limit: number|undefined = parseInt(event.queryStringParameters?.limit as string);

  const page = await CollectionLogPage.query()
    .findOne(raw('LOWER(??)', 'name'), '=', pageName.toLowerCase());

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
  const items = await clDao.getItems(itemSelect, pageName, limit, offset);
  if (!items) {
    return errorResponse(404, `Unable to find items for user: ${paramsUsername} page: ${pageName}`);
  }

  const kcSelect = {
    name: 'collection_log_kill_count.name',
    amount: 'amount',
  };
  const killCount = await clDao.getKillCounts(kcSelect, pageName, limit, offset);

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
