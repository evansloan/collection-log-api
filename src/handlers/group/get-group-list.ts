import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { response } from '@utils/handler-utils';
import CollectionLogGroup from '@models/CollectionLogGroup';

const getGroupList: APIGatewayProxyHandlerV2 = async () => {
  const groups = await CollectionLogGroup.query()
    .orderBy('unique_obtained', 'DESC')
    .limit(20);
  return response(200, { groups });
};

export const handler = middleware(getGroupList);
