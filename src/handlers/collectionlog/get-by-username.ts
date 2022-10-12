import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { errorResponse, response } from '@utils/handler-utils';

const getByUsername: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;
  const collectionLog = await CollectionLogDao.getByUsername(paramsUsername);

  if (!collectionLog) {
    return errorResponse(404, `Unable to find collection log for user ${paramsUsername}`);
  }

  const res = await CollectionLogDao.getFormattedCollectionLog(collectionLog);
  return response(200, res);
};

export const getCollectionLogByUsernameHandler = middleware(getByUsername);
