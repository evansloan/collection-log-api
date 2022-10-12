import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { headers } from '@utils/handler-utils';

const recentItems: APIGatewayProxyHandlerV2 = async (event) => {
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

  const { user: { username, accountType } } = collectionLog;
  const items = await CollectionLogDao.getObtainedItems(collectionLog);

  const res = {
    username,
    accountType,
    items,
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(res),
  };
};

export const recentItemsHandler = middleware(recentItems);
