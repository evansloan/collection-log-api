import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import middy, {MiddyfiedHandler} from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';

import databaseMiddleWare from './database';
import snakeCaseParse from './snake-case-parse';

export const middleware = (handler: APIGatewayProxyHandlerV2): MiddyfiedHandler => {
  return middy(handler)
    .use(doNotWaitForEmptyEventLoop({ runOnError: true, runOnBefore: true, runOnAfter: true }))
    .use(databaseMiddleWare())
    .use(snakeCaseParse());
};
