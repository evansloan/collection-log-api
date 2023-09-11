import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { repositories } from '@middleware/common';
import { RepositoryContext } from '@middleware/repository';
import { response } from '@utils/handler-utils';

const getCollectionLogExists: APIGatewayProxyHandlerV2 = async (event, context) => {
  const accountHash = event.pathParameters?.accountHash as string;

  const { repositories: { clRepo } } = context as RepositoryContext;
  const collectionLog = await clRepo.findByAccountHash(accountHash);
  const exists = !!collectionLog;

  return response(200, { exists });
};

export const handler = repositories(getCollectionLogExists);
