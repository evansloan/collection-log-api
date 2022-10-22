import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { errorResponse, response } from '@utils/handler-utils';

const recentItems: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;

  const collectionLog = await CollectionLogDao.getByUsername(paramsUsername);

  if (!collectionLog) {
    return errorResponse(404, `Collection log not found for user ${paramsUsername}`);
  }

  const { user: { username, accountType } } = collectionLog;
  const items = await CollectionLogDao.getObtainedItems(collectionLog);

  const res = {
    username,
    accountType,
    items,
  };

  return response(200, res);
};

export const handler = middleware(recentItems);