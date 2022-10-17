import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';

import { DatabaseMiddleware } from './database';

export const middleware = (handler: APIGatewayProxyHandlerV2): Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> => {
  return middy(handler)
    .use(doNotWaitForEmptyEventLoop({ runOnError: true, runOnBefore: true, runOnAfter: true }))
    .use(DatabaseMiddleware.getInstance());
};
