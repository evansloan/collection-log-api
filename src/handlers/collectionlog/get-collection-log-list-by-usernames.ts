import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { errorResponse, response } from '@utils/handler-utils';

const getCollectionLogListByUsernames: APIGatewayProxyHandlerV2 = async (event) => {
  const usernames = event.queryStringParameters
    ?.usernames
    ?.split(',');

  if (!usernames) {
    return errorResponse(400, 'Invalid usernames');
  }

  console.log(usernames);

  const collectionLogs: any[] = [];

  for (const username of usernames) {
    const collectionLog = await CollectionLogDao.getByUsername(username);
    if (!collectionLog) {
      return errorResponse(404, `Unable to find collection log for ${username}`);
    }
    const formatted = await CollectionLogDao.getFormattedCollectionLog(collectionLog);
    collectionLogs.push(formatted);
  }

  return response(200, { collectionLogs });
};

export const handler = middleware(getCollectionLogListByUsernames);
