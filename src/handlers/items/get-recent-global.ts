import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { response } from '@utils/handler-utils';
import RecentObtainedItems from '@models/RecentObtainedItems';

const recentItemsGlobal: APIGatewayProxyHandlerV2 = async () => {
  const items = await RecentObtainedItems.query();

  return response(200, { items });
};

export const handler = middleware(recentItemsGlobal);
