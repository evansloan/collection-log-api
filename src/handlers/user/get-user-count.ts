import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { CollectionLogUser } from '@models/index';
import { response } from '@utils/handler-utils';

const getUserCount: APIGatewayProxyHandlerV2 = async () => {
  const count = await CollectionLogUser.query()
    .where({ deleted_at: null })
    .resultSize();

  return response(200, { count });
};

export const handler = middleware(getUserCount);
