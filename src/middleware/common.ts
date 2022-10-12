import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import middy from 'middy';

import { DatabaseMiddleware } from './database';

export const middleware = (handler: APIGatewayProxyHandlerV2): Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> => middy(handler)
  .use(DatabaseMiddleware.getInstance());
