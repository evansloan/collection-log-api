import CollectionLogCache from '@lib/cache/collection-log-cache';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { cache } from '@middleware/cache';
import { errorResponse, response } from '@utils/handler-utils';

const getByUsername: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;

  const clDao = new CollectionLogDao();
  const collectionLog = await clDao.getByUsername(paramsUsername);

  if (!collectionLog) {
    return errorResponse(404, `Unable to find collection log for user ${paramsUsername}`);
  }

  const res = await clDao.getFormattedCollectionLog();
  return response(200, res);
};

export const handler = middleware(getByUsername)
  .use(cache(CollectionLogCache.getInstance(), 'username'));
