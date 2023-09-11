import { RepositoryContext } from '@middleware/repository';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { repositories } from '@middleware/common';
import { errorResponse, response } from '@utils/handler-utils';

const getByUsername: APIGatewayProxyHandlerV2 = async (event, context) => {
  const paramsUsername = event.pathParameters?.username as string;

  const { repositories: { clRepo } } = context as RepositoryContext;
  const collectionLog = await clRepo.findByUsername(paramsUsername);

  if (!collectionLog) {
    return errorResponse(404, `Unable to find collection log for user ${paramsUsername}`);
  }

  const res = await clRepo.formatCollectionLog(collectionLog);
  return response(200, res);
};

export const handler = repositories(getByUsername);
