import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { raw } from 'objection';

import { middleware } from '@middleware/common';
import { CollectionLogUser } from '@models/index';
import { headers } from '@utils/handler-utils';

const typeahead: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;

  const users = await CollectionLogUser.query()
    .where(raw('LOWER(??)', 'username'), 'LIKE', `${paramsUsername.toLowerCase()}%`)
    .orderBy('username', 'ASC');

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ users }),
  };
};

export const typeaheadHandler = middleware(typeahead);
