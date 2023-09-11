import repository, { RepositoryContext } from '@middleware/repository';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { errorResponse, response } from '@utils/handler-utils';

const recentItems: APIGatewayProxyHandlerV2 = async (event, context) => {
  const paramsUsername = event.pathParameters?.username as string;

  const {
    repositories: {
      clRepo,
      itemsRepo,
    },
  } = context as RepositoryContext;

  const collectionLog = await clRepo.findByUsername(paramsUsername);

  if (!collectionLog) {
    return errorResponse(404, `Collection log not found for user ${paramsUsername}`);
  }

  const { user: { username, accountType } } = collectionLog;
  const limit = 5;
  const items = await itemsRepo.fetchRecent(collectionLog, limit);

  const res = {
    username,
    accountType,
    items,
  };

  return response(200, res);
};

export const handler = middleware(recentItems)
  .use(repository());
