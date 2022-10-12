import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { CollectionLogUser } from '@models/index';
import { headers } from '@utils/handler-utils';

const getUserCount: APIGatewayProxyHandlerV2 = async () => {
  const count = await CollectionLogUser.query().resultSize();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ count }),
  };
};

export const getUserCountHandler = middleware(getUserCount);
