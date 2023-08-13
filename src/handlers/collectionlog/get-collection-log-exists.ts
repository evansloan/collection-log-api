import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import CollectionLogDao from '@dao/CollectionLogDao';
import { middleware } from '@middleware/common';
import { response } from '@utils/handler-utils';

const getCollectionLogExists: APIGatewayProxyHandlerV2 = async (event) => {
  const accountHash = event.pathParameters?.accountHash as string;

  const collectionLog = await (new CollectionLogDao()).getByAccountHash(accountHash);
  const exists = !!collectionLog;

  return response(200, { exists });
};

export const handler = middleware(getCollectionLogExists);
